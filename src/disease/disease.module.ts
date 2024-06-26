import { Module } from "@nestjs/common";

import { MongooseModule } from "@nestjs/mongoose";

import { DiseaseService } from "./services/disease.service";
import { DiseaseController } from "./controllers/disease.controller";
import { DiseaseDetail, DiseaseDetailSchema } from "./schemas/disease-detail.schema";
import { UtilsModule } from "src/utils/utils.module";

@Module({
    imports: [MongooseModule.forFeature([{ name: DiseaseDetail.name, schema: DiseaseDetailSchema }]), UtilsModule],
    controllers: [DiseaseController],
    providers: [DiseaseService],
    exports: [],
})
export class DiseaseModule {}
