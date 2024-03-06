import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Patients } from "src/users/schemas/patients.schema";
import { GetPatientListDto } from "../dto/patient-list.dto";
import { DiseaseDetail } from "src/disease/schemas/disease-detail.schema";

@Injectable()
export class CounsellorService {
    constructor(
        @InjectModel(Patients.name) private patientModel: Model<Patients>,
        @InjectModel(DiseaseDetail.name) private DiseaseDetailModel: Model<DiseaseDetail>,
    ) {}

    async getPatientList(id: string, GetPatientListDto: GetPatientListDto) :Promise<any> {
        const pageSize = GetPatientListDto.pageSize ?? 10;
        const page = GetPatientListDto?.page ?? 1;
        const skip = pageSize * (page -1);
        const counsellorId = Types.ObjectId.createFromHexString(id);
        let query = {counsellorId: counsellorId};

        if (GetPatientListDto?.search) {
            const searchQueryString = GetPatientListDto.search.trim().split(" ").join("|");
            query["$or"] = [{name: { $regex: `.*${searchQueryString}.*`, $options: "i" }},
                            {city: { $regex: `.*${searchQueryString}.*`, $options: "i" }}]
        }

        const countProm = this.patientModel.count(query);
        const dataProm = this.patientModel.find(query)
            .skip(skip)
            .limit(pageSize)
            .exec();

        const [count, list] = await Promise.all([countProm, dataProm]);
        return {count, list};
    }

    async getPatientDetails(id: string): Promise<any> {
        const user = await this.patientModel.findById(id)
        .populate("clinicId")
        .populate("medicalCondition")
        .populate("counsellorId", "firstName lastName email gender")
        .exec();
        const disease = await this.DiseaseDetailModel.findById(user.medicalCondition);
        const result = {
            ...user.toObject(), // Convert Mongoose document to plain JavaScript object
            medicalCondition: disease,
        };

        return result;
    }
}