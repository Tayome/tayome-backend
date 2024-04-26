import { BadRequestException, Injectable } from "@nestjs/common";
import { CampaignListDto } from "../dto/campaign-list.dto";
import { InjectModel } from "@nestjs/mongoose";
import { CreateCampaignDto } from "../dto/create-campagin.dto";
import { Campaign } from "../schemas/campaign.schema";
import { Model } from "mongoose";
import { RemoveCampaignDto } from "../dto/remove-campaign.dto";
import { CampaignAssign } from "../schemas/campaign-assign.schema";
import { TransactionService } from "src/utils/services/transaction.service";
import { Patients } from "src/users/schemas/patients.schema";
import { AxiosResponse } from "axios";
import { Observable } from "rxjs";
import { UploadService } from "src/utils/services/upload.service";
import { HttpService } from "@nestjs/axios";
import { DiseaseDetail } from "src/disease/schemas/disease-detail.schema";
import { CampaignSend } from "src/campaignsend/schemas/campaign-send.schema";
import { firstValueFrom } from "rxjs";
import { campaignAssignDto } from "../dto/campaign-assign.dto";
import { Journey, JourneyType } from "src/journey/schemas/journey.schema";
import { outcomeSurvey } from "src/survey/survey.schema";
@Injectable()
export class CampaignService {
    private readonly apiHeaders = {
        "Content-Type": "application/json",
        apikey: process.env.API_KEY,
        // Add any other headers you need
    };

    private readonly apiBaseUrl = "https://api.pinbot.ai/v2/wamessage/sendMessage";
    private readonly apiCampaignUrl = "https://console.pinbot.ai/api/create-template";

    constructor(
        @InjectModel(Campaign.name) private CampaignModel: Model<Campaign>,
        @InjectModel(Patients.name) private PatientModel: Model<Patients>,
        @InjectModel(CampaignAssign.name) private CampaignAssignModel: Model<CampaignAssign>,
        @InjectModel(DiseaseDetail.name) private DiseaseDetailModel: Model<DiseaseDetail>,
        @InjectModel(CampaignSend.name) private CampaignSendModel: Model<CampaignSend>,
        @InjectModel(Journey.name) private JourneyModel: Model<Journey>,
        @InjectModel(outcomeSurvey.name) private readonly surveyModel: Model<outcomeSurvey>,
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
                const im = await this.UploadService.upload(item.buffer, "campaign/", item.originalname, item.mimetype);
                return im;
            }),
        );

        const mergedArray = createCampaignDto.weekData.map((item, index) => ({
            ...item,
            file: imageData1[index]?.Location || null,
        }));
        createCampaignDto.weekData = mergedArray;
        // return createCampaignDto.name + (Math.floor(Math.random() * 10000) + 10000).toString().substring(1),
        const ReswithTemplate = await Promise.all(
            createCampaignDto.weekData.map(async (item, index) => {
                const templateData = {
                    name: "campaign" + (Math.floor(Math.random() * 10000) + 10000).toString().substring(1),
                    language: "en",
                    category: "MARKETING",
                    structure: {
                        header: {
                            format: "IMAGE",
                            mediaurl: item["file"],
                        },
                        body: item["content"],
                    },
                };

                const headers = this.apiHeaders;

                try {
                    const temp_res = await firstValueFrom(this.httpService.post(this.apiCampaignUrl, templateData, { headers }));
                    item["templateId"] = temp_res.data.data.templateid;
                } catch (error) {
                    console.error("Error fetching template data:", error.message);
                    // Handle the error as needed
                    item["templateId"] = null; // Or any default value
                }

                return item;
            }),
        );

        createCampaignDto.weekData = ReswithTemplate;
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

    async assignCampaign(assignCampaignDto: campaignAssignDto): Promise<any> {
        const session = await this.transactionService.startTransaction();
        try {
            const today = new Date();
            let camp_id;
            if (assignCampaignDto?.campaignId) {
                camp_id = assignCampaignDto.campaignId;
            } else {
                camp_id = await this.CampaignModel.findOne({ diseaseId: assignCampaignDto.diseaseId }, { _id: 1 });
                camp_id = camp_id["id"];
            }
            let addDetails = new this.CampaignAssignModel({ userId: assignCampaignDto.userId, campaignId: camp_id });
            let data = await addDetails.save({ session });
            if (data) {
                const journey = {
                    patientId: data.userId,
                    campaignId: camp_id,
                    journeyType: JourneyType.ASSIGNCAMPAIGN
                };
                const saveJourney = new this.JourneyModel(journey);
                await saveJourney.save({ session });
            }
            await this.transactionService.commitTransaction(session);
            let userData = await this.PatientModel.findById(data.userId);
            let campaignData = await this.CampaignModel.findById(data.campaignId);
            let surveytemplate=await this.surveyModel.distinct("firstWeekTemplateId",{campaignId:data.campaignId,isActive:true})

            const sendCampaignToUser = campaignData.weekData.filter(item => item.weekNumber === "1");
            const headers = this.apiHeaders;

            const textData = {
                from: process.env.ADMIN_WHATS_APP_NUMBER,
                to: "91" + userData.mobile,
                type: "template",
                header: "Welcome to Tayome",
                message: {
                    templateid: sendCampaignToUser[0]["templateId"],
                    url: sendCampaignToUser[0]["file"],
                },
            };
            const templateData = {
                from: process.env.ADMIN_WHATS_APP_NUMBER,
                to: "91" + userData.mobile,
                type: "template",
                header: "Welcome to Tayome",
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
            const temp_res = await firstValueFrom(this.httpService.post(this.apiBaseUrl, templateData, { headers }));
            const text_response = await firstValueFrom(this.httpService.post(this.apiBaseUrl, textData, { headers }));
            if(surveytemplate?.length>0){
                surveytemplate.forEach(async(ids)=>{
                    const campaignTemplateData = {
                        from: process.env.ADMIN_WHATS_APP_NUMBER,
                        to: "91" + userData.mobile,
                        type: "template",
                        header: "Welcome to Tayome",
                        message: {
                            templateid: ids,
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
                    await firstValueFrom(this.httpService.post(this.apiBaseUrl, campaignTemplateData, { headers }));

                })

            }
            // const img_response = await firstValueFrom(this.httpService.post(this.apiBaseUrl, imgData, { headers }));
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
    async getAllCampaign(search: string): Promise<any> {
        try {
            let query = {}
            if (search) {
                query["name"] = { $regex: search, $options: "i" }
            }
            const campaigndetails = await this.CampaignModel.find(query).select({ _id: 1, name: 1 });
            return {
                message: "Campaign retrieved successfully",
                data: campaigndetails,
            };
        }
        catch (error) {
            return {
                message: error.message,
            }
        }
    }
    async sendSurveyToUser(): Promise<any> {
        const userData = await this.CampaignAssignModel.aggregate([
            {
                $addFields: {
                    adjustedCreatedAt: {
                        $dateAdd: {
                            startDate: "$createdAt",
                            unit: "month",
                            amount: 3
                        }
                    }
                }
            },
            {
                $match: {
                    $expr: {
                        $eq: [
                            {
                                $dateToString: {
                                    date: "$adjustedCreatedAt",
                                    format: "%Y-%m-%d"
                                }
                            },
                            {
                                $dateToString: {
                                    date: new Date(),
                                    format: "%Y-%m-%d"
                                }
                            }
                        ]
                    }
                }
            }
        ])
        const headers = this.apiHeaders;
        if (userData?.length > 0) {
            userData.forEach(async campaignAssignData => {
                let user = await this.PatientModel.findById(campaignAssignData.userId).select({ mobile: 1 })
                let surveytemplate = await this.surveyModel.findOne({ campaignId: campaignAssignData.campaignId, isActive: true }).select({ lastWeekTemplateId: 1 })
                if (user && surveytemplate?.lastWeekTemplateId?.length > 0) {
                    surveytemplate?.lastWeekTemplateId.forEach(async (ids) => {
                        const campaignTemplateData = {
                            from: process.env.ADMIN_WHATS_APP_NUMBER,
                            to: "91" + user.mobile,
                            type: "template",
                            header: "Welcome to Tayome",
                            message: {
                                templateid: ids,
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
                        await firstValueFrom(this.httpService.post(this.apiBaseUrl, campaignTemplateData, { headers }));

                    })

                }
            }
            )
        }

    }

    async sendCampaignWeeklyDataToUser():Promise<any>{
        for (let i=1;i<=12;i++){
            let userWeeklyData=await this.CampaignAssignModel.aggregate([
                {
                  $addFields: {
                    adjustedCreatedAt: {
                      $add: ["$createdAt", { $multiply: [Number(`${7*i}`), 24, 60, 60, 1000] }] // Adding 7 days to createdAt date
                    }
                  }
                },
                {
                  $match: {
                    $expr: {
                      $eq: [
                        { $dateToString: { format: "%Y-%m-%d", date: "$adjustedCreatedAt" } }, // Format adjustedCreatedAt as YYYY-MM-DD
                        { $dateToString: { format: "%Y-%m-%d", date: new Date() } } // Format current date as YYYY-MM-DD
                      ]
                    }
                  }
                }
              ])
              const headers = this.apiHeaders;
              if (userWeeklyData?.length > 0) {
                userWeeklyData.forEach(async campaignAssignData => {
                    let user = await this.PatientModel.findById(campaignAssignData.userId).select({ mobile: 1 })
                    let campaignData = await this.CampaignModel.findOne({ _id: campaignAssignData.campaignId}).select({ weekData: 1 })
                    const sendCampaignToUser = campaignData?.weekData?.find(item => (item?.weekNumber).toString() ==(1+i).toString());
                    if (user && sendCampaignToUser && sendCampaignToUser["templateId"] &&sendCampaignToUser["file"]) {
                        const textData = {
                            from: process.env.ADMIN_WHATS_APP_NUMBER,
                            to: "91" + user.mobile,
                            type: "template",
                            header: "Welcome to Tayome",
                            message: {
                                templateid: sendCampaignToUser["templateId"],
                                url: sendCampaignToUser["file"],
                            },
                           
                        };
                    await firstValueFrom(this.httpService.post(this.apiBaseUrl, textData, { headers }));

    
                    }
                }
                )
            }

        }

    }
}


