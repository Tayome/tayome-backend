import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/utils/dto/pagination.dto";

export class CampaignListDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search: String;
}
