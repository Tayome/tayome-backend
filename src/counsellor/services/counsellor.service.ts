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
                    from: "diseasedetails",
                    localField: "medicalCondition",
                    foreignField: "_id",
                    as: "medicalCondition",
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
                            $unwind: {path: "$campaignId", preserveNullAndEmptyArrays: true},
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
                $lookup: {
                    from: "followups",
                    localField: "_id",
                    foreignField: "patientId",
                    as: "followUp",
                },
            },
            {
                $addFields: {
                    lastFollowUp: {
                        $filter: {
                            input: { $ifNull: ["$followUp", []] },
                            as: "follow",
                            cond: { $lt: ["$$follow.followUpDate", new Date()] }, 
                        },
                    },
                },
            },
            {
                $unwind: {path: "$lastFollowUp", preserveNullAndEmptyArrays: true},
            },
            {
                $sort: { "lastFollowUp.followUpDate": -1 }, 
            },
            {
                $limit: 1, 
            },
            {
                $addFields: {
                    upComingFollowup: {
                        $filter: {
                            input: { $ifNull: ["$followUp", []] },
                            as: "follow",
                            cond: { $gt: ["$$follow.followUpDate", new Date()] }, 
                        },
                    },
                },
            },
            {
                $unwind: {path: "$upComingFollowup", preserveNullAndEmptyArrays: true},
            },
            {
                $sort: { "upComingFollowup.followUpDate": -1 }, 
            },
            {
                $limit: 1, 
            },
            {
                $unwind: {path: "$clinicId", preserveNullAndEmptyArrays: true},
            },
            {
                $unwind: {path: "$counsellorId", preserveNullAndEmptyArrays: true},
            },
            {
                $project: {
                    followUp: 0
                }
            }
        ]);

        // const disease = await this.DiseaseDetailModel.findById(user.medicalCondition);
        // const result = {
        //     ...user[0], // Convert Mongoose document to plain JavaScript object
        //     medicalCondition: disease,
        // };

        return user;
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

    async patientDetails(id: string,pageNumber: number, pageSize: number,): Promise<any> {
        try {

            pageNumber=isNaN(pageNumber) ? 1 : pageNumber;
            pageSize=isNaN(pageSize) ? 10 : pageSize;
            const skip = (pageNumber - 1) * pageSize; // Calculate number of documents to skip
            console.log(pageNumber,pageSize)
            const result = await this.patientModel.aggregate([
                {
                    $match: { counsellorId: new Types.ObjectId(id) }
                },
                {
                    $lookup: {
                        from: "diseasedetails", // Target collection name (assuming it's "diseases")
                        localField: "medicalCondition",
                        foreignField: "_id",
                        as: "medicalConditionDetails"
                    }
                },
                {
                    $unwind: "$medicalConditionDetails"
                },
                {
                    $project: {
                        "_id": 1,
                        "name": 1,
                        "city": 1,
                        "countryCode": 1,
                        "mobile": 1,
                        "diseaseName": "$medicalConditionDetails.diseaseName" // Extract disease name
                    }
                },
                {
                    $skip: skip // Skip documents based on pagination
                },
                {
                    $limit: pageSize // Limit the number of documents per page
                }
            ]);
    
            return {
                data:result,
                count:result?.length
            }
        } catch (error) {
            console.error("Error fetching patient details:", error);
            throw error; // Handle or rethrow the error as needed
        }
    }
    
}
