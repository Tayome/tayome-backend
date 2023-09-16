import { Injectable } from '@nestjs/common';
import { AddNewClinicDto } from '../dto/add-new-clinic.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ClinicsDetail } from '../schemas/clinics-detail.schema';
import { Model } from 'mongoose';
import { UploadService } from 'src/utils/services/upload.service';
import * as QRCode from 'qrcode';

@Injectable()
export class ClinicsService {
    constructor(
        @InjectModel(ClinicsDetail.name) private ClinicDetailsModel: Model<ClinicsDetail>,
        private UploadService: UploadService
    ) {}

    async addClinic(addNewClinicDto: AddNewClinicDto): Promise<any>{
        let addDetails = new this.ClinicDetailsModel(addNewClinicDto);
        let response = await addDetails.save();
        let qr = await this.generateQRCode(response);
        response["qrCode"] = qr;
        return await response.save();
    }

    async generateQRCode(clinicDetails: Object): Promise<any>{
        let text = "https://tayome.temphosting.tk/app/form/" + clinicDetails["_id"];
        let qrBuffer = await QRCode.toBuffer(text);
        let uploadData = await this.UploadService.upload(qrBuffer, "qrCode/", clinicDetails["clinicName"]+".png");
        return uploadData.Location;
    }

    async clinicsList(): Promise<any>{
        return await this.ClinicDetailsModel.find();
    }
}
