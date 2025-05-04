const { scrapeUniqloProduct } = require('./scrapers/uniqlo');

async function checkDatabaseProducts() {
    console.log('======= CHECKING DATABASE PRODUCTS =======');
    
    const products = [
        {
            url: "https://www.uniqlo.com/nl/nl/products/E475296-000/00?colorDisplayCode=05&sizeDisplayCode=004",
            size: "M",
            name: "Heren 3D Knit Naadloze Trui"
        },
        {
            url: "https://www.uniqlo.com/nl/nl/products/E461090-000/00?colorDisplayCode=32&sizeDisplayCode=003",
            size: "S",
            name: "Dames 3D Knit Katoenen Trui met Ronde Hals"
        },
        {
            url: "https://www.uniqlo.com/nl/nl/products/E480161-000/00?colorDisplayCode=09&sizeDisplayCode=003",
            size: "M",
            name: "Dames Universal Movies UT T-Shirt (Back to the Future)"
        }
    ];
    
    for (const product of products) {
        console.log(`\nTesting: ${product.url}`);
        console.log(`Expected product: ${product.name}`);
        
        try {
            const result = await scrapeUniqloProduct(product.url, product.size);
            console.log('RESULT:');
            console.log(`- Name: ${result.name}`);
            console.log(`- Current Price: €${result.currentPrice}`);
            console.log(`- Original Price: €${result.originalPrice}`);
            console.log(`- On Sale: ${result.currentPrice < result.originalPrice ? 'YES' : 'NO'}`);
            console.log(`- Size Available: ${result.sizeAvailable ? 'YES' : 'NO'}`);
        } catch (error) {
            console.error(`ERROR with ${product.url}:`, error);
        }
    }
    
    console.log('\n======= CHECKING COMPLETE =======');
}

checkDatabaseProducts(); 