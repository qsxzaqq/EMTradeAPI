import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ClientService } from '../trade/client.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private clientService: ClientService) {}

  @Cron('0 0,20,40 * * * MON-FRI')
  async heartbeat() {
    this.logger.log('定时 heartbeat 开始');
    await this.clientService.heartbeat();
    Logger.log('定时 heartbeat 结束');
  }
}
