import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Extraction, ExtractionDocument } from './schemas/extraction.schema';
import { ScraperService } from '../scraper/scraper.service';
import { UsersService } from '../users/users.service';
import { StartExtractionDto } from './dto/start-extraction.dto';
import { Parser } from 'json2csv';

@Injectable()
export class ExtractionService {
  private readonly logger = new Logger(ExtractionService.name);

  constructor(
    @InjectModel(Extraction.name) private extractionModel: Model<ExtractionDocument>,
    private scraperService: ScraperService,
    private usersService: UsersService,
  ) {}

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
      // Create log callback
      const addLog = async (message: string) => {
        await this.extractionModel.findByIdAndUpdate(extractionId, {
          $push: { logs: `${new Date().toISOString()}: ${message}` },
        });
      };

      const { results, duplicatesSkipped, withoutPhoneSkipped, withoutWebsiteSkipped } =
        await this.scraperService.scrapeGoogleMaps(dto.keyword, {
          skipDuplicates: dto.skipDuplicates,
          skipWithoutPhone: dto.skipWithoutPhone,
          skipWithoutWebsite: dto.skipWithoutWebsite,
          maxResults: dto.maxResults,
          onLog: addLog,
        });

      await this.extractionModel.findByIdAndUpdate(extractionId, {
        status: 'completed',
        results,
        totalResults: results.length,
        duplicatesSkipped,
        withoutPhoneSkipped,
        withoutWebsiteSkipped: withoutWebsiteSkipped || 0,
        completedAt: new Date(),
      });

      this.logger.log(`Extraction ${extractionId} completed successfully`);
    } catch (error) {
      await this.extractionModel.findByIdAndUpdate(extractionId, {
        status: 'failed',
        errorMessage: error.message,
        completedAt: new Date(),
        $push: { logs: `${new Date().toISOString()}: ERROR - ${error.message}` },
      });

      this.logger.error(`Extraction ${extractionId} failed: ${error.message}`);
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
    const extraction = await this.extractionModel.findOne({
      _id: extractionId,
      userId,
    }).exec();

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
  }
}
