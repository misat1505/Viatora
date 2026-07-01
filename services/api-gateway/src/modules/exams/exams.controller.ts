import {
  Body,
  Controller,
  Inject,
  OnModuleInit,
  Post,
  UseGuards,
} from '@nestjs/common';
import { StartExamDTO, StartSessionResponseDTO } from './dto/start-exam.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ExamServiceClient } from 'src/generated/exam';
import { type ClientGrpc } from '@nestjs/microservices';
import { EXAMS_PACKAGE } from 'src/grpc/clients.module';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';
import { firstValueFrom } from 'rxjs';
import { CurrentUser } from 'src/common/decorators/get-current-user';
import { UserProfile } from 'src/generated/auth';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('/exams')
@UseGuards(JwtAuthGuard)
export class ExamsController implements OnModuleInit {
  private examService!: ExamServiceClient;

  constructor(
    @Inject(EXAMS_PACKAGE) private readonly grpcClient: ClientGrpc,
    private readonly grpcMetadataService: GrpcMetadataService,
  ) {}

  onModuleInit() {
    this.examService =
      this.grpcClient.getService<ExamServiceClient>('ExamService');
  }

  @Post('/start')
  @ApiOkResponse({ type: StartSessionResponseDTO })
  async startExamSession(
    @Body() dto: StartExamDTO,
    @CurrentUser() user: UserProfile,
  ): Promise<StartSessionResponseDTO> {
    const examSession = await firstValueFrom(
      this.examService.startSession({
        category: dto.category,
        userId: user.userId,
      }),
    );

    // @ts-expect-error TODO: make this error go away
    return examSession;
  }
}
