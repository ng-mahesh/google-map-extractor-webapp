import { Module, Global } from '@nestjs/common';
import { PerformanceMonitor } from './performance.monitor';

@Global()
@Module({
  providers: [PerformanceMonitor],
  exports: [PerformanceMonitor],
})
export class LoggingModule {}
