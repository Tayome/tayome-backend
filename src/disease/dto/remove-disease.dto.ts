import { IsMongoId } from "class-validator";

export class RemoveDiseaseDto {
    @IsMongoId({ message: "Invalid disease details" })
    diseaseId: string;
}
