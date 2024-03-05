import { Length } from "class-validator";

export class AddNewDiseaseDto {
    @Length(2, 100)
    diseaseName: String;

    @Length(2, 500)
    description: String;
}
