import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/utils/dto/pagination.dto";

export class GetPatientListDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search: string;
}