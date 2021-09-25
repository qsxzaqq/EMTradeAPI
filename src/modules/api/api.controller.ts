import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ClientService } from '../trade/client.service';
import { LoginDto } from './api.dto';

@ApiTags('交易登陆以及验证')
@Controller('api')
export class ApiController {
  constructor(private clientService: ClientService) {}

  @ApiOperation({ summary: '登陆' })
  @Post('/login')
  async login(@Body() body: LoginDto) {
    return this.clientService.login(body);
  }

  @ApiOperation({ summary: '退出' })
  @Get('/logout')
  async logout(@Query() query) {
    if (!query.clientId) {
      return {
        status: -1,
        error: '错误',
      };
    }

    return this.clientService.logout(query.clientId);
  }

  @ApiOperation({ summary: '持仓' })
  @Get('/asserts')
  async asserts(@Query() query) {
    if (!query.clientId) {
      return {
        status: -1,
        error: '错误',
      };
    }

    return this.clientService.asserts(query.clientId);
  }
}
