// Content script for Google Maps
// This script runs when user visits Google Maps to scrape review data as fallback

import { Review, ScrapingError } from '../lib/types';

// Content script interface (will be fully implemented in Phase 3)
export interface IReviewScrapingService {
  canScrape(): boolean;
  scrapeReviews(): Promise<Review[]>;
}

class GoogleMapsContentScript implements IReviewScrapingService {
  canScrape(): boolean {
    // Check if we're on Google Maps contributions page
    const url = window.location.href;
    return (
      url.includes('maps.google.com') &&
      (url.includes('/contrib') || url.includes('/contributions'))
    );
  }

  async scrapeReviews(): Promise<Review[]> {
    if (!this.canScrape()) {
      throw new ScrapingError(
        'Not on Google Maps contributions page',
        'WRONG_PAGE'
      );
    }

    // TODO: Implement actual DOM scraping logic in Phase 3
    console.log('Google Maps content script loaded - scraping not yet implemented');
    return [];
  }
}

// Initialize content script
const contentScript = new GoogleMapsContentScript();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SCRAPE_REVIEWS') {
    contentScript
      .scrapeReviews()
      .then((reviews) => sendResponse({ success: true, data: reviews }))
      .catch((error) =>
        sendResponse({ success: false, error: error.message })
      );
    return true; // Async response
  }

  if (message.type === 'CAN_SCRAPE') {
    sendResponse({ success: true, data: contentScript.canScrape() });
  }
});

console.log('Review Rescue: Google Maps content script loaded');
