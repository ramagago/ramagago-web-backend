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
      url: string;
    }[],
  ): Promise<any> {
    const highestOrder = await this.prisma.image.aggregate({
      _max: {
        order: true,
      },
    });

    let nextOrder = (highestOrder._max.order || 0) + 1;

    const imagesToCreate = imageData.map((image) => ({
      ...image,
      order: nextOrder++, // Asigna el próximo número disponible
    }));

    return this.prisma.image.createMany({
      data: imagesToCreate,
    });
  }

  async deleteMany(ids: number[]): Promise<void> {
    // Obtener las URLs de las imágenes a eliminar
    const imagesToDelete = await this.prisma.image.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        url: true,
      },
    });

    console.log('Imágenes a eliminar:', imagesToDelete);

    // Eliminar las imágenes de S3
    const deletePromises = imagesToDelete.map((image) => {
      console.log('Eliminando URL:', image.url);
      return this.uploadService.deleteObject(image.url);
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

  async getAllImages(): Promise<Image[]> {
    return this.prisma.image.findMany();
  }

  async getImagesByCategory(category: string): Promise<Image[]> {
    return this.prisma.image.findMany({
      where: {
        category,
      },
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
