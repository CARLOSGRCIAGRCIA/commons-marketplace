import { getProductByIdUseCase } from '../../../../src/application/use-cases/product/GetProductByIdUseCase.js';
import { createProductResponseDTO } from '../../../../src/application/dtos/products/ProductResponseDTO.js';
import { jest } from '@jest/globals';

describe('GetProductByIdUseCase Tests', () => {
    let productRepository;
    let useCase;

    beforeEach(() => {
        productRepository = {
            findById: jest.fn(),
        };
        useCase = getProductByIdUseCase(productRepository);
    });

    it('should return a product DTO when found', async () => {
        const mockProduct = { id: '1', name: 'Test Product' };
        productRepository.findById.mockResolvedValue(mockProduct);

        const result = await useCase('1');

        expect(productRepository.findById).toHaveBeenCalledWith('1');
        expect(result).toEqual(createProductResponseDTO(mockProduct));
    });

    it('should return DTO with null when product is not found', async () => {
        productRepository.findById.mockResolvedValue(null);

        const result = await useCase('1');

        expect(productRepository.findById).toHaveBeenCalledWith('1');
        expect(result).toEqual(createProductResponseDTO(null));
    });

    it('should handle repository errors', async () => {
        const error = new Error('DB error');
        productRepository.findById.mockRejectedValue(error);

        await expect(useCase('1')).rejects.toThrow(error);
    });
});
