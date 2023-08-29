import { Injectable } from "@nestjs/common";
import { S3 } from "aws-sdk";
import { ConfigService } from "@nestjs/config";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class UploadService {
  private bucketName = this.configService.getOrThrow<string>("AWS_S3_BUCKET");

  private readonly s3Client = new S3({
    region: this.configService.getOrThrow<string>("AWS_S3_REGION"),
  });

  constructor(private readonly configService: ConfigService) {}

  async upload(file: Buffer, path: string, fileName: string) {
    try {
      const response = await this.s3Client
        .upload({
          Bucket: this.bucketName,
          Key: `${path}${uuidv4()}-${fileName}`,
          Body: file,
          ACL: "public-read",
        })
        .promise();

      return response;
    } catch (error) {
      console.log(error);
    }
  }
}
