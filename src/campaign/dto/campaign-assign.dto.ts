import { IsMongoId, IsOptional } from "class-validator";

export class campaignAssignDto {
    @IsMongoId({ message: "Invalid patient id" })
    userId: string;

    @IsOptional()
    @IsMongoId({ message: "Invalid disease id" })
    diseaseId: string;

    @IsOptional()
    @IsMongoId({ message: "campaign id must be mongodb id"})
    campaignId: string;
}
