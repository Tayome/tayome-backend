import { IsNotEmpty } from "class-validator";

export class FacebookClientDetailsDto {
    @IsNotEmpty()
    access_token: String;
}
