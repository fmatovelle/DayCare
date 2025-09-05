import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Health Check - Verificar que la API esté funcionando' })
  getHealth() {
    return {
      message: '🏥 DayCare API está funcionando correctamente',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        docs: '/api/docs',
        health: '/health',
        users: '/api/v1/users',
      },
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health Check detallado' })
  getDetailedHealth() {
    return {
      status: 'healthy',
      service: 'DayCare API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
