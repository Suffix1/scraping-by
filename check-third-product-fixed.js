const puppeteer = require('puppeteer');

async function checkThirdProductFixed() {
    const url = "https://www.uniqlo.com/nl/nl/products/E480161-000/00?colorDisplayCode=09&sizeDisplayCode=003";
    const size = "M";
    
    console.log(`======= CHECKING THIRD PRODUCT WITH IMPROVED METHOD =======`);
    console.log(`URL: ${url}`);
    
    try {
        // Launch with specific window size to avoid layout shifts
        const browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--window-size=1920,1080', '--no-sandbox', '--disable-setuid-sandbox'] 
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36');
        
        // Navigate to page and make sure it's fully loaded
        console.log(`Opening browser and navigating to URL...`);
        await page.goto(url, { 
            waitUntil: 'networkidle0', 
            timeout: 60000 
        });
        
        // Accept cookies but with proper waiting
        try {
            console.log('Looking for cookie dialog...');
            await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 5000 });
            console.log('Found cookie button, clicking...');
            await page.click('#onetrust-accept-btn-handler');
            console.log('Waiting after accepting cookies...');
            await page.waitForTimeout(3000);
        } catch (error) {
            console.log('No cookie dialog found or timed out.');
        }
        
        // Take a screenshot before any interaction
        await page.screenshot({ path: 'product-before-interaction.png', fullPage: true });
        console.log('Took initial screenshot');
        
        // Extract data using page.evaluate to get everything at once
        console.log('Extracting product information...');
        const productInfo = await page.evaluate(() => {
            // Helper function to extract text from element
            const getTextContent = (selector) => {
                const element = document.querySelector(selector);
                return element ? element.textContent.trim() : null;
            };
            
            // Helper function to extract price in numeric form
            const extractPrice = (text) => {
                if (!text) return null;
                const match = text.match(/[0-9]+(?:[,.][0-9]+)?/);
                return match ? parseFloat(match[0].replace(',', '.')) : null;
            };
            
            // Get title from document
            const title = document.title.split('|')[0].trim();
            
            // Get prices from multiple possible selectors
            let currentPrice = null;
            let originalPrice = null;
            
            // Try all possible price selectors
            const priceSelectors = [
                '.pdp-content .product-price span.price-value',
                '.product-price span.price-value',
                '.product-price__current',
                '.price-sales',
                '.pdp-price'
            ];
            
            const originalPriceSelectors = [
                '.pdp-content .product-price span.price-standard',
                '.product-price span.price-standard',
                '.product-price__original',
                '.price-standard'
            ];
            
            // Check price selectors
            for (const selector of priceSelectors) {
                const element = document.querySelector(selector);
                if (element) {
                    currentPrice = extractPrice(element.textContent);
                    if (currentPrice) break;
                }
            }
            
            // Check original price selectors
            for (const selector of originalPriceSelectors) {
                const element = document.querySelector(selector);
                if (element) {
                    originalPrice = extractPrice(element.textContent);
                    if (originalPrice) break;
                }
            }
            
            // If only current price is found, original is the same
            if (currentPrice && !originalPrice) {
                originalPrice = currentPrice;
            }
            
            // Document what elements we found on the page
            const debug = {
                foundSelectors: {},
                allText: []
            };
            
            // Log all text content on the page for debugging
            document.querySelectorAll('p, h1, h2, h3, span, div').forEach(el => {
                if (el.textContent.trim()) {
                    debug.allText.push(el.textContent.trim());
                }
            });
            
            // Check which selectors exist
            [
                'h1.product-name', 
                '.product-price', 
                '.price-value', 
                '.price-standard',
                '.pdp-price',
                '.price-sales'
            ].forEach(selector => {
                debug.foundSelectors[selector] = !!document.querySelector(selector);
            });
            
            return {
                title,
                currentPrice,
                originalPrice,
                debug
            };
        });
        
        console.log('\n----- PRODUCT INFORMATION -----');
        console.log(`Title: ${productInfo.title}`);
        console.log(`Current Price: €${productInfo.currentPrice || 'Not found'}`);
        console.log(`Original Price: €${productInfo.originalPrice || 'Not found'}`);
        console.log(`On Sale: ${productInfo.currentPrice < productInfo.originalPrice ? 'YES' : 'NO'}`);
        
        // Debug information
        console.log('\n----- DEBUG INFORMATION -----');
        console.log('Found selectors:', productInfo.debug.foundSelectors);
        
        // Look for price-related text
        console.log('\n----- TEXT CONTAINING PRICES -----');
        const priceTexts = productInfo.debug.allText.filter(text => 
            text.includes('€') || text.match(/\d+,\d+/) || text.match(/\d+\.\d+/)
        );
        priceTexts.forEach(text => console.log(`- "${text}"`));
        
        // Try a different approach - run JavaScript in the page
        console.log('\n----- TRYING ALTERNATIVE METHOD -----');
        const hasJsonLd = await page.evaluate(() => {
            return !!document.querySelector('script[type="application/ld+json"]');
        });
        
        if (hasJsonLd) {
            console.log('Found JSON-LD data, extracting...');
            const jsonLdData = await page.evaluate(() => {
                const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
                return scripts.map(script => {
                    try {
                        return JSON.parse(script.textContent);
                    } catch (e) {
                        return null;
                    }
                }).filter(Boolean);
            });
            
            // Look for price in JSON-LD
            let found = false;
            for (const data of jsonLdData) {
                if (data.offers && data.offers.price) {
                    console.log(`JSON-LD Price: €${data.offers.price}`);
                    found = true;
                } else if (data.price) {
                    console.log(`JSON-LD Price: €${data.price}`);
                    found = true;
                }
            }
            
            if (!found) {
                console.log('No price found in JSON-LD data');
            }
        } else {
            console.log('No JSON-LD data found');
        }
        
        // Check if window.__PRELOADED_STATE__ is available (common in React/Redux apps)
        console.log('\n----- CHECKING PRELOADED STATE -----');
        const hasPreloadedState = await page.evaluate(() => {
            return typeof window.__PRELOADED_STATE__ !== 'undefined';
        });
        
        if (hasPreloadedState) {
            console.log('Found preloaded state data, checking for price...');
            const priceFromState = await page.evaluate(() => {
                const state = window.__PRELOADED_STATE__;
                // This is a generic approach, structure will vary by site
                const extractPriceFromObject = (obj, results = []) => {
                    if (!obj) return results;
                    
                    if (typeof obj === 'object') {
                        for (const key in obj) {
                            if (key === 'price' || key === 'currentPrice' || key === 'originalPrice') {
                                results.push({ key, value: obj[key] });
                            } else if (typeof obj[key] === 'object') {
                                extractPriceFromObject(obj[key], results);
                            }
                        }
                    }
                    return results;
                };
                
                return extractPriceFromObject(state);
            });
            
            if (priceFromState.length > 0) {
                console.log('Prices found in preloaded state:');
                priceFromState.forEach(p => console.log(`- ${p.key}: ${p.value}`));
            } else {
                console.log('No prices found in preloaded state');
            }
        } else {
            console.log('No preloaded state found');
        }
        
        // Final screenshot after all operations
        await page.screenshot({ path: 'product-after-interaction.png', fullPage: true });
        console.log('\nTook final screenshot');
        
        await browser.close();
        console.log('Browser closed');
    } catch (error) {
        console.error(`ERROR:`, error);
    }
    
    console.log('\n======= CHECK COMPLETE =======');
}

checkThirdProductFixed(); 