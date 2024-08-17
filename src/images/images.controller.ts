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
  Param,
  NotFoundException,
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
        blurDataUrl?: string;
        lowQualityUrl?: string;
        normalUrl: string;
        type: string;
        videoPreviewUrl?: string; // Añadido para el videoPreview
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
  async getImages(
    @Query('category') category?: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    const offset = (page - 1) * limit;

    return this.imagesService.getImagesByCategory(category, limit, offset);
  }

  @Get(':id')
  async getImageById(@Param('id', ParseIntPipe) id: number) {
    const image = await this.imagesService.getImageById(id);
    if (!image) {
      throw new NotFoundException(`Image with id ${id} not found`);
    }
    return image;
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
