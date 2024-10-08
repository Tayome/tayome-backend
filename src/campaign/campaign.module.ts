import { Module } from "@nestjs/common";
import { CampaignController } from "./controllers/campaign.controller";
import { CampaignService } from "./services/campaign.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Campaign, CampaignSchema } from "./schemas/campaign.schema";
import { CampaignAssign, CampaignAssignSchema } from "./schemas/campaign-assign.schema";
import { UtilsModule } from "src/utils/utils.module";
import { Patients, PatientsSchema } from "src/users/schemas/patients.schema";
import { HttpModule, HttpService } from "@nestjs/axios";
import { DiseaseDetail, DiseaseDetailSchema } from "src/disease/schemas/disease-detail.schema";
import { CampaignSend, CampaignSendSchema } from "src/campaignsend/schemas/campaign-send.schema";
import { Journey, JourneySchema } from "src/journey/schemas/journey.schema";
import { OutcomeSchema, outcomeSurvey } from "src/survey/survey.schema";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Campaign.name, schema: CampaignSchema }]),
        MongooseModule.forFeature([{ name: CampaignAssign.name, schema: CampaignAssignSchema }]),
        MongooseModule.forFeature([{ name: Patients.name, schema: PatientsSchema }]),
        MongooseModule.forFeature([{ name: DiseaseDetail.name, schema: DiseaseDetailSchema }]),
        MongooseModule.forFeature([{ name: CampaignSend.name, schema: CampaignSendSchema }]),
        MongooseModule.forFeature([{ name: Journey.name, schema: JourneySchema}]),
        MongooseModule.forFeature([{ name: outcomeSurvey.name, schema: OutcomeSchema}]),

        UtilsModule,
        HttpModule,
    ],
    controllers: [CampaignController],
    providers: [CampaignService],
    exports: [CampaignService],
})
export class CampaignModule {}
