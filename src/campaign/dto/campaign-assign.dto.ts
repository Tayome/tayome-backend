import { IsMongoId } from "class-validator";

export class assignCampaignDto {
    @IsMongoId({ message: "Invalid patient id" })
    userId: string;

    @IsMongoId({ message: "Invalid campaign id" })
    diseaseId: string;
}
