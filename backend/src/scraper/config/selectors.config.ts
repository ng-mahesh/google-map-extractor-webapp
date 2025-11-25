/**
 * Centralized CSS Selector Configuration
 *
 * This file contains all CSS selectors used for scraping Google Maps.
 * Each selector has fallback options to handle UI changes gracefully.
 */

export const SELECTORS = {
  // Main feed container
  FEED: 'div[role="feed"]',

  // Place article cards in the list
  PLACE_ARTICLE: 'div[role="article"]',

  // Business Name - Multiple fallbacks for robustness
  BUSINESS_NAME: [
    'h1.DUwDvf', // Primary selector (current Google Maps)
    'div[role="main"] h1', // Fallback 1: Main section heading
    'h1', // Fallback 2: Any h1 tag
  ],

  // Business name in the card (before clicking)
  CARD_NAME: [
    'div.qBF1Pd', // Primary selector
    'div.fontHeadlineSmall', // Fallback 1
    'a[aria-label]', // Fallback 2: Link with aria-label
  ],

  // Category/Type of business
  CATEGORY: [
    'button[jsaction*="category"]', // Primary selector
    'button.DkEaL', // Fallback 1
  ],

  // Address
  ADDRESS: [
    'button[data-item-id="address"]', // Primary selector
    'button[aria-label*="Address"]', // Fallback 1: Button with "Address" in label
    'div[data-tooltip*="address"]', // Fallback 2: Div with address tooltip
  ],

  // Phone number
  PHONE: [
    'button[data-item-id*="phone"]', // Primary selector
    'button[aria-label*="Phone"]', // Fallback 1: Button with "Phone" in label
    'a[href^="tel:"]', // Fallback 2: Tel link
  ],

  // Website
  WEBSITE: [
    'a[data-item-id="authority"]', // Primary selector
    'a[aria-label*="Website"]', // Fallback 1: Link with "Website" in label
    'a[href^="http"]:not([href*="google"])', // Fallback 2: External link (not Google)
  ],

  // Rating
  RATING: [
    'div[role="img"][aria-label*="stars"]', // Primary selector
    'span[aria-label*="stars"]', // Fallback 1
  ],

  // Reviews count
  REVIEWS_COUNT: [
    'button[aria-label*="reviews"]', // Primary selector
    'span[aria-label*="reviews"]', // Fallback 1
  ],

  // Individual reviews
  REVIEWS: [
    'div[data-review-id]', // Primary selector
    'div.jftiEf', // Fallback 1
  ],

  // Review author
  REVIEW_AUTHOR: [
    'button[aria-label]', // Primary selector - author name button
    'div.d4r55', // Fallback 1
    'div[data-review-id] button:first-child', // Fallback 2
  ],

  // Review rating
  REVIEW_RATING: [
    'span[role="img"][aria-label*="stars"]', // Primary selector
    'div[aria-label*="stars"]', // Fallback 1
  ],

  // Review text
  REVIEW_TEXT: [
    'span.wiI7pd', // Primary selector
    'div.MyEned', // Fallback 1
  ],

  // Review date
  REVIEW_DATE: [
    'span.rsqaWe', // Primary selector
    'span.DU9Pgb', // Fallback 1
  ],

  // Opening hours
  OPENING_HOURS: [
    'button[data-item-id*="oh"]', // Primary selector
    'button[aria-label*="Hours"]', // Fallback 1
  ],

  // Opening hours table
  HOURS_TABLE: [
    'table.eK4R0e', // Primary selector
    'div[aria-label*="Hours"]', // Fallback 1
  ],

  // Is open now
  IS_OPEN: [
    'span[aria-label*="Open"]', // Primary selector
    'div[aria-label*="Open"]', // Fallback 1
  ],

  // Description
  DESCRIPTION: [
    'div[data-attrid="description"]', // Primary selector
    'div.WeS02d', // Fallback 1
    'div[class*="description"]', // Fallback 2
  ],

  // Price range
  PRICE: [
    'span[aria-label*="Price"]', // Primary selector
    'span.mgr77e', // Fallback 1
  ],

  // Photos
  PHOTOS: [
    'button[jsaction*="photo"]', // Primary selector for photo button
    'img[src*="googleusercontent"]', // Fallback: Google hosted images
  ],

  // Featured/Main image
  FEATURED_IMAGE: [
    'div[role="main"] img[src*="googleusercontent"]', // Primary selector
    'button[aria-label*="Photo"] img', // Fallback 1
  ],

  // Review URL (constructed from place data)
  REVIEW_BUTTON: [
    'button[aria-label*="Write a review"]', // Primary selector
    'a[href*="review"]', // Fallback 1
  ],

  // Reviews tab button to navigate to reviews page
  REVIEWS_TAB: [
    'div.Gpq6kf.NlVald[aria-hidden="true"]', // Primary selector for Reviews text
    'button[aria-label*="Reviews"]', // Fallback 1
    'button:has(> .Gpq6kf.NlVald)', // Fallback 2
  ],
} as const;

/**
 * Selector metadata for logging and debugging
 */
export const SELECTOR_METADATA = {
  BUSINESS_NAME: 'Business name heading',
  CARD_NAME: 'Business name in card',
  CATEGORY: 'Business category/type',
  ADDRESS: 'Business address',
  PHONE: 'Phone number',
  WEBSITE: 'Website URL',
  RATING: 'Star rating',
  REVIEWS_COUNT: 'Number of reviews',
  REVIEWS: 'Review elements',
  REVIEW_AUTHOR: 'Review author name',
  REVIEW_RATING: 'Review star rating',
  REVIEW_TEXT: 'Review text content',
  REVIEW_DATE: 'Review date',
  OPENING_HOURS: 'Opening hours button',
  HOURS_TABLE: 'Hours table',
  IS_OPEN: 'Open/closed status',
  DESCRIPTION: 'Business description',
  PRICE: 'Price range',
  PHOTOS: 'Photo elements',
  FEATURED_IMAGE: 'Featured/main image',
  REVIEW_BUTTON: 'Write review button',
} as const;

/**
 * Timeout configurations for different operations
 */
export const TIMEOUTS = {
  PAGE_LOAD: 60000, // 60 seconds for page load
  SELECTOR_WAIT: 30000, // 30 seconds for selector to appear
  ELEMENT_CLICK: 5000, // 5 seconds for click operation
  SCROLL_WAIT: 2000, // 2 seconds between scrolls
  PLACE_DETAILS_LOAD: 2000, // 2 seconds for place details to load
} as const;
