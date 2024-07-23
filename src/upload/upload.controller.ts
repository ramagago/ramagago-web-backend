import { Controller, Post, Body } from '@nestjs/common';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload-url')
  async getUploadUrl(
    @Body('key') key: string,
  ): Promise<{ uploadUrl: string; key: string }> {
    const uploadUrl = await this.uploadService.getUploadUrl(key);
    return { uploadUrl, key };
  }
}
