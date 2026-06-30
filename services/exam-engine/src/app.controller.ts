import { Body, Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('ExamService', 'StartSession')
  startExamSession(@Body() dto: any) {
    console.log(dto);
    return 'Bob';
  }
}
