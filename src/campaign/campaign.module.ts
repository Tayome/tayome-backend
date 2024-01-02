import { Module } from "@nestjs/common";
import { CampaignController } from "./controllers/campaign.controller";
import { CampaignService } from "./services/campaign.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Campaign, CampaignSchema } from "./schemas/campaign.schema";
import { CampaignAssign, CampaignAssignSchema } from "./schemas/campaign-assign.schema";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Campaign.name, schema: CampaignSchema }]),
        MongooseModule.forFeature([{ name: CampaignAssign.name, schema: CampaignAssignSchema }]),
    ],
    controllers: [CampaignController],
    providers: [CampaignService],
    exports: [],
})
export class CampaignModule {}
