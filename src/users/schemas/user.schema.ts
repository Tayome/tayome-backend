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
  firstname: String;

  @Prop({ type: String })
  lastname: String;

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

  @Prop({ required: true, default: "user", enum: RoleType })
  role: String;

  @Prop()
  salt: String;

  @Prop()
  password: String;

  validatePassword: Function;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.validatePassword = async function (password: string): Promise<boolean> {
  const hash = await bcrypt.hash(password, this.salt);
  return this.password === hash;
};
