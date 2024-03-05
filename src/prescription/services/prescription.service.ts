import { BadRequestException, Injectable } from "@nestjs/common";
import { CreatePrescriptionDto } from "../dto/create-prescription.dto";
import { UploadService } from "src/utils/services/upload.service";
import { InjectModel } from "@nestjs/mongoose";
import { Prescription } from "../schemas/prescription.schema";
import { Model, Types } from "mongoose";

@Injectable()
export class PrescriptionService {
    constructor (
        @InjectModel(Prescription.name) private prescriptionModel : Model<Prescription>,
        private uploadService: UploadService,
    ) {}

    async createPrescription(CreatePrescriptionDto: CreatePrescriptionDto, image: Express.Multer.File): Promise<any> {
        let imageData;
        let payload : any = CreatePrescriptionDto;
        if (image) {
            imageData = await this.uploadService.upload(image?.buffer, `prescription/`, image?.originalname);
            if (imageData) {
                payload.prescriptionUrl = imageData?.Location
            } else {
                // throw new BadRequestException("Error While uploading prescription")
                payload.prescriptionUrl = "https://s3.ap-south-1.amazonaws.com/micra.sejal/campaign/9042ecc3-64b4-4eed-a585-97ef976fcc24-istockphoto-873891794-2048x2048.jpg"
            }
        }
        return await this.prescriptionModel.create(payload);
    }

    async getPrescriptionList(id: string): Promise <any> {
        let query = {patientId: Types.ObjectId.createFromHexString(id)}
        return await this.prescriptionModel.find(query)
        .populate("patientId", "name city language mobile")
        .populate("counsellorId", "firstName lastName email gender mobile")
        .exec();
    }
}