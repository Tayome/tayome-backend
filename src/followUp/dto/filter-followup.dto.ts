import { Transform } from "class-transformer";
import { IsDate, IsOptional } from "class-validator";

export class FilterFollowUpDTO {
  
  @IsOptional()
  @IsDate({ message: 'Invalid start date format' })
  @Transform(({ value }) => new Date(value))
  startDate: Date;

  @IsOptional()
  @IsDate({ message: 'Invalid end date format' })
  @Transform(({ value }) => new Date(value))
  endDate: Date;

}