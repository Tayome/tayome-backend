import { IsNotEmpty, IsBoolean, IsArray, ArrayNotEmpty, ArrayMinSize, IsString, IsMongoId, IsUUID } from 'class-validator';
import { Types } from 'mongoose';
import { IsOptional } from 'class-validator';

export class QuestionDTO {
    @IsNotEmpty()
    @IsString()
    question: string;

    @IsArray()
    @ArrayMinSize(1, { message: 'answerOptions must contain at least one item' })
    answerOptions: string[];
}

export class CreateSurveyDTO {
    @IsMongoId({ message: "Invalid campaign id" })
    @IsNotEmpty()
    campaignId: Types.ObjectId;

    @IsNotEmpty()
    @IsString()
    outcomeName: string;

    @IsNotEmpty()
    @IsString()
    campaignName: string;

    @IsBoolean()
    @IsOptional()
    isActive: boolean;

    @IsArray()
    @ArrayNotEmpty()
    @ArrayMinSize(1)
    profilingSurveyQnA: QuestionDTO[];

    @IsArray()
    @ArrayNotEmpty()
    @ArrayMinSize(1)
    outcomeSurveyQnA: QuestionDTO[];

    @IsString()
    firstWeekTemplateId: string;

    @IsString()
    lastWeekTemplateId: string;

}


export class UpdateQuestionDTO {
    @IsNotEmpty()
    questionId: string;

    @IsNotEmpty()
    @IsString()
    question: string;


    @IsArray()
    @ArrayMinSize(1, { message: 'answerOptions must contain at least one item' })
    answerOptions: string[];
}

