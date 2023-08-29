import { Type } from "class-transformer";
import { IsBoolean } from "class-validator";

export class StatusDto {
  @Type(() => Boolean)
  @IsBoolean()
  status: boolean;
}
