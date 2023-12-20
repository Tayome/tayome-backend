import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/utils/dto/pagination.dto";

export class DiseaseListDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search: String;
}
