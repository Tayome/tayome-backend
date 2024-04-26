import { Module } from "@nestjs/common";

import { MongooseModule } from "@nestjs/mongoose";
import { CampaignSend, CampaignSendSchema } from "./schemas/campaign-send.schema";
import { SchedularService as SchedularService } from "./services/campaignsend.service";
import { UtilsModule } from "src/utils/utils.module";
import { CampaignModule } from "src/campaign/campaign.module";
@Module({
    imports: [MongooseModule.forFeature([{ name: CampaignSend.name, schema: CampaignSendSchema }]), UtilsModule,CampaignModule],
    controllers: [],
    providers: [SchedularService],
    exports: [],
})
export class SchedularModule {}
