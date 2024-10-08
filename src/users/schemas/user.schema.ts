import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { AuthTypes } from "src/auth/enums/auth.enum";
import * as bcrypt from "bcrypt";
import { RoleType } from "src/auth/enums/role.enum";

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  _id: string;

  @Prop({ type: String })
  firstName: String;

  @Prop({ type: String })
  lastName: String;

  @Prop({ required: true, enum: AuthTypes })
  type: String;

  @Prop({ type: String })
  googleId: String;

  @Prop({ type: String })
  facebookId: String;

  @Prop({ unique: true })
  mobile: String;

  @Prop({ unique: true })
  email: String;

  @Prop({ type: String })
  picture: String;
  
  @Prop({ type: String })
  gender: string;

  @Prop({ type: Boolean, default: false })
  assigned: boolean;

  @Prop({ required: true, default: "user", enum: RoleType })
  role: String;

  @Prop({ required: false, default:true})
  isActive: boolean;

  @Prop({ type: Boolean, default: true})
  status: boolean;

  @Prop()
  salt: String;

  @Prop()
  password: String;

  @Prop({required:false})
  index: number;

  validatePassword: Function;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.validatePassword = async function (password: string): Promise<boolean> {
  const hash = await bcrypt.hash(password, this.salt);
  return this.password === hash;
};
