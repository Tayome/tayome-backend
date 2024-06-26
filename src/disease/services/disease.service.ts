import { BadRequestException, Injectable } from "@nestjs/common";
import { DiseaseDetail } from "../schemas/disease-detail.schema";
import { Model } from "mongoose";
import { AddNewDiseaseDto } from "../dto/add-new-disease.dto";
import { InjectModel } from "@nestjs/mongoose";
import { DiseaseListDto } from "../dto/disease-list.dto";
import { RemoveDiseaseDto } from "../dto/remove-disease.dto";
import { UpdateDiseaseDto } from "../dto/update-disease.dto";
@Injectable()
export class DiseaseService {
    constructor(@InjectModel(DiseaseDetail.name) private DiseaseDetailModel: Model<DiseaseDetail>) {}
    async addDisease(AddNewDiseaseDto: AddNewDiseaseDto): Promise<any> {
        let addDetails = new this.DiseaseDetailModel(AddNewDiseaseDto);
        let data = await addDetails.save();
        return {
            message: "Disease Added",
            data: data,
        };
    }

    async diseaseList(diseaseListDto: DiseaseListDto): Promise<any> {
        const pageSize = diseaseListDto.pageSize ?? 10;
        const page = diseaseListDto.page ?? 1;
        const skip = pageSize * (page - 1);

        const query = {};
        const sort = {};

        if (diseaseListDto.search) {
            const searchQueryString = diseaseListDto.search.trim().split(" ").join("|");

            query["$or"] = [{ diseaseName: { $regex: `.*${searchQueryString}.*`, $options: "i" } }];
        }

        const totalProm = this.DiseaseDetailModel.count(query);
        const diseaseListProm = this.DiseaseDetailModel.find()
            .sort({ ...sort, createdAt: -1 })
            .limit(pageSize)
            .skip(skip)
            .exec();
        const [total, diseaseList] = await Promise.all([totalProm, diseaseListProm]);

        return {
            list: diseaseList,
            total: total,
        };
    }
    async remove(removeDiseaseDto: RemoveDiseaseDto): Promise<any> {
        let data = await this.DiseaseDetailModel.findByIdAndDelete(removeDiseaseDto.diseaseId);
        if (!data) {
            throw new BadRequestException("Unable to remove disease");
        }
        return {
            message: "Disease removed",
        };
    }

    async update(updateDiseaseDto: UpdateDiseaseDto): Promise<any> {
        let updateDetails = {
            diseaseName: updateDiseaseDto.diseaseName,
            description: updateDiseaseDto.description,
        };
        let options = {
            new: true,
        };
        let updatedDisease = await this.DiseaseDetailModel.findByIdAndUpdate(updateDiseaseDto.diseaseId, updateDetails, options);
        if (!updatedDisease) throw new BadRequestException("Unable to update / Invalid details passed");
        return updatedDisease;
    }

    async getAllDiseases(search: string): Promise<any> {
        try {
            let query = {}
            if (search) {
                query["diseaseName"] = { $regex: search, $options: "i" }
            }
            const diseaseDetails = await this.DiseaseDetailModel.find(query).select({ _id: 1, diseaseName: 1 });
            return {
                message: "Diseases retrieved successfully",
                data: diseaseDetails,
            };
        }
        catch (error) {
            return {
                message: error.message,
            }
        }
    }
}
