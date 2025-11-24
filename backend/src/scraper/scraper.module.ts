import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { DebugService } from './debug/debug.service';

@Module({
  providers: [ScraperService, DebugService],
  exports: [ScraperService, DebugService],
})
export class ScraperModule {}
