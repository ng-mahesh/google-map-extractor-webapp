import { Test, TestingModule } from '@nestjs/testing';
import { ScraperService } from './scraper.service';
import { DebugService } from './debug/debug.service';
import { ExtractedPlace } from '../extraction/schemas/extraction.schema';
import { ConfigService } from '@nestjs/config';

// Mock Puppeteer
jest.mock('puppeteer-extra', () => ({
  use: jest.fn(),
  launch: jest.fn(),
}));

describe('ScraperService', () => {
  let service: ScraperService;
  let mockDebugService: Partial<DebugService>;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    mockDebugService = {
      isDebugMode: jest.fn().mockReturnValue(true),
      createDebugDirectory: jest.fn(),
      saveScreenshot: jest.fn(),
      saveHtmlDump: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScraperService,
        { provide: DebugService, useValue: mockDebugService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<ScraperService>(ScraperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

    describe('skipAlreadyExtracted feature', () => {
      const previouslyExtractedPlaces: ExtractedPlace[] = [
        {
          category: 'Restaurant',
          name: 'Old Pizza Place',
          address: '100 First St',
          phone: '+1111111111',
          email: '',
          website: 'https://oldpizza.com',
          rating: 4.2,
          reviewsCount: 80,
          reviews: [],
          openingHours: [],
          isOpen: true,
          placeId: 'prev1',
        },
        {
          category: 'Cafe',
          name: 'Coffee Shop',
          address: '456 Oak Ave',
          phone: '+9876543210',
          email: '',
          website: 'https://coffee.com',
          rating: 4.0,
          reviewsCount: 50,
          reviews: [],
          openingHours: [],
          isOpen: true,
          placeId: 'prev2',
        },
      ];

      it('should skip places that match by phone number', () => {
        const newPlaces: ExtractedPlace[] = [
          {
            category: 'Restaurant',
            name: 'Pizza Place (renamed)',
            address: '999 Different St',
            phone: '+1111111111', // Same phone as Old Pizza Place
            email: '',
            website: 'https://newpizza.com',
            rating: 4.5,
            reviewsCount: 100,
            reviews: [],
            openingHours: [],
            isOpen: true,
            placeId: 'new1',
          },
          {
            category: 'Bakery',
            name: 'New Bakery',
            address: '789 New St',
            phone: '+5555555555', // Unique phone
            email: '',
            website: 'https://bakery.com',
            rating: 4.8,
            reviewsCount: 200,
            reviews: [],
            openingHours: [],
            isOpen: true,
            placeId: 'new2',
          },
        ];

        const result = service['filterResults'](newPlaces, {
          skipDuplicates: false,
          skipWithoutPhone: false,
          skipWithoutWebsite: false,
          skipAlreadyExtracted: true,
          previousPlaces: previouslyExtractedPlaces,
        });

        expect(result.results.length).toBe(1);
        expect(result.alreadyExistsSkipped).toBe(1);
        expect(result.results[0].name).toBe('New Bakery');
      });

      it('should skip places that match by name + address', () => {
        const newPlaces: ExtractedPlace[] = [
          {
            category: 'Cafe',
            name: 'Coffee Shop',
            address: '456 Oak Ave', // Same name and address as previous
            phone: '+0000000000', // Different phone
            email: '',
            website: 'https://coffee.com',
            rating: 4.0,
            reviewsCount: 50,
            reviews: [],
            openingHours: [],
            isOpen: true,
            placeId: 'new3',
          },
          {
            category: 'Bakery',
            name: 'Unique Place',
            address: '999 Unique St',
            phone: '+7777777777',
            email: '',
            website: 'https://unique.com',
            rating: 4.9,
            reviewsCount: 150,
            reviews: [],
            openingHours: [],
            isOpen: true,
            placeId: 'new4',
          },
        ];

        const result = service['filterResults'](newPlaces, {
          skipDuplicates: false,
          skipWithoutPhone: false,
          skipWithoutWebsite: false,
          skipAlreadyExtracted: true,
          previousPlaces: previouslyExtractedPlaces,
        });

        expect(result.results.length).toBe(1);
        expect(result.alreadyExistsSkipped).toBe(1);
        expect(result.results[0].name).toBe('Unique Place');
      });

      it('should not skip when skipAlreadyExtracted is false', () => {
        const newPlaces: ExtractedPlace[] = [
          {
            category: 'Restaurant',
            name: 'Old Pizza Place',
            address: '100 First St',
            phone: '+1111111111', // Same as previous
            email: '',
            website: 'https://oldpizza.com',
            rating: 4.2,
            reviewsCount: 80,
            reviews: [],
            openingHours: [],
            isOpen: true,
            placeId: 'new5',
          },
        ];

        const result = service['filterResults'](newPlaces, {
          skipDuplicates: false,
          skipWithoutPhone: false,
          skipWithoutWebsite: false,
          skipAlreadyExtracted: false,
          previousPlaces: previouslyExtractedPlaces,
        });

        expect(result.results.length).toBe(1);
        expect(result.alreadyExistsSkipped).toBe(0);
      });

      it('should handle phone number normalization (with formatting)', () => {
        const previousWithFormatted: ExtractedPlace[] = [
          {
            category: 'Store',
            name: 'Test Store',
            address: '123 Test St',
            phone: '(123) 456-7890', // Formatted
            email: '',
            website: 'https://test.com',
            rating: 4.0,
            reviewsCount: 10,
            reviews: [],
            openingHours: [],
            isOpen: true,
            placeId: 'prev3',
          },
        ];

        const newPlaces: ExtractedPlace[] = [
          {
            category: 'Store',
            name: 'Different Name',
            address: '999 Other St',
            phone: '+1234567890', // Same digits, different format
            email: '',
            website: 'https://other.com',
            rating: 4.5,
            reviewsCount: 20,
            reviews: [],
            openingHours: [],
            isOpen: true,
            placeId: 'new6',
          },
        ];

        const result = service['filterResults'](newPlaces, {
          skipDuplicates: false,
          skipWithoutPhone: false,
          skipWithoutWebsite: false,
          skipAlreadyExtracted: true,
          previousPlaces: previousWithFormatted,
        });

        expect(result.results.length).toBe(0);
        expect(result.alreadyExistsSkipped).toBe(1);
      });

      it('should work with multiple filters combined', () => {
        const newPlaces: ExtractedPlace[] = [
          {
            category: 'Restaurant',
            name: 'Pizza Place',
            address: '123 Main St',
            phone: '+1111111111', // Matches previous phone
            email: '',
            website: 'https://pizza.com',
            rating: 4.5,
            reviewsCount: 100,
            reviews: [],
            openingHours: [],
            isOpen: true,
            placeId: 'new7',
          },
          {
            category: 'Restaurant',
            name: 'Pizza Place', // Duplicate of above
            address: '123 Main St',
            phone: '+1234567890',
            email: '',
            website: 'https://pizza.com',
            rating: 4.5,
            reviewsCount: 100,
            reviews: [],
            openingHours: [],
            isOpen: true,
            placeId: 'new8',
          },
          {
            category: 'Cafe',
            name: 'New Cafe',
            address: '789 New St',
            phone: '', // No phone
            email: '',
            website: 'https://newcafe.com',
            rating: 4.0,
            reviewsCount: 50,
            reviews: [],
            openingHours: [],
            isOpen: true,
            placeId: 'new9',
          },
          {
            category: 'Bakery',
            name: 'Fresh Bakery',
            address: '456 Fresh St',
            phone: '+8888888888',
            email: '',
            website: 'https://bakery.com',
            rating: 4.8,
            reviewsCount: 200,
            reviews: [],
            openingHours: [],
            isOpen: true,
            placeId: 'new10',
          },
        ];

        const result = service['filterResults'](newPlaces, {
          skipDuplicates: true,
          skipWithoutPhone: true,
          skipWithoutWebsite: false,
          skipAlreadyExtracted: true,
          previousPlaces: previouslyExtractedPlaces,
        });

        // Processing order:
        // 1. First Pizza Place: phone matches previous (+1111111111) → alreadyExistsSkipped
        // 2. Second Pizza Place: has unique phone, NOT duplicate (first was already skipped) → KEPT
        // 3. New Cafe: no phone → withoutPhoneSkipped
        // 4. Fresh Bakery: unique, has phone → KEPT
        // Result: Second Pizza Place + Fresh Bakery = 2 results
        expect(result.results.length).toBe(2);
        expect(result.results[0].name).toBe('Pizza Place');
        expect(result.results[1].name).toBe('Fresh Bakery');
        expect(result.alreadyExistsSkipped).toBe(1);
        expect(result.duplicatesSkipped).toBe(0);
        expect(result.withoutPhoneSkipped).toBe(1);
      });
    });
  });
});
