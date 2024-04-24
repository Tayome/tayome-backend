import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type PatientsManagerDocument = HydratedDocument<PatientsManager>;

@Schema({ timestamps: true })
export class PatientsManager {

    @Prop()
    CounsellorId: string;

    @Prop()
    counter:number

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}
export const PatientsManagerSchema = SchemaFactory.createForClass(PatientsManager);
