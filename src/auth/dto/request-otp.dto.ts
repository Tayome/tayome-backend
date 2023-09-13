import { IsEmail, IsEnum, ValidateIf, Length, MaxLength, IsString, Matches } from "class-validator";
import { AuthTypes } from "../enums/auth.enum";
import { Transform } from "class-transformer";
import { OtpPurpose } from "../enums/otp-purpose.enum";

export class RequestOtpDto {
  @IsEnum([AuthTypes.EMAIL, AuthTypes.MOBILE])
  type: string;

  @ValidateIf(req => req.type === AuthTypes.EMAIL)
  @Transform(param => param.value.toLowerCase())
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ValidateIf(req => req.type === AuthTypes.MOBILE)
  @Matches(/^\d{6,}$/, {
    message: "Please enter valid mobile number"
  })
  @Length(10)
  mobile: string;

  @ValidateIf(req => req.type === AuthTypes.MOBILE)
  @IsString()
  @Length(2,4)
  countryCode: string;

  @IsEnum(OtpPurpose)
  purpose: string;
}
