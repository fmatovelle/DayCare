import { IsNotEmpty, IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckInDto {
  @ApiProperty({ example: 'child-uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  childId: string;

  @ApiProperty({ example: '2025-09-18' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 'Llego contento y descansado', required: false })
  @IsString()
  @IsOptional()
  checkInNotes?: string;

  @ApiProperty({ example: 'center-uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  centerId: string;

  @ApiProperty({ example: 'educator-uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  checkInByUserId: string;
}
