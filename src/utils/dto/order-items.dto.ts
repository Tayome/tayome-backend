import { IsMongoId } from "class-validator";
import { ObjectId } from "mongoose";

export class OrderItemsDto {
  @IsMongoId({
    each: true,
  })
  order: Array<ObjectId>;
}
