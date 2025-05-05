const { scrapeUniqloProduct } = require('./scrapers/uniqlo');

async function testEnhancedScraper() {
    console.log('===== TESTING ENHANCED SCRAPER =====');
    
    // Test with a known product to verify base functionality
    const knownProductUrl = 'https://www.uniqlo.com/nl/nl/products/E480161-000/00?colorDisplayCode=09&sizeDisplayCode=003';
    console.log(`\nTesting known product: ${knownProductUrl}`);
    
    try {
        const knownResult = await scrapeUniqloProduct(knownProductUrl);
        console.log('\nKnown Product Result:');
        console.log(JSON.stringify(knownResult, null, 2));
    } catch (error) {
        console.error('Error with known product:', error);
    }
    
    // Test with an unknown product to see if the selector system works
    // This is a dynamic URL that should work at the time of testing
    const dynamicProductUrl = 'https://www.uniqlo.com/nl/nl/products/E451484-000/00?colorDisplayCode=56&sizeDisplayCode=005';
    console.log(`\nTesting unknown product: ${dynamicProductUrl}`);
    
    try {
        const unknownResult = await scrapeUniqloProduct(dynamicProductUrl);
        console.log('\nUnknown Product Result:');
        console.log(JSON.stringify(unknownResult, null, 2));
    } catch (error) {
        console.error('Error with unknown product:', error);
    }
    
    // Test with a 404 page to verify error handling
    const nonexistentUrl = 'https://www.uniqlo.com/nl/nl/nonexistent-page-404';
    console.log(`\nTesting nonexistent URL: ${nonexistentUrl}`);
    
    try {
        const errorResult = await scrapeUniqloProduct(nonexistentUrl);
        console.log('\nNonexistent URL Result:');
        console.log(JSON.stringify(errorResult, null, 2));
    } catch (error) {
        console.error('Error with nonexistent URL:', error);
    }
    
    console.log('\n===== ENHANCED SCRAPER TEST COMPLETE =====');
}

testEnhancedScraper(); 