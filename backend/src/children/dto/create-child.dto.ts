import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChildDto {
  @ApiProperty({ example: 'Federico' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Matovelle' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '2022-03-03' })
  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @ApiProperty({ example: 'male' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ example: 'Ninguna alergia conocida', required: false })
  @IsString()
  @IsOptional()
  allergies?: string;

  @ApiProperty({ example: 'Carmen García', required: false })
  @IsString()
  @IsOptional()
  emergencyContactName?: string;

  @ApiProperty({ example: '638835054', required: false })
  @IsString()
  @IsOptional()
  emergencyContactPhone?: string;

  @ApiProperty({ example: 'classroom-uuid', required: false })
  @IsString()
  @IsOptional()
  classroomId?: string;
}
