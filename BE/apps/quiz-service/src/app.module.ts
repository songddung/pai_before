import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuizModule } from './modules/quiz.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    QuizModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
