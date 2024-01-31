import { IsMongoId } from "class-validator";

export class campaignAssignDto {
    @IsMongoId({ message: "Invalid patient id" })
    userId: string;

    @IsMongoId({ message: "Invalid disease id" })
    diseaseId: string;
}
