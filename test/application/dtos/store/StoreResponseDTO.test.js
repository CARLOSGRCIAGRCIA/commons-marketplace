import { createStoreResponseDTO } from '../../../../src/application/dtos/stores/StoreResponseDTO.js';

describe('StoreResponseDTO Tests', () => {
    it('should create a valid StoreResponseDTO from database object with _id', () => {
        const store = {
            _id: '507f1f77bcf86cd799439011',
            userId: 'user123',
            storeName: 'My Test Store',
            description: 'A test store description',
            logo: 'https://example.com/logo.jpg',
            status: 'Approved',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-02T00:00:00.000Z',
        };

        const dto = createStoreResponseDTO(store);

        expect(dto).toEqual({
            id: '507f1f77bcf86cd799439011',
            userId: 'user123',
            storeName: 'My Test Store',
            description: 'A test store description',
            logo: 'https://example.com/logo.jpg',
            status: 'Approved',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-02T00:00:00.000Z',
        });
        expect(Object.isFrozen(dto)).toBe(true);
    });

    it('should create a valid StoreResponseDTO from database object with id', () => {
        const store = {
            id: 'store123',
            userId: 'user123',
            storeName: 'My Test Store',
            description: 'A test store description',
            logo: 'https://example.com/logo.jpg',
            status: 'Pending',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-02T00:00:00.000Z',
        };

        const dto = createStoreResponseDTO(store);

        expect(dto).toEqual({
            id: 'store123',
            userId: 'user123',
            storeName: 'My Test Store',
            description: 'A test store description',
            logo: 'https://example.com/logo.jpg',
            status: 'Pending',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-02T00:00:00.000Z',
        });
        expect(Object.isFrozen(dto)).toBe(true);
    });

    it('should handle null logo', () => {
        const store = {
            id: 'store123',
            userId: 'user123',
            storeName: 'My Test Store',
            description: 'A test store description',
            logo: null,
            status: 'Approved',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-02T00:00:00.000Z',
        };

        const dto = createStoreResponseDTO(store);

        expect(dto.logo).toBe(null);
    });

    it('should handle undefined logo', () => {
        const store = {
            id: 'store123',
            userId: 'user123',
            storeName: 'My Test Store',
            description: 'A test store description',
            status: 'Approved',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-02T00:00:00.000Z',
        };

        const dto = createStoreResponseDTO(store);

        expect(dto.logo).toBe(null);
    });

    it('should return null when store is null', () => {
        const dto = createStoreResponseDTO(null);

        expect(dto).toBe(null);
    });

    it('should return null when store is undefined', () => {
        const dto = createStoreResponseDTO(undefined);

        expect(dto).toBe(null);
    });

    it('should return null when store is false', () => {
        const dto = createStoreResponseDTO(false);

        expect(dto).toBe(null);
    });

    it('should handle store with minimal fields', () => {
        const store = {
            id: 'store123',
            userId: 'user123',
            storeName: 'My Test Store',
            status: 'Approved',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-02T00:00:00.000Z',
        };

        const dto = createStoreResponseDTO(store);

        expect(dto).toEqual({
            id: 'store123',
            userId: 'user123',
            storeName: 'My Test Store',
            description: undefined,
            logo: null,
            status: 'Approved',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-02T00:00:00.000Z',
        });
    });

    it('should prioritize _id over id if both exist', () => {
        const store = {
            _id: '507f1f77bcf86cd799439011',
            id: 'store123',
            userId: 'user123',
            storeName: 'My Test Store',
            status: 'Approved',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-02T00:00:00.000Z',
        };

        const dto = createStoreResponseDTO(store);

        expect(dto.id).toBe('507f1f77bcf86cd799439011');
    });
});
