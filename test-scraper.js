const { scrapeUniqloProduct } = require('./scrapers/uniqlo');

async function testScraper() {
    console.log('======= TESTING UNIQLO SCRAPER =======');
    
    const products = [
        {
            url: 'https://www.uniqlo.com/nl/nl/products/E475296-000/00?colorDisplayCode=55&sizeDisplayCode=004',
            expected: 'Heren 3D Knit Naadloze Trui'
        },
        {
            url: 'https://www.uniqlo.com/nl/nl/products/E480161-000/00?colorDisplayCode=09&sizeDisplayCode=003',
            expected: 'Heren Warme Voering V-Hals Trui'
        }
    ];
    
    for (const product of products) {
        console.log(`\nTesting: ${product.url}`);
        console.log(`Expected product: ${product.expected}`);
        
        try {
            const result = await scrapeUniqloProduct(product.url);
            console.log('RESULT:');
            console.log(`- Name: ${result.name}`);
            console.log(`- Current Price: €${result.currentPrice}`);
            console.log(`- Original Price: €${result.originalPrice}`);
            console.log(`- On Sale: ${result.currentPrice < result.originalPrice ? 'YES' : 'NO'}`);
        } catch (error) {
            console.error(`ERROR with ${product.url}:`, error);
        }
    }
    
    console.log('\n======= TESTING COMPLETE =======');
}

// Run the tests
testScraper().catch(console.error); 