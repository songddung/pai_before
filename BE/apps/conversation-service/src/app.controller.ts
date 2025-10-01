import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'conversation-service',
      port: process.env.PORT ?? '3004',
      uptimeSec: Math.floor(process.uptime()),
      time: new Date().toISOString(),
    };
  }
}
