import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";

export type JourneyDocument = HydratedDocument<Journey>

export enum JourneyType  {
    FOLLOWUPADDED = "FollowUpAdded",
    ASSIGNCOUNSELLOR = "AssignCounsellor",
    ASSIGNCAMPAIGN = "AssignCampaign"
}

@Schema({ timestamps: true })
export class Journey {
    _id: string;

    @Prop({ type: SchemaTypes.ObjectId, required: true, ref: "Patients"})
    patientId: string;
  
    @Prop({ type: SchemaTypes.ObjectId, ref: "User"})
    counsellorId: string;

    @Prop({ enum: JourneyType, required: true })
    journeyType: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: "Campaign"})
    campaignId: string;
  
    @Prop({ type: SchemaTypes.ObjectId, ref: "FollowUp"})
    followUpId: string;
   
    @Prop()
    createdAt: Date;
  
    @Prop()
    updatedAt: Date;
}

export const JourneySchema = SchemaFactory.createForClass(Journey);