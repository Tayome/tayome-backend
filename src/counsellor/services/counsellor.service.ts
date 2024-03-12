import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Patients } from "src/users/schemas/patients.schema";
import { GetPatientListDto } from "../dto/patient-list.dto";
import { DiseaseDetail } from "src/disease/schemas/disease-detail.schema";
import { CampaignAssign } from "src/campaign/schemas/campaign-assign.schema";

@Injectable()
export class CounsellorService {
    constructor(
        @InjectModel(Patients.name) private patientModel: Model<Patients>,
        @InjectModel(DiseaseDetail.name) private DiseaseDetailModel: Model<DiseaseDetail>,
        @InjectModel(CampaignAssign.name) private CampaignAssignModel: Model<CampaignAssign>,
    ) {}

    async getPatientList(id: string, GetPatientListDto: GetPatientListDto): Promise<any> {
        const pageSize = GetPatientListDto.pageSize ?? 10;
        const page = GetPatientListDto?.page ?? 1;
        const skip = pageSize * (page - 1);
        const counsellorId = Types.ObjectId.createFromHexString(id);
        let query = { counsellorId: counsellorId };

        if (GetPatientListDto?.search) {
            const searchQueryString = GetPatientListDto.search.trim().split(" ").join("|");
            query["$or"] = [{ name: { $regex: `.*${searchQueryString}.*`, $options: "i" } }, { city: { $regex: `.*${searchQueryString}.*`, $options: "i" } }];
        }

        const countProm = this.patientModel.count(query);
        const dataProm = this.patientModel.find(query).skip(skip).limit(pageSize).exec();

        const [count, list] = await Promise.all([countProm, dataProm]);
        return { count, list };
    }

    async getPatientDetails(id: string): Promise<any> {
        // const user = await this.patientModel.findById(id)
        // .populate("clinicId")
        // .populate("medicalCondition")
        // .populate("counsellorId", "firstName lastName email gender")
        // .exec();
        // const disease = await this.DiseaseDetailModel.findById(user.medicalCondition);
        // const result = {
        //     ...user.toObject(), // Convert Mongoose document to plain JavaScript object
        //     medicalCondition: disease,
        // };

        const user: any = await this.patientModel.aggregate([
            {
                $match: { _id: Types.ObjectId.createFromHexString(id) },
            },
            {
                $lookup: {
                    from: "clinicsdetails",
                    localField: "clinicId",
                    foreignField: "_id",
                    as: "clinicId",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "counsellorId",
                    foreignField: "_id",
                    as: "counsellorId",
                    pipeline: [
                        {
                            $project: {
                                firstName: 1,
                                lastName: 1,
                                email: 1,
                                gender: 1,
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: "campaignassigns",
                    localField: "_id",
                    foreignField: "userId",
                    as: "campaignDetails",
                    pipeline: [
                        {
                            $lookup: {
                                from: "campaigns",
                                localField: "campaignId",
                                foreignField: "_id",
                                as: "campaignId",
                                pipeline: [
                                    {
                                        $project: {
                                            name: 1,
                                            weekData: 1,
                                            createdAt: 1,
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $unwind: "$campaignId",
                        },
                        {
                            $project: {
                                campaign: "$campaignId",
                            },
                        },
                    ],
                },
            },
            {
                $unwind: "$clinicId",
            },
            {
                $unwind: "$counsellorId",
            },
        ]);

        const disease = await this.DiseaseDetailModel.findById(user.medicalCondition);
        const result = {
            ...user[0], // Convert Mongoose document to plain JavaScript object
            medicalCondition: disease,
        };

        return result;
    }

    async getCampaignList(id: string): Promise<any> {
        const userId = Types.ObjectId.createFromHexString(id);
        const result = await this.CampaignAssignModel.aggregate([
            {
                $match: { userId: userId },
            },
            {
                $lookup: {
                    from: "campaigns",
                    localField: "campaignId",
                    foreignField: "_id",
                    as: "campaignList",
                    pipeline: [
                        {
                            $lookup: {
                                from: "diseasedetails",
                                localField: "diseaseId",
                                foreignField: "_id",
                                as: "diseaseList",
                                pipeline: [
                                    {
                                        $project: {
                                            diseaseName: 1,
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $unwind: "$diseaseList",
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                diseaseName: "$diseaseList.diseaseName",
                            },
                        },
                    ],
                },
            },
            {
                $unwind: "$campaignList",
            },
            {
                $project: {
                    _id: "$campaignList._id",
                    name: "$campaignList.name",
                    diseaseName: "$campaignList.diseaseName",
                },
            },
        ]);
        return result;
    }
}
