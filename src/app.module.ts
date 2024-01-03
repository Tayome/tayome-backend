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
        ScheduleModule.forRoot(),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
