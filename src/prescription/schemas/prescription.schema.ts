import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";

export type PrescriptionDocument = HydratedDocument<Prescription>

@Schema({ timestamps: true })

export class Prescription {
    _id: string;

    @Prop({ required: true, type: SchemaTypes.ObjectId, ref: "Patients"})
    patientId: string;

    @Prop({ required: true, type: SchemaTypes.ObjectId, ref : "User"})
    counsellorId: string;

    @Prop({ type: String })
    name: string;

    @Prop({ type: String, required: true })
    prescriptionUrl: string;
}

export const PrescriptionSchema = SchemaFactory.createForClass(Prescription);