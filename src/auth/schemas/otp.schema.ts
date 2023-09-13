import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type OtpDocument = HydratedDocument<Otp>;

@Schema({ timestamps: true })
export class Otp {
  @Prop()
  otp: Number;

  @Prop({ required: true, type: String })
  for: String;

  @Prop({ required: true, type: String })
  purpose: String;

  @Prop({ required: true, type: Boolean, default: false })
  isUsed: Boolean;

  @Prop({ required: true, type: Number, default: 0 })
  resendCount: Number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
