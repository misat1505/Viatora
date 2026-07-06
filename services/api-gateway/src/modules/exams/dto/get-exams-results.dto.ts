import { ApiProperty } from '@nestjs/swagger';
import { SubmitExamResponseDTO } from './submit-exam.dto';

export class GetExamsResultsResponseDTO {
  @ApiProperty({
    type: () => SubmitExamResponseDTO,
    isArray: true,
  })
  exams!: SubmitExamResponseDTO[];
}
