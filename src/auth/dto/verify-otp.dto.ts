import { IsEmail, IsEnum, ValidateIf, Length, MaxLength, Min, Max } from "class-validator";
import { AuthTypes } from "../enums/auth.enum";
import { Transform } from "class-transformer";

export class VerifyOtpDto {
  @IsEnum([AuthTypes.EMAIL, AuthTypes.MOBILE])
  type: string;

  @ValidateIf(req => req.type === AuthTypes.EMAIL)
  @Transform(param => param.value.toLowerCase())
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ValidateIf(req => req.type === AuthTypes.MOBILE)
  @Length(10)
  mobile: string;

  @Min(100000)
  @Max(999999)
  otp: number;
}
