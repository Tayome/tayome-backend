import { MaxLength, IsEnum, IsEmail, Length, ValidateIf, IsStrongPassword, IsMongoId, IsString, IsOptional } from "class-validator";
import { AuthTypes } from "../enums/auth.enum";
import { Transform } from "class-transformer";
import { RoleType } from "../enums/role.enum";

export class RegisterUserDto {
  @IsEnum([AuthTypes.EMAIL, AuthTypes.MOBILE])
  type: string;

  @Length(2, 50)
  firstName: string;

  @IsOptional()
  @Length(2, 50)
  lastName: string;

  @ValidateIf(req => req.type === AuthTypes.EMAIL)
  @Transform(param => param.value.toLowerCase())
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ValidateIf(req => req.type === AuthTypes.MOBILE)
  @Length(10)
  mobile: string;

  @IsOptional()
  @IsString()
  gender: string;

  @IsStrongPassword()
  password: string;

  @IsOptional()
  @IsString({ message: "Invalid value for role" })
  role: string;

  @ValidateIf(req => req.role !== RoleType.COUNSELLOR)
  @IsMongoId()
  otpVerificationCode: string;
}
