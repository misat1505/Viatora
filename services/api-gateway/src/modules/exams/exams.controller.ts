import { Body, Controller, Post } from '@nestjs/common';
import { StartExamDTO } from './dto/start-exam.dto';

@Controller('/exams')
export class ExamsController {
  @Post('/start')
  async startExamSession(@Body() dto: StartExamDTO) {
    console.log(dto);
  }
}
