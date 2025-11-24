import { Controller, Post, Get, Delete, Body, Param, UseGuards, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ExtractionService } from './extraction.service';
import { StartExtractionDto } from './dto/start-extraction.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';

@Controller('extraction')
@UseGuards(JwtAuthGuard)
export class ExtractionController {
  constructor(
    private extractionService: ExtractionService,
    private usersService: UsersService,
  ) {}

  @Post('start')
  async startExtraction(@CurrentUser() user: any, @Body() dto: StartExtractionDto) {
    const extraction = await this.extractionService.startExtraction(user.userId, dto);
    return {
      id: extraction._id,
      keyword: extraction.keyword,
      status: extraction.status,
      message: 'Extraction started. Check status using the extraction ID.',
    };
  }

  @Get('history')
  async getHistory(@CurrentUser() user: any, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 20;
    return this.extractionService.getExtractionHistory(user.userId, limitNum);
  }

  @Get('quota')
  async getQuota(@CurrentUser() user: any) {
    const remainingQuota = await this.usersService.getRemainingQuota(user.userId);
    const userDetails = await this.usersService.findById(user.userId);

    return {
      dailyQuota: userDetails.dailyQuota,
      usedToday: userDetails.usedQuotaToday,
      remaining: remainingQuota,
      resetDate: userDetails.quotaResetDate,
    };
  }

  @Get(':id')
  async getExtraction(@CurrentUser() user: any, @Param('id') id: string) {
    return this.extractionService.getExtraction(id, user.userId);
  }

  @Get(':id/export')
  async exportToCSV(@CurrentUser() user: any, @Param('id') id: string, @Res() res: Response) {
    const csv = await this.extractionService.exportToCSV(id, user.userId);
    const extraction = await this.extractionService.getExtraction(id, user.userId);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="google-maps-${extraction.keyword.replace(/\s+/g, '-')}-${Date.now()}.csv"`,
    );
    res.send(csv);
  }

  @Post(':id/cancel')
  async cancelExtraction(@CurrentUser() user: any, @Param('id') id: string) {
    await this.extractionService.cancelExtraction(id, user.userId);
    return { message: 'Extraction cancelled successfully' };
  }

  @Delete(':id')
  async deleteExtraction(@CurrentUser() user: any, @Param('id') id: string) {
    await this.extractionService.deleteExtraction(id, user.userId);
    return { message: 'Extraction deleted successfully' };
  }
}
