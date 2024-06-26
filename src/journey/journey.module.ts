import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Journey, JourneySchema } from "./schemas/journey.schema";
import { JourneyController } from "./controllers/journey.controller";
import { JourneyService } from "./services/journey.service";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Journey.name, schema: JourneySchema}])
    ],
    controllers: [JourneyController],
    providers: [JourneyService],
    exports: [MongooseModule.forFeature([{ name: Journey.name, schema: JourneySchema}])]
})

export class JourneyModule {}