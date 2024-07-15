import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'; // Importar los comandos necesarios
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly s3Client = new S3Client({
    region: this.configService.getOrThrow('AWS_S3_REGION'),
    credentials: {
      accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
    },
  });
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly configService: ConfigService) {}

  async upload(fileName: string, file: Buffer): Promise<string> {
    const bucketName = this.configService.getOrThrow('AWS_S3_BUCKET');

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fileName,
          Body: file,
        }),
      );

      const url = `https://${bucketName}.s3.${this.configService.getOrThrow('AWS_S3_REGION')}.amazonaws.com/${fileName}`;
      this.logger.log(`Uploaded file "${fileName}" to S3. URL: ${url}`);

      return url;
    } catch (error) {
      this.logger.error(
        `Failed to upload file "${fileName}" to S3`,
        error.stack,
      );
      throw new Error(`Failed to upload file "${fileName}" to S3`);
    }
  }

  async deleteObject(url: string): Promise<void> {
    const bucketName = this.configService.getOrThrow('AWS_S3_BUCKET');
    const key = url.split(
      `https://${bucketName}.s3.${this.configService.getOrThrow('AWS_S3_REGION')}.amazonaws.com/`,
    )[1];

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key,
        }),
      );
      this.logger.log(`Deleted object from S3. URL: ${url}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete object from S3. URL: ${url}`,
        error.stack,
      );
      throw new Error(`Failed to delete object from S3. URL: ${url}`);
    }
  }

  async uploadMany(
    files: { fileName: string; file: Buffer }[],
  ): Promise<string[]> {
    const uploadPromises = files.map(({ fileName, file }) =>
      this.upload(fileName, file),
    );

    return Promise.all(uploadPromises);
  }
}
