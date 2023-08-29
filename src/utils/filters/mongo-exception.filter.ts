import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { MongoError } from "mongodb";

// https://stackoverflow.com/a/64682602

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let error: { statusCode: number; message: string };
    let value = [];
    if(Object.keys(exception["keyValue"])){
      value =  Object.keys(exception["keyValue"])
    }

    switch (exception.code) {
      case 11000: {
        error = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Duplicate Exception: " + value[0],
        };
        break;
      }
      default: {
        error = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Internal Error",
        };
        break;
      }
    }

    response.status(error.statusCode).json(error);
  }
}
