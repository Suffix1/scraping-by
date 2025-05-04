const puppeteer = require('puppeteer');

async function checkThirdProductManually() {
    const url = "https://www.uniqlo.com/nl/nl/products/E480161-000/00?colorDisplayCode=09&sizeDisplayCode=003";
    const size = "M";
    const expectedName = "Dames Universal Movies UT T-Shirt (Back to the Future)";
    
    console.log(`======= CHECKING THIRD PRODUCT MANUALLY =======`);
    console.log(`URL: ${url}`);
    console.log(`Expected product: ${expectedName}`);
    
    // Direct browser check - bypassing the known products cache
    try {
        const browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'] 
        });
        const page = await browser.newPage();
        
        // Set viewport and user agent
        await page.setViewport({ width: 1280, height: 800 });
        await page.setDefaultNavigationTimeout(60000);
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36');
        
        console.log(`Opening browser and navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        
        // Accept cookies if the dialog appears
        try {
            const cookieButton = await page.$('#onetrust-accept-btn-handler');
            if (cookieButton) {
                console.log('Accepting cookies...');
                await cookieButton.click();
                await page.waitForTimeout(3000);
            }
        } catch (error) {
            console.log('No cookie dialog or error accepting cookies.');
        }
        
        // Get page title which usually contains product name
        const title = await page.title();
        console.log(`Page title: ${title}`);
        
        // Take a screenshot for debugging
        await page.screenshot({ path: 'third-product-updated.png' });
        console.log('Screenshot saved to third-product-updated.png');
        
        // Extract product name and price using different methods
        const productName = await page.evaluate(() => {
            // Try multiple selectors that might contain the product name
            const nameSelectors = [
                'h1.product-name',
                '.product-title',
                'h1.page-title',
                '[data-test="product-name"]',
                'title' // Fall back to page title
            ];
            
            for (const selector of nameSelectors) {
                const element = document.querySelector(selector);
                if (element && element.textContent) {
                    return element.textContent.trim();
                }
            }
            
            return document.title.split('|')[0].trim();
        });
        
        console.log(`Product name: ${productName}`);
        
        // Extract price information using multiple methods
        const priceInfo = await page.evaluate(() => {
            // Function to extract price from text
            const extractPrice = (text) => {
                if (!text) return null;
                const match = text.match(/[0-9]+(?:[,.][0-9]+)?/);
                if (match) {
                    return parseFloat(match[0].replace(',', '.'));
                }
                return null;
            };
            
            // Try multiple selectors that might contain price
            const priceSelectors = [
                '[data-test="price-value"]', 
                '.price-value',
                '.product-price',
                '.price-value.price',
                'span[itemprop="price"]',
                '.price-box .regular-price',
                '.product-price-container .price'
            ];
            
            // Original price selectors
            const originalPriceSelectors = [
                '.price-value.original',
                '.old-price',
                '[data-test="price-original"]',
                '.product-price__old'
            ];
            
            // Try to find current price
            let current = null;
            for (const selector of priceSelectors) {
                const elements = document.querySelectorAll(selector);
                for (const element of elements) {
                    if (element && element.textContent) {
                        const price = extractPrice(element.textContent);
                        if (price) {
                            current = price;
                            break;
                        }
                    }
                }
                if (current) break;
            }
            
            // Try to find original price
            let original = null;
            for (const selector of originalPriceSelectors) {
                const elements = document.querySelectorAll(selector);
                for (const element of elements) {
                    if (element && element.textContent) {
                        const price = extractPrice(element.textContent);
                        if (price) {
                            original = price;
                            break;
                        }
                    }
                }
                if (original) break;
            }
            
            // If we have current but no original, they're the same
            if (current && !original) {
                original = current;
            }
            
            return { current, original };
        });
        
        console.log(`Current price: €${priceInfo.current || 'Not found'}`);
        console.log(`Original price: €${priceInfo.original || 'Not found'}`);
        console.log(`On sale: ${priceInfo.current < priceInfo.original ? 'YES' : 'NO'}`);
        
        // Getting the HTML body content for debugging
        const htmlContent = await page.content();
        require('fs').writeFileSync('third-product-page.html', htmlContent);
        console.log('Saved HTML to third-product-page.html');
        
        await browser.close();
        console.log('Browser closed');
    } catch (error) {
        console.error(`ERROR with browser check:`, error);
    }
    
    console.log('\n======= CHECK COMPLETE =======');
}

checkThirdProductManually(); 