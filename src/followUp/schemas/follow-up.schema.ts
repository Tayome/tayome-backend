import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";

export type FollowUpDocument = HydratedDocument<FollowUp>

export enum FollowUpStatus {
    UPCOMING = "Upcoming" 
  }

@Schema({ timestamps: true })
export class FollowUp {
    _id: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: "Patients"})
    patientId: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: "User"})
    counsellorId: string;

    @Prop({ type: Date })
    followUpDate: Date;

    @Prop({ type: String })
    note: string;

    @Prop({ type: String, default: FollowUpStatus.UPCOMING })
    status: FollowUpStatus

    @Prop()
    createdAt: Date;
  
    @Prop()
    updatedAt: Date;
}

export const FollowUpSchema =  SchemaFactory.createForClass(FollowUp);