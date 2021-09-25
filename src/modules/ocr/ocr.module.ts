import { Module } from '@nestjs/common';
import { OcrService } from './ocr.service';

@Module({
  providers: [OcrService],
  exports: [OcrService],
})
export class OcrModule {}
