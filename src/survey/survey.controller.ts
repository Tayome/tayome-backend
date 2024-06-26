import { Body, Controller, Delete, Get, HttpException, Param, Post, Put, Query } from "@nestjs/common";
import { SurveyService } from "./survey.service";
import { CreateSurveyDTO } from "./dto/create.survey.dto";

@Controller("/survey")
export class SurveyController {
    constructor(private service: SurveyService) {}

    @Post("/create")
    async createSurvey(@Body() createSurveyDto: CreateSurveyDTO): Promise<any> {
        try {
            return await this.service.createSurvey(createSurveyDto);
        } catch (error) {
            throw new HttpException(error.message, error.statusCode);
        }
    }
    @Get('/getAll')
    async getAllSurvey(
        @Query('pageNumber') pageNumber: number,
        @Query('pageSize') pageSize: number,
        @Query("search") search:string
    ) {
        try {
            return await this.service.getAllSurvey(pageNumber, pageSize,search);
        } catch (e) {
            throw new HttpException(e.message, 500);
        }
    }
    @Get("/:id")
    async getSurveyById(@Param("id") id: string): Promise<any> {
        try {
            return await this.service.getSurveyById(id);
        } catch (error) {
            throw new HttpException(error.message, error.statusCode);
        }
    }
    @Delete("/:id")
    async deleteSurveyById(@Param("id") id: string): Promise<any> {
        try {
            return await this.service.deleteSurveybyId(id);
        } catch (error) {
            throw new HttpException(error.message, error.statusCode);
        }
    }
    @Put("/:id")
    async updateSurveyById(@Param("id") id: string,@Body() updateSurvey:CreateSurveyDTO): Promise<any> {
        try {
            return await this.service.updateSurveyById(id,updateSurvey);
        } catch (error) {
            throw new HttpException(error.message, error.statusCode);
        }
    }
    @Get()
    async searchSurvey(@Query("search") search:string):Promise<any>{
        try {
            return await this.service.searchSurvey(search);
        } catch (error) {
            throw new HttpException(error.message, error.statusCode);
        }
    }
}
