import { Injectable } from "@nestjs/common";
import { User } from "../schemas/user.schema";
import { Connection, Model } from "mongoose";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { UploadService } from "src/utils/services/upload.service";
import { OnboardingUserDto } from "../dto/onboarding-user.dto";
import { Patients } from "../schemas/patients.schema";

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
        @InjectModel(Patients.name) private PatientModel: Model<Patients>, 
        @InjectConnection() private readonly connection: Connection, 
        private UploadService: UploadService
    ) {}

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

    async onboardingUser(onboardingUserDto: OnboardingUserDto): Promise<any>{
        let patientData = new this.PatientModel(onboardingUserDto);
        return await patientData.save();
    }
}
