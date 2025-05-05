const fetch = require('node-fetch');

async function testFrontend() {
    try {
        console.log('Simulating frontend product submission...');
        
        // This mimics what the frontend JavaScript would send
        const response = await fetch('http://localhost:3000/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: 'https://www.uniqlo.com/nl/nl/products/E475296-000/00?colorDisplayCode=55'
            })
        });
        
        console.log('Response status:', response.status);
        
        const responseData = await response.json();
        console.log('Response data:', responseData);
        
        if (response.ok) {
            console.log('Frontend product submission successful!');
        } else {
            console.error('Frontend product submission failed:', responseData.message);
        }
        
        // Check all products in database
        const allProductsResponse = await fetch('http://localhost:3000/api/products');
        const allProducts = await allProductsResponse.json();
        
        console.log('\nAll products in database:');
        allProducts.forEach((product, index) => {
            console.log(`\nProduct ${index + 1}:`);
            console.log(`Name: ${product.name}`);
            console.log(`URL: ${product.url}`);
            console.log(`Current price: €${product.currentPrice}`);
            console.log(`Original price: €${product.originalPrice}`);
            console.log(`On sale: ${product.onSale ? 'Yes' : 'No'}`);
            console.log(`Last checked: ${new Date(product.lastChecked).toLocaleString()}`);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

testFrontend().then(() => console.log('Test completed')); 