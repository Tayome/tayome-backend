import { Injectable } from "@nestjs/common";
import { User } from "../schemas/user.schema";
import { Connection, Model } from "mongoose";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { UploadService } from "src/utils/services/upload.service";
import { UpdateProfileDto } from "../dto/update-profile.dto";

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private UserModel: Model<User>, @InjectConnection() private readonly connection: Connection, private UploadService: UploadService) {}

  async index() {
    return await this.UserModel.find().sort({ createdAt: -1 }).exec();
  }

  async getUserDetails(id: String): Promise<User> {
    return await this.UserModel.findById(id);
  }

  async getById(id: string): Promise<any> {
    const user = await this.UserModel.findById(id).exec();

    user.password = user.salt = undefined; // delete is not working
    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto, image?: Express.Multer.File): Promise<any> {
    const user = {};

    user["firstname"] = updateProfileDto.firstname;
    user["lastname"] = updateProfileDto.lastname;

    if (image) {
      const imageData = await this.UploadService.upload(image.buffer, "user/profile/", image.originalname);
      user["picture"] = imageData.Location;
    }
    const data = await this.UserModel.findByIdAndUpdate(userId, user, { returnOriginal: false });
    data.password = data.salt = undefined; // delete is not working

    return data;
  }
}
