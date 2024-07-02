import { Injectable } from "@nestjs/common";
import { User } from "../schemas/user.schema";
import { Connection, Model, Types } from "mongoose";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { UploadService } from "src/utils/services/upload.service";
import { OnboardingUserDto } from "../dto/onboarding-user.dto";
import { Patients } from "../schemas/patients.schema";
import { PatientsListDto } from "../dto/patients-list.dto";
import { PatienDetailDto } from "../dto/patient-detail.dto";
import { DiseaseDetail } from "src/disease/schemas/disease-detail.schema";
import { PatientsManager } from "../schemas/patients.manager.schema";
import { TransactionService } from "src/utils/services/transaction.service";
import { RegisterSubAdminDto } from "src/auth/dto/register-user.dto";
import { RoleType } from "src/auth/enums/role.enum";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
        @InjectModel(Patients.name) private PatientModel: Model<Patients>,
        @InjectConnection() private readonly connection: Connection,
        @InjectModel(DiseaseDetail.name) private DiseaseDetailModel: Model<DiseaseDetail>,
        private UploadService: UploadService,
        @InjectModel(PatientsManager.name) private PatientsManagerModel: Model<PatientsManager>,
        private readonly transactionService: TransactionService,
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
        const session = await this.transactionService.startTransaction();

        try {
            let checkPhoneNo = await this.PatientModel.findOne({ mobile: onboardingUserDto.mobile });
            if (checkPhoneNo) {
                return {
                    status: false,
                    message: "Phone number already exist",
                };
            }
            let patientData = new this.PatientModel(onboardingUserDto);
            let patientManager = await this.PatientsManagerModel.findOne({});
            let userData = await this.UserModel.find({ role: "counsellor", status: true }).sort({ index: 1 }).limit(1);
            if (!patientManager) {
                if (userData?.length > 0) {
                    patientData.counsellorId = userData[0]?._id ? userData[0]?._id : "";
                    patientManager = new this.PatientsManagerModel({ CounsellorId: userData[0]._id, counter: userData[0].index });
                }
            } else {
                let userDetails = await this.UserModel.find({ role: "counsellor", status: true, index: { $gt: patientManager.counter } })
                    .sort({ index: 1 })
                    .limit(1);
                if (userDetails?.length > 0) {
                    patientData.counsellorId = userDetails[0]?._id ? userDetails[0]._id : "";
                    patientManager.CounsellorId = userDetails[0]?._id ? userDetails[0]?._id : "";
                    patientManager.counter = userDetails[0]?.index;
                } else {
                    patientData.counsellorId = userData[0]?._id ? userData[0]?._id : "";
                    patientManager.CounsellorId = userData[0]?._id ? userData[0]?._id : "";
                    patientManager.counter = userData[0]?.index;
                }
            }
            await patientManager.save({ session });
            await patientData.save({ session });
            await this.transactionService.commitTransaction(session);
            return patientData;
        } catch (error) {
            console.log(error.message);
            await this.transactionService.abortTransaction(session);
            throw error;
        }
    }

    async createSubAdmin(registerUserDto: RegisterSubAdminDto): Promise<any> {
        const session = await this.transactionService.startTransaction();
        try {
            const salt = await bcrypt.genSalt();
            const password = await this.hashPassword(registerUserDto.password, salt);
            const createdUser = new this.UserModel({
                type: registerUserDto.type,
                role: RoleType.SUBADMIN,
                isActive: true,
                firstName: registerUserDto.firstName,
                lastName: registerUserDto.lastName ?? "",
                [registerUserDto.type]: registerUserDto[registerUserDto.type],
                mobile: registerUserDto?.mobile,
                gender: registerUserDto?.gender,
                password,
                salt,
            });
            await createdUser.save({ session });
            await this.transactionService.commitTransaction(session);
            return createdUser;
        } catch (error) {
            await this.transactionService.abortTransaction(session);
            throw error;
        }
    }

    async updateStatus(status: boolean, id: string): Promise<any> {
        const session = await this.transactionService.startTransaction();
        try {
            const updatedUser = await this.UserModel.findByIdAndUpdate(id, { isActive: status }, { session });
            await this.transactionService.commitTransaction(session);
            return updatedUser;
        } catch (error) {
            await this.transactionService.abortTransaction(session);
            throw error;
        }
    }
    private async hashPassword(password: string, salt: string): Promise<String> {
        return await bcrypt.hash(password, salt);
    }
    async patientsList(patientsListDto: PatientsListDto, user): Promise<any> {
        const pageSize = patientsListDto.pageSize ?? 10;
        const page = patientsListDto.page ?? 1;
        const skip = pageSize * (page - 1);
        let sort = {};
        let query;
        let countQuery;
        if (user.role == "admin") {
            query = this.PatientModel.find();
            countQuery = this.PatientModel.countDocuments();
        } else {
            query = this.PatientModel.find({ counsellorId: user.id });
            countQuery = this.PatientModel.countDocuments({ counsellorId: user.id });
        }
        if (patientsListDto.name) {
            // Add name search to the query
            query = query.find({ name: { $regex: patientsListDto.name, $options: "i" } });
        }

        const patient = await query
            .sort({ ...sort, createdAt: -1 })
            .limit(pageSize)
            .skip(skip)
            .populate("clinicId")
            .populate("counsellorId", "-password -salt")
            .populate("medicalCondition")
            .exec();

        const count = await countQuery;

        return {
            list: patient,
            count: count,
        };
    }

    async patienDetails(patienDetailDto: PatienDetailDto): Promise<any> {
        const user = await this.PatientModel.findById(patienDetailDto.id)
            .populate("clinicId")
            .populate("counsellorId", "firstName lastName email gender")
            .populate("medicalCondition")
            .exec();
        // const disease = await this.DiseaseDetailModel.findById(user.medicalCondition);
        // const result = {
        //     ...user.toObject(), // Convert Mongoose document to plain JavaScript object
        //     disease: disease,
        // };
        return user;
    }

    async getAllUser(pageNumber: number, pageSize: number, search: string): Promise<any> {
        const skip = (pageNumber - 1) * pageSize; // Calculate number of documents to skip

        const query = {};

        try {
            if (search?.length > 0) {
                query["$or"] = [{ firstName: { $regex: search, $options: "i" } }, { lastName: { $regex: search, $options: "i" } }];
            }
            const totalUser = await this.UserModel.countDocuments(query);
            const UserList = await this.UserModel.find(query).skip(skip).limit(pageSize);

            if (!UserList || UserList?.length === 0) {
                return {
                    status: 404,
                    message: "No Sub-admin found",
                    data: [],
                    totalItems: totalUser,
                };
            } else {
                return {
                    status: 200,
                    message: "Sub-admin fetched successfully",
                    data: UserList,
                    totalItems: totalUser,
                };
            }
        } catch (error) {
            return {
                status: 500,
                message: "Internal server error",
                error: error.message,
            };
        }
    }
}
