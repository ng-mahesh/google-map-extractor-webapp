import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExtractionService } from './extraction.service';
import { ExtractionController } from './extraction.controller';
import { ExtractionGateway } from './extraction.gateway';
import { Extraction, ExtractionSchema } from './schemas/extraction.schema';
import { ScraperModule } from '../scraper/scraper.module';
import { UsersModule } from '../users/users.module';
import { PerformanceMonitor } from '../common/logging/performance.monitor';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Extraction.name, schema: ExtractionSchema }]),
    ScraperModule,
    UsersModule,
  ],
  controllers: [ExtractionController],
  providers: [ExtractionService, ExtractionGateway, PerformanceMonitor],
  exports: [ExtractionGateway],
})
export class ExtractionModule {}
