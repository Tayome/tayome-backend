import { IsMongoId } from "class-validator";

export class PatienDetailDto {
    @IsMongoId()
    id: String;
}
