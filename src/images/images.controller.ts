import {
  Controller,
  Post,
  Body,
  Delete,
  Get,
  Patch,
  Query,
  UsePipes,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { ParseArrayToNumberPipe } from '../pipes/parse-array-to-number.pipe';
import { UpdateDescriptionDto } from './dto/update-description.dto';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  async uploadImages(
    @Body()
    body: {
      imageData: {
        description: string;
        category: string;
        order: number;
        url: string;
      }[];
    },
  ) {
    const { imageData } = body;

    if (!imageData || imageData.length === 0) {
      throw new BadRequestException('No image data provided');
    }

    try {
      return this.imagesService.createImages(imageData);
    } catch (error) {
      throw new BadRequestException('Failed to process image data');
    }
  }

  @Delete('many')
  @UsePipes(new ParseArrayToNumberPipe())
  async deleteMany(@Body() ids: number[]) {
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
  async updateDescription(
    @Body('id', ParseIntPipe) id: number,
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
