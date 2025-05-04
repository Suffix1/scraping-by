const { scrapeUniqloProduct } = require('./scrapers/uniqlo');
const puppeteer = require('puppeteer');

async function checkThirdProduct() {
    const url = "https://www.uniqlo.com/nl/nl/products/E480161-000/00?colorDisplayCode=09&sizeDisplayCode=003";
    const size = "M";
    const expectedName = "Dames Universal Movies UT T-Shirt (Back to the Future)";
    
    console.log(`======= CHECKING THIRD PRODUCT MANUALLY =======`);
    console.log(`URL: ${url}`);
    console.log(`Expected product: ${expectedName}`);
    
    // First try the regular scraper
    try {
        console.log("\n1. Using regular scraper:");
        const result = await scrapeUniqloProduct(url, size);
        console.log('RESULT:');
        console.log(`- Name: ${result.name}`);
        console.log(`- Current Price: €${result.currentPrice}`);
        console.log(`- Original Price: €${result.originalPrice}`);
        console.log(`- On Sale: ${result.currentPrice < result.originalPrice ? 'YES' : 'NO'}`);
        console.log(`- Size Available: ${result.sizeAvailable ? 'YES' : 'NO'}`);
    } catch (error) {
        console.error(`ERROR with regular scraper:`, error);
    }
    
    // Now try a direct browser check
    try {
        console.log("\n2. Direct browser check:");
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        
        console.log(`Opening browser and navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        
        // Accept cookies if the dialog appears
        try {
            const cookieButton = await page.$('#onetrust-accept-btn-handler');
            if (cookieButton) {
                console.log('Accepting cookies...');
                await cookieButton.click();
                await page.waitForTimeout(2000);
            }
        } catch (error) {
            console.log('No cookie dialog or error accepting cookies.');
        }
        
        // Get page title which usually contains product name
        const title = await page.title();
        console.log(`Page title: ${title}`);
        
        // Get product info
        const productName = await page.evaluate(() => {
            const nameElement = document.querySelector('h1.product-name');
            return nameElement ? nameElement.textContent.trim() : 'Name not found';
        });
        
        const currentPrice = await page.evaluate(() => {
            const priceElement = document.querySelector('.product-price span.price-value');
            return priceElement ? priceElement.textContent.trim() : 'Price not found';
        });
        
        const originalPrice = await page.evaluate(() => {
            const originalPriceElement = document.querySelector('.product-price span.price-standard');
            return originalPriceElement ? originalPriceElement.textContent.trim() : null;
        });
        
        console.log(`Direct product name: ${productName}`);
        console.log(`Current price: ${currentPrice}`);
        console.log(`Original price: ${originalPrice || 'Same as current price'}`);
        
        // Take a screenshot for debugging
        await page.screenshot({ path: 'third-product-screenshot.png' });
        console.log('Screenshot saved to third-product-screenshot.png');
        
        await browser.close();
    } catch (error) {
        console.error(`ERROR with direct browser check:`, error);
    }
    
    console.log('\n======= CHECK COMPLETE =======');
}

checkThirdProduct(); 