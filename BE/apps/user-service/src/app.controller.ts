import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'user-service',
      port: process.env.PORT ?? '3001',
      uptimeSec: Math.floor(process.uptime()),
      time: new Date().toISOString(),
    };
  }
}
