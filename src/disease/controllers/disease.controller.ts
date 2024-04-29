import { BadRequestException, Body, Controller, Delete, HttpException, Post, Query } from "@nestjs/common";
import { AddNewDiseaseDto } from "../dto/add-new-disease.dto";
import { DiseaseService } from "../services/disease.service";
import { DiseaseListDto } from "../dto/disease-list.dto";
import { RemoveDiseaseDto } from "../dto/remove-disease.dto";
import { UpdateDiseaseDto } from "../dto/update-disease.dto";

@Controller("/disease")
export class DiseaseController {
    constructor(private diseaseService: DiseaseService) {}
    @Post("/add")
    async addDisease(@Body() AddNewDiseaseDto: AddNewDiseaseDto): Promise<{ message: String; data: any }> {
        let addDisease = await this.diseaseService.addDisease(AddNewDiseaseDto);
        return addDisease;
    }

    @Post("/list")
    // @UseGuards(AuthGuard(), RolesGuard)
    // @Roles(RoleType.ADMIN)
    async diseaseList(@Body() diseaseListDto: DiseaseListDto): Promise<{ message: String; data: any }> {
        let diseaseList = await this.diseaseService.diseaseList(diseaseListDto);
        return diseaseList;
    }

    @Post("/delete")
    async RemoveProduct(@Body() removeDiseaseDto: RemoveDiseaseDto): Promise<{ message: String }> {
        let res = await this.diseaseService.remove(removeDiseaseDto);
        return res;
    }
    @Post("/update")
    async updateCinema(@Body() updateDiseaseDto: UpdateDiseaseDto): Promise<{ message: String; data: any }> {
        let data = await this.diseaseService.update(updateDiseaseDto);
        return {
            message: "disease details updated",
            data: data,
        };
    }
    @Post("/diseaseSearch")
    async getAllCampaign(@Query("search") search:string): Promise<any> {
        try {
            return await this.diseaseService.getAllDiseases(search);
        } catch (error) {
            throw new HttpException(error.message, error.statusCode);
        }
    }
}
