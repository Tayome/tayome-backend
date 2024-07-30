import { IsEmail, IsInt, IsNumber, Length, Matches, Max, MaxLength, Min } from "class-validator";

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

    @IsNumber()
    @IsInt()
    @Min(100000, { message: 'Pincode must be at least 6 digits' })
    @Max(999999, { message: 'Pincode must be at most 6 digits' })
    pincode: Number;
}
