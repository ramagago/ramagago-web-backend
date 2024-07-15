import { Injectable } from '@nestjs/common';
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
    files: Express.Multer.File[],
    imageData: { description: string; category: string; order: number }[],
  ): Promise<Image[]> {
    const createImagePromises = files.map(async (file, index) => {
      const { description, category } = imageData[index];
      console.log('Procesando archivo:', file.originalname); // Log de depuración

      const url = await this.uploadService.upload(
        file.originalname,
        file.buffer,
      );
      console.log('Archivo subido a S3:', url); // Log de depuración

      // Obtener la última imagen para determinar el siguiente order por categoría
      const lastImageInCategory = await this.prisma.image.findFirst({
        where: { category },
        orderBy: { order: 'desc' },
      });

      const newOrder = lastImageInCategory ? lastImageInCategory.order + 1 : 0;

      return this.prisma.image.create({
        data: {
          url,
          description,
          category,
          order: newOrder,
        },
      });
    });

    return await Promise.all(createImagePromises);
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
      return this.uploadService.deleteObject(image.url); // Utilizar deleteObject en lugar de delete
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
}