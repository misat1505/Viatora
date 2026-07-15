import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class GetSummaryResponseDTO {
  @ApiProperty()
  @IsInt()
  totalExams: number;

  @ApiProperty()
  @IsInt()
  passRate: number;

  @ApiProperty()
  @IsInt()
  averageScore: number;

  @ApiProperty()
  @IsInt()
  bestScore: number;

  @ApiProperty()
  @IsInt()
  currentStreak: number;

  @ApiProperty()
  @IsInt()
  longestStreak: number;

  @ApiProperty()
  @IsInt()
  totalTimeMinutes: number;
}
