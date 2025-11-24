import { Page, ElementHandle } from 'puppeteer';
import { Logger } from '@nestjs/common';

const logger = new Logger('SelectorHelper');

/**
 * Find an element using multiple selector fallbacks
 * Tries each selector in order until one is found
 */
export async function findElement(
  page: Page,
  selectors: string | string[] | readonly string[],
  options: {
    timeout?: number;
    description?: string;
  } = {},
): Promise<ElementHandle | null> {
  const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
  const { timeout = 5000, description = 'element' } = options;

  for (let i = 0; i < selectorArray.length; i++) {
    const selector = selectorArray[i] as string;
    try {
      const element = await page.waitForSelector(selector, {
        timeout: i === 0 ? timeout : 1000, // Give more time to first selector
        visible: false,
      });

      if (element) {
        if (i > 0) {
          logger.debug(`Found ${description} using fallback selector #${i + 1}: ${selector}`);
        }
        return element;
      }
    } catch (error) {
      // Continue to next selector
      if (i === selectorArray.length - 1) {
        logger.warn(`Could not find ${description} with any of ${selectorArray.length} selectors`);
      }
    }
  }

  return null;
}

/**
 * Find multiple elements using selector fallbacks
 */
export async function findElements(
  page: Page,
  selectors: string | string[] | readonly string[],
  options: {
    description?: string;
  } = {},
): Promise<ElementHandle[]> {
  const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
  const { description = 'elements' } = options;

  for (let i = 0; i < selectorArray.length; i++) {
    const selector = selectorArray[i] as string;
    try {
      const elements = await page.$$(selector);

      if (elements && elements.length > 0) {
        if (i > 0) {
          logger.debug(
            `Found ${elements.length} ${description} using fallback selector #${i + 1}: ${selector}`,
          );
        }
        return elements;
      }
    } catch (error) {
      // Continue to next selector
    }
  }

  logger.warn(`Could not find ${description} with any selector`);
  return [];
}

/**
 * Extract text content from an element using selector fallbacks
 */
export async function extractText(
  page: Page,
  selectors: string | string[] | readonly string[],
  options: {
    defaultValue?: string;
    description?: string;
    trim?: boolean;
  } = {},
): Promise<string> {
  const { defaultValue = '', description = 'text', trim = true } = options;

  const element = await findElement(page, selectors, { description });

  if (!element) {
    return defaultValue;
  }

  try {
    const text = await page.evaluate((el: Element) => {
      return el.textContent || '';
    }, element);

    return trim ? text.trim() : text;
  } catch (error) {
    logger.warn(`Failed to extract ${description}: ${error.message}`);
    return defaultValue;
  }
}

/**
 * Extract attribute value from an element using selector fallbacks
 */
export async function extractAttribute(
  page: Page,
  selectors: string | string[] | readonly string[],
  attribute: string,
  options: {
    defaultValue?: string;
    description?: string;
  } = {},
): Promise<string> {
  const { defaultValue = '', description = 'attribute' } = options;

  const element = await findElement(page, selectors, { description });

  if (!element) {
    return defaultValue;
  }

  try {
    const value = await page.evaluate(
      (el: Element, attr: string) => {
        return el.getAttribute(attr) || '';
      },
      element,
      attribute,
    );

    return value;
  } catch (error) {
    logger.warn(`Failed to extract ${description}: ${error.message}`);
    return defaultValue;
  }
}

/**
 * Extract text from an element handle
 */
export async function extractTextFromElement(
  element: ElementHandle,
  options: {
    defaultValue?: string;
    trim?: boolean;
  } = {},
): Promise<string> {
  const { defaultValue = '', trim = true } = options;

  try {
    const text = await element.evaluate((el: Element) => {
      return el.textContent || '';
    });

    return trim ? text.trim() : text;
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Extract attribute from an element handle
 */
export async function extractAttributeFromElement(
  element: ElementHandle,
  attribute: string,
  defaultValue: string = '',
): Promise<string> {
  try {
    const value = await element.evaluate((el: Element, attr: string) => {
      return el.getAttribute(attr) || '';
    }, attribute);

    return value;
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Check if an element exists on the page
 */
export async function elementExists(
  page: Page,
  selectors: string | string[] | readonly string[],
  timeout: number = 1000,
): Promise<boolean> {
  const element = await findElement(page, selectors, { timeout });
  return element !== null;
}

/**
 * Wait for any of the selectors to appear
 */
export async function waitForAnySelector(
  page: Page,
  selectors: string[] | readonly string[],
  timeout: number = 30000,
): Promise<string | null> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          return selector;
        }
      } catch (error) {
        // Continue checking
      }
    }

    // Wait a bit before checking again
    await page.waitForTimeout(100);
  }

  return null;
}

/**
 * Extract text content from a child element using selector fallbacks
 */
export async function extractTextFromChild(
  parent: ElementHandle,
  selectors: string | string[] | readonly string[],
  options: {
    defaultValue?: string;
    description?: string;
    trim?: boolean;
  } = {},
): Promise<string> {
  const { defaultValue = '', description: _description = 'child text', trim = true } = options;
  void _description; // Explicitly mark as intentionally unused
  const selectorArray = Array.isArray(selectors) ? selectors : [selectors];

  for (const item of selectorArray) {
    const selector = item as string;
    try {
      const element = await parent.$(selector);
      if (element) {
        const text = await element.evaluate((el: Element) => el.textContent || '');
        return trim ? text.trim() : text;
      }
    } catch (error) {
      // Continue to next selector
    }
  }

  return defaultValue;
}

/**
 * Extract attribute from a child element using selector fallbacks
 */
export async function extractAttributeFromChild(
  parent: ElementHandle,
  selectors: string | string[] | readonly string[],
  attribute: string,
  options: {
    defaultValue?: string;
    description?: string;
  } = {},
): Promise<string> {
  const { defaultValue = '', description: _description = 'child attribute' } = options;
  void _description; // Explicitly mark as intentionally unused
  const selectorArray = Array.isArray(selectors) ? selectors : [selectors];

  for (const item of selectorArray) {
    const selector = item as string;
    try {
      const element = await parent.$(selector);
      if (element) {
        const value = await element.evaluate(
          (el: Element, attr: string) => el.getAttribute(attr) || '',
          attribute,
        );
        return value;
      }
    } catch (error) {
      // Continue to next selector
    }
  }

  return defaultValue;
}
