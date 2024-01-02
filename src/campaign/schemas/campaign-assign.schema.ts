import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";

export type CampaignAssignDocument = HydratedDocument<CampaignAssign>;

@Schema({ timestamps: true })
export class CampaignAssign {
    @Prop({ type: SchemaTypes.ObjectId, required: true, ref: "Patients" })
    userId: string;

    @Prop({ type: SchemaTypes.ObjectId, required: true, ref: "Campaign" })
    campaignId: string;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const CampaignAssignSchema = SchemaFactory.createForClass(CampaignAssign);
