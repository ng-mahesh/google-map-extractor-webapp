import { Injectable, Logger } from '@nestjs/common';
import { performance, PerformanceObserver } from 'perf_hooks';

@Injectable()
export class PerformanceMonitor {
  private readonly logger = new Logger(PerformanceMonitor.name);
  private observer: PerformanceObserver | null = null;

  constructor() {
    this.initializeObserver();
  }

  private initializeObserver(): void {
    // Only initialize if performance monitoring is enabled
    if (process.env.ENABLE_PERFORMANCE_MONITORING !== 'true') {
      return;
    }

    try {
      this.observer = new PerformanceObserver((items) => {
        items.getEntries().forEach((entry) => {
          if (entry.entryType === 'measure') {
            const duration = Math.round(entry.duration);

            // Log performance metrics
            this.logger.log({
              type: 'performance',
              name: entry.name,
              duration: `${duration}ms`,
              timestamp: new Date().toISOString(),
            });

            // Warn if operation takes too long
            if (duration > 5000) {
              this.logger.warn(`Slow operation detected: ${entry.name} took ${duration}ms`);
            }
          }
        });
      });

      this.observer.observe({ entryTypes: ['measure'] });
      this.logger.log('Performance monitoring initialized');
    } catch (error) {
      this.logger.error('Failed to initialize performance monitoring:', error);
    }
  }

  /**
   * Start measuring performance for an operation
   * @param name Unique name for the operation
   */
  startMeasure(name: string): void {
    if (process.env.ENABLE_PERFORMANCE_MONITORING !== 'true') {
      return;
    }

    try {
      performance.mark(`${name}-start`);
    } catch (error) {
      this.logger.error(`Failed to start measure for ${name}:`, error);
    }
  }

  /**
   * End measuring performance for an operation
   * @param name Name of the operation (must match the name used in startMeasure)
   */
  endMeasure(name: string): void {
    if (process.env.ENABLE_PERFORMANCE_MONITORING !== 'true') {
      return;
    }

    try {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);

      // Clean up marks
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
    } catch (error) {
      this.logger.error(`Failed to end measure for ${name}:`, error);
    }
  }

  /**
   * Measure the execution time of an async function
   * @param name Name for the measurement
   * @param fn Async function to measure
   * @returns Result of the function
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startMeasure(name);
    try {
      const result = await fn();
      this.endMeasure(name);
      return result;
    } catch (error) {
      this.endMeasure(name);
      throw error;
    }
  }

  /**
   * Measure the execution time of a synchronous function
   * @param name Name for the measurement
   * @param fn Function to measure
   * @returns Result of the function
   */
  measureSync<T>(name: string, fn: () => T): T {
    this.startMeasure(name);
    try {
      const result = fn();
      this.endMeasure(name);
      return result;
    } catch (error) {
      this.endMeasure(name);
      throw error;
    }
  }

  /**
   * Clean up the performance observer
   */
  onModuleDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
