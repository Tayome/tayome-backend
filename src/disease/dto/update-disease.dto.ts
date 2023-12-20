import { IsMongoId, Length } from "class-validator";

export class UpdateDiseaseDto {
    @IsMongoId({ message: "Invalid disease details" })
    diseaseId: string;

    @Length(2, 100, { message: "Disease name should be in between 2 to 100 characters" })
    diseaseName: String;

    @Length(2, 500, { message: "Disease description should be in between 2 to 500 characters" })
    description: String;
}
