import { IsDate, IsEmail, IsEnum, IsMongoId, IsOptional, Length, Matches, MaxLength } from "class-validator";
import { GenderEnum } from "src/utils/enums/gender.enum";

export class OnboardingUserDto {
    @IsMongoId()
    clinicId: String;

    @Length(2,100)
    name: String;

    @IsEnum(GenderEnum)
    Gender: GenderEnum;

    @Length(2,100)
    city: String;

    @Length(2,100)
    language: String;

    @IsEmail()
    @MaxLength(255)
    email: String

    @IsEmail()
    @MaxLength(255)
    alternateEmail: String;

    @Length(2,4)
    countryCode: String;

    @Matches(/^\d{6,}$/, {
        message: "Please enter valid mobile number"
      })
    @Length(10)
    mobile: String;

    @Length(2,4)
    alternateCountryCode: String;

    @Matches(/^\d{6,}$/, {
        message: "Please enter valid alternate mobile number"
      })
    @Length(10)
    alternateMobile: String;

    @Length(2,100)
    accountType: String;

    @IsDate()
    medicineStartDate: String;

    @Length(2,100)
    medicalCondition: String;

    @Length(2,200)
    medicineName: String;

    @IsOptional()
    @Length(2,600)
    notes: String;
}
