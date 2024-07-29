import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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

  async getUploadUrl(key: string): Promise<string> {
    const bucketName = this.configService.getOrThrow('AWS_S3_BUCKET');
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: 'image/jpeg', // Ajusta esto según el tipo de archivo
    });

    try {
      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 300,
      });
      return uploadUrl;
    } catch (error) {
      this.logger.error(`Failed to get upload URL for "${key}"`, error.stack);
      throw new Error(`Failed to get upload URL for "${key}"`);
    }
  }
  async deleteObject(url: string): Promise<void> {
    const bucketName = this.configService.getOrThrow('AWS_S3_BUCKET');
    const region = this.configService.getOrThrow('AWS_S3_REGION');

    // Asegúrate de que la URL es la esperada
    this.logger.log(`Deleting URL: ${url}`);

    // Extraer la clave del objeto
    const key = url.replace(
      `https://${bucketName}.s3.${region}.amazonaws.com/`,
      '',
    );

    // Verificar la clave extraída
    this.logger.log(`Extracted key: ${key}`);

    // Asegurarse de que la clave no esté vacía
    if (!key) {
      this.logger.error(`Invalid key extracted: ${key}`);
      throw new Error(`Invalid key extracted: ${key}`);
    }

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
}
