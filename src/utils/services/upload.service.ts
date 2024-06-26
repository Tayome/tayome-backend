import { Injectable } from "@nestjs/common";
import { S3 } from "aws-sdk";
import { ConfigService } from "@nestjs/config";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class UploadService {
    private readonly bucketName: string;
    private readonly s3Client: S3;

    constructor(private readonly configService: ConfigService) {
        this.bucketName = this.configService.getOrThrow<string>("DO_SPACES_BUCKET_NAME");
        this.s3Client = new S3({
            endpoint: `https://${this.configService.getOrThrow<string>("DO_SPACES_REGION")}.digitaloceanspaces.com`,
            accessKeyId: this.configService.getOrThrow<string>("DO_SPACES_ACCESS_KEY_ID"),
            secretAccessKey: this.configService.getOrThrow<string>("DO_SPACES_SECRET_ACCESS_KEY"),
            region: "us-east-1", // AWS SDK requires a region, but it won't affect DigitalOcean Spaces
            s3ForcePathStyle: true, // Ensures compatibility with DigitalOcean Spaces
            signatureVersion: "v4",
        });
    }

    async upload(file: Buffer, path: string, fileName: string, mimetype?: string | null) {
        try {
            const response = await this.s3Client
                .upload({
                    Bucket: this.bucketName,
                    Key: `${path}${uuidv4()}-${fileName}`,
                    Body: file,
                    ACL: "public-read",
                    ContentType: mimetype ?? null,
                    ContentDisposition: "inline",
                })
                .promise();

            return response;
        } catch (error) {
            console.log(error);
            throw new Error("Failed to upload file");
        }
    }
}
