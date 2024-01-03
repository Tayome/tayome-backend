import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";

export type CampaignSendDocument = HydratedDocument<CampaignSend>;

@Schema({ timestamps: true })
export class CampaignSend {
    @Prop({ type: SchemaTypes.ObjectId, required: true, ref: "Patients" })
    userId: string;

    @Prop({ type: SchemaTypes.ObjectId, required: true, ref: "Campaign" })
    campaignId: string;

    @Prop({ required: true, type: String })
    mobile: String;

    @Prop({
        type: [
            {
                weekId: { type: SchemaTypes.ObjectId, required: true, ref: "Campaign" },
                messageSent: Boolean,
                sentOn: Date,
                userResponse: String,
            },
        ],
        required: true,
    })
    campaignResponse: { weekId: String; messageSent: Boolean; sentOn: Date; userResponse: String }[];

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const CampaignSendSchema = SchemaFactory.createForClass(CampaignSend);
