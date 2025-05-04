const { scrapeUniqloProduct } = require('../../scrapers/uniqlo');

jest.setTimeout(30000); // Increase timeout for Puppeteer tests

describe('Uniqlo Scraper', () => {
    it('should throw error for invalid URL', async () => {
        await expect(scrapeUniqloProduct('invalid-url', 'M')).rejects.toThrow();
    });

    it('should throw error for invalid size', async () => {
        const testUrl = 'https://www.uniqlo.com/nl/nl/airism-ultra-stretch-oversized-t-shirt-468201.html';
        await expect(scrapeUniqloProduct(testUrl, 'INVALID_SIZE')).rejects.toThrow();
    });

    // Note: This test requires a stable test product URL
    it.skip('should successfully scrape product information', async () => {
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