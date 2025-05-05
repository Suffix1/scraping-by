const fs = require('fs');
const path = require('path');

// Database file path - fixing the path to include the data subdirectory
const dbFilePath = path.join(__dirname, 'db', 'data', 'products.json');

// Read the current database
function readDatabase() {
    if (!fs.existsSync(dbFilePath)) {
        return [];
    }
    const data = fs.readFileSync(dbFilePath, 'utf8');
    return JSON.parse(data);
}

// Write to the database
function writeDatabase(products) {
    fs.writeFileSync(dbFilePath, JSON.stringify(products, null, 2));
}

// Update the price for the specific product
function updateProductPrice() {
    console.log('Updating product price in database...');
    
    // Read current data
    const products = readDatabase();
    
    // Find the product with the URL containing the product code
    const productUrl = 'https://www.uniqlo.com/nl/nl/products/E453754-000/00?colorDisplayCode=69&sizeDisplayCode=004';
    const productIndex = products.findIndex(p => p.url === productUrl);
    
    if (productIndex === -1) {
        console.log(`Product not found: ${productUrl}`);
        return;
    }
    
    // Display current values
    console.log('Current product data:');
    console.log(JSON.stringify(products[productIndex], null, 2));
    
    // Update the price values
    const updatedProduct = {
        ...products[productIndex],
        currentPrice: 39.90,
        originalPrice: 39.90,
        onSale: false,  // Since both prices are the same
        lastChecked: new Date().toISOString()
    };
    
    // Save the updated product
    products[productIndex] = updatedProduct;
    
    // Write back to database
    writeDatabase(products);
    
    console.log('Updated product data:');
    console.log(JSON.stringify(updatedProduct, null, 2));
    console.log('Database updated successfully');
}

// Run the update
updateProductPrice(); 