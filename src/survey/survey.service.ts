import { BadRequestException, HttpException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { outcomeSurvey } from "./survey.schema";
import { CreateSurveyDTO } from "./dto/create.survey.dto";
import { Campaign } from "src/campaign/schemas/campaign.schema";
import { firstValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";
import { DiseaseDetail } from "src/disease/schemas/disease-detail.schema";

@Injectable()
export class SurveyService {
    private readonly apiHeaders = {
        "Content-Type": "application/json",
        apikey: process.env.API_KEY,
        // Add any other headers you need
    };

    private readonly apiBaseUrl = "https://api.pinbot.ai/v2/wamessage/sendMessage";
    private readonly apiCampaignUrl = "https://console.pinbot.ai/api/create-template";

    constructor(
        @InjectModel(outcomeSurvey.name)
        private readonly surveyModel: Model<outcomeSurvey>,
        @InjectModel(Campaign.name)
        private readonly campaignModel: Model<Campaign>,
        @InjectModel(DiseaseDetail.name) 
        private DiseaseDetailModel: Model<DiseaseDetail>,
        private readonly httpService: HttpService,
    ) {}

    async createSurvey(createSurveyDto: CreateSurveyDTO): Promise<any> {
        try{
        if (!createSurveyDto.diseaseName || !createSurveyDto.outcomeName || !createSurveyDto.diseaseId) {
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

        // const campaignDetails = await this.campaignModel.findById(createSurveyDto.campaignId);
        // if (!campaignDetails) {
        //     return{
        //         status: 400,
        //         message: "Campaign not found",
        //     }
        // }
        const diseasesDetails = await this.DiseaseDetailModel.findById(createSurveyDto.diseaseId);
        if (!diseasesDetails) {
            return{
                status: 400,
                message: "diseases not found",
            }
        }

        const surveyExists = await this.surveyModel.findOne({ diseaseId: createSurveyDto.diseaseId, isActive: true });
        let firstWeekTemplateIds=[]
        let lastWeekTemplateIds=[]
        for(const quesData of createSurveyDto.profilingSurveyQnA){
            let buttons=[]
            for(let i=0;i<5;i++){
                buttons.push({
                    "text":quesData.answerOptions[i],
                    "type":"QUICK_REPLY",
                })
            }
            let data = {
                "name": "profilingsurveyform" + (Math.floor(Math.random() * 10000) + 10000).toString().substring(1),
                "language": "en",
                "category": "MARKETING",
                "structure": {
                    "body": `${quesData.question}`,
                    "buttons": buttons,
                }
            }
            const headers = this.apiHeaders;
    try {
                const temp_res = await firstValueFrom(this.httpService.post(this.apiCampaignUrl, data, { headers }));
                if(!temp_res.data.data.templateid){
                    return {
                        status: 400,
                        message: "Template creation failed",
                    }
                }
                firstWeekTemplateIds.push(temp_res.data.data.templateid);
            } catch (error) {
                console.error("Error fetching template data:", error.message);
            }

        }
        for(const quesData of createSurveyDto.outcomeSurveyQnA){
            let buttons=[]
            for(let i=0;i<5;i++){
                buttons.push({
                    "text":quesData.answerOptions[i],
                    "type":"QUICK_REPLY",
                })
            }
            let data = {
                "name": "outcomesurveyform" + (Math.floor(Math.random() * 10000) + 10000).toString().substring(1),
                "language": "en",
                "category": "MARKETING",
                "structure": {
                    "body": `${quesData.question}`,
                    "buttons": buttons,
                }
            }
            const headers = this.apiHeaders;
    try {
                const temp_res = await firstValueFrom(this.httpService.post(this.apiCampaignUrl, data, { headers }));
                if(!temp_res.data.data.templateid){
                    return {
                        status: 400,
                        message: "Template creation failed",
                    }
                }
                lastWeekTemplateIds.push(temp_res.data.data.templateid);
            } catch (error) {
                console.error("Error fetching template data:", error.message);
            }

        }
        createSurveyDto["firstWeekTemplateId"]=firstWeekTemplateIds
        createSurveyDto["lastWeekTemplateId"]=lastWeekTemplateIds
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
    catch(error){
        console.log(error.message)
    }
    }

    async getAllSurvey(pageNumber: number, pageSize: number,search:string): Promise<any> {
        const skip = (pageNumber - 1) * pageSize; // Calculate number of documents to skip
        
        const query = { isActive: true };
    
        try {
            if(search?.length>0){
                query["$or"] = [
                    { outcomeName: { $regex: search, $options: "i" } }, 
                    { diseaseName: { $regex: search, $options: "i" } }
                ];
            }
            const totalSurveys = await this.surveyModel.countDocuments(query);
            const surveyList = await this.surveyModel
                .find(query)
                .skip(skip)
                .limit(pageSize);
    
            if (!surveyList || surveyList.length === 0) {
                return {
                    status: 404,
                    message: "No surveys found",
                    data: [],
                    totalItems: totalSurveys
                };
            } else {
                return {
                    status: 200,
                    message: "Surveys fetched successfully",
                    data: surveyList,
                    totalItems: totalSurveys
                };
            }
        } catch (error) {
            return {
                status: 500,
                message: "Internal server error",
                error: error.message
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
        if (!data.diseaseName || !data.outcomeName || !data.diseaseId) {
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
        const diseasesDetails = await this.DiseaseDetailModel.findById(data.diseaseId);
        if (!diseasesDetails) {
            return {
                status: 404,
                message: "Disease not found",
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
        let checkOptioForProfile = data.profilingSurveyQnA.map(question =>
            question.answerOptions.some(answer => answer.trim() == "" || answer == null || answer == undefined),
        );

        let checkOptionForOutcome = data.outcomeSurveyQnA.map(question =>
            question.answerOptions.some(answer => answer.trim() == "" || answer == null || answer == undefined),
        );

        if (checkOptioForProfile.includes(true) || checkOptionForOutcome.includes(true)) {
            return {
                status: 400,
                message: "Please fill all the answer options",
            };
        }
        let firstWeekTemplateIds=[]
        let lastWeekTemplateIds=[]
        for(const quesData of data.profilingSurveyQnA){
            let buttons=[]
            for(let i=0;i<5;i++){
                buttons.push({
                    "text":quesData.answerOptions[i],
                    "type":"QUICK_REPLY",
                })
            }
            let data = {
                "name": "profilingsurveyform" + (Math.floor(Math.random() * 10000) + 10000).toString().substring(1),
                "language": "en",
                "category": "MARKETING",
                "structure": {
                    "body": `${quesData.question}`,
                    "buttons": buttons,
                }
            }
            const headers = this.apiHeaders;
    try {
                const temp_res = await firstValueFrom(this.httpService.post(this.apiCampaignUrl, data, { headers }));
                if(!temp_res.data.data.templateid){
                    return {
                        status: 400,
                        message: "Template creation failed",
                    }
                }
                firstWeekTemplateIds.push(temp_res.data.data.templateid);
            } catch (error) {
                console.error("Error fetching template data:", error.message);
            }

        }
        for(const quesData of data.outcomeSurveyQnA){
            let buttons=[]
            for(let i=0;i<5;i++){
                buttons.push({
                    "text":quesData.answerOptions[i],
                    "type":"QUICK_REPLY",
                })
            }
            let data = {
                "name": "outcomesurveyform" + (Math.floor(Math.random() * 10000) + 10000).toString().substring(1),
                "language": "en",
                "category": "MARKETING",
                "structure": {
                    "body": `${quesData.question}`,
                    "buttons": buttons,
                }
            }
            const headers = this.apiHeaders;
    try {
                const temp_res = await firstValueFrom(this.httpService.post(this.apiCampaignUrl, data, { headers }));
                if(!temp_res.data.data.templateid){
                    return {
                        status: 400,
                        message: "Template creation failed",
                    }
                }
                lastWeekTemplateIds.push(temp_res.data.data.templateid);
            } catch (error) {
                console.error("Error fetching template data:", error.message);
            }

        }
        data["firstWeekTemplateId"]=firstWeekTemplateIds
        data["lastWeekTemplateId"]=lastWeekTemplateIds
        const updatedSurvey = await this.surveyModel.findOneAndUpdate({ _id: surveyId }, data, { new: true });
        return {
            status: 200,
            message: "Survey updated successfully",
            data: updatedSurvey,
        };
    }

    async searchSurvey(search: string): Promise<any> {
        const survey = await this.surveyModel.find({
            $or: [{ outcomeName: { $regex: search, $options: "i" } }, { diseaseName: { $regex: search, $options: "i" } }],
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
