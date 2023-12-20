import { Injectable } from "@nestjs/common";
import { AddNewClinicDto } from "../dto/add-new-clinic.dto";
import { InjectModel } from "@nestjs/mongoose";
import { ClinicsDetail } from "../schemas/clinics-detail.schema";
import { Model } from "mongoose";
import { UploadService } from "src/utils/services/upload.service";
import * as QRCode from "qrcode";
import { ClinicsListDto } from "../dto/clinics-list.dto";

@Injectable()
export class ClinicsService {
    constructor(@InjectModel(ClinicsDetail.name) private ClinicDetailsModel: Model<ClinicsDetail>, private UploadService: UploadService) {}

    async addClinic(addNewClinicDto: AddNewClinicDto): Promise<any> {
        let addDetails = new this.ClinicDetailsModel(addNewClinicDto);
        let response = await addDetails.save();
        let qr = await this.generateQRCode(response);
        response["qrCode"] = qr;
        return await response.save();
    }

    async generateQRCode(clinicDetails: Object): Promise<any> {
        let text = "https://tayome.hkstest.uk/app/form/" + clinicDetails["_id"];
        let qrBuffer = await QRCode.toBuffer(text);
        let uploadData = await this.UploadService.upload(qrBuffer, "qrCode/", clinicDetails["clinicName"] + ".png");
        return uploadData.Location;
    }

    async clinicsList(clinicsListDto: ClinicsListDto): Promise<any> {
        const pageSize = clinicsListDto.pageSize ?? 10;
        const page = clinicsListDto.page ?? 1;
        const skip = pageSize * (page - 1);

        const query = {};
        const sort = {};

        if (clinicsListDto.search) {
            const searchQueryString = clinicsListDto.search.trim().split(" ").join("|");

            query["$or"] = [
                { clinicName: { $regex: `.*${searchQueryString}.*`, $options: "i" } },
                { mobile: { $regex: `.*${searchQueryString}.*`, $options: "i" } },
                { email: { $regex: `.*${searchQueryString}.*`, $options: "i" } },
            ];
        }

        const totalProm = this.ClinicDetailsModel.count(query);
        const clinicsListProm = this.ClinicDetailsModel.find()
            .sort({ ...sort, createdAt: -1 })
            .limit(pageSize)
            .skip(skip)
            .exec();
        const [total, clinicsList] = await Promise.all([totalProm, clinicsListProm]);

        return {
            list: clinicsList,
            total: total,
        };
    }
}
