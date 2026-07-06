import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import {
  ExamQuestionDTO,
  LocaleDTO,
} from 'src/modules/exams/dto/start-exam.dto';

export class DetailedExamQuestionDTO extends ExamQuestionDTO {
  @IsString()
  @ApiProperty({
    description: 'Answer exaplanation',
    example: 'Trzeba zatrzymać się na czerwonym świetle.',
  })
  explanation!: LocaleDTO;
}
