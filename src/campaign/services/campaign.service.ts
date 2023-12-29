import { Injectable } from "@nestjs/common";
import { CampaignListDto } from "../dto/campaign-list.dto";
import { InjectModel } from "@nestjs/mongoose";
import { CreateCampaignDto } from "../dto/create-campagin.dto";
import { Campaign } from "../schemas/campaign.schema";
import { Model } from "mongoose";
@Injectable()
export class CampaignService {
    constructor(@InjectModel(Campaign.name) private CampaignModel: Model<Campaign>) {}

    async onModuleInit() {
        await this.CampaignModel.syncIndexes();
    }

    async createNewCampaign(createCampaignDto: CreateCampaignDto, images: Array<Express.Multer.File>): Promise<any> {
        const mergedArray = createCampaignDto.weekData.map((item, index) => ({
            ...item,
            file: images[index]?.originalname || null, // Add the file name or null if not present
        }));
        createCampaignDto.weekData = mergedArray;
        let createCampaignDetails = new this.CampaignModel(createCampaignDto);
        let data = await createCampaignDetails.save();
        return {
            message: "Campaign Created successfully",
            data: data,
        };
    }
}
