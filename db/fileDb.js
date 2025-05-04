const fs = require('fs').promises;
const path = require('path');

// Ensure the data directory exists
const DB_DIR = path.join(__dirname, 'data');
const ensureDbDir = async () => {
    try {
        await fs.mkdir(DB_DIR, { recursive: true });
    } catch (error) {
        if (error.code !== 'EEXIST') {
            console.error('Error creating database directory:', error);
            throw error;
        }
    }
};

// Generic functions for file-based data storage
const fileDb = {
    /**
     * Save data to a collection file
     * @param {string} collection - Collection name
     * @param {Array} data - Data to save
     */
    async saveCollection(collection, data) {
        await ensureDbDir();
        const filePath = path.join(DB_DIR, `${collection}.json`);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    },

    /**
     * Load data from a collection file
     * @param {string} collection - Collection name
     * @returns {Array} - Collection data
     */
    async loadCollection(collection) {
        await ensureDbDir();
        const filePath = path.join(DB_DIR, `${collection}.json`);
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            // If file doesn't exist, return empty array
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    },

    /**
     * Find all documents in a collection
     * @param {string} collection - Collection name
     * @returns {Array} - All documents
     */
    async findAll(collection) {
        return await this.loadCollection(collection);
    },

    /**
     * Find documents in a collection that match criteria
     * @param {string} collection - Collection name
     * @param {Object} criteria - Criteria to match
     * @returns {Array} - Matching documents
     */
    async find(collection, criteria = {}) {
        const data = await this.loadCollection(collection);
        return data.filter(item => {
            return Object.entries(criteria).every(([key, value]) => item[key] === value);
        });
    },

    /**
     * Find one document in a collection that matches criteria
     * @param {string} collection - Collection name
     * @param {Object} criteria - Criteria to match
     * @returns {Object|null} - First matching document or null
     */
    async findOne(collection, criteria = {}) {
        const results = await this.find(collection, criteria);
        return results.length > 0 ? results[0] : null;
    },

    /**
     * Find document by ID
     * @param {string} collection - Collection name
     * @param {string} id - Document ID
     * @returns {Object|null} - Document or null
     */
    async findById(collection, id) {
        const data = await this.loadCollection(collection);
        return data.find(item => item._id === id) || null;
    },

    /**
     * Create a new document
     * @param {string} collection - Collection name
     * @param {Object} document - Document to create
     * @returns {Object} - Created document with ID
     */
    async create(collection, document) {
        const data = await this.loadCollection(collection);
        const newDocument = {
            ...document,
            _id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        data.push(newDocument);
        await this.saveCollection(collection, data);
        return newDocument;
    },

    /**
     * Update a document
     * @param {string} collection - Collection name
     * @param {string} id - Document ID
     * @param {Object} update - Updated document fields
     * @returns {Object|null} - Updated document or null
     */
    async updateById(collection, id, update) {
        const data = await this.loadCollection(collection);
        const index = data.findIndex(item => item._id === id);
        if (index === -1) return null;
        
        const updatedDocument = {
            ...data[index],
            ...update,
            updatedAt: new Date().toISOString()
        };
        data[index] = updatedDocument;
        await this.saveCollection(collection, data);
        return updatedDocument;
    },

    /**
     * Delete a document
     * @param {string} collection - Collection name
     * @param {string} id - Document ID
     * @returns {boolean} - Success status
     */
    async deleteById(collection, id) {
        const data = await this.loadCollection(collection);
        const filteredData = data.filter(item => item._id !== id);
        if (filteredData.length === data.length) return false;
        
        await this.saveCollection(collection, filteredData);
        return true;
    }
};

module.exports = fileDb; 