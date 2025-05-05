const { scrapeUniqloProduct } = require('./scrapers/uniqlo');

const url = 'https://www.uniqlo.com/nl/nl/products/E422992-000/02?colorDisplayCode=62&sizeDisplayCode=007';

async function main() {
    console.log(`Testing scraper for URL: ${url}`);
    
    try {
        const productInfo = await scrapeUniqloProduct(url);
        console.log('--------------------------------------------------');
        console.log('SCRAPED PRODUCT INFORMATION:');
        console.log(`Product Name: ${productInfo.name}`);
        console.log(`Current Price: €${productInfo.currentPrice.toFixed(2)}`);
        console.log(`Original Price: €${productInfo.originalPrice.toFixed(2)}`);
        console.log(`On Sale: ${productInfo.currentPrice < productInfo.originalPrice ? 'Yes' : 'No'}`);
        console.log('--------------------------------------------------');
    } catch (error) {
        console.error('Error during scraping test:', error);
    }
}

main(); 