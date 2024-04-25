import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { SchemaTypes } from "mongoose";

export type PatientsDocument = HydratedDocument<Patients>;

@Schema({ timestamps: true })
export class Patients {
    @Prop({ required: true, type: SchemaTypes.ObjectId, ref: "ClinicsDetail" })
    clinicId: String;

    @Prop({ required: true, type: String })
    name: String;

    @Prop({ required: true, type: String })
    city: String;

    @Prop({ required: true, type: String })
    language: String;

    @Prop({ required: true, type: String })
    countryCode: String;

    @Prop({ required: true, type: String,unique:true })
    mobile: String;

    @Prop({ required: true, type: SchemaTypes.ObjectId, ref: "DiseaseDetail" })
    medicalCondition: String;

    @Prop({ required: true, type: String })
    medicineName: String;

    @Prop({ type: String })
    notes: String;
    
    @Prop({ type: SchemaTypes.ObjectId, ref: "User"})
    counsellorId: string;
}

export const PatientsSchema = SchemaFactory.createForClass(Patients);
