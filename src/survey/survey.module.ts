import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Campaign, CampaignSchema } from 'src/campaign/schemas/campaign.schema';

import { outcomeSurvey, OutcomeSchema } from './survey.schema';
import { SurveyController } from './survey.controller';
import { SurveyService } from './survey.service';
import { HttpModule } from '@nestjs/axios';
import { DiseaseDetail, DiseaseDetailSchema } from 'src/disease/schemas/disease-detail.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Campaign.name, schema: CampaignSchema }]),
        MongooseModule.forFeature([{ name: outcomeSurvey.name, schema: OutcomeSchema}]),
        MongooseModule.forFeature([{ name: DiseaseDetail.name, schema: DiseaseDetailSchema }]),

        HttpModule
    ],
    controllers: [SurveyController],
    providers: [SurveyService],
    exports: [],
})
export class SurveyModule {}
