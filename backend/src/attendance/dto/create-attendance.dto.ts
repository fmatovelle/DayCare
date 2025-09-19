import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttendanceDto {
  @ApiProperty({ example: 'child-uuid' })
  @IsString()
  @IsNotEmpty()
  childId: string;

  @ApiProperty({ example: '2025-09-19' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '08:30:00', required: false })
  @IsString()
  @IsOptional()
  checkIn?: string;

  @ApiProperty({ example: '16:30:00', required: false })
  @IsString()
  @IsOptional()
  checkOut?: string;

  @ApiProperty({ example: 'Llegó temprano hoy', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
