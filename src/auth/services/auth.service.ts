import { Injectable } from "@nestjs/common";
import { BadRequestException, UnauthorizedException } from "@nestjs/common/exceptions";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { RequestOtpDto } from "../dto/request-otp.dto";
import { Otp } from "../schemas/otp.schema";
import * as bcrypt from "bcrypt";
import { RegisterUserDto } from "../dto/register-user.dto";
import { User } from "src/users/schemas/user.schema";
import { LoginDto } from "../dto/login.dto";
import { VerifyOtpDto } from "../dto/verify-otp.dto";
import { GoogleClientDetailsDto } from "../dto/google-client-details.dto";
import { JwtService } from "@nestjs/jwt";
import { AuthTypes } from "../enums/auth.enum";
import { SocialUser } from "../interface/social-user.interface";
import { Length } from "class-validator";
import axios from 'axios';
import { HttpService } from '@nestjs/axios';
import { FacebookClientDetailsDto } from "../dto/facebook-client-details.dto";
import { ResetPasswordDto } from "../dto/reset-password.dto";

@Injectable()
export class AuthService {
  constructor(@InjectModel(Otp.name) private OtpModel: Model<Otp>, @InjectModel(User.name) private UserModel: Model<User>, private JwtService: JwtService,private readonly httpService: HttpService) {}

  async createOtp(requestOtpDto: RequestOtpDto): Promise<void | Number> {
    const user = await this.UserModel.findOne({ [requestOtpDto.type]: requestOtpDto[requestOtpDto.type] }).exec();

    if (user) throw new BadRequestException(`${[requestOtpDto.type]} already exists`);

    return await this.generateOTP(requestOtpDto);
  }

  async forgetPasswordOtp(requestOtpDto: RequestOtpDto): Promise<void | Number> {
    const user = await this.UserModel.findOne({ [requestOtpDto.type]: requestOtpDto[requestOtpDto.type] }).exec();

    if (!user) throw new BadRequestException(`${[requestOtpDto.type]} not exist`);

    return await this.generateOTP(requestOtpDto);
  }

  private async generateOTP(requestOtpDto: RequestOtpDto): Promise<void | Number> {
    let record = await this.OtpModel.findOne({ for: requestOtpDto[requestOtpDto.type] }).exec();

    if (record) {
      let now = new Date();
      now.setMinutes(now.getMinutes() - 10);
      if (record.updatedAt < now || record.otp === undefined) {
        record.otp = parseInt(this.randomOTP());
        await record.save();
      }

      return record.otp;
    }

    const createdOtp = new this.OtpModel({
      otp: this.randomOTP(),
      for: requestOtpDto[requestOtpDto.type],
    });

    await createdOtp.save();
    return createdOtp.otp;
  }

  async registerUser(registerUserDto: RegisterUserDto): Promise<object> {
    let record = await this.OtpModel.findOne({ _id: registerUserDto.otpVerificationCode, for: registerUserDto[registerUserDto.type] }).exec();

    if (!record) throw new BadRequestException("Invalid token");

    const user = await this.UserModel.findOne({ [registerUserDto.type]: registerUserDto[registerUserDto.type] }).exec();

    if (user) throw new BadRequestException(`${[registerUserDto.type]} already exists`);

    await this.OtpModel.findByIdAndDelete(record._id);

    const salt = await bcrypt.genSalt();
    const password = await this.hashPassword(registerUserDto.password, salt);

    const createdUser = new this.UserModel({
      type: registerUserDto.type,
      firstname: registerUserDto.firstname,
      lastname: registerUserDto.lastname ?? "",
      [registerUserDto.type]: registerUserDto[registerUserDto.type],
      password,
      salt,
    });

    await createdUser.save();
    createdUser.password = createdUser.salt = undefined; // delete is not working

    const accessToken = this.JwtService.sign({ userId: createdUser._id });
    return { user: createdUser, accessToken: accessToken };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<any> {
    let record = await this.OtpModel.findOne({ for: verifyOtpDto[verifyOtpDto.type], otp: verifyOtpDto.otp }).exec();

    if (record) {
      let now = new Date();
      now.setMinutes(now.getMinutes() - 10);
      if (record.updatedAt > now) {
        record.otp = undefined;
        await record.save();
        return record._id;
      }
    }

    throw new BadRequestException("Invalid OTP");
  }

  async login(loginDto: LoginDto): Promise<any> {
    const user = await this.validateUser(loginDto.type, loginDto[loginDto.type], loginDto.password);

    if (!user) throw new UnauthorizedException();

    const accessToken = this.JwtService.sign({ userId: user._id });

    return { user, accessToken: accessToken };
  }

  async validateUser(type: string, loginString: string, password: string): Promise<any> {
    const user = await this.UserModel.findOne({ [type]: loginString }).exec();
    if (user) {
      const passwordMatches = await user.validatePassword(password);

      user.password = user.salt = undefined; // delete is not working

      if (passwordMatches) {
        return user;
      }
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<any> {
    let record = await this.OtpModel.findOne({ _id: resetPasswordDto.otpVerificationCode, for: resetPasswordDto[resetPasswordDto.type] }).exec();

    if (!record) throw new BadRequestException("Invalid token");

    const user = await this.UserModel.findOne({ [resetPasswordDto.type]: resetPasswordDto[resetPasswordDto.type] }).exec();

    if (!user) throw new BadRequestException(`${[resetPasswordDto.type]} not exists`);

    const salt = await bcrypt.genSalt();
    const password = await this.hashPassword(resetPasswordDto.password, salt);

    user.salt = salt;
    user.password = password;

    await user.save();

    user.password = user.salt = undefined; // delete is not working

    const accessToken = this.JwtService.sign({ userId: user._id });

    return { user: user, accessToken: accessToken };
  }

  async fetchGoogleDetails(googleClientDetailsDto: GoogleClientDetailsDto): Promise<any>{
    try{
      const token = googleClientDetailsDto.token;
      const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
      let data = {};
      data["id"] = response.data.id;
      data["email"] = response.data.email;
      data["token"] = googleClientDetailsDto.token;
      let nameArr = response.data.name.split(" ");
      data["firstName"] = nameArr[0];
      data["lastName"] = nameArr[1];
      data["profile"] = response.data.picture;
      return data; 
    }
    catch(error){
      console.log("error is --> ", error.response.data);
      throw new BadRequestException("Unable to fetch details");
    }
  }

  async fetchFacebookDetails(facebookClientDetailsDto: FacebookClientDetailsDto): Promise<any>{
    try{
      const token = facebookClientDetailsDto.access_token;
      const response = await axios.get(`https://graph.facebook.com/me?fields=id,email,first_name,last_name,picture{url}&access_token=${token}`);
      let data = {};
      data["id"] = response.data.id;
      data["email"] = response.data.email;
      data["token"] = facebookClientDetailsDto.access_token;
      data["firstName"] = response.data.first_name;
      data["lastName"] =response.data.last_name;
      data["profile"] = response.data.picture.data.url;
      return data; 
    }
    catch(error){
      console.log("error is --> ", error.response.data);
      throw new BadRequestException("Unable to fetch details");
    }
  }

  async socialLogin(type: AuthTypes.GOOGLE | AuthTypes.FACEBOOK, socialUser: SocialUser): Promise <any> {
    const user = await this.UserModel.findOne({ [`${type}Id`]: socialUser.id }).exec();

    if (user) {
      user.password = user.salt = undefined;
      return { token: this.JwtService.sign({ userId: user._id }), user}
    };

    const salt = await bcrypt.genSalt();
    const password = await this.hashPassword(this.randomOTP(10), salt);

    const createdUser = new this.UserModel({
      type,
      [`${type}Id`]: socialUser.id,
      password,
      salt,
      email: socialUser.email,
      firstname: socialUser.firstName,
      lastname: socialUser.lastName,
      picture: socialUser.profile
    });

    await createdUser.save()

    createdUser.password = createdUser.salt = undefined;
    return {
      token : this.JwtService.sign({ userId: createdUser._id }),
      user: createdUser
    }
  }

  private async hashPassword(password: string, salt: string): Promise<String> {
    return await bcrypt.hash(password, salt);
  }

  private randomOTP(otpLength: number = 6) {
    var digits = "0123456789";
    var otp = "";

    for (let i = 1; i <= otpLength; i++) {
      var index = Math.floor(Math.random() * digits.length);
      otp = otp + digits[index];
    }

    return otp;
  }
}
