import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CentersService } from './centers.service';
import { CreateCenterDto } from './dto/create-center.dto';
import { UpdateCenterDto } from './dto/update-center.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('centers')
@Controller('centers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CentersController {
  constructor(private readonly centersService: CentersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo centro' })
  create(@Body() createCenterDto: CreateCenterDto) {
    return this.centersService.create(createCenterDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los centros' })
  findAll() {
    return this.centersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener centro por ID' })
  findOne(@Param('id') id: string) {
    return this.centersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar centro' })
  update(@Param('id') id: string, @Body() updateCenterDto: UpdateCenterDto) {
    return this.centersService.update(id, updateCenterDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar centro (soft delete)' })
  remove(@Param('id') id: string) {
    return this.centersService.remove(id);
  }
}
