const { scrapeUniqloProduct } = require('../scrapers/uniqlo');
const expectedPrices = require('./expected-prices');

// The URLs to test, mapped to their product codes
const urlsToTest = [
  {
    url: 'https://www.uniqlo.com/nl/nl/products/E453754-000/00?colorDisplayCode=69&sizeDisplayCode=004',
    code: 'E453754-000',
    name: 'Heren Ribgebreide Trui met Ronde Hals (Wasbaar)'
  },
  {
    url: 'https://www.uniqlo.com/nl/nl/products/E475296-000/00?colorDisplayCode=55&sizeDisplayCode=004',
    code: 'E475296-000',
    name: 'Heren 3D Knit Naadloze Trui'
  },
  {
    url: 'https://www.uniqlo.com/nl/nl/products/E480161-000/00?colorDisplayCode=09&sizeDisplayCode=003',
    code: 'E480161-000',
    name: 'Universal Movies UT T-Shirt (Back to the Future)'
  },
  {
    url: 'https://www.uniqlo.com/nl/nl/products/E422992-000/02?colorDisplayCode=62&sizeDisplayCode=007',
    code: 'E422992-000',
    name: 'Heren T-Shirt met Ronde Hals'
  }
];

async function validatePrices() {
  console.log('===== VALIDATING UNIQLO PRODUCT PRICES =====\n');
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (const item of urlsToTest) {
    console.log(`Testing: ${item.name} (${item.code})`);
    console.log(`URL: ${item.url}`);
    
    try {
      // Get expected values
      const expected = expectedPrices[item.code];
      if (!expected) {
        console.log(`❌ ERROR: No expected prices found for ${item.code}`);
        failedTests++;
        console.log('\n-------------------------------------------\n');
        continue;
      }
      
      // Get actual scraped values
      const actual = await scrapeUniqloProduct(item.url);
      
      // Round to 2 decimal places for consistent comparison
      const expectedCurrent = Math.round(expected.currentPrice * 100) / 100;
      const expectedOriginal = Math.round(expected.originalPrice * 100) / 100;
      const actualCurrent = Math.round(actual.currentPrice * 100) / 100;
      const actualOriginal = Math.round(actual.originalPrice * 100) / 100;
      
      // Compare prices
      const currentPriceMatch = expectedCurrent === actualCurrent;
      const originalPriceMatch = expectedOriginal === actualOriginal;
      const saleStatusMatch = expected.onSale === (actualCurrent < actualOriginal);
      
      // Display results
      console.log('\nPrice Comparison:');
      console.log(`Current Price:  Expected €${expectedCurrent.toFixed(2)} | Actual €${actualCurrent.toFixed(2)} | ${currentPriceMatch ? '✅ MATCH' : '❌ MISMATCH'}`);
      console.log(`Original Price: Expected €${expectedOriginal.toFixed(2)} | Actual €${actualOriginal.toFixed(2)} | ${originalPriceMatch ? '✅ MATCH' : '❌ MISMATCH'}`);
      console.log(`Sale Status:    Expected ${expected.onSale ? 'YES' : 'NO'} | Actual ${actualCurrent < actualOriginal ? 'YES' : 'NO'} | ${saleStatusMatch ? '✅ MATCH' : '❌ MISMATCH'}`);
      
      // Overall test result
      if (currentPriceMatch && originalPriceMatch && saleStatusMatch) {
        console.log('\n✅ TEST PASSED: All price data matches expected values');
        passedTests++;
      } else {
        console.log('\n❌ TEST FAILED: Price data does not match expected values');
        failedTests++;
      }
      
    } catch (error) {
      console.error(`❌ ERROR: Failed to scrape product: ${error.message}`);
      failedTests++;
    }
    
    console.log('\n-------------------------------------------\n');
  }
  
  // Summary
  console.log('===== TEST SUMMARY =====');
  console.log(`Total tests: ${urlsToTest.length}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Success rate: ${Math.round((passedTests / urlsToTest.length) * 100)}%`);
}

validatePrices()
  .then(() => console.log('Testing complete'))
  .catch(err => console.error('Testing failed:', err)); 