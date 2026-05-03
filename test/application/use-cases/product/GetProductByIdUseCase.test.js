import { jest } from '@jest/globals';

jest.mock('../../../../src/infrastructure/cache/cacheManager.js');

import { getProductByIdUseCase } from '../../../../src/application/use-cases/product/GetProductByIdUseCase.js';
import { createProductResponseDTO } from '../../../../src/application/dtos/products/ProductResponseDTO.js';
import { cacheManager, CACHE_TTL } from '../../../../src/infrastructure/cache/cacheManager.js';

describe('GetProductByIdUseCase Tests', () => {
    let productRepository;
    let useCase;

    beforeEach(() => {
        productRepository = {
            findByIdOrSlug: jest.fn(),
        };
        useCase = getProductByIdUseCase(productRepository);
        jest.clearAllMocks();
        cacheManager.get.mockReturnValue(null);
        CACHE_TTL.PRODUCTS = 300;
    });

    it('should return a product DTO when found', async () => {
        const mockProduct = { id: '1', name: 'Test Product' };
        productRepository.findByIdOrSlug.mockResolvedValue(mockProduct);

        const result = await useCase('1');

        expect(productRepository.findByIdOrSlug).toHaveBeenCalledWith('1');
        expect(result).toEqual(createProductResponseDTO(mockProduct));
    });

    it('should return null when product is not found', async () => {
        productRepository.findByIdOrSlug.mockResolvedValue(null);

        const result = await useCase('1');

        expect(productRepository.findByIdOrSlug).toHaveBeenCalledWith('1');
        expect(result).toBeNull();
    });

    it('should handle repository errors', async () => {
        const error = new Error('DB error');
        productRepository.findByIdOrSlug.mockRejectedValue(error);

        await expect(useCase('1')).rejects.toThrow(error);
    });
});
