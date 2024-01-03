import { Module } from "@nestjs/common";

import { MongooseModule } from "@nestjs/mongoose";
import { CampaignSend, CampaignSendSchema } from "./schemas/campaign-send.schema";
import { CampaignsendService } from "./services/campaignsend.service";
import { UtilsModule } from "src/utils/utils.module";
@Module({
    imports: [MongooseModule.forFeature([{ name: CampaignSend.name, schema: CampaignSendSchema }]), UtilsModule],
    controllers: [],
    providers: [CampaignsendService],
    exports: [],
})
export class CampaignSendModule {}
