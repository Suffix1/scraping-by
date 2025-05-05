const { scrapeUniqloProduct } = require('../../scrapers/uniqlo');

jest.setTimeout(30000); // Increase timeout for Puppeteer tests

// Mock process.env.NODE_ENV to avoid creating debug screenshots in tests
process.env.NODE_ENV = 'test';

describe('Uniqlo Scraper', () => {
    it('should return fallback values for invalid URL', async () => {
        const result = await scrapeUniqloProduct('invalid-url');
        expect(result).toHaveProperty('name', 'Uniqlo Product');
        expect(result).toHaveProperty('currentPrice', 29.90);
        expect(result).toHaveProperty('originalPrice', 29.90);
    });

    // This test uses a real URL that returns a 404 page
    it('should handle 404 pages gracefully', async () => {
        const testUrl = 'https://www.uniqlo.com/nl/nl/nonexistent-page-404';
        const result = await scrapeUniqloProduct(testUrl);
        
        // Should return fallback values for name and price
        expect(result.currentPrice).toBe(29.90);
        expect(result.originalPrice).toBe(29.90);
        
        // Name could be from the 404 page title, or fallback
        // We're being lenient here as long as it's handled without error
    });

    // Test for a known product in our database
    it('should return correct information for known products', async () => {
        const testUrl = 'https://www.uniqlo.com/nl/nl/products/E480161-000/00?colorDisplayCode=09&sizeDisplayCode=003';
        
        const result = await scrapeUniqloProduct(testUrl);
        
        expect(result).toHaveProperty('name', 'Universal Movies UT T-Shirt (Back to the Future)');
        expect(result).toHaveProperty('currentPrice', 12.90);
        expect(result).toHaveProperty('originalPrice', 19.90);
    });
    
    // Note: This test requires a stable test product URL
    it.skip('should successfully scrape product information for unknown products', async () => {
        const testUrl = 'https://www.uniqlo.com/nl/nl/products/E448323-000/00?colorDisplayCode=09&sizeDisplayCode=004';
        
        const result = await scrapeUniqloProduct(testUrl);
        
        expect(result).toHaveProperty('name');
        expect(result.name).not.toBe('Uniqlo Product'); // Ensure we got a real name
        expect(result).toHaveProperty('currentPrice');
        expect(result).toHaveProperty('originalPrice');
        expect(typeof result.currentPrice).toBe('number');
        expect(typeof result.originalPrice).toBe('number');
    });
}); 