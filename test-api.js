const fetch = require('node-fetch');

async function testApi() {
    try {
        console.log('Testing API...');
        console.log('Sending request to add product...');
        
        // Test POST to add a product
        const postResponse = await fetch('http://localhost:3000/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: 'https://www.uniqlo.com/nl/nl/products/E480161-000/00?colorDisplayCode=09&sizeDisplayCode=003'
            })
        });
        
        console.log('Response status:', postResponse.status);
        
        const postData = await postResponse.text();
        console.log('Raw response:', postData);
        
        try {
            const jsonData = JSON.parse(postData);
            console.log('Response data (JSON):', jsonData);
            
            if (postResponse.ok) {
                console.log('Product added successfully!');
            } else {
                console.error('Failed to add product:', jsonData.message);
            }
        } catch (e) {
            // Not JSON
            console.log('Response data (text):', postData);
        }
        
        // Also try to get all products to see what exists in DB
        console.log('\nTrying to fetch all products...');
        const getResponse = await fetch('http://localhost:3000/api/products');
        const getJsonData = await getResponse.json();
        console.log('GET products response:', getJsonData);
    } catch (error) {
        console.error('Error testing API:', error);
    }
}

console.log('Starting API test...');
testApi().then(() => console.log('Test completed')); 