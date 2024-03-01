import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CounsellorDocument = HydratedDocument<Counsellor>;

@Schema({ timestamps: true })
export class Counsellor {

    _id: string;

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String, required: true })
    email: string;

    @Prop({ type: String })
    gender: string;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}
export const CounsellorSchema = SchemaFactory.createForClass(Counsellor);
