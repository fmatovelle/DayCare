import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { CheckInDto } from './dto/checkin.dto';
import { CheckOutDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiOperation({ summary: 'Crear registro de asistencia' })
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener registros de asistencia' })
  @ApiQuery({ name: 'date', required: false, description: 'Filtrar por fecha (YYYY-MM-DD)' })
  @ApiQuery({ name: 'childId', required: false, description: 'Filtrar por niño' })
  @ApiQuery({ name: 'classroomId', required: false, description: 'Filtrar por aula' })
  findAll(
    @Query('date') date?: string,
    @Query('childId') childId?: string,
    @Query('classroomId') classroomId?: string,
  ) {
    return this.attendanceService.findAll(date, childId, classroomId);
  }

  @Post('check-in')
  @ApiOperation({ summary: 'Registrar check-in' })
  checkIn(@Body() checkInDto: CheckInDto) {
    return this.attendanceService.checkIn(
      checkInDto.childId,
      checkInDto.date,
      checkInDto.checkIn,
    );
  }

  @Patch('check-out')
  @ApiOperation({ summary: 'Registrar check-out' })
  checkOut(@Body() checkOutDto: CheckOutDto) {
    return this.attendanceService.checkOut(
      checkOutDto.childId,
      checkOutDto.date,
      checkOutDto.checkOut,
    );
  }

  // NEW REPORT ENDPOINTS

  @Get('reports/daily')
  @ApiOperation({ summary: 'Reporte diario de asistencia' })
  @ApiQuery({ name: 'date', required: true, description: 'Fecha del reporte (YYYY-MM-DD)' })
  @ApiQuery({ name: 'classroomId', required: false, description: 'Filtrar por aula' })
  getDailyReport(
    @Query('date') date: string,
    @Query('classroomId') classroomId?: string,
  ) {
    return this.attendanceService.getDailyReport(date, classroomId);
  }

  @Get('reports/weekly')
  @ApiOperation({ summary: 'Reporte semanal de asistencia' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Fecha inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'Fecha fin (YYYY-MM-DD)' })
  @ApiQuery({ name: 'classroomId', required: false, description: 'Filtrar por aula' })
  getWeeklyReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('classroomId') classroomId?: string,
  ) {
    return this.attendanceService.getWeeklyReport(startDate, endDate, classroomId);
  }

  @Get('reports/child/:childId')
  @ApiOperation({ summary: 'Reporte de asistencia por niño' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Fecha inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'Fecha fin (YYYY-MM-DD)' })
  getChildReport(
    @Param('childId') childId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.attendanceService.getChildAttendanceReport(childId, startDate, endDate);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estadísticas de asistencia del día' })
  @ApiQuery({ name: 'date', required: true, description: 'Fecha (YYYY-MM-DD)' })
  getStats(@Query('date') date: string) {
    return this.attendanceService.getAttendanceStats(date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener registro por ID' })
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar registro de asistencia' })
  update(@Param('id') id: string, @Body() updateAttendanceDto: UpdateAttendanceDto) {
    return this.attendanceService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar registro de asistencia' })
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(id);
  }
}
