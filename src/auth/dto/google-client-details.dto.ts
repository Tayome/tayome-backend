import { IsNotEmpty } from "class-validator";

export class GoogleClientDetailsDto {
    @IsNotEmpty()
    token: String;
}
