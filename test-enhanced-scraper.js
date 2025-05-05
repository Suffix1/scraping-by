const { scrapeUniqloProduct } = require('./scrapers/uniqlo');

// URL from the terminal output that showed the incorrect price
const testUrl = 'https://www.uniqlo.com/nl/nl/products/E453754-000/00?colorDisplayCode=69&sizeDisplayCode=004';

async function testScraper() {
    console.log(`Testing scraper with URL: ${testUrl}`);
    
    try {
        const productData = await scrapeUniqloProduct(testUrl);
        
        console.log('Scraped Product Data:');
        console.log('-------------------');
        console.log(`Name: ${productData.name}`);
        console.log(`Current Price: €${productData.currentPrice}`);
        console.log(`Original Price: €${productData.originalPrice}`);
        
        if (productData.currentPrice === 29.90 && productData.originalPrice === 39.90) {
            console.log('\nWARNING: Still showing the same price values as before');
            console.log('Please check the actual price on the Uniqlo website');
        } else {
            console.log('\nPrice values have been updated from the original values');
        }
    } catch (error) {
        console.error('Error testing scraper:', error);
    }
}

testScraper().then(() => {
    console.log('Test completed');
}).catch((error) => {
    console.error('Test failed:', error);
}); 