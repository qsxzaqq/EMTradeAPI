import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ClientModule } from '../trade/client.module';

@Module({
  imports: [ClientModule],
  providers: [TasksService],
})
export class TasksModule {}
