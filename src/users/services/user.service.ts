import { Injectable } from "@nestjs/common";
import { User } from "../schemas/user.schema";
import { Connection, Model } from "mongoose";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { UploadService } from "src/utils/services/upload.service";
import { OnboardingUserDto } from "../dto/onboarding-user.dto";
import { Patients } from "../schemas/patients.schema";
import { PatientsListDto } from "../dto/patients-list.dto";
import { PatienDetailDto } from "../dto/patient-detail.dto";
import { DiseaseDetail } from "src/disease/schemas/disease-detail.schema";

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
        @InjectModel(Patients.name) private PatientModel: Model<Patients>,
        @InjectConnection() private readonly connection: Connection,
        @InjectModel(DiseaseDetail.name) private DiseaseDetailModel: Model<DiseaseDetail>,
        private UploadService: UploadService,
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

    async onboardingUser(onboardingUserDto: OnboardingUserDto): Promise<any> {
        let patientData = new this.PatientModel(onboardingUserDto);
        return await patientData.save();
    }

    async patientsList(patientsListDto: PatientsListDto, user): Promise<any> {
        const pageSize = patientsListDto.pageSize ?? 10;
        const page = patientsListDto.page ?? 1;
        const skip = pageSize * (page - 1);
        let sort = {};
        let query;
        if (user.role == "admin") {
            query = this.PatientModel.find();
        } else {
            query = this.PatientModel.find({ counsellorId: user.id });
        }
        if (patientsListDto.name) {
            // Add name search to the query
            query = query.find({ name: { $regex: patientsListDto.name, $options: "i" } });
        }

        return await query
            .sort({ ...sort, createdAt: -1 })
            .limit(pageSize)
            .skip(skip)
            .populate("clinicId")
            .exec();
    }

    async patienDetails(patienDetailDto: PatienDetailDto): Promise<any> {
        const user = await this.PatientModel.findById(patienDetailDto.id).populate("clinicId").populate("counsellorId", "firstName lastName email gender").exec();
        const disease = await this.DiseaseDetailModel.findById(user.medicalCondition);
        const result = {
            ...user.toObject(), // Convert Mongoose document to plain JavaScript object
            disease: disease,
        };
        return result;
    }
}
