import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }

  @Post('test-user')
  @ApiOperation({ summary: 'Crear usuario de prueba (solo desarrollo)' })
  async createTestUser() {
    // Solo para testing - eliminar en producción
    const { UsersService } = await import('../users/users.service');
    const usersService = new UsersService(null); // Simplified for demo
    
    return {
      message: 'Usa POST /api/v1/users para crear usuarios',
      example: {
        email: 'admin@daycare.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'DayCare',
        role: 'admin'
      }
    };
  }
}
