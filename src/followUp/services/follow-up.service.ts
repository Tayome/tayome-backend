import { Injectable } from "@nestjs/common";
import { CreateFollowUpDTO } from "../dto/create-followup.dto";
import { InjectModel } from "@nestjs/mongoose";
import { FollowUp } from "../schemas/follow-up.schema";
import { Model } from "mongoose";
import { Journey, JourneyType } from "src/journey/schemas/journey.schema";
import { FilterFollowUpDTO } from "../dto/filter-followup.dto";

@Injectable()
export class FollowUpService {
    constructor(
        @InjectModel(FollowUp.name) private followupModel: Model<FollowUp>, 
        @InjectModel(Journey.name) private journeyModel: Model<Journey>) {}

    async createFollowUp(CreateFollowUpDTO: CreateFollowUpDTO): Promise<any> {
        const followUp = new this.followupModel(CreateFollowUpDTO);
        const saveFollowUp = await followUp.save();
        if (saveFollowUp) {
            const journey = {
                patientId: CreateFollowUpDTO?.patientId,
                counsellorId: CreateFollowUpDTO?.counsellorId,
                followUpId: saveFollowUp?._id,
                journeyType: JourneyType.FOLLOWUPADDED
            };
            const saveJourney = new this.journeyModel(journey);
            await saveJourney.save();
        }
        return saveFollowUp;
    }

    async getFollowUpList(patientId: string, FilterFollowUpDTO: FilterFollowUpDTO): Promise<any> {
        let query = {patientId: patientId};
        if (FilterFollowUpDTO?.startDate) {
          if (FilterFollowUpDTO?.endDate) {
            query["followUpDate"] = {
              $gte: FilterFollowUpDTO?.startDate,
              $lte: FilterFollowUpDTO?.endDate
            };
          } else {
            query["followUpDate"] = { $gte: FilterFollowUpDTO?.startDate };
          }
        }else if (FilterFollowUpDTO?.endDate) {
          query["followUpDate"] = { $lte: FilterFollowUpDTO?.endDate };
        }
        return await this.followupModel.find(query)
        .populate("patientId", "name language mobile medicineName")
        .populate("counsellorId", "firstName lastName email mobile gender role")
      }
}
