import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '🏥 DayCare API funcionando correctamente!';
  }
}
