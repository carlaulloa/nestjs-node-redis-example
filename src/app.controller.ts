import { Body, Controller, Get, Post } from '@nestjs/common';
import { Query } from '@nestjs/common/decorators';
import { AppService } from './app.service';
import { RedisCacheService } from './redis-cache/redis-cache.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly redisCacheService: RedisCacheService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('data')
  async getData(@Query('key') key: string) {
    const result = await this.redisCacheService.get(key);
    return {
      status: true,
      result
    }
  }

  @Post('data')
  async setData(@Body() data: { key: string }) {
    const result = await this.redisCacheService.set('key', data.key, 3600);
    return {
      status: true,
      result
    }
  }

}
