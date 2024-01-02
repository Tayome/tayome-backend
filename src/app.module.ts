import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { UtilsModule } from "./utils/utils.module";
import { ClinicModule } from "./clinic/clinic.module";
import { DiseaseModule } from "./disease/disease.module";
import { CampaignModule } from "./campaign/campaign.module";
import { CampaignsendService } from "./campaignsend/campaignsend.service";
import { ScheduleModule } from "@nestjs/schedule";

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
        ScheduleModule.forRoot(),
    ],
    controllers: [],
    providers: [CampaignsendService],
})
export class AppModule {}
