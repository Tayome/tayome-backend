import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { UtilsModule } from "./utils/utils.module";
import { ClinicModule } from "./clinic/clinic.module";
import { DiseaseModule } from "./disease/disease.module";
import { CampaignModule } from "./campaign/campaign.module";
import { ScheduleModule } from "@nestjs/schedule";
import { CampaignSendModule } from "./campaignsend/campaignsend.module";
import { CounsellorModule } from "./counsellor/counsellor.module";
import { FollowUpModule } from "./followUp/follow-up.module";
import { JourneyModule } from "./journey/journey.module";
import { PrescriptionModule } from "./prescription/prescription.module";
import { SurveyModule } from './survey/survey.module';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            useFactory: () => ({
                uri: process.env.MONGODB_URI,
            }),
        }),
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        AuthModule,
        UsersModule,
        UtilsModule,
        ClinicModule,
        DiseaseModule,
        CampaignModule,
        CampaignSendModule,
        CounsellorModule,
        FollowUpModule,
        JourneyModule,
        PrescriptionModule,
        ScheduleModule.forRoot(),
        SurveyModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
