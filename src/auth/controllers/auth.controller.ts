import { Controller, Get, Post, Body, HttpCode, UseGuards, Req, Res } from "@nestjs/common";
import { RequestOtpDto } from "../dto/request-otp.dto";
import { AuthService } from "../services/auth.service";
import { VerifyOtpDto } from "../dto/verify-otp.dto";
import { RegisterUserDto } from "../dto/register-user.dto";
import { GoogleClientDetailsDto } from "../dto/google-client-details.dto";
import { FacebookClientDetailsDto } from "../dto/facebook-client-details.dto";
import { LoginDto } from "../dto/login.dto";
import { AuthGuard } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { AuthTypes } from "../enums/auth.enum";
import { ResetPasswordDto } from "../dto/reset-password.dto";

@Controller("auth")
export class AuthController {
  constructor(private authservice: AuthService, private readonly configService: ConfigService) {}

  @Get("/google")
  @UseGuards(AuthGuard("google"))
  async googleLogin() {}

  @Get("/google/callback")
  @UseGuards(AuthGuard("google"))
  async googleCallback(@Req() req, @Res() res) {
    const frontendHost = this.configService.getOrThrow<string>("FRONTEND_APP_URL");
    if (!req.user) {
      return res.redirect(`${frontendHost}/auth/social-login/failed/google`);
    }
    const {token} = await this.authservice.socialLogin(AuthTypes.GOOGLE, req.user);
    return res.redirect(`${frontendHost}/auth/social-login/success/${token}/token`);
  }

  @Get("/facebook")
  @UseGuards(AuthGuard("facebook"))
  async facebookLogin() {}

  @Get("/facebook/callback")
  @UseGuards(AuthGuard("facebook"))
  async facebookCallback(@Req() req, @Res() res) {
    const frontendHost = this.configService.getOrThrow<string>("FRONTEND_APP_URL");
    if (!req.user) {
      return res.redirect(`${frontendHost}/auth/social-login/failed/facebook`);
    }
    const {token} = await this.authservice.socialLogin(AuthTypes.FACEBOOK, req.user);
    return res.redirect(`${frontendHost}/auth/social-login/success/${token}/token`);
  }

  @Post("/google/clientDetails")
  async googleClientDetails(@Body() googleClientDetailsDto: GoogleClientDetailsDto){
    const getClientDetails = await this.authservice.fetchGoogleDetails(googleClientDetailsDto);
    const data = await this.authservice.socialLogin(AuthTypes.GOOGLE, getClientDetails);
    return {
      message: "User Login",
      data,
    };
  }

  @Post("/facebook/clientDetails")
  async facebookClientDetails(@Body() facebookClientDetailsDto: FacebookClientDetailsDto){
    const getClientDetails = await this.authservice.fetchFacebookDetails(facebookClientDetailsDto);
    const data = await this.authservice.socialLogin(AuthTypes.FACEBOOK, getClientDetails);
    return {
      message: "User Login",
      data,
    };
  }

  @HttpCode(200)
  @Post("/request-otp")
  async requestOTP(@Body() requestOtpDto: RequestOtpDto) {
    const createOtp = await this.authservice.createOtp(requestOtpDto);

    return {
      message: "OTP genrated",
      data: {
        otp: createOtp,
      },
    };
  }

  @HttpCode(200)
  @Post("/verify-otp")
  async verifyOTP(@Body() verifyOtpDto: VerifyOtpDto) {
    const verifyOtp = await this.authservice.verifyOtp(verifyOtpDto);

    return {
      message: "OTP verified",
      data: {
        token: verifyOtp,
      },
    };
  }

  @HttpCode(201)
  @Post("/register")
  async registerUser(@Body() registerUserDto: RegisterUserDto): Promise<object> {
    const data = await this.authservice.registerUser(registerUserDto);

    return {
      message: "User registered",
      data: data,
    };
  }

  @HttpCode(200)
  @Post("/login")
  async login(@Body() loginDto: LoginDto) {
    const data = await this.authservice.login(loginDto);

    return {
      message: "User Login",
      data: data,
    };
  }

  @HttpCode(200)
  @Post("/change-password")
  async(@Body() registerUserDto: RegisterUserDto) {}

  @HttpCode(200)
  @Post("/forget-password-request-otp")
  async forgetPasswordRequestOtp(@Body() requestOtpDto: RequestOtpDto) {
    const createOtp = await this.authservice.forgetPasswordOtp(requestOtpDto);

    return {
      message: "OTP genrated",
      data: {
        otp: createOtp,
      },
    };
  }

  @HttpCode(200)
  @Post("/reset-password")
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const createOtp = await this.authservice.resetPassword(resetPasswordDto);

    return {
      message: "OTP genrated",
      data: {
        otp: createOtp,
      },
    };
  }

  @HttpCode(200)
  @Post("/logout")
  async logout() {}
}
