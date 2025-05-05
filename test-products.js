const { scrapeUniqloProduct } = require('./scrapers/uniqlo');
const expectedPrices = require('./test/expected-prices');

// The URLs to test with their product codes
const urlsToTest = [
    {
        url: 'https://www.uniqlo.com/nl/nl/products/E475296-000/00?colorDisplayCode=55&sizeDisplayCode=004',
        code: 'E475296-000',
        name: 'Heren 3D Knit Naadloze Trui'
    },
    {
        url: 'https://www.uniqlo.com/nl/nl/products/E453754-000/00?colorDisplayCode=69&sizeDisplayCode=004',
        code: 'E453754-000',
        name: 'Heren Ribgebreide Trui met Ronde Hals (Wasbaar)'
    },
    {
        url: 'https://www.uniqlo.com/nl/nl/products/E480161-000/00?colorDisplayCode=09&sizeDisplayCode=003',
        code: 'E480161-000',
        name: 'Universal Movies UT T-Shirt (Back to the Future)'
    },
    {
        url: 'https://www.uniqlo.com/nl/nl/products/E422992-000/02?colorDisplayCode=62&sizeDisplayCode=007',
        code: 'E422992-000',
        name: 'Heren T-Shirt met Ronde Hals'
    }
];

async function main() {
    console.log('===== UNIQLO PRODUCT PRICE TESTER =====\n');
    console.log('Testing product prices for special case handling...\n');
    
    for (const item of urlsToTest) {
        console.log(`\n===== TESTING: ${item.name} (${item.code}) =====\n`);
        console.log(`URL: ${item.url}`);
        
        try {
            // Get expected values
            const expected = expectedPrices[item.code];
            
            // Get actual scraped values
            const productInfo = await scrapeUniqloProduct(item.url);
            
            // Compare results
            console.log('\n--------------------------------------------------');
            console.log('SCRAPED PRODUCT INFORMATION:');
            console.log(`Product Name: ${productInfo.name}`);
            console.log(`Current Price: €${productInfo.currentPrice.toFixed(2)}`);
            console.log(`Original Price: €${productInfo.originalPrice.toFixed(2)}`);
            console.log(`On Sale: ${productInfo.currentPrice < productInfo.originalPrice ? 'Yes' : 'No'}`);
            
            if (expected) {
                console.log('\nCOMPARISON WITH EXPECTED VALUES:');
                
                const currentMatch = Math.abs(expected.currentPrice - productInfo.currentPrice) < 0.01;
                const originalMatch = Math.abs(expected.originalPrice - productInfo.originalPrice) < 0.01;
                const saleMatch = expected.onSale === (productInfo.currentPrice < productInfo.originalPrice);
                
                console.log(`Current Price: ${currentMatch ? '✅ MATCH' : '❌ MISMATCH'} (Expected: €${expected.currentPrice.toFixed(2)})`);
                console.log(`Original Price: ${originalMatch ? '✅ MATCH' : '❌ MISMATCH'} (Expected: €${expected.originalPrice.toFixed(2)})`);
                console.log(`Sale Status: ${saleMatch ? '✅ MATCH' : '❌ MISMATCH'} (Expected: ${expected.onSale ? 'Yes' : 'No'})`);
                
                if (currentMatch && originalMatch && saleMatch) {
                    console.log('\n✅ TEST PASSED: All price data matches expected values');
                } else {
                    console.log('\n❌ TEST FAILED: Price data does not match expected values');
                }
            }
            
            console.log('--------------------------------------------------');
        } catch (error) {
            console.error('Error scraping product:', error);
        }
    }
    
    console.log('\nTesting complete');
}

main().catch(console.error); 