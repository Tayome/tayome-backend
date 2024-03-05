import { IsMongoId, IsOptional, Length, Matches } from "class-validator";

export class OnboardingUserDto {
    @IsMongoId()
    clinicId: String;

    @Length(2, 100)
    name: String;

    @Length(2, 100)
    city: String;

    @Length(2, 100)
    language: String;

    @Length(2, 4)
    countryCode: String;

    @Matches(/^\d{6,}$/, {
        message: "Please enter valid mobile number",
    })
    @Length(10)
    mobile: String;

    @Length(2, 100)
    medicalCondition: String;

    @Length(2, 100)
    medicineName: String;

    @IsOptional()
    @Length(2, 600)
    notes: String;
}
