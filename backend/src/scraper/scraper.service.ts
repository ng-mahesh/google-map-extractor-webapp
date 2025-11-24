import { Injectable, Logger } from '@nestjs/common';
import { ExtractedPlace } from '../extraction/schemas/extraction.schema';

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  async scrapeGoogleMaps(
    keyword: string,
    options: {
      skipDuplicates?: boolean;
      skipWithoutPhone?: boolean;
      skipWithoutWebsite?: boolean;
      maxResults?: number;
      onLog?: (message: string) => void;
    } = {},
  ): Promise<{
    results: ExtractedPlace[];
    duplicatesSkipped: number;
    withoutPhoneSkipped: number;
    withoutWebsiteSkipped: number;
  }> {
    const {
      skipDuplicates = true,
      skipWithoutPhone = true,
      skipWithoutWebsite = false,
      maxResults = 50,
      onLog = () => {},
    } = options;

    this.logger.log(`Starting scraping for keyword: ${keyword}`);
    onLog(`Starting extraction for: ${keyword}`);

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
      const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(keyword)}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });

      // Wait for results to load
      onLog('Waiting for results to load...');
      await page.waitForSelector('div[role="feed"]', { timeout: 30000 });

      // Scroll to load more results
      onLog('Loading more results...');
      await this.scrollResults(page, maxResults);

      // Extract place data
      onLog(`Extracting data from places (max ${maxResults})...`);
      const places = await this.extractPlaceData(page, maxResults, onLog);

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

  private async scrollResults(page: any, maxResults: number) {
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

  private async extractPlaceData(page: any, maxResults: number, onLog: (message: string) => void = () => {}): Promise<ExtractedPlace[]> {
    const places: ExtractedPlace[] = [];

    // Get all place articles
    const placeElements = await page.$$('div[role="article"]');
    const limit = Math.min(placeElements.length, maxResults);
    onLog(`Found ${placeElements.length} places, extracting ${limit} results...`);

    for (let i = 0; i < limit; i++) {
      try {
        const element = placeElements[i];

        // Extract name from the article card before clicking (as fallback)
        const cardName = await element.evaluate((el: any) => {
          const nameEl = el.querySelector('div.qBF1Pd') ||
                        el.querySelector('div.fontHeadlineSmall') ||
                        el.querySelector('a[aria-label]');
          return nameEl?.textContent?.trim() || nameEl?.getAttribute('aria-label') || '';
        });

        // Click on the place to open details
        await element.click();
        await page.waitForTimeout(2000);

        if ((i + 1) % 5 === 0 || i === limit - 1) {
          onLog(`Extracted ${i + 1}/${limit} places...`);
        }

        // Extract data from the details panel
        const placeData = await page.evaluate((fallbackName: string) => {
          const data: any = {
            category: '',
            name: '',
            address: '',
            phone: '',
            email: '',
            website: '',
            rating: 0,
            reviewsCount: 0,
            reviews: [],
            openingHours: [],
            isOpen: false,
            placeId: '',
          };

          // Name - Try multiple selectors for business name
          let nameEl = document.querySelector('h1.DUwDvf');
          if (!nameEl) nameEl = document.querySelector('div[role="main"] h1');
          if (!nameEl) nameEl = document.querySelector('h1');
          if (nameEl) {
            const nameText = nameEl.textContent?.trim() || '';
            // Filter out common non-business name texts
            if (nameText && !['Results', 'Google Maps', 'Map'].includes(nameText)) {
              data.name = nameText;
            }
          }

          // Use fallback name from card if main extraction failed
          if (!data.name && fallbackName) {
            data.name = fallbackName;
          }

          // Category
          const categoryEl = document.querySelector('button[jsaction*="category"]');
          if (categoryEl) data.category = categoryEl.textContent?.trim() || '';

          // Rating
          const ratingEl = document.querySelector('div[role="img"][aria-label*="stars"]');
          if (ratingEl) {
            const ratingText = ratingEl.getAttribute('aria-label') || '';
            const match = ratingText.match(/(\d+\.?\d*)/);
            if (match) data.rating = parseFloat(match[1]);
          }

          // Review count
          const reviewCountEl = document.querySelector('button[aria-label*="reviews"]');
          if (reviewCountEl) {
            const text = reviewCountEl.textContent || '';
            const match = text.match(/(\d+(?:,\d+)?)/);
            if (match) {
              data.reviewsCount = parseInt(match[1].replace(/,/g, ''));
            }
          }

          // Address
          const addressEl = document.querySelector('button[data-item-id="address"]');
          if (addressEl) {
            const addressDiv = addressEl.querySelector('div[class*="fontBodyMedium"]');
            if (addressDiv) data.address = addressDiv.textContent?.trim() || '';
          }

          // Phone
          const phoneEl = document.querySelector('button[data-item-id*="phone"]');
          if (phoneEl) {
            const phoneDiv = phoneEl.querySelector('div[class*="fontBodyMedium"]');
            if (phoneDiv) data.phone = phoneDiv.textContent?.trim() || '';
          }

          // Website
          const websiteEl = document.querySelector('a[data-item-id="authority"]');
          if (websiteEl) {
            data.website = websiteEl.getAttribute('href') || '';
          }

          // Opening Hours
          const hoursButton = document.querySelector('button[data-item-id="oh"]');
          if (hoursButton) {
            const hoursText = hoursButton.getAttribute('aria-label') || '';
            if (hoursText.includes('Open') || hoursText.includes('Closed')) {
              data.isOpen = hoursText.includes('Open');
            }
            // Try to get detailed hours
            const hoursDiv = hoursButton.querySelector('div[class*="fontBodyMedium"]');
            if (hoursDiv) {
              const hoursContent = hoursDiv.textContent?.trim() || '';
              data.openingHours = [hoursContent];
            }
          }

          // Extract top 5 reviews
          const reviewElements = document.querySelectorAll('div[data-review-id]');
          const reviews: any[] = [];

          for (let i = 0; i < Math.min(5, reviewElements.length); i++) {
            const reviewEl = reviewElements[i];
            const authorEl = reviewEl.querySelector('button[aria-label]');
            const ratingEl = reviewEl.querySelector('span[role="img"]');
            const textEl = reviewEl.querySelector('span[class*="review-text"]') ||
                           reviewEl.querySelector('div[class*="review-full-text"]');
            const dateEl = reviewEl.querySelector('span[class*="review-date"]');

            const review: any = {
              author: authorEl?.getAttribute('aria-label') || 'Anonymous',
              rating: 0,
              text: textEl?.textContent?.trim() || '',
              date: dateEl?.textContent?.trim() || '',
            };

            // Extract rating from aria-label
            if (ratingEl) {
              const ratingText = ratingEl.getAttribute('aria-label') || '';
              const match = ratingText.match(/(\d+)/);
              if (match) review.rating = parseInt(match[1]);
            }

            reviews.push(review);
          }

          data.reviews = reviews;

          // Try to get place ID from URL
          const urlParams = new URLSearchParams(window.location.search);
          const placeId = urlParams.get('place_id');
          if (placeId) data.placeId = placeId;

          return data;
        }, cardName);

        // Try to extract email from website or page
        if (placeData.website) {
          placeData.email = await this.extractEmailFromWebsite(page, placeData.website);
        }

        places.push(placeData);

        this.logger.debug(`Extracted place ${i + 1}/${limit}: ${placeData.name}`);
      } catch (error) {
        this.logger.warn(`Failed to extract place ${i + 1}: ${error.message}`);
      }
    }

    return places;
  }

  private async extractEmailFromWebsite(page: any, website: string): Promise<string> {
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
    };
  }
}
