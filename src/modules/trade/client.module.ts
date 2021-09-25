import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { OcrModule } from '../ocr/ocr.module';

@Module({
  imports: [OcrModule],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
