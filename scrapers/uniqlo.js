const puppeteer = require('puppeteer');

async function scrapeUniqloProduct(url, size) {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0' });
        
        // Extract product name
        const name = await page.$eval('h1.product-name', el => el.textContent.trim());
        
        // Extract prices
        const priceElement = await page.$('.product-price');
        const currentPrice = await priceElement.$eval('.price-value', el => {
            const priceText = el.textContent.trim();
            return parseFloat(priceText.replace('€', '').replace(',', '.'));
        });
        
        // Check for original price
        let originalPrice = currentPrice;
        const originalPriceElement = await page.$('.product-price .price-value.original');
        if (originalPriceElement) {
            originalPrice = await originalPriceElement.evaluate(el => {
                const priceText = el.textContent.trim();
                return parseFloat(priceText.replace('€', '').replace(',', '.'));
            });
        }
        
        // Check size availability
        const sizeAvailable = await page.evaluate((targetSize) => {
            const sizeButtons = Array.from(document.querySelectorAll('.size-selector button'));
            const sizeButton = sizeButtons.find(button => 
                button.textContent.trim() === targetSize && !button.disabled
            );
            return !!sizeButton;
        }, size);
        
        if (!sizeAvailable) {
            throw new Error(`Size ${size} is not available for this product`);
        }
        
        return {
            name,
            currentPrice,
            originalPrice,
            sizeAvailable
        };
    } finally {
        await browser.close();
    }
}

module.exports = {
    scrapeUniqloProduct
}; 