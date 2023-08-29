import { IsInt, IsOptional, Max, Min } from "class-validator";

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  pageSize: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  page: number;
}
