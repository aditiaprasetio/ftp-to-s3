import { Controller, Get } from '@nestjs/common';
import * as appJSON from '../app.json';

@Controller()
export class AppController {

  @Get('health')
  getHello(): string {
    return 'Ok';
  }

  @Get()
  getApiVersion() {
    return appJSON.version;
  }
}
