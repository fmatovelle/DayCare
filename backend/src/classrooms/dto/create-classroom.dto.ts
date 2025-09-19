import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClassroomDto {
  @ApiProperty({ example: 'Aula Infantil' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Aula especializada para niños pequeños', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 6 })
  @IsNumber()
  @Min(0)
  ageGroupMin: number;

  @ApiProperty({ example: 18 })
  @IsNumber()
  @Min(0)
  ageGroupMax: number;

  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(1)
  capacity: number;

  @ApiProperty({ example: 'center-uuid' })
  @IsUUID()
  @IsNotEmpty()
  centerId: string;
}
