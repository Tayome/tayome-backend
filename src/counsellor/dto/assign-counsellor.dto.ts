import { IsMongoId, IsOptional, IsString } from "class-validator";

export class AssignCounsellorDto {
    @IsOptional()
    @IsMongoId({ message: "Counsellor id must be mongodb id " })
    counsellorId: string;
}
