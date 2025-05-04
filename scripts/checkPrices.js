require('dotenv').config();
const nodemailer = require('nodemailer');
const Product = require('../models/Product');
const { scrapeUniqloProduct } = require('../scrapers/uniqlo');

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

async function checkPrices() {
    try {
        const products = await Product.find();
        let emailContent = '';
        let hasPriceDrops = false;

        for (const product of products) {
            try {
                const productInfo = await scrapeUniqloProduct(product.url, product.size);
                
                if (productInfo.currentPrice < product.currentPrice) {
                    hasPriceDrops = true;
                    emailContent += `
                        Product: ${product.name}
                        Size: ${product.size}
                        Old Price: €${product.currentPrice.toFixed(2)}
                        New Price: €${productInfo.currentPrice.toFixed(2)}
                        Savings: €${(product.currentPrice - productInfo.currentPrice).toFixed(2)}
                        URL: ${product.url}
                        ----------------------------
                    `;
                }

                // Update product in database
                product.currentPrice = productInfo.currentPrice;
                product.lastChecked = new Date();
                await product.save();
            } catch (error) {
                console.error(`Error checking price for ${product.name}:`, error);
            }
        }

        if (hasPriceDrops) {
            await sendEmail(emailContent);
        }
        
        return { success: true, priceDrops: hasPriceDrops };
    } catch (error) {
        console.error('Error checking prices:', error);
        return { success: false, error: error.message };
    }
}

async function sendEmail(content) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.NOTIFICATION_EMAIL,
        subject: 'Uniqlo Price Drops Alert',
        text: `Price drops detected!\n\n${content}`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Price drop email sent successfully');
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

// Run the check if this file is executed directly
if (require.main === module) {
    checkPrices();
}

module.exports = {
    checkPrices,
    sendEmail
}; 