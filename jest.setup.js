// Set environment variables for tests
process.env.NODE_ENV = 'test';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASSWORD = 'test-password';
process.env.NOTIFICATION_EMAIL = 'test@example.com';
process.env.PORT = '3001';

// Ensure data directory is created for tests
const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '../db/data');

// Increase timeout for tests
jest.setTimeout(30000);

// Before all tests, ensure test directory exists
beforeAll(async () => {
    try {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        console.log('Test directory setup complete');
    } catch (error) {
        console.error('Error setting up test directory:', error);
    }
});

// After all tests, clean up
afterAll(async () => {
    console.log('Tests completed');
}); 