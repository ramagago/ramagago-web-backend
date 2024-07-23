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
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { ParseArrayToNumberPipe } from '../pipes/parse-array-to-number.pipe';
import { UpdateDescriptionDto } from './dto/update-description.dto';

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
  @UsePipes(new ParseArrayToNumberPipe())
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

  @Patch('description')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateDescription(
    @Body('id', ParseIntPipe) id: number, // Usa el ParseIntPipe para transformar el id
    @Body() updateDescriptionDto: UpdateDescriptionDto,
  ) {
    const { description } = updateDescriptionDto;

    if (!id) {
      throw new BadRequestException('Id is required');
    }

    await this.imagesService.updateDescription(id, description);

    return { message: 'Description updated successfully' };
  }
}
