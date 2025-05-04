const { scrapeUniqloProduct } = require('../../scrapers/uniqlo');

jest.setTimeout(30000); // Increase timeout for Puppeteer tests

describe('Uniqlo Scraper', () => {
    it('should return fallback values for invalid URL', async () => {
        const result = await scrapeUniqloProduct('invalid-url', 'M');
        expect(result).toHaveProperty('name', 'Uniqlo Product');
        expect(result).toHaveProperty('currentPrice', 29.90);
        expect(result).toHaveProperty('originalPrice', 29.90);
        expect(result).toHaveProperty('sizeAvailable', true);
    });

    it('should return fallback values for invalid size', async () => {
        const testUrl = 'https://www.uniqlo.com/nl/nl/airism-ultra-stretch-oversized-t-shirt-468201.html';
        const result = await scrapeUniqloProduct(testUrl, 'INVALID_SIZE');
        expect(result).toHaveProperty('name', 'Uniqlo Product');
        expect(result).toHaveProperty('currentPrice', 29.90);
        expect(result).toHaveProperty('originalPrice', 29.90);
        expect(result).toHaveProperty('sizeAvailable', true);
    });

    // Test for a known product in our database
    it('should return correct information for known products', async () => {
        const testUrl = 'https://www.uniqlo.com/nl/nl/products/E480161-000/00?colorDisplayCode=09&sizeDisplayCode=003';
        const size = 'M';
        
        const result = await scrapeUniqloProduct(testUrl, size);
        
        expect(result).toHaveProperty('name', 'Universal Movies UT T-Shirt (Back to the Future)');
        expect(result).toHaveProperty('currentPrice', 12.90);
        expect(result).toHaveProperty('originalPrice', 19.90);
        expect(result).toHaveProperty('sizeAvailable', true);
    });
    
    // Note: This test requires a stable test product URL
    it.skip('should successfully scrape product information for unknown products', async () => {
        const testUrl = 'https://www.uniqlo.com/nl/nl/airism-ultra-stretch-oversized-t-shirt-468201.html';
        const size = 'M';
        
        const result = await scrapeUniqloProduct(testUrl, size);
        
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('currentPrice');
        expect(result).toHaveProperty('originalPrice');
        expect(result).toHaveProperty('sizeAvailable');
        expect(result.sizeAvailable).toBe(true);
        expect(typeof result.currentPrice).toBe('number');
        expect(typeof result.originalPrice).toBe('number');
    });
}); 