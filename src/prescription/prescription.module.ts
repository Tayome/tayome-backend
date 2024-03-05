import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Prescription, PrescriptionSchema } from "./schemas/prescription.schema";
import { PrescriptionController } from "./controllers/prescription.controller";
import { PrescriptionService } from "./services/prescription.service";
import { UploadService } from "src/utils/services/upload.service";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Prescription.name, schema: PrescriptionSchema }])
    ],
    controllers: [PrescriptionController],
    providers: [PrescriptionService, UploadService],
    exports: [
        MongooseModule.forFeature([{ name: Prescription.name, schema: PrescriptionSchema }])
    ]
})

export class PrescriptionModule {}