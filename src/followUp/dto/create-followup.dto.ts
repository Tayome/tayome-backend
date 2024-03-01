import { Transform } from "class-transformer";
import { IsDate, IsEnum, IsMongoId, IsOptional, IsString} from "class-validator";
import { FollowUpStatus } from "../schemas/follow-up.schema";

export class CreateFollowUpDTO {

  @IsMongoId({ message: "Patient id must be mongodb id" })
  patientId: string;

  @IsMongoId({ message: "Counsellor id must be mongodb id"})
  counsellorId: string;
  
  @IsDate({ message: 'Invalid follow up date format' })
  @Transform(({ value }) => new Date(value))
  followUpDate: Date;

  @IsString()
  note: string;

  @IsOptional()
  @IsEnum(FollowUpStatus)
  status: string;

}