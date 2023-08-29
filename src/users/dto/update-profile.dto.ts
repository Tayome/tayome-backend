import { Length } from "class-validator";

export class UpdateProfileDto {
  @Length(2, 50)
  firstname: string;

  @Length(2, 50)
  lastname: string;
}
