import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ClientModule } from '../trade/client.module';

@Module({
  imports: [ClientModule],
  controllers: [ApiController],
})
export class ApiModule {}
