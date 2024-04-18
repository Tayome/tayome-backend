import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ArrayMinSize, IsArray, IsNotEmpty, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { Document, SchemaTypes, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export class Questions {
    @Prop({ required: true })
    @IsNotEmpty()
    question: string;

    @Prop({ type: [String], required: false })
    @ArrayMinSize(1, { message: 'answerOptions must contain at least one item' })
    answerOptions: string[];
}

@Schema({ timestamps: true }) // Enable timestamps (createdAt, updatedAt)
export class outcomeSurvey extends Document {
    @Prop({ type: SchemaTypes.ObjectId, required: true, ref: "Campaign" })
    campaignId: Types.ObjectId;

    @Prop({ required: true })
    @IsNotEmpty()
    outcomeName: string;

    @Prop({ required:true})  // Consider using a reference here
    @IsNotEmpty()
    campaignName: string;

    @Prop({ required: true,default:true })
    @IsNotEmpty()
    isActive: boolean;

    @Prop({ required:true })
    @IsArray()
    @IsNotEmpty()
    profilingSurveyQnA: Questions;

    @Prop({ required:true })
    @IsArray()
    @IsNotEmpty()
    outcomeSurveyQnA: Questions;
}

export const OutcomeSchema = SchemaFactory.createForClass(outcomeSurvey);