import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckOutDto {
  @ApiProperty({ example: 'attendance-record-uuid' })
  @IsUUID()
  @IsNotEmpty()
  attendanceId: string;

  @ApiProperty({ example: 'Tuvo un buen dia, comio bien', required: false })
  @IsString()
  @IsOptional()
  checkOutNotes?: string;

  @ApiProperty({ example: 'educator-uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  checkOutByUserId: string;
}
