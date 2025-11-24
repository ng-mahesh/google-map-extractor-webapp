import { ElementHandle, Page } from 'puppeteer';
import {
  findElement,
  findElements,
  extractText,
  extractAttribute,
  extractTextFromChild,
  extractAttributeFromChild,
} from './selector.helper';

describe('SelectorHelper', () => {
  let mockPage: Partial<Page>;
  let mockElement: Partial<ElementHandle>;

  beforeEach(() => {
    mockElement = {
      evaluate: jest.fn(),
      $: jest.fn(),
      $$: jest.fn(),
      click: jest.fn(),
    };

    mockPage = {
      waitForSelector: jest.fn(),
      $: jest.fn(),
      $$: jest.fn(),
      evaluate: jest.fn(),
    };
  });

  describe('findElement', () => {
    it('should find an element with a single selector', async () => {
      (mockPage.waitForSelector as jest.Mock).mockResolvedValue(mockElement);

      const result = await findElement(mockPage as Page, 'div.test');

      expect(mockPage.waitForSelector).toHaveBeenCalledWith('div.test', expect.any(Object));
      expect(result).toBe(mockElement);
    });

    it('should find an element with fallback selectors', async () => {
      (mockPage.waitForSelector as jest.Mock)
        .mockRejectedValueOnce(new Error('Not found'))
        .mockResolvedValueOnce(mockElement);

      const result = await findElement(mockPage as Page, ['div.fail', 'div.success']);

      expect(mockPage.waitForSelector).toHaveBeenCalledTimes(2);
      expect(mockPage.waitForSelector).toHaveBeenCalledWith('div.fail', expect.any(Object));
      expect(mockPage.waitForSelector).toHaveBeenCalledWith('div.success', expect.any(Object));
      expect(result).toBe(mockElement);
    });

    it('should return null if all selectors fail', async () => {
      (mockPage.waitForSelector as jest.Mock).mockRejectedValue(new Error('Not found'));

      const result = await findElement(mockPage as Page, ['div.fail1', 'div.fail2']);

      expect(result).toBeNull();
    });
  });

  describe('findElements', () => {
    it('should find elements with a single selector', async () => {
      const mockElements = [mockElement, mockElement];
      (mockPage.$$ as jest.Mock).mockResolvedValue(mockElements);

      const result = await findElements(mockPage as Page, 'div.list-item');

      expect(mockPage.$$).toHaveBeenCalledWith('div.list-item');
      expect(result).toBe(mockElements);
    });

    it('should find elements with fallback selectors', async () => {
      (mockPage.$$ as jest.Mock).mockResolvedValueOnce([]).mockResolvedValueOnce([mockElement]);

      const result = await findElements(mockPage as Page, ['div.empty', 'div.found']);

      expect(mockPage.$$).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(1);
    });
  });

  describe('extractText', () => {
    it('should extract text from an element', async () => {
      (mockPage.waitForSelector as jest.Mock).mockResolvedValue(mockElement);
      (mockPage.evaluate as jest.Mock).mockResolvedValue('  Hello World  ');

      const result = await extractText(mockPage as Page, 'div.text');

      expect(result).toBe('Hello World');
    });

    it('should return default value if element not found', async () => {
      (mockPage.waitForSelector as jest.Mock).mockRejectedValue(new Error('Not found'));

      const result = await extractText(mockPage as Page, 'div.missing', {
        defaultValue: 'Default',
      });

      expect(result).toBe('Default');
    });
  });

  describe('extractAttribute', () => {
    it('should extract attribute from an element', async () => {
      (mockPage.waitForSelector as jest.Mock).mockResolvedValue(mockElement);
      (mockPage.evaluate as jest.Mock).mockResolvedValue('https://example.com');

      const result = await extractAttribute(mockPage as Page, 'a.link', 'href');

      expect(result).toBe('https://example.com');
    });
  });

  describe('extractTextFromChild', () => {
    it('should extract text from a child element', async () => {
      (mockElement.$ as jest.Mock).mockResolvedValue(mockElement);
      (mockElement.evaluate as jest.Mock).mockResolvedValue('Child Text');

      const result = await extractTextFromChild(mockElement as ElementHandle, 'span.child');

      expect(result).toBe('Child Text');
    });
  });

  describe('extractAttributeFromChild', () => {
    it('should extract attribute from a child element', async () => {
      (mockElement.$ as jest.Mock).mockResolvedValue(mockElement);
      (mockElement.evaluate as jest.Mock).mockResolvedValue('value123');

      const result = await extractAttributeFromChild(
        mockElement as ElementHandle,
        'input.field',
        'value',
      );

      expect(result).toBe('value123');
    });
  });
});
