import { BadRequestException, Injectable } from "@nestjs/common";
import { CampaignListDto } from "../dto/campaign-list.dto";
import { InjectModel } from "@nestjs/mongoose";
import { CreateCampaignDto } from "../dto/create-campagin.dto";
import { Campaign } from "../schemas/campaign.schema";
import { Model } from "mongoose";
import { RemoveCampaignDto } from "../dto/remove-campaign.dto";
import { CampaignAssign } from "../schemas/campaign-assign.schema";
import { assignCampaignDto } from "../dto/campaign-assign.dto";
import { TransactionService } from "src/utils/services/transaction.service";
import { Patients } from "src/users/schemas/patients.schema";

import { AxiosResponse } from "axios";
import { Observable } from "rxjs";
import { UploadService } from "src/utils/services/upload.service";
import { HttpService } from "@nestjs/axios";
import { DiseaseDetail } from "src/disease/schemas/disease-detail.schema";
import { CampaignSend } from "src/campaignsend/schemas/campaign-send.schema";
import { firstValueFrom } from "rxjs";
@Injectable()
export class CampaignService {
    private readonly apiHeaders = {
        "Content-Type": "application/json",
        apikey: process.env.API_KEY,
        // Add any other headers you need
    };

    private readonly apiBaseUrl = "https://api.pinbot.ai/v2/wamessage/sendMessage";

    constructor(
        @InjectModel(Campaign.name) private CampaignModel: Model<Campaign>,
        @InjectModel(Patients.name) private PatientModel: Model<Patients>,
        @InjectModel(CampaignAssign.name) private CampaignAssignModel: Model<CampaignAssign>,
        @InjectModel(DiseaseDetail.name) private DiseaseDetailModel: Model<DiseaseDetail>,
        @InjectModel(CampaignSend.name) private CampaignSendModel: Model<CampaignSend>,
        private readonly transactionService: TransactionService,
        private readonly httpService: HttpService,
        private UploadService: UploadService,
    ) {}

    async onModuleInit() {
        await this.CampaignModel.syncIndexes();
    }

    async createNewCampaign(createCampaignDto: CreateCampaignDto, images: Array<Express.Multer.File>): Promise<any> {
        // const imageData = await this.UploadService.upload(image.buffer, "campaign/", image.originalname);
        const imageData1 = await Promise.all(
            images.map(async (item, index) => {
                const im = await this.UploadService.upload(item.buffer, "campaign/", item.originalname);
                return im;
            }),
        );
        const mergedArray = createCampaignDto.weekData.map((item, index) => ({
            ...item,
            file: imageData1[index]?.Location || null, // Add the file name or null if not present
        }));
        createCampaignDto.weekData = mergedArray;
        let createCampaignDetails = new this.CampaignModel(createCampaignDto);
        let data = await createCampaignDetails.save();
        return {
            message: "Campaign Created successfully",
            data: data,
        };
    }

    async campaignListPipeline(campaignListDTO: CampaignListDto): Promise<Array<any>> {
        const pageSize = campaignListDTO.pageSize ?? 10;
        const page = campaignListDTO.page ?? 1;
        const skip = pageSize * (page - 1);
        let search: string = "";
        if (campaignListDTO.search) {
            search = campaignListDTO.search.trim().split(" ").join("|");
        }

        let pipeline = [
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $match: {
                    $or: [
                        {
                            name: {
                                $regex: `.*${search}.*`,
                                $options: "i",
                            },
                        },
                    ],
                },
            },
            {
                $facet: {
                    list: [
                        {
                            $skip: skip,
                        },
                        {
                            $limit: pageSize,
                        },
                        {
                            $lookup: {
                                from: "diseasedetails",
                                localField: "diseaseId",
                                foreignField: "_id",
                                as: "diseasedetails",
                            },
                        },
                        {
                            $unwind: {
                                path: "$diseasedetails",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: "campaignassigns",
                                localField: "_id",
                                foreignField: "campaignId",
                                as: "assignedUsers",
                            },
                        },
                        {
                            $project: {
                                campaignName: "$name",
                                diseaseName: "$diseasedetails.diseaseName",
                                createdAt: 1,
                                campaignStatus: {
                                    $ifNull: ["$status", "ready"],
                                },
                                numberOfWeeks: "$weekData.weekNumber",
                                totalPatients: {
                                    $size: "$assignedUsers",
                                },
                            },
                        },
                    ],
                    total: [
                        {
                            $count: "total",
                        },
                    ],
                },
            },
        ];
        return pipeline;
    }

    async campaignList(campaignListDTO: CampaignListDto): Promise<any> {
        let pipeline = await this.campaignListPipeline(campaignListDTO);
        let data = await this.CampaignModel.aggregate(pipeline);
        // console.log(data);
        return {
            list: data[0]?.list,
            count: data[0]?.total[0]?.total ? data[0]?.total[0]?.total : 0,
        };
    }

    async remove(removeCampaignDto: RemoveCampaignDto): Promise<any> {
        // Delete from CampaignModel
        const data = await this.CampaignModel.findByIdAndDelete(removeCampaignDto.id);

        // Delete from CampaignAssignModel
        const deleteAssignData = await this.CampaignAssignModel.deleteMany({ campaignId: removeCampaignDto.id });
        return {
            message: "Campaign removed successfully",
        };
    }

    async assignCampaign(assignCampaignDto: assignCampaignDto): Promise<any> {
        const session = await this.transactionService.startTransaction();
        try {
            // const headers = {
            //     "Content-Type": "application/json",
            //     apikey: process.env.API_KEY,
            //     // Add any other headers you need
            // };

            const today = new Date();
            let camp_id = await this.CampaignModel.findOne({ diseaseId: assignCampaignDto.diseaseId }, { _id: 1 });
            camp_id = camp_id["id"];
            let addDetails = new this.CampaignAssignModel({ userId: assignCampaignDto.userId, campaignId: camp_id });
            let data = await addDetails.save({ session });
            await this.transactionService.commitTransaction(session);
            let userData = await this.PatientModel.findById(data.userId);
            let campaignData = await this.CampaignModel.findById(data.campaignId);

            const sendCampaignToUser = campaignData.weekData.filter(item => item.weekNumber === "1");
            const templateData = {
                from: process.env.ADMIN_WHATS_APP_NUMBER,
                to: "91" + userData.mobile,
                type: "template",
                header: "Welcome to Pinnacle",
                message: {
                    templateid: "107995",
                    placeholders: [],
                    Footer: "www.pinnacle.in",
                    buttons: [
                        {
                            index: 0,
                            type: "quick_reply",
                        },
                    ],
                },
            };
            const textData = {
                from: process.env.ADMIN_WHATS_APP_NUMBER,
                to: "91" + userData.mobile,
                type: "text",
                message: {
                    text: sendCampaignToUser[0].content,
                },
            };
            const imgData = {
                from: process.env.ADMIN_WHATS_APP_NUMBER,
                to: "91" + userData.mobile,
                type: "image",
                message: {
                    url: sendCampaignToUser[0].file,
                    caption: "refer this image",
                    filename: "sample",
                },
            };
            const headers = this.apiHeaders;
            const temp_res = await firstValueFrom(this.httpService.post(this.apiBaseUrl, templateData, { headers }));
            const text_response = await firstValueFrom(this.httpService.post(this.apiBaseUrl, textData, { headers }));
            const img_response = await firstValueFrom(this.httpService.post(this.apiBaseUrl, imgData, { headers }));
            console.log("---temp_res--", temp_res);
            console.log("---text_response--", text_response);
            console.log("---img_response--", img_response);
            let modifyData = campaignData.weekData.map((item, index) => {
                const sentOnDate = new Date(today);
                sentOnDate.setDate(today.getDate() + index * 7);
                if (sendCampaignToUser[0]["_id"] === item["_id"]) {
                    return {
                        weekId: item["_id"],
                        messageSent: true,
                        sentOn: sentOnDate.toISOString(),
                        userResponse: "sent",
                    };
                }
                return {
                    weekId: item["_id"],
                    messageSent: false,
                    sentOn: sentOnDate.toISOString(),
                    userResponse: "",
                };
            });
            let sendCampaignData = {
                userId: data.userId,
                mobile: "91" + userData.mobile,
                campaignId: data.campaignId,
                campaignResponse: modifyData,
            };
            let createCampaignsend = new this.CampaignSendModel(sendCampaignData);
            let res = await createCampaignsend.save();
            return {
                message: "Campaign Assigned successfully",
                data: res,
            };
        } catch (error) {
            await this.transactionService.abortTransaction(session);
            throw error;
        }
    }

    async campaignDetail(removeCampaignDto: RemoveCampaignDto): Promise<any> {
        // Delete from CampaignModel
        const data = await this.CampaignModel.findById(removeCampaignDto.id);
        const disease = await this.DiseaseDetailModel.findById(data.diseaseId);
        if (!data) {
            throw new BadRequestException("Unable to remove campaign or related assignments");
        }
        const result = {
            ...data.toObject(), // Convert Mongoose document to plain JavaScript object
            disease: disease,
        };

        return {
            message: "Campaign retrieved successfully",
            data: result,
        };
    }
}
