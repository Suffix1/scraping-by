/**
 * This file contains the expected prices for specific Uniqlo products.
 * Use this ONLY for testing against actual scraped values.
 */

const expectedPrices = {
  // Heren Ribgebreide Trui met Ronde Hals (Wasbaar)
  'E453754-000': {
    currentPrice: 39.90,
    originalPrice: 39.90,
    onSale: false
  },
  // Heren 3D Knit Naadloze Trui
  'E475296-000': {
    currentPrice: 49.90,
    originalPrice: 49.90,
    onSale: false
  },
  // Universal Movies UT T-Shirt (Back to the Future)
  'E480161-000': {
    currentPrice: 12.90,
    originalPrice: 19.90,
    onSale: true
  },
  // Heren T-Shirt met Ronde Hals
  'E422992-000': {
    currentPrice: 5.90,
    originalPrice: 14.90,
    onSale: true
  }
};

module.exports = expectedPrices; 