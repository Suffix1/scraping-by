const puppeteer = require('puppeteer');

async function directProductCheck() {
    const url = "https://www.uniqlo.com/nl/nl/products/E480161-000/00?colorDisplayCode=09&sizeDisplayCode=003";
    
    console.log(`======= DIRECT PRODUCT CHECK =======`);
    console.log(`URL: ${url}`);
    
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--window-size=1920,1080', '--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Navigate directly to the product page
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        
        // Accept cookies
        try {
            await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 5000 });
            await page.click('#onetrust-accept-btn-handler');
            await page.waitForTimeout(2000);
        } catch (error) {
            console.log('Cookie dialog not found or already accepted');
        }

        // 1. Capture all text on the page
        const allText = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('*'))
                .map(el => el.innerText)
                .filter(text => text && text.includes('€'))
                .filter(text => text.length < 100); // Filter out very long texts
        });
        
        console.log('\n----- TEXTS CONTAINING EURO SYMBOL -----');
        allText.forEach(text => console.log(text.trim()));
        
        // 2. Try to locate the price element using a variety of selectors
        const priceData = await page.evaluate(() => {
            const selectors = [
                '.product-price .price-value',
                '[data-test="price-value"]',
                '.pdp-content .product-price span',
                '.price-sales',
                '.price-value',
                '.price-box .price',
                '[itemprop="price"]',
                '.current-price'
            ];
            
            const results = {};
            
            for (const selector of selectors) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    results[selector] = Array.from(elements).map(el => el.textContent.trim());
                }
            }
            
            return results;
        });
        
        console.log('\n----- PRICE ELEMENTS FOUND -----');
        for (const [selector, texts] of Object.entries(priceData)) {
            console.log(`${selector}:`, texts);
        }
        
        // 3. Try to look for common price patterns in the document
        console.log('\n----- PRICE PATTERN SEARCH -----');
        const pricePatterns = await page.evaluate(() => {
            // Common regex patterns for euro prices
            const patterns = [
                /€\s*\d+,\d+/, // €XX,XX
                /\d+,\d+\s*€/,  // XX,XX€
                /€\d+\.\d+/,    // €XX.XX
                /\d+\.\d+€/     // XX.XX€
            ];
            
            // Search in all elements
            const results = [];
            const elements = document.querySelectorAll('body *');
            
            for (const element of elements) {
                const text = element.textContent.trim();
                for (const pattern of patterns) {
                    const match = text.match(pattern);
                    if (match && text.length < 100) { // avoid very long texts
                        results.push({
                            match: match[0],
                            fullText: text,
                            tagName: element.tagName,
                            className: element.className
                        });
                    }
                }
            }
            
            return results;
        });
        
        // Log the price pattern matches
        if (pricePatterns.length > 0) {
            pricePatterns.forEach(item => {
                console.log(`Found: ${item.match} in ${item.tagName} element with class "${item.className}"`);
                console.log(`  Full text: "${item.fullText}"`);
            });
        } else {
            console.log('No price patterns found');
        }
        
        // 4. Capture a screenshot of the product page
        await page.screenshot({ path: 'product-page.png', fullPage: true });
        console.log('\nSaved screenshot to product-page.png');
        
        console.log('\n----- PRODUCT DETAILS SUMMARY -----');
        // Extract product title
        const title = await page.evaluate(() => {
            const titleEl = document.querySelector('h1.product-name') || document.querySelector('h1');
            return titleEl ? titleEl.textContent.trim() : 'Title not found';
        });
        console.log(`Product: ${title}`);
        
        console.log('\n======= CHECK COMPLETE =======');
    } catch (error) {
        console.error('Error during product check:', error);
    } finally {
        await browser.close();
        console.log('Browser closed');
    }
}

directProductCheck(); 