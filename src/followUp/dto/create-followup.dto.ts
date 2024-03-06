import { Transform } from "class-transformer";
import { IsDate, IsEnum, IsMongoId, IsOptional, IsString, Matches} from "class-validator";
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
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Time should be in HH:mm format' })
  followUpTime: string;

  @IsString()
  note: string;

  @IsOptional()
  @IsEnum(FollowUpStatus)
  status: string;

  @IsOptional()
  @IsMongoId({ message: "Prescription id must be mongodb id"})
  prescriptionId: string;

}