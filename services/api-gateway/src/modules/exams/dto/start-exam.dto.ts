import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class StartExamDTO {
  @IsString()
  @ApiProperty({
    description: 'Category of the test',
    example: 'B',
  })
  category!: string; // "B" | "A" | "A1" | "A2" | "B1" | "C" | "D" | "AM"
}
