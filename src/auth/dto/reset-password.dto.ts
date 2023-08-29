import { MaxLength, IsEnum, IsEmail, Length, ValidateIf, IsStrongPassword, IsMongoId, IsString, IsOptional } from "class-validator";
import { AuthTypes } from "../enums/auth.enum";
import { Transform } from "class-transformer";

export class ResetPasswordDto {
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
  
    @IsStrongPassword()
    password: string;
  
    @IsMongoId()
    otpVerificationCode: string;
}
