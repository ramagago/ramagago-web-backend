import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { Image } from '@prisma/client';

@Injectable()
export class ImagesService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async createImages(
    imageData: {
      description: string;
      category: string;
      blurDataUrl?: string;
      lowQualityUrl?: string;
      normalUrl: string;
      type: string;
      videoPreviewUrl?: string; // Añadido para el videoPreview
    }[],
  ): Promise<any> {
    const highestOrder = await this.prisma.image.aggregate({
      _max: {
        order: true,
      },
    });

    let nextOrder = (highestOrder._max.order || 0) + 1;

    const imagesToCreate = imageData.map((image) => ({
      description: image.description,
      category: image.category,
      blurDataUrl: image.blurDataUrl,
      lowQualityUrl: image.lowQualityUrl,
      normalUrl: image.normalUrl,
      type: image.type,
      videoPreviewUrl: image.videoPreviewUrl, // Añadido para el videoPreview
      order: nextOrder++, // Asigna el próximo número disponible
    }));

    return this.prisma.image.createMany({
      data: imagesToCreate,
    });
  }

  async deleteMany(ids: number[]): Promise<void> {
    // Obtener las Urls de las imágenes a eliminar
    const imagesToDelete = await this.prisma.image.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        blurDataUrl: true,
        lowQualityUrl: true,
        normalUrl: true,
        videoPreviewUrl: true, // Añadido para el videoPreview
      },
    });

    console.log('Imágenes a eliminar:', imagesToDelete);

    // Eliminar las imágenes de S3
    const deletePromises = imagesToDelete.flatMap((image) => {
      console.log('Eliminando lowQualityUrl:', image.lowQualityUrl);
      console.log('Eliminando normalUrl:', image.normalUrl);
      console.log('Eliminando videoPreviewUrl:', image.videoPreviewUrl); // Añadido para el videoPreview
      return [
        this.uploadService.deleteObject(image.lowQualityUrl),
        this.uploadService.deleteObject(image.normalUrl),
        image.videoPreviewUrl
          ? this.uploadService.deleteObject(image.videoPreviewUrl)
          : null, // Eliminar videoPreviewUrl si existe
      ].filter(Boolean);
    });

    await Promise.all(deletePromises);

    // Eliminar las imágenes de la base de datos
    await this.prisma.image.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async getAllImages(limit: number, offset: number): Promise<Image[]> {
    return this.prisma.image.findMany({
      take: limit,
      skip: offset,
    });
  }

  async getImageById(id: number): Promise<Image | null> {
    return this.prisma.image.findUnique({
      where: { id },
    });
  }

  async getImagesByCategory(
    category: string,
    limit: number,
    offset: number,
  ): Promise<Image[]> {
    return this.prisma.image.findMany({
      where: { category },
      take: limit,
      skip: offset,
    });
  }

  async updateImageOrder(
    updateOrderDto: { id: number; order: number }[],
  ): Promise<void> {
    const updatePromises = updateOrderDto.map(({ id, order }) => {
      return this.prisma.image.update({
        where: { id },
        data: { order },
      });
    });

    await Promise.all(updatePromises);
  }

  async updateDescription(id: number, description: string): Promise<void> {
    const image = await this.prisma.image.findUnique({ where: { id } });

    if (!image) {
      throw new NotFoundException(`Image with id ${id} not found`);
    }

    await this.prisma.image.update({
      where: { id },
      data: { description },
    });
  }
}
