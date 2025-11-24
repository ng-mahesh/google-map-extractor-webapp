import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import { join } from 'path';
import type { Page } from 'puppeteer';

@Injectable()
export class DebugService {
  private readonly logger = new Logger(DebugService.name);
  private readonly debugBasePath: string;
  private readonly retentionDays: number;
  private readonly saveScreenshots: boolean;
  private readonly saveHtmlDumps: boolean;

  constructor(private configService: ConfigService) {
    this.debugBasePath =
      this.configService.get<string>('DEBUG_BASE_PATH') || join(process.cwd(), 'debug');
    this.retentionDays = parseInt(
      this.configService.get<string>('DEBUG_RETENTION_DAYS') || '7',
      10,
    );
    this.saveScreenshots = this.configService.get<string>('SCRAPER_SAVE_SCREENSHOTS') !== 'false';
    this.saveHtmlDumps = this.configService.get<string>('SCRAPER_SAVE_HTML_DUMPS') !== 'false';
  }

  /**
   * Create debug directory structure for an extraction
   */
  async createDebugDirectory(extractionId: string): Promise<string> {
    const extractionPath = join(this.debugBasePath, extractionId);
    const screenshotsPath = join(extractionPath, 'screenshots');
    const htmlDumpsPath = join(extractionPath, 'html-dumps');
    const errorLogsPath = join(extractionPath, 'error-logs');

    try {
      await fs.mkdir(screenshotsPath, { recursive: true });
      await fs.mkdir(htmlDumpsPath, { recursive: true });
      await fs.mkdir(errorLogsPath, { recursive: true });

      this.logger.debug(`Created debug directory for extraction ${extractionId}`);
      return extractionPath;
    } catch (error) {
      this.logger.error(`Failed to create debug directory: ${error.message}`);
      throw error;
    }
  }

  /**
   * Save a screenshot of the current page state
   */
  async saveScreenshot(
    page: Page,
    extractionId: string,
    context: string,
    placeIndex?: number,
  ): Promise<string | null> {
    if (!this.saveScreenshots) {
      return null;
    }

    try {
      const timestamp = Date.now();
      const indexPart = placeIndex !== undefined ? `-place-${placeIndex}` : '';
      const filename = `${context}${indexPart}-${timestamp}.png`;
      const screenshotPath = join(this.debugBasePath, extractionId, 'screenshots', filename);

      // Ensure directory exists
      await fs.mkdir(join(this.debugBasePath, extractionId, 'screenshots'), {
        recursive: true,
      });

      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      this.logger.debug(`Saved screenshot: ${filename}`);
      return screenshotPath;
    } catch (error) {
      this.logger.warn(`Failed to save screenshot: ${error.message}`);
      return null;
    }
  }

  /**
   * Save HTML dump of the current page
   */
  async saveHtmlDump(
    page: Page,
    extractionId: string,
    context: string,
    placeIndex?: number,
  ): Promise<string | null> {
    if (!this.saveHtmlDumps) {
      return null;
    }

    try {
      const timestamp = Date.now();
      const indexPart = placeIndex !== undefined ? `-place-${placeIndex}` : '';
      const filename = `${context}${indexPart}-${timestamp}.html`;
      const htmlPath = join(this.debugBasePath, extractionId, 'html-dumps', filename);

      // Ensure directory exists
      await fs.mkdir(join(this.debugBasePath, extractionId, 'html-dumps'), {
        recursive: true,
      });

      const html = await page.content();
      await fs.writeFile(htmlPath, html, 'utf-8');

      this.logger.debug(`Saved HTML dump: ${filename}`);
      return htmlPath;
    } catch (error) {
      this.logger.warn(`Failed to save HTML dump: ${error.message}`);
      return null;
    }
  }

  /**
   * Save error log with context
   */
  async saveErrorLog(
    extractionId: string,
    error: Error,
    context: {
      operation: string;
      placeIndex?: number;
      placeName?: string;
      additionalInfo?: Record<string, any>;
    },
  ): Promise<string | null> {
    try {
      const timestamp = new Date().toISOString();
      const filename = `error-${Date.now()}.json`;
      const errorLogPath = join(this.debugBasePath, extractionId, 'error-logs', filename);

      // Ensure directory exists
      await fs.mkdir(join(this.debugBasePath, extractionId, 'error-logs'), {
        recursive: true,
      });

      const errorData = {
        timestamp,
        extractionId,
        operation: context.operation,
        placeIndex: context.placeIndex,
        placeName: context.placeName,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        additionalInfo: context.additionalInfo || {},
      };

      await fs.writeFile(errorLogPath, JSON.stringify(errorData, null, 2), 'utf-8');

      this.logger.debug(`Saved error log: ${filename}`);
      return errorLogPath;
    } catch (err) {
      this.logger.warn(`Failed to save error log: ${err.message}`);
      return null;
    }
  }

  /**
   * Save debug artifacts (screenshot + HTML + error log)
   */
  async saveDebugArtifacts(
    page: Page,
    extractionId: string,
    error: Error,
    context: {
      operation: string;
      placeIndex?: number;
      placeName?: string;
      additionalInfo?: Record<string, any>;
    },
  ): Promise<{
    screenshot: string | null;
    htmlDump: string | null;
    errorLog: string | null;
  }> {
    const [screenshot, htmlDump, errorLog] = await Promise.all([
      this.saveScreenshot(page, extractionId, 'error', context.placeIndex),
      this.saveHtmlDump(page, extractionId, 'error', context.placeIndex),
      this.saveErrorLog(extractionId, error, context),
    ]);

    return { screenshot, htmlDump, errorLog };
  }

  /**
   * Clean up old debug files based on retention policy
   */
  async cleanupOldDebugFiles(): Promise<void> {
    try {
      const extractionDirs = await fs.readdir(this.debugBasePath);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

      for (const dir of extractionDirs) {
        const dirPath = join(this.debugBasePath, dir);
        const stats = await fs.stat(dirPath);

        if (stats.isDirectory() && stats.mtime < cutoffDate) {
          await fs.rm(dirPath, { recursive: true, force: true });
          this.logger.log(`Cleaned up old debug directory: ${dir}`);
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to cleanup old debug files: ${error.message}`);
    }
  }

  /**
   * Get debug artifacts path for an extraction
   */
  getDebugPath(extractionId: string): string {
    return join(this.debugBasePath, extractionId);
  }

  /**
   * Check if debug mode is enabled
   */
  isDebugMode(): boolean {
    return process.env.SCRAPER_DEBUG_MODE === 'true';
  }
}
