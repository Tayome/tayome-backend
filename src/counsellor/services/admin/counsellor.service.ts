import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Counsellor } from "../../schemas/counsellor.schema";
import { Model, Types } from "mongoose";
import { GetCounsellorDto } from "../../dto/get-counsellor.dto";
import { UpdateCounsellorDto } from "../../dto/update-counsellor.dto";
import * as bcrypt from "bcrypt";
import { RegisterUserDto } from "src/auth/dto/register-user.dto";
import { User } from "src/users/schemas/user.schema";
import { RoleType } from "src/auth/enums/role.enum";
import { Patients } from "src/users/schemas/patients.schema";
import { AuthTypes } from "src/auth/enums/auth.enum";
import { MailService } from "src/mail/services/mail.service";
import { AssignCounsellorDto } from "src/counsellor/dto/assign-counsellor.dto";
import { Journey, JourneyType } from "src/journey/schemas/journey.schema";
import { UpdateStatusDto } from "src/counsellor/dto/update-status.dto";
import { CounsellorManager } from "src/counsellor/schemas/counsellor.manager.schema";
import { TransactionService } from "src/utils/services/transaction.service";

@Injectable()
export class CounsellorService {
    constructor(
        @InjectModel(Counsellor.name) private counsellorModel: Model<Counsellor>,
        @InjectModel(CounsellorManager.name) private counsellorManagerModel: Model<CounsellorManager>,
        @InjectModel(User.name) private UserModel: Model<User>,
        @InjectModel(Patients.name) private patientModel: Model<Patients>,
        @InjectModel(Journey.name) private journeyModel: Model<Journey>,
        private mailService: MailService,
        private readonly transactionService: TransactionService,

    ) {}

    async createCounsellor(registerUserDto: RegisterUserDto): Promise<any> {
        const session = await this.transactionService.startTransaction();
        try{
        const salt = await bcrypt.genSalt();
        const password = await this.hashPassword(registerUserDto.password, salt);
        const counsellorManagerModel=await this.counsellorManagerModel.findOne({});

        const createdUser = new this.UserModel({
            type: registerUserDto.type,
            role: RoleType.COUNSELLOR,
            firstName: registerUserDto.firstName,
            lastName: registerUserDto.lastName ?? "",
            [registerUserDto.type]: registerUserDto[registerUserDto.type],
            mobile: registerUserDto?.mobile,
            gender: registerUserDto?.gender,
            index:counsellorManagerModel?counsellorManagerModel.counter+1:1,
            password,
            salt,
        });
        if(!counsellorManagerModel){
            const counsellorManager=new this.counsellorManagerModel({
                CounsellorId:createdUser._id,
                counter:1
            });
            await counsellorManager.save({ session });
        }
        else{
            counsellorManagerModel.CounsellorId=createdUser._id;
            counsellorManagerModel.counter=counsellorManagerModel.counter+1;
            await counsellorManagerModel.save({ session });
        }

        await createdUser.save({ session });
        await this.transactionService.commitTransaction(session);

        createdUser.password = createdUser.salt = undefined; // delete is not working
        if (registerUserDto.type === AuthTypes.EMAIL && registerUserDto?.email) {
            const mailData = {
                firstName: registerUserDto?.firstName ?? "User",
                lastName: registerUserDto?.lastName ?? "",
                email: registerUserDto?.email,
                password: registerUserDto.password,
            };
            this.mailService.sendMail({
                to: registerUserDto.email,
                subject: "OTP for email verification",
                template: "sign-up",
                context: mailData,
            });
        }
        return createdUser;
    }
    catch(error){
        await this.transactionService.abortTransaction(session);
        throw error;
    }
    }

    async getCounsellorList(GetCounsellorDto: GetCounsellorDto): Promise<any> {
        const pageSize = GetCounsellorDto?.pageSize ?? 10;
        const page = GetCounsellorDto?.page ?? 1;
        const skip = pageSize * (page - 1);
        let query = { role: RoleType.COUNSELLOR };
        // query["status"] = true;

        if (GetCounsellorDto?.search) {
            const searchQueryString = GetCounsellorDto.search.trim().split(" ").join("|");
            query["$or"] = [
                { firstName: { $regex: `.*${searchQueryString}.*`, $options: "i" } },
                { lastName: { $regex: `.*${searchQueryString}.*`, $options: "i" } },
                { email: { $regex: `.*${searchQueryString}.*`, $options: "i" } },
            ];
        }

        const countProm = this.UserModel.count(query);

        const dataProm = this.UserModel.aggregate([
            {
                $match: query,
            },
            {
                $lookup: {
                    from: "patients",
                    localField: "_id",
                    foreignField: "counsellorId",
                    as: "patient",
                },
            },
            {
                $project: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    type: 1,
                    mobile: 1,
                    email: 1,
                    gender: 1,
                    assigned: 1,
                    role: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    patientCount: { $size: "$patient" }, // Count the number of patients for each user
                    status: 1,
                },
            },
            {
                $sort: {
                    createdAt: -1, // Sort in descending order (latest first)
                },
            },
        ])
            .skip(skip)
            .limit(pageSize)
            .exec();

        const [count, list] = await Promise.all([countProm, dataProm]);
        return { count, list };
    }

    async getCounsellorDetails(id: string): Promise<any> {
        return await this.UserModel.aggregate([
            {
                $match: {
                    _id: Types.ObjectId.createFromHexString(id),
                    // status: true,
                },
            },
            {
                $lookup: {
                    from: "patients",
                    localField: "_id",
                    foreignField: "counsellorId",
                    as: "patient",
                },
            },
            {
                $project: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    type: 1,
                    mobile: 1,
                    email: 1,
                    gender: 1,
                    assigned: 1,
                    role: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    patientCount: { $size: "$patient" }, // Count the number of patients for each user
                    status: 1
                },
            },
        ]);
        // return this.UserModel.findById(id).select("-salt -password").exec();
    }

    async updateCounsellor(id: string, UpdateCounsellorDto: UpdateCounsellorDto): Promise<any> {
        return await this.UserModel.findByIdAndUpdate(id, UpdateCounsellorDto, { new: true }).exec();
    }

    async deleteCounsellor(id: string): Promise<any> {
        return await this.counsellorModel.findByIdAndDelete(id);
    }

    async assignCounsellor(id: string, assignCounsellorDto: AssignCounsellorDto): Promise<any> {
        let query: any = {};

        if (assignCounsellorDto?.counsellorId) {
            let counsellorQuery = { _id: Types.ObjectId.createFromHexString(assignCounsellorDto.counsellorId) };
            counsellorQuery["status"] = true;
            const existCounsellor = await this.UserModel.findOne(counsellorQuery);
            if (!existCounsellor) {
                throw new BadRequestException("Counsellor is not active");
            }
            query["counsellorId"] = assignCounsellorDto.counsellorId;
        } else {
            const nextCounsellor = await this.getNextCounsellor();
            if (nextCounsellor) {
                query["counsellorId"] = nextCounsellor._id;
            }
        }

        const journey = {
            patientId: id,
            counsellorId: query?.counsellorId,
            journeyType: JourneyType.ASSIGNCOUNSELLOR,
        };
        const saveJourney = new this.journeyModel(journey);
        await saveJourney.save();
        return await this.patientModel.findByIdAndUpdate(id, query, { new: true });
    }

    async updateStatus(id: string, UpdateStatusDto: UpdateStatusDto): Promise<any> {
        return await this.UserModel.findByIdAndUpdate(id, { status: UpdateStatusDto.status }, { new: true }).exec();
    }

    private async hashPassword(password: string, salt: string): Promise<String> {
        return await bcrypt.hash(password, salt);
    }

    private async getNextCounsellor(): Promise<any> {
        // Find the first unassigned counsellor
        const unassignedEmployee = await this.UserModel.findOneAndUpdate({ assigned: false, role: RoleType.COUNSELLOR, status: true }, { assigned: true }, { new: true });

        // If no unassigned counsellor is found, reset the assignments
        if (!unassignedEmployee) {
            await this.UserModel.updateMany({ role: RoleType.COUNSELLOR, status: true }, { assigned: false });
            return this.UserModel.findOneAndUpdate({ role: RoleType.COUNSELLOR, status: true }, { assigned: true }, { new: true });
        }

        return unassignedEmployee;
    }
}
