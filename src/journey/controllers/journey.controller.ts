import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { APIResponse } from "src/utils/types/api-response.type";
import { JourneyService } from "../services/journey.service";
import { FilterJourneyDTO } from "../dto/filter-journey.dto";

@Controller("/journey")
export class JourneyController {
    constructor (
        private journeyService: JourneyService
    ) {}

    @Post("/:id")
    async getJourney(@Param("id") id: string, @Body() FilterJourneyDTO: FilterJourneyDTO): Promise<APIResponse> {
        return {
            message: "Journey list fetch successfully",
            data: await this.journeyService.getJourneyList(id, FilterJourneyDTO)
        }
    }
}