import { Module } from "@nestjs/common";
import { CampaignController } from "./controllers/campaign.controller";
import { CampaignService } from "./services/campaign.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Campaign, CampaignSchema } from "./schemas/campaign.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: Campaign.name, schema: CampaignSchema }])],
    controllers: [CampaignController],
    providers: [CampaignService],
    exports: [],
})
export class CampaignModule {}
