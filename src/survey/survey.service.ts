import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { outcomeSurvey } from "./survey.schema";
import { CreateSurveyDTO } from "./dto/create.survey.dto";
import { Campaign } from "src/campaign/schemas/campaign.schema";

@Injectable()
export class SurveyService {
    constructor(
        @InjectModel(outcomeSurvey.name)
        private readonly surveyModel: Model<outcomeSurvey>,
        @InjectModel(Campaign.name)
        private readonly campaignModel: Model<Campaign>,
    ) {}

    async createSurvey(createSurveyDto: CreateSurveyDTO): Promise<any> {
        if (!createSurveyDto.campaignName || !createSurveyDto.outcomeName || !createSurveyDto.campaignId) {
            return {
                status: 400,
                message: "Please fill all the required fields",
            };
        }
        let checkOptioForProfile = createSurveyDto.profilingSurveyQnA.map(question =>
            question.answerOptions.some(answer => answer.trim() == "" || answer == null || answer == undefined),
        );

        let checkOptionForOutcome = createSurveyDto.outcomeSurveyQnA.map(question =>
            question.answerOptions.some(answer => answer.trim() == "" || answer == null || answer == undefined),
        );

        if (checkOptioForProfile.includes(true) || checkOptionForOutcome.includes(true)) {
            return {
                status: 400,
                message: "Please fill all the answer options",
            };
        }

        const campaignDetails = await this.campaignModel.findById(createSurveyDto.campaignId);
        if (!campaignDetails) {
            throw new Error("Campaign not found");
        }
        const surveyExists = await this.surveyModel.findOne({ campaignId: createSurveyDto.campaignId, isActive: true });
        if (surveyExists) {
            const updatedSurvey = await this.surveyModel.findOneAndUpdate({ _id: surveyExists._id }, createSurveyDto, { new: true });
            return {
                status: 200,
                message: "Survey updated successfully",
                data: updatedSurvey,
            };
        }
        const survey = new this.surveyModel(createSurveyDto);
        await survey.save();
        return {
            status: 200,
            message: "Survey created successfully",
            data: survey,
        };
    }

    async getAllSurvey(): Promise<any> {
        const surveyList = await this.surveyModel.find({ isActive: true });
        if (!surveyList) {
            return {
                status: 404,
                message: "No survey Exists",
                data: [],
            };
        } else {
            return {
                status: 200,
                message: "Data fetched successfully",
                data: surveyList,
            };
        }
    }

    async getSurveyById(surveyId: string): Promise<any> {
        const ckeckvalidId = mongoose.Types.ObjectId.isValid(surveyId);
        if (!ckeckvalidId) {
            return {
                status: 400,
                message: "Invalid surveyId",
            };
        }
        const survey = await this.surveyModel.findOne({ _id: surveyId, isActive: true });
        if (!survey) {
            return {
                status: 404,
                message: "No survey Exists",
                data: [],
            };
        } else {
            return {
                status: 200,
                message: "Data fetched successfully",
                data: survey,
            };
        }
    }

    async deleteSurveybyId(surveyId: string): Promise<any> {
        const ckeckvalidId = mongoose.Types.ObjectId.isValid(surveyId);
        if (!ckeckvalidId) {
            return {
                status: 400,
                message: "Invalid surveyId",
            };
        }
        const survey = await this.surveyModel.findOneAndUpdate({ _id: surveyId, isActive: true }, { isActive: false }, { new: true });
        if (!survey) {
            return {
                status: 404,
                message: "No survey Exists",
                data: [],
            };
        }
        return {
            status: 200,
            message: "Survey deleted successfully",
            data: survey,
        };
    }

    async updateSurveyById(surveyId: string, data: CreateSurveyDTO): Promise<any> {
        if (!data.campaignName || !data.outcomeName || !data.campaignId) {
            return {
                status: 400,
                message: "Please provide all the required data",
            };
        }
        const ckeckvalidId = mongoose.Types.ObjectId.isValid(surveyId);
        if (!ckeckvalidId) {
            return {
                status: 400,
                message: "Invalid surveyId",
            };
        }
        const campaignDetails = await this.campaignModel.findById(data.campaignId);
        if (!campaignDetails) {
            return {
                status: 404,
                message: "Campaign not found",
                data: [],
            };
        }
        const survey = await this.surveyModel.findOne({ _id: surveyId, isActive: true });
        if (!survey) {
            return {
                status: 404,
                message: "No survey Exists",
                data: [],
            };
        }
        const updatedSurvey = await this.surveyModel.findOneAndUpdate({ _id: surveyId }, data, { new: true });
        return {
            status: 200,
            message: "Survey updated successfully",
            data: updatedSurvey,
        };
    }

    async searchSurvey(search: string): Promise<any> {
        const survey = await this.surveyModel.find({
            $or: [{ outcomeName: { $regex: search, $options: "i" } }, { campaignName: { $regex: search, $options: "i" } }],
            isActive: true,
        });
        if (survey?.length == 0) {
            return {
                status: 404,
                message: "No survey Exists with this search",
                data: [],
            };
        }
        return {
            status: 200,
            message: "Survey found successfully",
            data: survey,
        };
    }
}
