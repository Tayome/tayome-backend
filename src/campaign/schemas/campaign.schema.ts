import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";

export type CampaignDocument = HydratedDocument<Campaign>;

@Schema({ timestamps: true })
export class Campaign {
    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: SchemaTypes.ObjectId, required: true, ref: "Disease" })
    diseaseId: string;

    @Prop({
        type: [
            {
                weekNumber: { type: String, required: true },
                content: { type: String, required: true },
                file: { type: String, required: true },
                templateId: { type: String },
            },
        ],
        required: true,
    })
    weekData: { weekNumber: String; content: String; file: String; templateId: String }[];

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
