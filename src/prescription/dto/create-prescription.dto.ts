import { IsMongoId, IsString } from "class-validator";

export class CreatePrescriptionDto {
    @IsMongoId({ message: "Patient id must be mongodb id"})
    patientId: string;

    @IsMongoId({ message: "Counsellor id must be mongodb id"})
    counsellorId: string;

    @IsString({ message: "Invalid value for name" })
    name: string;

}