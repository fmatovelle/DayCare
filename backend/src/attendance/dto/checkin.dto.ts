import { IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckInDto {
  @ApiProperty({ example: 'child-uuid' })
  @IsString()
  @IsNotEmpty()
  childId: string;

  @ApiProperty({ example: '2025-09-19' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '08:30:00' })
  @IsString()
  @IsNotEmpty()
  checkIn: string;
}
