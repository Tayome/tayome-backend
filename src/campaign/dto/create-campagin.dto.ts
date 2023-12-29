import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsEnum, IsMongoId, Length, ValidateNested } from "class-validator";
import { WeekNumber } from "src/utils/enums/week-number.enum";

class WeekDataDto {
    @IsEnum(WeekNumber, { message: "Invalid week number" })
    weekNumber: WeekNumber;

    @Length(2, 1000, { message: "Invalid" })
    content: Number;
}

export class CreateCampaignDto {
    @Length(2, 100)
    name: String;

    @IsMongoId({ message: "Invalid disease id" })
    diseaseId: String;

    @IsArray()
    @Type(() => WeekDataDto)
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    weekData: WeekDataDto[];
}
