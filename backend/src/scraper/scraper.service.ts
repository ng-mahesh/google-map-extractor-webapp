import { Injectable, Logger } from '@nestjs/common';
import { ExtractedPlace, Review } from '../extraction/schemas/extraction.schema';
import { ExtractionOptions, CheckpointData } from './interfaces/checkpoint.interface';
import { DebugService } from './debug/debug.service';
import { SELECTORS } from './config/selectors.config';
import {
  findElement,
  findElements,
  extractText,
  extractAttribute,
  extractTextFromChild,
  extractAttributeFromChild,
  extractTextFromElement,
  extractAttributeFromElement,
} from './helpers/selector.helper';
import { retryWithBackoff } from './helpers/retry.helper';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { Page, ElementHandle } from 'puppeteer';

puppeteer.use(StealthPlugin());

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(private readonly debugService: DebugService) {}

  async scrapeGoogleMaps(
    keyword: string,
    options: ExtractionOptions = {},
  ): Promise<{
    results: ExtractedPlace[];
    duplicatesSkipped: number;
    withoutPhoneSkipped: number;
    withoutWebsiteSkipped: number;
    failedPlaces: number;
  }> {
    const {
      skipDuplicates = true,
      skipWithoutPhone = true,
      skipWithoutWebsite = false,
      maxResults = 50,
      onLog = () => {},
      resumeFromCheckpoint = false,
      saveCheckpoints = false,
      checkpointInterval = 10,
      onCheckpoint,
      existingCheckpoint,
      extractionId,
    } = options;

    this.logger.log(`Starting scraping for keyword: ${keyword}`);
    onLog(`Starting extraction for: ${keyword}`);

    // Initialize debug directory if needed
    if (extractionId && this.debugService.isDebugMode()) {
      await this.debugService.createDebugDirectory(extractionId);
    }

    const browser = await puppeteer.launch({
      headless: process.env.HEADLESS_BROWSER !== 'false',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    });

    try {
      onLog('Launching browser...');
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });

      // Navigate to Google Maps
      onLog('Navigating to Google Maps...');
      await retryWithBackoff(
        async () => {
          await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(keyword)}`, {
            waitUntil: 'networkidle2',
            timeout: 60000,
          });
        },
        { maxAttempts: 3 },
      );

      // Handle cookie consent if present
      try {
        const consentButton = await page.$('button[aria-label="Accept all"]');
        if (consentButton) {
          onLog('Accepting cookies...');
          await consentButton.click();
          await page.waitForNavigation({ waitUntil: 'networkidle0' });
        }
      } catch (e) {
        // Ignore consent errors
      }

      // Wait for results to load
      onLog('Waiting for results to load...');
      const feedSelector = 'div[role="feed"]';
      await retryWithBackoff(
        async () => {
          await page.waitForSelector(feedSelector, { timeout: 30000 });
        },
        { maxAttempts: 3 },
      );

      // Scroll to load more results
      onLog('Loading more results...');
      await this.scrollResults(page, maxResults);

      // Extract place data
      onLog(`Extracting data from places (max ${maxResults})...`);
      const places = await this.extractPlaceData(
        keyword,
        page,
        maxResults,
        onLog,
        resumeFromCheckpoint,
        saveCheckpoints,
        checkpointInterval,
        onCheckpoint,
        existingCheckpoint,
        extractionId,
      );

      // Filter results
      onLog('Filtering results...');
      const filteredResults = this.filterResults(places, {
        skipDuplicates,
        skipWithoutPhone,
        skipWithoutWebsite,
      });

      onLog(`Extraction completed! Found ${filteredResults.results.length} results`);
      this.logger.log(`Scraping completed. Found ${filteredResults.results.length} results`);

      return filteredResults;
    } catch (error) {
      this.logger.error(`Scraping error: ${error.message}`, error.stack);
      throw new Error(`Failed to scrape Google Maps: ${error.message}`);
    } finally {
      await browser.close();
    }
  }

  private async scrollResults(page: Page, maxResults: number) {
    const feedSelector = 'div[role="feed"]';
    let previousHeight = 0;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const currentHeight = await page.evaluate((selector: string) => {
        const feed = document.querySelector(selector);
        return feed ? feed.scrollHeight : 0;
      }, feedSelector);

      if (currentHeight === previousHeight) {
        attempts++;
      } else {
        attempts = 0;
      }

      await page.evaluate((selector: string) => {
        const feed = document.querySelector(selector);
        if (feed) {
          feed.scrollTo(0, feed.scrollHeight);
        }
      }, feedSelector);

      await page.waitForTimeout(2000);

      const resultCount = await page.evaluate(() => {
        return document.querySelectorAll('div[role="article"]').length;
      });

      if (resultCount >= maxResults) {
        break;
      }

      previousHeight = currentHeight;
    }
  }

  private async extractPlaceData(
    keyword: string,
    page: Page,
    maxResults: number,
    onLog: (message: string) => void = () => {},
    resumeFromCheckpoint: boolean = false,
    saveCheckpoints: boolean = false,
    checkpointInterval: number = 10,
    onCheckpoint?: (data: CheckpointData) => Promise<void>,
    existingCheckpoint?: CheckpointData | null,
    extractionId?: string,
  ): Promise<ExtractedPlace[]> {
    const places: ExtractedPlace[] = [];
    let startIndex = 0;
    let failedPlacesCount = 0;
    let duplicatesSkipped = 0;
    let withoutPhoneSkipped = 0;
    let withoutWebsiteSkipped = 0;

    // Initialize from checkpoint if resuming
    if (resumeFromCheckpoint && existingCheckpoint) {
      places.push(...existingCheckpoint.places);
      startIndex = existingCheckpoint.lastProcessedIndex + 1;
      failedPlacesCount = existingCheckpoint.failedPlaces || 0;
      duplicatesSkipped = existingCheckpoint.duplicatesSkipped || 0;
      withoutPhoneSkipped = existingCheckpoint.withoutPhoneSkipped || 0;
      withoutWebsiteSkipped = existingCheckpoint.withoutWebsiteSkipped || 0;

      onLog(`Resuming extraction from index ${startIndex} (already have ${places.length} places)`);
    }

    // Get all place articles
    const placeElements = await page.$$('div[role="article"]');
    const limit = Math.min(placeElements.length, maxResults);
    onLog(`Found ${placeElements.length} places, extracting ${limit} results...`);

    for (let i = startIndex; i < limit; i++) {
      try {
        const element = placeElements[i];

        const placeData = await this.extractSinglePlace(page, element, i, limit, onLog);

        places.push(placeData);

        // Save checkpoint if enabled and interval met
        if (saveCheckpoints && onCheckpoint && extractionId && (i + 1) % checkpointInterval === 0) {
          await onCheckpoint({
            extractionId,
            keyword,
            lastProcessedIndex: i,
            totalProcessed: i + 1,
            places: [...places],
            failedPlaces: failedPlacesCount,
            duplicatesSkipped,
            withoutPhoneSkipped,
            withoutWebsiteSkipped,
            timestamp: new Date(),
          });
          onLog(`Checkpoint saved at index ${i + 1}`);
        }

        this.logger.debug(`Extracted place ${i + 1}/${limit}: ${placeData.name}`);
      } catch (error) {
        failedPlacesCount++;
        this.logger.warn(`Failed to extract place ${i + 1}: ${error.message}`);

        // Save debug artifact
        if (this.debugService.isDebugMode() && extractionId) {
          await this.debugService.saveScreenshot(page, extractionId, `failed_place_${i + 1}`);
          await this.debugService.saveHtmlDump(page, extractionId, `failed_place_${i + 1}`);
        }
      }
    }

    return places;
  }

  private async extractSinglePlace(
    page: Page,
    element: ElementHandle,
    index: number,
    limit: number,
    onLog: (message: string) => void,
  ): Promise<ExtractedPlace> {
    // Extract name from the article card before clicking (as fallback)
    let cardName = await extractTextFromChild(element, SELECTORS.CARD_NAME, {
      description: 'business name (card)',
    });

    if (!cardName) {
      cardName = await extractAttributeFromChild(element, SELECTORS.CARD_NAME, 'aria-label', {
        description: 'business name aria-label (card)',
      });
    }

    // Click on the place to open details with retry
    await retryWithBackoff(
      async () => {
        await element.click();
      },
      { maxAttempts: 3, initialDelay: 1000 },
    );

    await page.waitForTimeout(2000);

    if ((index + 1) % 5 === 0 || index === limit - 1) {
      onLog(`Extracted ${index + 1}/${limit} places...`);
    }

    // Extract data using robust selectors
    const name = await extractText(page, SELECTORS.BUSINESS_NAME, {
      defaultValue: cardName,
      description: 'business name',
    });

    const category = await extractText(page, SELECTORS.CATEGORY, { description: 'category' });

    // Address: try attribute first, then text
    let address = await extractAttribute(page, SELECTORS.ADDRESS, 'aria-label', {
      description: 'address attribute',
    });
    if (!address) {
      address = await extractText(page, SELECTORS.ADDRESS, { description: 'address text' });
    }

    // Phone: try attribute first, then text
    let phone = await extractAttribute(page, SELECTORS.PHONE, 'aria-label', {
      description: 'phone attribute',
    });
    if (!phone) {
      phone = await extractText(page, SELECTORS.PHONE, { description: 'phone text' });
    }

    const website = await extractAttribute(page, SELECTORS.WEBSITE, 'href', {
      description: 'website',
    });

    const ratingStr = await extractAttribute(page, SELECTORS.RATING, 'aria-label', {
      description: 'rating',
    });
    const rating = ratingStr ? parseFloat(ratingStr) : 0;

    const reviewsCountStr = await extractAttribute(page, SELECTORS.REVIEWS_COUNT, 'aria-label', {
      description: 'reviews count',
    });
    const reviewsCount = reviewsCountStr ? parseInt(reviewsCountStr.replace(/\D/g, '')) : 0;

    // Extract reviews
    const reviewElements = await findElements(page, SELECTORS.REVIEWS, { description: 'reviews' });
    const reviews: Review[] = [];

    for (let j = 0; j < Math.min(5, reviewElements.length); j++) {
      const reviewEl = reviewElements[j];
      const author = await extractAttributeFromChild(
        reviewEl,
        SELECTORS.REVIEW_AUTHOR,
        'aria-label',
        { defaultValue: 'Anonymous' },
      );

      const ratingStr = await extractAttributeFromChild(
        reviewEl,
        SELECTORS.REVIEW_RATING,
        'aria-label',
      );
      const rating = ratingStr ? parseInt(ratingStr.match(/(\d+)/)?.[1] || '0') : 0;

      const text = await extractTextFromChild(reviewEl, SELECTORS.REVIEW_TEXT);
      const date = await extractTextFromChild(reviewEl, SELECTORS.REVIEW_DATE);

      reviews.push({ author, rating, text, date });
    }

    // Opening hours
    let isOpen = false;
    let openingHours: string[] = [];
    const hoursBtn = await findElement(page, SELECTORS.OPENING_HOURS);

    if (hoursBtn) {
      const hoursText = await extractAttributeFromElement(hoursBtn, 'aria-label');
      if (hoursText.includes('Open') || hoursText.includes('Closed')) {
        isOpen = hoursText.includes('Open');
      }

      // Try to get detailed hours from text content
      const hoursContent = await extractTextFromElement(hoursBtn);
      if (hoursContent) {
        openingHours = [hoursContent];
      }
    }

    // Place ID from URL
    const placeId = await page.evaluate(() => {
      return new URLSearchParams(window.location.search).get('place_id') || '';
    });

    const placeData: ExtractedPlace = {
      category,
      name,
      address,
      phone,
      email: '',
      website,
      rating,
      reviewsCount,
      reviews,
      openingHours,
      placeId,
      isOpen,
    };

    // Try to extract email from website or page
    if (placeData.website) {
      placeData.email = await this.extractEmailFromWebsite();
    }

    return placeData;
  }

  private async extractEmailFromWebsite(): Promise<string> {
    // Simple email extraction - in production, you might want to visit the website
    // For now, we'll just return empty string
    // This would require opening the website in a new tab and searching for email
    return '';
  }

  private filterResults(
    places: ExtractedPlace[],
    options: {
      skipDuplicates?: boolean;
      skipWithoutPhone?: boolean;
      skipWithoutWebsite?: boolean;
    },
  ): {
    results: ExtractedPlace[];
    duplicatesSkipped: number;
    withoutPhoneSkipped: number;
    withoutWebsiteSkipped: number;
    failedPlaces: number;
  } {
    let duplicatesSkipped = 0;
    let withoutPhoneSkipped = 0;
    let withoutWebsiteSkipped = 0;
    const seenNames = new Set<string>();
    const results: ExtractedPlace[] = [];

    for (const place of places) {
      // Skip if no phone and option is enabled
      if (options.skipWithoutPhone && !place.phone) {
        withoutPhoneSkipped++;
        continue;
      }

      // Skip if no website and option is enabled
      if (options.skipWithoutWebsite && !place.website) {
        withoutWebsiteSkipped++;
        continue;
      }

      // Skip duplicates based on name
      if (options.skipDuplicates) {
        const normalizedName = place.name.toLowerCase().trim();
        if (seenNames.has(normalizedName)) {
          duplicatesSkipped++;
          continue;
        }
        seenNames.add(normalizedName);
      }

      results.push(place);
    }

    return {
      results,
      duplicatesSkipped,
      withoutPhoneSkipped,
      withoutWebsiteSkipped,
      failedPlaces: 0, // Will be implemented in Phase 4
    };
  }
}
