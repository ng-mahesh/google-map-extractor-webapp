import { Test, TestingModule } from '@nestjs/testing';
import { DebugService } from './debug.service';
import { ConfigService } from '@nestjs/config';
import { Page } from 'puppeteer';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

describe('DebugService', () => {
  let service: DebugService;
  let mockConfigService: Partial<ConfigService>;
  let mockPage: Partial<Page>;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn((key) => {
        if (key === 'SCRAPER_DEBUG_MODE') return 'true';
        if (key === 'SCRAPER_SAVE_SCREENSHOTS') return 'true';
        if (key === 'SCRAPER_SAVE_HTML_DUMPS') return 'true';
        if (key === 'DEBUG_BASE_PATH') return 'debug';
        return null;
      }),
    };

    mockPage = {
      screenshot: jest.fn(),
      content: jest.fn().mockResolvedValue('<html></html>'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DebugService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    service = module.get<DebugService>(DebugService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDebugDirectory', () => {
    it('should create directories if they do not exist', async () => {
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);

      await service.createDebugDirectory('test-id');

      expect(fs.mkdir).toHaveBeenCalledTimes(3); // base, screenshots, html-dumps
    });
  });

  describe('saveScreenshot', () => {
    it('should save screenshot if enabled', async () => {
      await service.saveScreenshot(mockPage as Page, 'test-id', 'test-name');

      expect(mockPage.screenshot).toHaveBeenCalledWith(
        expect.objectContaining({
          path: expect.stringContaining('test-name'),
        }),
      );
    });

    it('should not save screenshot if disabled', async () => {
      // Create a new service instance with screenshots disabled
      const disabledConfigService = {
        get: jest.fn((key) => {
          if (key === 'SCRAPER_DEBUG_MODE') return 'true';
          if (key === 'SCRAPER_SAVE_SCREENSHOTS') return 'false';
          if (key === 'SCRAPER_SAVE_HTML_DUMPS') return 'true';
          if (key === 'DEBUG_BASE_PATH') return 'debug';
          return null;
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [DebugService, { provide: ConfigService, useValue: disabledConfigService }],
      }).compile();

      const disabledService = module.get<DebugService>(DebugService);
      jest.clearAllMocks();

      await disabledService.saveScreenshot(mockPage as Page, 'test-id', 'test-name');

      expect(mockPage.screenshot).not.toHaveBeenCalled();
    });
  });

  describe('saveHtmlDump', () => {
    it('should save HTML dump if enabled', async () => {
      await service.saveHtmlDump(mockPage as Page, 'test-id', 'test-name');

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('test-name'),
        '<html></html>',
        'utf-8',
      );
    });
  });

  describe('saveErrorLog', () => {
    it('should save error log', async () => {
      await service.saveErrorLog('test-id', new Error('Error message'), { operation: 'test' });

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('error-'),
        expect.stringContaining('Error message'),
        'utf-8',
      );
    });
  });
});
