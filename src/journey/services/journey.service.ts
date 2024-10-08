import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Journey } from "../schemas/journey.schema";
import mongoose, { Model } from "mongoose";
import { FilterJourneyDTO } from "../dto/filter-journey.dto";

@Injectable()
export class JourneyService {
    constructor(@InjectModel(Journey.name) private journeyModel: Model<Journey>) {}

    async getJourneyList(id: string, FilterJourneyDTO: FilterJourneyDTO): Promise<any> {
        let query = { patientId: new mongoose.Types.ObjectId(id) };

        if (FilterJourneyDTO?.startDate) {
            if (FilterJourneyDTO?.endDate) {
                query["createdAt"] = {
                    $gte: FilterJourneyDTO?.startDate,
                    $lte: FilterJourneyDTO?.endDate,
                };
            } else {
                query["createdAt"] = { $gte: FilterJourneyDTO?.startDate };
            }
        } else if (FilterJourneyDTO?.endDate) {
            query["createdAt"] = { $lte: FilterJourneyDTO?.endDate };
        }

        return await this.journeyModel
            .find(query)
            .sort({ createdAt: -1 })
            .populate("patientId", "name city mobile")
            .populate("counsellorId", "firstName lastName mobile email gender")
            .populate("followUpId", "followUpDate note")
            .populate("campaignId", "name weekData");
    }
}
