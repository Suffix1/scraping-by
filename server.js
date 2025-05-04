require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Import routes
const productRoutes = require('./routes/products');

// Use routes
app.use('/api/products', productRoutes);

// Basic route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// API health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// Start server if file is run directly
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app; 