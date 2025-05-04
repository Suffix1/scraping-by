# Uniqlo Price Tracker

A simple application to track Uniqlo product prices and receive email notifications when prices drop.

## Features

- Track specific Uniqlo products and sizes
- Daily price checking
- Email notifications for price drops
- Simple web interface to manage tracked items

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```
   MONGODB_URI=mongodb://localhost:27017/uniqlo-tracker
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-specific-password
   NOTIFICATION_EMAIL=your-email@gmail.com
   PORT=3000
   ```

4. For Gmail, you'll need to:
   - Enable 2-factor authentication
   - Generate an App Password
   - Use the App Password in the EMAIL_PASSWORD field

5. Start the server:
   ```bash
   npm start
   ```

6. Set up the daily price check:
   - On Windows: Use Task Scheduler to run `node scripts/checkPrices.js` daily
   - On Linux/Mac: Use cron to run `node scripts/checkPrices.js` daily

## Usage

1. Open the web interface at `http://localhost:3000`
2. Add a product by entering its Uniqlo URL and desired size
3. The application will check prices daily and send email notifications for any price drops

## Development

- Run in development mode with hot reload:
  ```bash
  npm run dev
  ```

## Technologies Used

- Node.js
- Express
- MongoDB
- Puppeteer (for web scraping)
- Nodemailer (for email notifications)
