// Mock for fileDb module
module.exports = {
    saveCollection: jest.fn().mockResolvedValue(true),
    loadCollection: jest.fn().mockResolvedValue([]),
    findAll: jest.fn().mockResolvedValue([]),
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    findById: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((collection, data) => {
        return Promise.resolve({
            ...data,
            _id: 'mock-id-123',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }),
    updateById: jest.fn().mockImplementation((collection, id, update) => {
        return Promise.resolve({
            _id: id,
            ...update,
            updatedAt: new Date().toISOString()
        });
    }),
    deleteById: jest.fn().mockResolvedValue(true)
}; 