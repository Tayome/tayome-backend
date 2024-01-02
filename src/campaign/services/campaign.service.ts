import { BadRequestException, Injectable } from "@nestjs/common";
import { CampaignListDto } from "../dto/campaign-list.dto";
import { InjectModel } from "@nestjs/mongoose";
import { CreateCampaignDto } from "../dto/create-campagin.dto";
import { Campaign } from "../schemas/campaign.schema";
import { Model } from "mongoose";
import { RemoveCampaignDto } from "../dto/remove-campaign.dto";
import { CampaignAssign } from "../schemas/campaign-assign.schema";
import { assignCampaignDto } from "../dto/campaign-assign.dto";
@Injectable()
export class CampaignService {
    constructor(@InjectModel(Campaign.name) private CampaignModel: Model<Campaign>, @InjectModel(CampaignAssign.name) private CampaignAssignModel: Model<CampaignAssign>) {}

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
        let addDetails = new this.CampaignAssignModel(assignCampaignDto);
        let data = await addDetails.save();
        return {
            message: "Campaign Assigned",
            data: data,
        };
    }
}
