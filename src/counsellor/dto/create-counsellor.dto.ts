import { IsOptional, IsString } from "class-validator";

export class CreateCounsellorDto {

    @IsString({ message: "Invalid value for name "})
    name: string;

    @IsString({ message: "Invalid value for e-mail"})
    email: string;

    @IsOptional()
    @IsString({ message: "Invalid value for gender "})
    gender: string;
}
