import { Module } from '@nestjs/common';
import { AssistantModule } from './modules/assistant/assistant.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceKeyGuard } from './common/guards/service-key.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.getOrThrow<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true, // TODO: DEV only
      }),
    }),
    AssistantModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ServiceKeyGuard,
    },
  ],
})
export class AppModule {}
