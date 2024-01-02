import { IsMongoId } from "class-validator";

export class RemoveCampaignDto {
    @IsMongoId({ message: "Invalid campaign details" })
    id: string;
}
