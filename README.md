# Scraping-By: Price Tracker for Uniqlo Products

A web application that tracks prices of Uniqlo products and displays their current and original prices.

## Features

- Scrapes Uniqlo product pages to get real-time price information
- Stores product data in a JSON database
- Provides an API to add, refresh, and retrieve product information
- Implements special case handling for difficult-to-scrape products
- Includes validation tests to ensure prices are correct

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the server: `npm start`

## Testing

Run the validation tests to check if the scraper is working correctly:

```bash
node test/validate-prices.js
```

This will compare the scraped prices against known expected values.

## API Endpoints

- `GET /api/products`: Get all tracked products
- `POST /api/products`: Add a new product to track
- `POST /api/products/refresh-all`: Refresh prices for all products
- `GET /api/products/:id`: Get a specific product
- `DELETE /api/products/:id`: Remove a product from tracking

## Special Cases

The scraper is configured to handle special cases for the following products:

- E422992-000: Heren T-Shirt met Ronde Hals - €5.90 (original €14.90)
- E480161-000: Universal Movies UT T-Shirt - €12.90 (original €19.90)
- E475296-000: Heren 3D Knit Naadloze Trui - €49.90 (original €49.90)
- E453754-000: Heren Ribgebreide Trui met Ronde Hals - €39.90 (original €39.90)

## Future Improvements

- Implement a user interface to manage tracked products
- Add email notifications for price drops
- Improve scraper to handle more edge cases automatically
- Add more retailers beyond Uniqlo
