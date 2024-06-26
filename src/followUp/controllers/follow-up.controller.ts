import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { APIResponse } from "src/utils/types/api-response.type";
import { FollowUpService } from "../services/follow-up.service";
import { CreateFollowUpDTO } from "../dto/create-followup.dto";
import { FilterFollowUpDTO } from "../dto/filter-followup.dto";

@Controller("/followUp")
export class FollowUpController {
    constructor (
        private followUpService: FollowUpService
    ) {}

    @Post("/create")
    async createFollowUp(@Body() CreateFollowUpDTO: CreateFollowUpDTO): Promise<APIResponse> {
        return {
            message: "Follow up created successfully",
            data: await this.followUpService.createFollowUp(CreateFollowUpDTO)
        }
    }

    @Post("/:id")
    async getFollowUpList(@Param("id") id: string, @Body() FilterFollowUpDTO: FilterFollowUpDTO): Promise<APIResponse> {
        return {
            message: "Follow up list",
            data: await this.followUpService.getFollowUpList(id, FilterFollowUpDTO)
        }
  }
}