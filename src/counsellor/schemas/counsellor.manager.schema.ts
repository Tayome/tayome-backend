import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CounsellorManagerDocument = HydratedDocument<CounsellorManager>;

@Schema({ timestamps: true })
export class CounsellorManager {

    @Prop()
    CounsellorId: string;

    @Prop()
    counter:number

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}
export const CounsellorManagerSchema = SchemaFactory.createForClass(CounsellorManager);
