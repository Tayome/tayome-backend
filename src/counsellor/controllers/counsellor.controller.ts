import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CounsellorService } from "../services/counsellor.service";
import { APIResponse } from "src/utils/types/api-response.type";
import { GetPatientListDto } from "../dto/patient-list.dto";

@Controller("/counsellor")
export class CounsellorController {
    constructor (
        private counsellorService: CounsellorService
    ) {}

    @Post("/:id")
    async getPatientList(@Param("id") id: string, @Body() GetPatientListDto: GetPatientListDto): Promise<APIResponse> {
        return {
            message: "Patient list fetch successfully",
            data: await this.counsellorService.getPatientList(id, GetPatientListDto)
        }
    }

    @Get("/:id")
    async getPatientDetails(@Param("id") id: string) :Promise <APIResponse> {
        return {
            message: "Patient details fetch successfully",
            data: await this.counsellorService.getPatientDetails(id)
        }
    }

    @Get("/campaign-list/:id")
    async getCampaignList(@Param("id") id: string): Promise<APIResponse> {
        return {
            message: "Patient campaign list fetch successfully",
            data: await this.counsellorService.getCampaignList(id)
        }
    }

    @Get("/patientDetails/:id")
    async patientDetails(
        @Query('pageNumber') pageNumber: number,
        @Query('pageSize') pageSize: number,
        @Param("id") id: string): Promise<APIResponse> {
        return {
            message: "Patient details fetch successfully",
            data: await this.counsellorService.patientDetails(id,pageNumber, pageSize)
        }
    }
}