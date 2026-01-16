import { getStoresByStatusUseCase } from '../../../../src/application/use-cases/store/GetStoresByStatusUseCase.js';
import { createStoreResponseDTO } from '../../../../src/application/dtos/stores/index.js';

describe('GetStoresByStatusUseCase Tests', () => {
    let storeRepository;
    let useCase;

    beforeEach(() => {
        storeRepository = {
            findAllByStatus: jest.fn(),
        };
        useCase = getStoresByStatusUseCase(storeRepository);
    });

    it('should return stores for valid status', async () => {
        const status = 'Approved';
        const mockStores = [
            {
                id: 'store1',
                name: 'Approved Store 1',
                status: 'Approved',
                logo: 'https://example.com/logo1.jpg',
            },
            {
                id: 'store2',
                name: 'Approved Store 2',
                status: 'Approved',
                logo: 'https://example.com/logo2.jpg',
            },
        ];

        storeRepository.findAllByStatus.mockResolvedValue(mockStores);

        const result = await useCase(status);

        expect(storeRepository.findAllByStatus).toHaveBeenCalledWith(status);
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual(createStoreResponseDTO(mockStores[0]));
        expect(result[1]).toEqual(createStoreResponseDTO(mockStores[1]));
    });

    it('should return empty array when no stores found for status', async () => {
        const status = 'Pending';

        storeRepository.findAllByStatus.mockResolvedValue([]);

        const result = await useCase(status);

        expect(result).toEqual([]);
    });

    it('should throw error for invalid status', async () => {
        const invalidStatus = 'InvalidStatus';

        await expect(useCase(invalidStatus)).rejects.toThrow(
            'Status must be one of: Pending, Approved, Rejected, Suspended',
        );
    });

    it('should throw error when status is not provided', async () => {
        await expect(useCase()).rejects.toThrow(
            'Status must be one of: Pending, Approved, Rejected, Suspended',
        );
        await expect(useCase(null)).rejects.toThrow(
            'Status must be one of: Pending, Approved, Rejected, Suspended',
        );
        await expect(useCase('')).rejects.toThrow(
            'Status must be one of: Pending, Approved, Rejected, Suspended',
        );
    });

    it('should handle all valid statuses', async () => {
        const validStatuses = ['Pending', 'Approved', 'Rejected', 'Suspended'];

        for (const status of validStatuses) {
            storeRepository.findAllByStatus.mockResolvedValue([]);

            await expect(useCase(status)).resolves.toEqual([]);
            expect(storeRepository.findAllByStatus).toHaveBeenCalledWith(status);
        }
    });

    it('should handle repository errors', async () => {
        const status = 'Approved';
        const repositoryError = new Error('Database error');

        storeRepository.findAllByStatus.mockRejectedValue(repositoryError);

        await expect(useCase(status)).rejects.toThrow('Database error');
    });
});
