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
    alreadyExistsSkipped: number;
    failedPlaces: number;
  }> {
    const {
      skipDuplicates = true,
      skipWithoutPhone = true,
      skipWithoutWebsite = false,
      skipAlreadyExtracted = false,
      previousPlaces = [],
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

      // Extract and filter with auto-continue logic
      onLog(`Extracting data from places (target: ${maxResults} new places)...`);
      const { filteredResults } = await this.extractAndFilterWithAutoContinue(
        keyword,
        page,
        maxResults,
        {
          skipDuplicates,
          skipWithoutPhone,
          skipWithoutWebsite,
          skipAlreadyExtracted,
          previousPlaces,
        },
        onLog,
        resumeFromCheckpoint,
        saveCheckpoints,
        checkpointInterval,
        onCheckpoint,
        existingCheckpoint,
        extractionId,
      );

      onLog(`Extraction completed! Found ${filteredResults.results.length} new results`);
      this.logger.log(`Scraping completed. Found ${filteredResults.results.length} new results`);

      return filteredResults;
    } catch (error) {
      this.logger.error(`Scraping error: ${error.message}`, error.stack);
      throw new Error(`Failed to scrape Google Maps: ${error.message}`);
    } finally {
      await browser.close();
    }
  }

  /**
   * Extract and filter places with auto-continue logic
   * Continues extraction until target number of NEW places is reached
   */
  private async extractAndFilterWithAutoContinue(
    keyword: string,
    page: Page,
    targetResults: number,
    filterOptions: {
      skipDuplicates?: boolean;
      skipWithoutPhone?: boolean;
      skipWithoutWebsite?: boolean;
      skipAlreadyExtracted?: boolean;
      previousPlaces?: ExtractedPlace[];
    },
    onLog: (message: string) => void = () => {},
    resumeFromCheckpoint: boolean = false,
    saveCheckpoints: boolean = false,
    checkpointInterval: number = 10,
    onCheckpoint?: (data: CheckpointData) => Promise<void>,
    existingCheckpoint?: CheckpointData | null,
    extractionId?: string,
  ): Promise<{
    places: ExtractedPlace[];
    filteredResults: {
      results: ExtractedPlace[];
      duplicatesSkipped: number;
      withoutPhoneSkipped: number;
      withoutWebsiteSkipped: number;
      alreadyExistsSkipped: number;
      failedPlaces: number;
    };
  }> {
    const MAX_EXTRACTION_ATTEMPTS = 200; // Safety limit to prevent infinite loops

    // Build lookup maps for fast duplicate checking during extraction
    const previousPhones = new Set<string>();
    const previousNameAddress = new Set<string>();

    if (filterOptions.skipAlreadyExtracted && filterOptions.previousPlaces) {
      for (const prevPlace of filterOptions.previousPlaces) {
        if (prevPlace.phone) {
          const normalizedPhone = this.normalizePhone(prevPlace.phone);
          if (normalizedPhone) {
            previousPhones.add(normalizedPhone);
          }
        }
        if (prevPlace.name && prevPlace.address) {
          const key = this.createNameAddressKey(prevPlace.name, prevPlace.address);
          previousNameAddress.add(key);
        }
      }
      this.logger.debug(
        `Pre-built lookup maps: ${previousPhones.size} phones, ${previousNameAddress.size} name+address`,
      );
    }

    // Extract all places and filter them
    const allExtractedPlaces = await this.extractPlaceData(
      keyword,
      page,
      MAX_EXTRACTION_ATTEMPTS, // Extract many places
      onLog,
      resumeFromCheckpoint,
      saveCheckpoints,
      checkpointInterval,
      onCheckpoint,
      existingCheckpoint,
      extractionId,
    );

    // Now filter and take only targetResults NEW places
    onLog(
      `Filtering ${allExtractedPlaces.length} extracted places to find ${targetResults} new ones...`,
    );
    const filteredResults = this.filterResults(allExtractedPlaces, filterOptions);

    // Trim to target results if we have more
    if (filteredResults.results.length > targetResults) {
      filteredResults.results = filteredResults.results.slice(0, targetResults);
    }

    onLog(
      `Filtered: ${filteredResults.results.length} new, ` +
        `${filteredResults.alreadyExistsSkipped} already exists, ` +
        `${filteredResults.duplicatesSkipped} duplicates, ` +
        `${filteredResults.withoutPhoneSkipped} without phone, ` +
        `${filteredResults.withoutWebsiteSkipped} without website`,
    );

    return {
      places: allExtractedPlaces,
      filteredResults,
    };
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
    let alreadyExistsSkipped = 0;

    // Initialize from checkpoint if resuming
    if (resumeFromCheckpoint && existingCheckpoint) {
      places.push(...existingCheckpoint.places);
      startIndex = existingCheckpoint.lastProcessedIndex + 1;
      failedPlacesCount = existingCheckpoint.failedPlaces || 0;
      duplicatesSkipped = existingCheckpoint.duplicatesSkipped || 0;
      withoutPhoneSkipped = existingCheckpoint.withoutPhoneSkipped || 0;
      withoutWebsiteSkipped = existingCheckpoint.withoutWebsiteSkipped || 0;
      alreadyExistsSkipped = existingCheckpoint.alreadyExistsSkipped || 0;

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
            alreadyExistsSkipped,
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

    // Extract reviews count - try multiple approaches
    let reviewsCount = 0;
    try {
      // First try: Look for aria-label with "reviews" text
      const reviewsCountStr = await page.evaluate(() => {
        // Try to find span with aria-label containing "reviews"
        const reviewSpans = Array.from(
          document.querySelectorAll('span[role="img"][aria-label*="review"]'),
        );
        for (const span of reviewSpans) {
          const label = span.getAttribute('aria-label');
          if (label && label.includes('review')) {
            // Extract number from "4,903 reviews" or similar
            const match = label.match(/([\d,]+)\s*review/i);
            if (match) {
              return match[1];
            }
          }
        }
        return null;
      });

      if (reviewsCountStr) {
        reviewsCount = parseInt(reviewsCountStr.replace(/,/g, ''));
      }
    } catch (e) {
      this.logger.debug(`Failed to extract reviews count: ${e.message}`);
    }

    // Extract reviews
    const reviewElements = await findElements(page, SELECTORS.REVIEWS, { description: 'reviews' });
    const reviews: Review[] = [];

    for (let j = 0; j < Math.min(5, reviewElements.length); j++) {
      const reviewEl = reviewElements[j];

      // Try to extract author - first try aria-label, then text content
      let author = await extractAttributeFromChild(reviewEl, SELECTORS.REVIEW_AUTHOR, 'aria-label');
      if (!author) {
        author = await extractTextFromChild(reviewEl, SELECTORS.REVIEW_AUTHOR);
      }
      if (!author) {
        author = 'Anonymous';
      }

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

    try {
      const hoursBtn = await findElement(page, SELECTORS.OPENING_HOURS);
      if (hoursBtn) {
        const hoursText = await extractAttributeFromElement(hoursBtn, 'aria-label');
        if (hoursText && (hoursText.includes('Open') || hoursText.includes('Closed'))) {
          isOpen = hoursText.includes('Open');
        }

        // Try to click and get detailed hours
        try {
          await hoursBtn.click();
          await page.waitForTimeout(500);

          // Try to extract hours table
          const hoursTable = await page.evaluate(() => {
            const tables = Array.from(document.querySelectorAll('table'));
            for (const table of tables) {
              const rows = Array.from(table.querySelectorAll('tr'));
              if (rows.length > 0 && rows.length <= 7) {
                return rows
                  .map((row) => {
                    const cells = Array.from(row.querySelectorAll('td'));
                    return cells.map((cell) => cell.textContent?.trim()).join(' ');
                  })
                  .filter((text) => text);
              }
            }
            return [];
          });

          if (hoursTable.length > 0) {
            openingHours = hoursTable;
          }
        } catch (e) {
          // If clicking fails, just get the button text
          const hoursContent = await extractTextFromElement(hoursBtn);
          if (hoursContent) {
            openingHours = [hoursContent];
          }
        }
      }
    } catch (e) {
      // Silently fail if hours are not available
    }

    // Place ID, CID, and KGMID from URL
    const urlData = await page.evaluate(() => {
      const url = window.location.href;

      // Extract Place ID from URL - multiple patterns
      let placeId = '';

      // Try data= parameter pattern: data=!4m...!3m...!1s<PLACE_ID>
      const dataMatch = url.match(/data=[^#]*!3m\d+!1s([A-Za-z0-9_-]+)(?:!|$|&)/);
      if (dataMatch && dataMatch[1].length > 10) {
        placeId = dataMatch[1];
      }

      // Try ftid parameter
      if (!placeId) {
        const ftidMatch = url.match(/ftid=0x[0-9a-f]+:0x[0-9a-f]+/);
        if (ftidMatch) {
          // Convert ftid to format that can be used
          placeId = ftidMatch[0].replace('ftid=', '');
        }
      }

      // Try ludocid parameter (numeric place ID)
      if (!placeId) {
        const ludocidMatch = url.match(/ludocid=(\d+)/);
        if (ludocidMatch) {
          placeId = ludocidMatch[1];
        }
      }

      // Extract CID (Customer ID) from URL - this is the most reliable
      let cid = '';
      const cidMatch = url.match(/0x[0-9a-f]+:0x[0-9a-f]+/);
      if (cidMatch) {
        cid = cidMatch[0];
      }

      // Extract KGMID (Knowledge Graph Machine ID) from URL
      let kgmid = '';
      const kgmidMatch = url.match(/!1s(\/g\/[a-z0-9_]+)/i);
      if (kgmidMatch) {
        kgmid = kgmidMatch[1];
      }

      return { placeId, cid, kgmid, url };
    });

    // Log URL for debugging
    this.logger.debug(`URL: ${urlData.url}`);
    this.logger.debug(
      `Extracted - PlaceID: ${urlData.placeId}, CID: ${urlData.cid}, KGMID: ${urlData.kgmid}`,
    );

    // Extract description
    const description = await extractText(page, SELECTORS.DESCRIPTION, {
      description: 'business description',
    });

    // Extract price range
    const price = await extractText(page, SELECTORS.PRICE, {
      description: 'price range',
    });

    // Extract featured image
    const featuredImage = await extractAttribute(page, SELECTORS.FEATURED_IMAGE, 'src', {
      description: 'featured image',
    });

    // Extract photos (up to 10) - try multiple approaches
    const photos: string[] = [];
    try {
      // Try to find photo button and click it
      const photoButton = await page.$('button[aria-label*="Photo"]');
      if (photoButton) {
        // If there's a photos section, extract image URLs
        const photoUrls = await page.evaluate(() => {
          const imgs = Array.from(document.querySelectorAll('img[src*="googleusercontent"]'));
          return imgs
            .map((img) => (img as HTMLImageElement).src)
            .filter((src) => src && src.includes('googleusercontent'))
            .slice(0, 10);
        });
        photos.push(...photoUrls);
      }
    } catch (e) {
      // Silently fail if photos are not available
      this.logger.debug(`Failed to extract photos: ${e.message}`);
    }

    // Extract review URL by clicking Reviews tab
    let reviewUrl = '';
    try {
      // Try to find and click the Reviews tab
      const reviewsTabButton = await page.evaluate(() => {
        // Find the "Reviews" text element
        const reviewsTextDivs = Array.from(document.querySelectorAll('div.Gpq6kf.NlVald'));
        for (const div of reviewsTextDivs) {
          if (div.textContent?.trim() === 'Reviews') {
            // Find the parent button
            const button = div.closest('button');
            return button !== null;
          }
        }
        return false;
      });

      if (reviewsTabButton) {
        // Click the Reviews tab
        await page.evaluate(() => {
          const reviewsTextDivs = Array.from(document.querySelectorAll('div.Gpq6kf.NlVald'));
          for (const div of reviewsTextDivs) {
            if (div.textContent?.trim() === 'Reviews') {
              const button = div.closest('button') as HTMLButtonElement;
              if (button) {
                button.click();
                return;
              }
            }
          }
        });

        await page.waitForTimeout(1000);

        // Get the URL after clicking Reviews tab
        reviewUrl = await page.evaluate(() => window.location.href);

        this.logger.debug(`Extracted reviews URL: ${reviewUrl}`);
      } else {
        // Fallback: construct URL from place ID
        reviewUrl = urlData.placeId
          ? `https://search.google.com/local/writereview?placeid=${urlData.placeId}`
          : '';
      }
    } catch (e) {
      this.logger.debug(`Failed to extract review URL: ${e.message}`);
      // Fallback: construct URL from place ID
      reviewUrl = urlData.placeId
        ? `https://search.google.com/local/writereview?placeid=${urlData.placeId}`
        : '';
    }

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
      placeId: urlData.placeId,
      isOpen,
      description,
      reviewUrl,
      photos,
      price,
      featuredImage,
      cid: urlData.cid,
      kgmid: urlData.kgmid,
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
      skipAlreadyExtracted?: boolean;
      previousPlaces?: ExtractedPlace[];
    },
  ): {
    results: ExtractedPlace[];
    duplicatesSkipped: number;
    withoutPhoneSkipped: number;
    withoutWebsiteSkipped: number;
    alreadyExistsSkipped: number;
    failedPlaces: number;
  } {
    let duplicatesSkipped = 0;
    let withoutPhoneSkipped = 0;
    let withoutWebsiteSkipped = 0;
    let alreadyExistsSkipped = 0;
    const seenNames = new Set<string>();
    const results: ExtractedPlace[] = [];

    // Build lookup maps from previous places if skipAlreadyExtracted is enabled
    const previousPhones = new Set<string>();
    const previousNameAddress = new Set<string>();

    if (options.skipAlreadyExtracted && options.previousPlaces) {
      for (const prevPlace of options.previousPlaces) {
        // Index by phone (most reliable)
        if (prevPlace.phone) {
          const normalizedPhone = this.normalizePhone(prevPlace.phone);
          if (normalizedPhone) {
            previousPhones.add(normalizedPhone);
          }
        }

        // Index by name + address combination
        if (prevPlace.name && prevPlace.address) {
          const key = this.createNameAddressKey(prevPlace.name, prevPlace.address);
          previousNameAddress.add(key);
        }
      }

      this.logger.debug(
        `Built lookup maps: ${previousPhones.size} phones, ${previousNameAddress.size} name+address combinations`,
      );
    }

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

      // Check if place already exists in previous extractions (priority: phone > name+address)
      if (options.skipAlreadyExtracted) {
        let alreadyExists = false;

        // Priority 1: Check by phone number
        if (place.phone) {
          const normalizedPhone = this.normalizePhone(place.phone);
          if (normalizedPhone && previousPhones.has(normalizedPhone)) {
            alreadyExistsSkipped++;
            alreadyExists = true;
          }
        }

        // Priority 2: Check by name + address (only if not already matched by phone)
        if (!alreadyExists && place.name && place.address) {
          const key = this.createNameAddressKey(place.name, place.address);
          if (previousNameAddress.has(key)) {
            alreadyExistsSkipped++;
            alreadyExists = true;
          }
        }

        if (alreadyExists) {
          continue;
        }
      }

      // Skip duplicates within current extraction based on name
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
      alreadyExistsSkipped,
      failedPlaces: 0,
    };
  }

  /**
   * Normalize phone number for comparison
   * Removes all non-digit characters
   */
  private normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  /**
   * Create a normalized key from name and address for duplicate detection
   */
  private createNameAddressKey(name: string, address: string): string {
    const normalizedName = name.toLowerCase().trim();
    const normalizedAddress = address.toLowerCase().trim().replace(/\s+/g, ' ');
    return `${normalizedName}::${normalizedAddress}`;
  }
}
