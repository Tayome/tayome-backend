import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/utils/dto/pagination.dto";

export class ClinicsListDto extends PaginationDto{
    @IsOptional()
    @IsString()
    search: String;
}
