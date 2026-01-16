import { createCreateStoreDTO } from '../../../../src/application/dtos/stores/CreateStoreDTO.js';

describe('CreateStoreDTO Tests', () => {
    it('should create a valid CreateStoreDTO with all fields', () => {
        const data = {
            userId: 'user123',
            storeName: 'My Test Store',
            description: 'A test store description',
            logo: 'https://example.com/logo.jpg',
        };

        const dto = createCreateStoreDTO(data);

        expect(dto).toEqual({
            userId: 'user123',
            storeName: 'My Test Store',
            description: 'A test store description',
            logo: 'https://example.com/logo.jpg',
        });
        expect(Object.isFrozen(dto)).toBe(true);
    });

    it('should create a valid CreateStoreDTO with only required fields', () => {
        const data = {
            userId: 'user123',
            storeName: 'My Test Store',
        };

        const dto = createCreateStoreDTO(data);

        expect(dto).toEqual({
            userId: 'user123',
            storeName: 'My Test Store',
            description: '',
            logo: null,
        });
        expect(Object.isFrozen(dto)).toBe(true);
    });

    it('should set default values for optional fields when not provided', () => {
        const data = {
            userId: 'user123',
            storeName: 'My Test Store',
        };

        const dto = createCreateStoreDTO(data);

        expect(dto.description).toBe('');
        expect(dto.logo).toBe(null);
    });

    it('should handle null and undefined for optional fields', () => {
        const data = {
            userId: 'user123',
            storeName: 'My Test Store',
            description: null,
            logo: undefined,
        };

        const dto = createCreateStoreDTO(data);

        expect(dto.description).toBe('');
        expect(dto.logo).toBe(null);
    });

    it('should throw error when userId is missing', () => {
        const data = {
            storeName: 'My Test Store',
            description: 'A test store',
        };

        expect(() => createCreateStoreDTO(data)).toThrow(
            'userId and storeName are required to create a store.',
        );
    });

    it('should throw error when storeName is missing', () => {
        const data = {
            userId: 'user123',
            description: 'A test store',
        };

        expect(() => createCreateStoreDTO(data)).toThrow(
            'userId and storeName are required to create a store.',
        );
    });

    it('should throw error when both userId and storeName are missing', () => {
        const data = {
            description: 'A test store',
        };

        expect(() => createCreateStoreDTO(data)).toThrow(
            'userId and storeName are required to create a store.',
        );
    });

    it('should throw error when userId is empty string', () => {
        const data = {
            userId: '',
            storeName: 'My Test Store',
        };

        expect(() => createCreateStoreDTO(data)).toThrow(
            'userId and storeName are required to create a store.',
        );
    });

    it('should throw error when storeName is empty string', () => {
        const data = {
            userId: 'user123',
            storeName: '',
        };

        expect(() => createCreateStoreDTO(data)).toThrow(
            'userId and storeName are required to create a store.',
        );
    });
});
