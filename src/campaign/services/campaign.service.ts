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

@Injectable()
export class CampaignService {
    constructor(
        @InjectModel(Campaign.name) private CampaignModel: Model<Campaign>,
        @InjectModel(Patients.name) private PatientModel: Model<Patients>,
        @InjectModel(CampaignAssign.name) private CampaignAssignModel: Model<CampaignAssign>,
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

    async campaignList(campaignListDTO: CampaignListDto): Promise<any> {
        const pageSize = campaignListDTO.pageSize ?? 10;
        const page = campaignListDTO.page ?? 1;
        const skip = pageSize * (page - 1);

        const query = {};
        const sort = {};

        if (campaignListDTO.search) {
            const searchQueryString = campaignListDTO.search.trim().split(" ").join("|");

            query["$or"] = [{ name: { $regex: `.*${searchQueryString}.*`, $options: "i" } }];
        }

        const totalProm = this.CampaignModel.count(query);
        const listProm = this.CampaignModel.find()
            .sort({ ...sort, createdAt: -1 })
            .limit(pageSize)
            .skip(skip)
            .exec();
        const [total, List] = await Promise.all([totalProm, listProm]);

        return {
            list: List,
            total: total,
        };
    }
    async remove(removeCampaignDto: RemoveCampaignDto): Promise<any> {
        let data = await this.CampaignModel.findByIdAndDelete(removeCampaignDto.id);
        if (!data) {
            throw new BadRequestException("Unable to remove disease");
        }
        return {
            message: "Campaign removed",
        };
    }

    async assignCampaign(assignCampaignDto: assignCampaignDto): Promise<any> {
        const session = await this.transactionService.startTransaction();
        try {
            const today = new Date();
            let camp_id = await this.CampaignModel.findOne({ diseaseId: assignCampaignDto.diseaseId }, { _id: 1 });
            camp_id = camp_id["id"];
            let addDetails = new this.CampaignAssignModel({ userId: assignCampaignDto.userId, campaignId: camp_id });
            let data = await addDetails.save({ session });
            await this.transactionService.commitTransaction(session);
            let userData = await this.PatientModel.findById(data.userId);
            let campaignData = await this.CampaignModel.findById(data.campaignId);
            const sendCampaignToUser = campaignData.weekData.filter(item => item.weekNumber === "1");
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
                mobile: userData.mobile,
                campaignId: data.campaignId,
                campaignResponse: modifyData,
            };
            return sendCampaignData;
        } catch (error) {
            await this.transactionService.abortTransaction(session);
            throw error;
        }
    }
}
