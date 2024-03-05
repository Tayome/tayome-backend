import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
export type DiseaseDetailDocument = HydratedDocument<DiseaseDetail>;
@Schema({ timestamps: true })
export class DiseaseDetail {
    @Prop({ required: true, type: String, unique: true })
    diseaseName: String;

    @Prop({ required: true, type: String })
    description: String;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}
export const DiseaseDetailSchema = SchemaFactory.createForClass(DiseaseDetail);
