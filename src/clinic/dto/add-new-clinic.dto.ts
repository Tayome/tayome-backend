import { IsEmail, Length, Matches, Max, MaxLength, Min } from "class-validator";

export class AddNewClinicDto {
    @Length(2,100)
    clinicName: String;

    @Matches(/^\d{6,}$/, {
        message: "Please enter valid mobile number"
    })
    @Length(10)
    mobile: string;

    @IsEmail()
    @MaxLength(255)
    email: String;

    @Length(2,300)
    address: String;

    @Min(111111)
    @Max(999999)
    pincode: Number;
}
