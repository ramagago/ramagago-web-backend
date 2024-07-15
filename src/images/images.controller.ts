import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  Delete,
  Get,
  Patch,
  Query,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('imageData') imageData: string,
  ) {
    const parsedImageData = JSON.parse(imageData);
    return this.imagesService.createImages(files, parsedImageData);
  }

  @Delete('many')
  async deleteMany(@Body() ids: number[]) {
    console.log('hola');
    return this.imagesService.deleteMany(ids);
  }

  @Get()
  async getImages(@Query('category') category?: string) {
    if (category) {
      return this.imagesService.getImagesByCategory(category);
    }
    return this.imagesService.getAllImages();
  }

  @Patch('order')
  async updateImageOrder(
    @Body() updateOrderDto: { id: number; order: number }[],
  ) {
    return this.imagesService.updateImageOrder(updateOrderDto);
  }
}
