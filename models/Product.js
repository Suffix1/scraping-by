const db = require('../db/fileDb');

// Collection name for products
const COLLECTION = 'products';

class Product {
    /**
     * Create a product
     * @param {Object} data - Product data
     * @returns {Promise<Object>} - Created product
     */
    static async create(data) {
        // Validate required fields
        if (!data.url) throw new Error('URL is required');
        if (!data.name) throw new Error('Name is required');
        if (!data.currentPrice) throw new Error('Current price is required');
        if (!data.originalPrice) throw new Error('Original price is required');

        // Check for duplicate URL
        const existingProduct = await db.findOne(COLLECTION, { url: data.url });
        if (existingProduct) {
            throw new Error('Product with this URL already exists');
        }

        // Add default values if not provided
        const newProduct = {
            ...data,
            lastChecked: new Date().toISOString(),
            emailSent: false,
            onSale: data.currentPrice < data.originalPrice
        };

        // Create product in database
        return await db.create(COLLECTION, newProduct);
    }

    /**
     * Find all products
     * @returns {Promise<Array>} - All products
     */
    static async find() {
        return await db.findAll(COLLECTION);
    }

    /**
     * Find product by ID
     * @param {string} id - Product ID
     * @returns {Promise<Object|null>} - Product or null
     */
    static async findById(id) {
        return await db.findById(COLLECTION, id);
    }

    /**
     * Update product by ID
     * @param {string} id - Product ID
     * @param {Object} update - Updated product fields
     * @returns {Promise<Object|null>} - Updated product or null
     */
    static async findByIdAndUpdate(id, update) {
        // If updating prices, recalculate onSale
        if (update.currentPrice !== undefined && update.originalPrice !== undefined) {
            update.onSale = update.currentPrice < update.originalPrice;
        } else if (update.currentPrice !== undefined) {
            const product = await this.findById(id);
            if (product) {
                update.onSale = update.currentPrice < product.originalPrice;
            }
        }
        
        return await db.updateById(COLLECTION, id, update);
    }

    /**
     * Delete product by ID
     * @param {string} id - Product ID
     * @returns {Promise<boolean>} - Success status
     */
    static async findByIdAndDelete(id) {
        return await db.deleteById(COLLECTION, id);
    }

    /**
     * Save - convenience method for instance operations
     * @returns {Promise<Object>} - Saved product
     */
    async save() {
        if (this._id) {
            // Update existing product
            const { _id, ...updateData } = this;
            const updated = await db.updateById(COLLECTION, _id, updateData);
            Object.assign(this, updated);
            return this;
        } else {
            // Create new product
            const created = await Product.create(this);
            Object.assign(this, created);
            return this;
        }
    }
}

module.exports = Product; 