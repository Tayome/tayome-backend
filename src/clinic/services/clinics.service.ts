import { Injectable ,Logger} from "@nestjs/common";
import { AddNewClinicDto } from "../dto/add-new-clinic.dto";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { ClinicsDetail } from "../schemas/clinics-detail.schema";
import { Model } from "mongoose";
import { UploadService } from "src/utils/services/upload.service";
import * as QRCode from "qrcode";
import { ClinicsListDto } from "../dto/clinics-list.dto";
import { Connection } from 'mongoose';

@Injectable()
export class ClinicsService {
    private readonly logger = new Logger(ClinicsService.name);
    constructor(@InjectModel(ClinicsDetail.name) private ClinicDetailsModel: Model<ClinicsDetail>, private UploadService: UploadService,@InjectConnection() private readonly connection: Connection,) {}

    async addClinic(addNewClinicDto: AddNewClinicDto): Promise<any> {
        const session = await this.connection.startSession();
        session.startTransaction();
        try {
          let addDetails = new this.ClinicDetailsModel(addNewClinicDto);
          let response = await addDetails.save({ session });
    
          let qr = await this.generateQRCode(response);  
          
          response["qrCode"] = qr;
          await response.save({ session });
    
          await session.commitTransaction();
          return response;
        } catch (error) {
          await session.abortTransaction();  
          this.logger.error('Failed to add clinic and generate QR code', error.stack);
          throw new Error('Failed to add clinic and generate QR code');
        } finally {
          session.endSession();
        }
      }


    async generateQRCode(clinicDetails: Object): Promise<any> {
        let text = "https://admin.tayome.net/app/form/" + clinicDetails["_id"];
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
