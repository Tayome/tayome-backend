import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { SchemaTypes } from "mongoose";

export type ClinicsDetailDocument = HydratedDocument<ClinicsDetail>;

@Schema({ timestamps: true })
export class ClinicsDetail {
    @Prop({ required: true, type: String })
    clinicName: String;

    @Prop({ required: true, type: String,unique:true })
    mobile: String;

    @Prop({ required: true, type: String,unique:true })
    email: String;

    @Prop({ required: true, type: String })
    address: String;

    @Prop({ required: true, type: Number })
    pincode: Number;

    @Prop({ default: "", type: String })
    qrCode: String;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const ClinicsDetailSchema = SchemaFactory.createForClass(ClinicsDetail);