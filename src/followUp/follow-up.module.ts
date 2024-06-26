import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FollowUp, FollowUpSchema } from "./schemas/follow-up.schema";
import { FollowUpController } from "./controllers/follow-up.controller";
import { FollowUpService } from "./services/follow-up.service";
import { Journey, JourneySchema } from "src/journey/schemas/journey.schema";

@Module({   
    imports: [
        MongooseModule.forFeature([{ name: FollowUp.name, schema: FollowUpSchema }]),
        MongooseModule.forFeature([{ name: Journey.name, schema: JourneySchema}])
    ],
    controllers: [FollowUpController],
    providers: [FollowUpService],
    exports: [MongooseModule.forFeature([{ name: FollowUp.name, schema: FollowUpSchema }]),
            MongooseModule.forFeature([{ name: Journey.name, schema: JourneySchema}])]
})

export class FollowUpModule {}