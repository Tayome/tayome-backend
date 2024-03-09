import { IsOptional, IsString, Length } from "class-validator";
import { PaginationDto } from "src/utils/dto/pagination.dto";

export class PatientsListDto extends PaginationDto {
    @IsOptional()
    @Length(2, 100)
    @IsString({ message: "Invalid value for name" })
    name: string;
}
