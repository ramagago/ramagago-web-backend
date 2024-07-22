import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseArrayToNumberPipe implements PipeTransform {
  transform(value: any) {
    if (!Array.isArray(value)) {
      throw new BadRequestException('Expected an array of IDs');
    }

    const parsedValues = value.map((id) => {
      const parsedId = parseInt(id, 10);
      if (isNaN(parsedId)) {
        throw new BadRequestException(`Invalid ID: ${id}`);
      }
      return parsedId;
    });

    return parsedValues;
  }
}
