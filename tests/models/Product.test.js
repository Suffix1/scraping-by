const Product = require('../../models/Product');
const db = require('../../db/fileDb');

// Mock the file database
jest.mock('../../db/fileDb');

describe('Product Model', () => {
    beforeEach(() => {
        // Clear all mock implementations
        jest.clearAllMocks();
        
        // Mock database functions
        db.findOne.mockResolvedValue(null);
        db.create.mockImplementation(async (collection, data) => {
            return {
                ...data,
                _id: 'test-id-123',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        });
    });

    it('should create a new product successfully', async () => {
        const productData = {
            url: 'https://www.uniqlo.com/nl/nl/test-product',
            name: 'Test Product',
            currentPrice: 29.99,
            originalPrice: 39.99
        };

        const product = await Product.create(productData);

        expect(db.findOne).toHaveBeenCalledWith('products', { url: productData.url });
        expect(db.create).toHaveBeenCalled();
        expect(product._id).toBeDefined();
        expect(product.url).toBe(productData.url);
        expect(product.name).toBe(productData.name);
        expect(product.currentPrice).toBe(productData.currentPrice);
        expect(product.originalPrice).toBe(productData.originalPrice);
        expect(product.lastChecked).toBeDefined();
        expect(product.emailSent).toBe(false);
    });

    it('should not create a product without required fields', async () => {
        const productData = {
            url: 'https://www.uniqlo.com/nl/nl/test-product'
        };

        await expect(Product.create(productData)).rejects.toThrow();
        expect(db.create).not.toHaveBeenCalled();
    });

    it('should not allow duplicate URLs', async () => {
        // Mock finding an existing product
        db.findOne.mockResolvedValueOnce({
            _id: 'existing-id',
            url: 'https://www.uniqlo.com/nl/nl/test-product'
        });

        const productData = {
            url: 'https://www.uniqlo.com/nl/nl/test-product',
            name: 'Test Product',
            currentPrice: 29.99,
            originalPrice: 39.99
        };

        await expect(Product.create(productData)).rejects.toThrow();
        expect(db.create).not.toHaveBeenCalled();
    });

    it('should find all products', async () => {
        const mockProducts = [
            { _id: '1', name: 'Product 1' },
            { _id: '2', name: 'Product 2' }
        ];
        db.findAll.mockResolvedValueOnce(mockProducts);

        const products = await Product.find();
        
        expect(db.findAll).toHaveBeenCalledWith('products');
        expect(products).toEqual(mockProducts);
    });

    it('should find product by ID', async () => {
        const mockProduct = { _id: 'test-id', name: 'Test Product' };
        db.findById.mockResolvedValueOnce(mockProduct);

        const product = await Product.findById('test-id');
        
        expect(db.findById).toHaveBeenCalledWith('products', 'test-id');
        expect(product).toEqual(mockProduct);
    });

    it('should update product by ID', async () => {
        const mockProduct = { 
            _id: 'test-id', 
            name: 'Updated Product',
            currentPrice: 19.99
        };
        db.updateById.mockResolvedValueOnce(mockProduct);

        const product = await Product.findByIdAndUpdate('test-id', { 
            name: 'Updated Product',
            currentPrice: 19.99
        });
        
        expect(db.updateById).toHaveBeenCalledWith('products', 'test-id', { 
            name: 'Updated Product',
            currentPrice: 19.99
        });
        expect(product).toEqual(mockProduct);
    });

    it('should delete product by ID', async () => {
        db.deleteById.mockResolvedValueOnce(true);

        const result = await Product.findByIdAndDelete('test-id');
        
        expect(db.deleteById).toHaveBeenCalledWith('products', 'test-id');
        expect(result).toBe(true);
    });
}); 