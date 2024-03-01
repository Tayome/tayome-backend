import { IsOptional, IsString } from "class-validator";

export class UpdateCounsellorDto {

    @IsOptional()
    @IsString({ message: "Invalid value for first name "})
    firstName: string;

    @IsOptional()
    @IsString({ message: "Invalid value for last name"})
    lastName: string;

    @IsOptional()
    @IsString({ message: "Invalid value for email "})
    email: string;

    @IsOptional()
    @IsString({ message: "Invalid value for gender"})
    gender: string;
}
