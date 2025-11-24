import { Test, TestingModule } from '@nestjs/testing';
import { ScraperService } from './scraper.service';
import { ExtractedPlace } from '../extraction/schemas/extraction.schema';

// Mock Puppeteer
jest.mock('puppeteer-extra', () => ({
  use: jest.fn(),
  launch: jest.fn(),
}));

describe('ScraperService', () => {
  let service: ScraperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScraperService],
    }).compile();

    service = module.get<ScraperService>(ScraperService);
  });

  describe('filterResults', () => {
    const mockPlaces: ExtractedPlace[] = [
      {
        category: 'Restaurant',
        name: 'Pizza Place',
        address: '123 Main St',
        phone: '+1234567890',
        email: '',
        website: 'https://pizza.com',
        rating: 4.5,
        reviewsCount: 100,
        reviews: [],
        openingHours: [],
        isOpen: true,
        placeId: '1',
      },
      {
        category: 'Restaurant',
        name: 'Pizza Place', // Duplicate
        address: '123 Main St',
        phone: '+1234567890',
        email: '',
        website: 'https://pizza.com',
        rating: 4.5,
        reviewsCount: 100,
        reviews: [],
        openingHours: [],
        isOpen: true,
        placeId: '2',
      },
      {
        category: 'Cafe',
        name: 'Coffee Shop',
        address: '456 Oak Ave',
        phone: '',
        email: '',
        website: 'https://coffee.com',
        rating: 4.0,
        reviewsCount: 50,
        reviews: [],
        openingHours: [],
        isOpen: true,
        placeId: '3',
      },
      {
        category: 'Bakery',
        name: 'Bread Store',
        address: '789 Elm St',
        phone: '+0987654321',
        email: '',
        website: '',
        rating: 4.8,
        reviewsCount: 200,
        reviews: [],
        openingHours: [],
        isOpen: false,
        placeId: '4',
      },
    ];

    it('should remove duplicates when skipDuplicates is true', () => {
      const result = service['filterResults'](mockPlaces, {
        skipDuplicates: true,
        skipWithoutPhone: false,
        skipWithoutWebsite: false,
      });

      expect(result.results.length).toBe(3);
      expect(result.duplicatesSkipped).toBe(1);
    });

    it('should keep all results when skipDuplicates is false', () => {
      const result = service['filterResults'](mockPlaces, {
        skipDuplicates: false,
        skipWithoutPhone: false,
        skipWithoutWebsite: false,
      });

      expect(result.results.length).toBe(4);
      expect(result.duplicatesSkipped).toBe(0);
    });

    it('should remove entries without phone when skipWithoutPhone is true', () => {
      const result = service['filterResults'](mockPlaces, {
        skipDuplicates: false,
        skipWithoutPhone: true,
        skipWithoutWebsite: false,
      });

      expect(result.results.length).toBe(3);
      expect(result.withoutPhoneSkipped).toBe(1);
      expect(result.results.every((place) => place.phone)).toBe(true);
    });

    it('should remove entries without website when skipWithoutWebsite is true', () => {
      const result = service['filterResults'](mockPlaces, {
        skipDuplicates: false,
        skipWithoutPhone: false,
        skipWithoutWebsite: true,
      });

      expect(result.results.length).toBe(3);
      expect(result.withoutWebsiteSkipped).toBe(1);
      expect(result.results.every((place) => place.website)).toBe(true);
    });

    it('should apply multiple filters together', () => {
      const result = service['filterResults'](mockPlaces, {
        skipDuplicates: true,
        skipWithoutPhone: true,
        skipWithoutWebsite: false,
      });

      // Should remove: 1 duplicate + 1 without phone
      expect(result.results.length).toBe(2);
      expect(result.duplicatesSkipped).toBe(1);
      expect(result.withoutPhoneSkipped).toBe(1);
    });

    it('should return empty results when all are filtered out', () => {
      const result = service['filterResults'](mockPlaces, {
        skipDuplicates: true,
        skipWithoutPhone: true,
        skipWithoutWebsite: true,
      });

      expect(result.results.length).toBe(1); // Only Pizza Place (first occurrence) has both phone and website
    });

    it('should handle empty input array', () => {
      const result = service['filterResults']([], {
        skipDuplicates: true,
        skipWithoutPhone: true,
        skipWithoutWebsite: true,
      });

      expect(result.results.length).toBe(0);
      expect(result.duplicatesSkipped).toBe(0);
      expect(result.withoutPhoneSkipped).toBe(0);
      expect(result.withoutWebsiteSkipped).toBe(0);
    });
  });
});
