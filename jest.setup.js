const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// MongoDB in-memory server instance
let mongoServer;

// Set environment variables for tests
process.env.NODE_ENV = 'test';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASSWORD = 'test-password';
process.env.NOTIFICATION_EMAIL = 'test@example.com';
process.env.PORT = '3001';

// Increase timeout for tests
jest.setTimeout(30000);

// Helper to reset mongoose connection
const resetMongoose = async () => {
  if (mongoose.connection && mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  // Reset mongoose to clear any existing connection state
  const mongoose2 = require('mongoose');
  if (mongoose2.connection.readyState !== 0) {
    await mongoose2.connection.close();
  }
};

// Before all tests, create & connect to the DB
beforeAll(async () => {
  await resetMongoose();
  
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;
  
  await mongoose.connect(mongoUri);
  console.log('Connected to in-memory MongoDB server');
});

// After all tests, disconnect & stop DB
afterAll(async () => {
  if (mongoose.connection) {
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
  console.log('Disconnected from in-memory MongoDB server');
}); 