import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    const d = 1;
    const e = 1;
    if (d == 1) {
      return '';
    } else {
      return ' d';
    }

    return 'e';
  }
}
