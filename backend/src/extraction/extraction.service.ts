import { Injectable, BadRequestException, Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Extraction, ExtractionDocument } from './schemas/extraction.schema';
import { ScraperService } from '../scraper/scraper.service';
import { UsersService } from '../users/users.service';
import { StartExtractionDto } from './dto/start-extraction.dto';
import { Parser } from 'json2csv';
import { promises as fs } from 'fs';
import { join } from 'path';
import { CheckpointData } from '../scraper/interfaces/checkpoint.interface';
import { PerformanceMonitor } from '../common/logging/performance.monitor';
import { ExtractionGateway } from './extraction.gateway';

@Injectable()
export class ExtractionService {
  private readonly logger = new Logger(ExtractionService.name);
  private readonly checkpointDir: string;
  private readonly checkpointsEnabled: boolean;

  constructor(
    @InjectModel(Extraction.name) private extractionModel: Model<ExtractionDocument>,
    private scraperService: ScraperService,
    private usersService: UsersService,
    @Inject(PerformanceMonitor) private performanceMonitor: PerformanceMonitor,
    private extractionGateway: ExtractionGateway,
  ) {
    this.checkpointDir = join(process.cwd(), 'checkpoints');
    this.checkpointsEnabled = process.env.SCRAPER_ENABLE_CHECKPOINTS !== 'false';

    // Ensure checkpoint directory exists
    if (this.checkpointsEnabled) {
      fs.mkdir(this.checkpointDir, { recursive: true }).catch((error) => {
        this.logger.warn(`Failed to create checkpoint directory: ${error.message}`);
      });
    }
  }

  async startExtraction(userId: string, dto: StartExtractionDto): Promise<ExtractionDocument> {
    // Check quota
    const hasQuota = await this.usersService.hasQuotaRemaining(userId);
    if (!hasQuota) {
      throw new BadRequestException('Daily extraction quota exceeded');
    }

    // Create extraction record
    const extraction = new this.extractionModel({
      userId,
      keyword: dto.keyword,
      status: 'processing',
      skipDuplicates: dto.skipDuplicates,
      skipWithoutPhone: dto.skipWithoutPhone,
      startedAt: new Date(),
    });

    await extraction.save();

    // Start scraping in background (in production, use a job queue)
    this.performExtraction(extraction._id.toString(), dto).catch((error) => {
      this.logger.error(`Extraction ${extraction._id} failed: ${error.message}`);
    });

    // Update user quota
    await this.usersService.updateQuota(userId);

    return extraction;
  }

  private async performExtraction(extractionId: string, dto: StartExtractionDto) {
    try {
      // Check for existing checkpoint
      const existingCheckpoint = await this.loadCheckpoint(extractionId);

      if (existingCheckpoint) {
        this.logger.log(
          `Resuming extraction ${extractionId} from checkpoint at index ${existingCheckpoint.lastProcessedIndex}`,
        );
      }

      // Emit initial progress
      this.extractionGateway.emitProgress(extractionId, {
        status: 'processing',
        percentage: 0,
        message: 'Starting extraction...',
      });

      // Create log callback
      const addLog = async (message: string) => {
        await this.extractionModel.findByIdAndUpdate(extractionId, {
          $push: { logs: `${new Date().toISOString()}: ${message}` },
        });

        // Emit progress update via WebSocket
        this.extractionGateway.emitProgress(extractionId, {
          status: 'processing',
          message,
        });
      };

      // Create checkpoint callback
      const saveCheckpointCallback = async (checkpointData: CheckpointData) => {
        await this.saveCheckpoint(checkpointData);

        // Emit progress update via WebSocket
        const percentage = Math.round((checkpointData.lastProcessedIndex / dto.maxResults) * 100);
        this.extractionGateway.emitProgress(extractionId, {
          status: 'processing',
          currentIndex: checkpointData.lastProcessedIndex,
          totalResults: dto.maxResults,
          percentage,
          message: `Processed ${checkpointData.lastProcessedIndex} of ${dto.maxResults} results`,
        });
      };

      // Measure scraping performance
      const {
        results,
        duplicatesSkipped,
        withoutPhoneSkipped,
        withoutWebsiteSkipped,
        failedPlaces,
      } = await this.performanceMonitor.measureAsync(
        `extraction-${extractionId}`,
        async () =>
          await this.scraperService.scrapeGoogleMaps(dto.keyword, {
            skipDuplicates: dto.skipDuplicates,
            skipWithoutPhone: dto.skipWithoutPhone,
            skipWithoutWebsite: dto.skipWithoutWebsite,
            maxResults: dto.maxResults,
            onLog: addLog,
            resumeFromCheckpoint: !!existingCheckpoint,
            saveCheckpoints: this.checkpointsEnabled,
            checkpointInterval: parseInt(process.env.SCRAPER_CHECKPOINT_INTERVAL || '10', 10),
            onCheckpoint: saveCheckpointCallback,
            existingCheckpoint,
            extractionId,
          }),
      );

      await this.extractionModel.findByIdAndUpdate(extractionId, {
        status: 'completed',
        results,
        totalResults: results.length,
        duplicatesSkipped,
        withoutPhoneSkipped,
        withoutWebsiteSkipped: withoutWebsiteSkipped || 0,
        failedPlaces: failedPlaces || 0,
        completedAt: new Date(),
      });

      // Delete checkpoint on successful completion
      await this.deleteCheckpoint(extractionId);

      // Emit completion via WebSocket
      this.extractionGateway.emitComplete(extractionId, {
        status: 'completed',
        totalResults: results.length,
      });

      this.logger.log(`Extraction ${extractionId} completed successfully`);
    } catch (error) {
      await this.extractionModel.findByIdAndUpdate(extractionId, {
        status: 'failed',
        errorMessage: error.message,
        completedAt: new Date(),
        $push: { logs: `${new Date().toISOString()}: ERROR - ${error.message}` },
      });

      // Emit error via WebSocket
      this.extractionGateway.emitError(extractionId, {
        message: error.message,
      });

      this.logger.error(`Extraction ${extractionId} failed: ${error.message}`);

      // Keep checkpoint on failure for potential resume
    }
  }

  async cancelExtraction(extractionId: string, userId: string): Promise<void> {
    const extraction = await this.extractionModel.findOne({
      _id: extractionId,
      userId,
    });

    if (!extraction) {
      throw new BadRequestException('Extraction not found');
    }

    if (extraction.status === 'completed' || extraction.status === 'failed') {
      throw new BadRequestException('Extraction already completed');
    }

    await this.extractionModel.findByIdAndUpdate(extractionId, {
      status: 'cancelled',
      completedAt: new Date(),
      $push: { logs: `${new Date().toISOString()}: Extraction cancelled by user` },
    });
  }

  async getExtractionHistory(userId: string, limit: number = 20): Promise<ExtractionDocument[]> {
    return this.extractionModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-results') // Exclude large results array from list
      .exec();
  }

  async getExtraction(extractionId: string, userId: string): Promise<ExtractionDocument> {
    const extraction = await this.extractionModel
      .findOne({
        _id: extractionId,
        userId,
      })
      .exec();

    if (!extraction) {
      throw new BadRequestException('Extraction not found');
    }

    return extraction;
  }

  async exportToCSV(extractionId: string, userId: string): Promise<string> {
    const extraction = await this.getExtraction(extractionId, userId);

    if (extraction.status !== 'completed') {
      throw new BadRequestException('Extraction is not completed yet');
    }

    if (!extraction.results || extraction.results.length === 0) {
      throw new BadRequestException('No results to export');
    }

    // Define CSV fields
    const fields = [
      { label: 'Category', value: 'category' },
      { label: 'Name', value: 'name' },
      { label: 'Address', value: 'address' },
      { label: 'Phone', value: 'phone' },
      { label: 'Email', value: 'email' },
      { label: 'Website', value: 'website' },
      { label: 'Rating', value: 'rating' },
      { label: 'Reviews Count', value: 'reviewsCount' },
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(extraction.results);

    return csv;
  }

  async deleteExtraction(extractionId: string, userId: string): Promise<void> {
    const result = await this.extractionModel.deleteOne({
      _id: extractionId,
      userId,
    });

    if (result.deletedCount === 0) {
      throw new BadRequestException('Extraction not found');
    }

    // Also delete checkpoint if it exists
    await this.deleteCheckpoint(extractionId);
  }

  /**
   * Save checkpoint data to file
   */
  async saveCheckpoint(checkpointData: CheckpointData): Promise<void> {
    if (!this.checkpointsEnabled) {
      return;
    }

    try {
      const checkpointPath = join(this.checkpointDir, `${checkpointData.extractionId}.json`);
      await fs.writeFile(checkpointPath, JSON.stringify(checkpointData, null, 2), 'utf-8');

      // Update extraction record with checkpoint info
      await this.extractionModel.findByIdAndUpdate(checkpointData.extractionId, {
        checkpointSavedAt: new Date(),
        lastCheckpointIndex: checkpointData.lastProcessedIndex,
      });

      this.logger.debug(
        `Checkpoint saved for extraction ${checkpointData.extractionId} at index ${checkpointData.lastProcessedIndex}`,
      );
    } catch (error) {
      this.logger.warn(`Failed to save checkpoint: ${error.message}`);
    }
  }

  /**
   * Load checkpoint data from file
   */
  async loadCheckpoint(extractionId: string): Promise<CheckpointData | null> {
    if (!this.checkpointsEnabled) {
      return null;
    }

    try {
      const checkpointPath = join(this.checkpointDir, `${extractionId}.json`);
      const data = await fs.readFile(checkpointPath, 'utf-8');
      const checkpoint: CheckpointData = JSON.parse(data);

      this.logger.log(
        `Loaded checkpoint for extraction ${extractionId} from index ${checkpoint.lastProcessedIndex}`,
      );

      return checkpoint;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.logger.warn(`Failed to load checkpoint: ${error.message}`);
      }
      return null;
    }
  }

  /**
   * Delete checkpoint file
   */
  async deleteCheckpoint(extractionId: string): Promise<void> {
    if (!this.checkpointsEnabled) {
      return;
    }

    try {
      const checkpointPath = join(this.checkpointDir, `${extractionId}.json`);
      await fs.unlink(checkpointPath);
      this.logger.debug(`Deleted checkpoint for extraction ${extractionId}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.logger.warn(`Failed to delete checkpoint: ${error.message}`);
      }
    }
  }

  /**
   * Check if checkpoint exists for an extraction
   */
  async hasCheckpoint(extractionId: string): Promise<boolean> {
    if (!this.checkpointsEnabled) {
      return false;
    }

    try {
      const checkpointPath = join(this.checkpointDir, `${extractionId}.json`);
      await fs.access(checkpointPath);
      return true;
    } catch {
      return false;
    }
  }
}
