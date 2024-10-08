import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { APIResponse } from "src/utils/types/api-response.type";
import { CounsellorService } from "../../services/admin/counsellor.service";
import { GetCounsellorDto } from "../../dto/get-counsellor.dto";
import { UpdateCounsellorDto } from "../../dto/update-counsellor.dto";
import { RegisterUserDto } from "src/auth/dto/register-user.dto";
import { AssignCounsellorDto } from "src/counsellor/dto/assign-counsellor.dto";
import { UpdateStatusDto } from "src/counsellor/dto/update-status.dto";

@Controller("/admin/counsellor")
export class CounsellorController {
    constructor(private CounsellorService: CounsellorService) {}

    @Post("/create")
    async createCounsellor(@Body() registerUserDto: RegisterUserDto): Promise<APIResponse> {
        return {
            message: "Counsellor created successfully",
            data: await this.CounsellorService.createCounsellor(registerUserDto),
        };
    }

    @Post("/")
    async counsellorList(@Body() GetCounsellorDto: GetCounsellorDto): Promise<APIResponse> {
        return {
            message: "Counsellor list fetch successfully",
            data: await this.CounsellorService.getCounsellorList(GetCounsellorDto),
        };
    }

    @Get("/:id")
    async counsellorDetail(@Param("id") id: string): Promise<APIResponse> {
        return {
            message: "Counsellor detail fetch successfully",
            data: await this.CounsellorService.getCounsellorDetails(id),
        };
    }

    @Patch("/:id")
    async updateCounsellor(@Param("id") id: string, @Body() UpdateCounsellorDto: UpdateCounsellorDto): Promise<APIResponse> {
        return {
            message: "Counsellor updated successfully",
            data: await this.CounsellorService.updateCounsellor(id, UpdateCounsellorDto),
        };
    }

    @Delete("/:id")
    async deleteCounsellor(@Param("id") id: string): Promise<APIResponse> {
        return {
            message: "Counsellor deleted successfully",
            data: await this.CounsellorService.deleteCounsellor(id),
        };
    }

    @Post("/assign-counsellor/:id")
    async assignCounsellor(@Param("id") id: string, @Body() assignCounsellorDto: AssignCounsellorDto): Promise<APIResponse> {
        return {
            message: "Counsellor assign successfully",
            data: await this.CounsellorService.assignCounsellor(id, assignCounsellorDto),
        };
    }

    @Patch("/update-status/:id")
    async updateStatus(@Param("id") id: string, @Body() UpdateStatusDto: UpdateStatusDto): Promise<APIResponse> {
        return {
            message: "Counsellor status updated successfully",
            data: await this.CounsellorService.updateStatus(id, UpdateStatusDto)
        }
    }
}
