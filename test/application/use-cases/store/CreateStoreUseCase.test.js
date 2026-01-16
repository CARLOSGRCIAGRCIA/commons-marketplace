import { createStoreUseCase } from '../../../../src/application/use-cases/store/CreateStoreUseCase.js';
import {
    createCreateStoreDTO,
    createStoreResponseDTO,
} from '../../../../src/application/dtos/stores/index.js';

describe('CreateStoreUseCase Tests', () => {
    let storeRepository;
    let fileService;
    let useCase;

    beforeEach(() => {
        storeRepository = {
            countByUserId: jest.fn(),
            create: jest.fn(),
        };
        fileService = {
            uploadImage: jest.fn(),
        };
        useCase = createStoreUseCase(storeRepository, fileService);
    });

    it('should create a store successfully without logo', async () => {
        const storeData = {
            userId: 'user123',
            storeName: 'Test Store',
            description: 'Test description',
        };

        const mockStore = {
            id: 'store123',
            ...storeData,
            logo: null,
        };

        storeRepository.countByUserId.mockResolvedValue(0);
        storeRepository.create.mockResolvedValue(mockStore);

        const result = await useCase(storeData);

        expect(storeRepository.countByUserId).toHaveBeenCalledWith('user123');
        expect(storeRepository.create).toHaveBeenCalledWith(
            createCreateStoreDTO({ ...storeData, logo: null }),
        );
        expect(result).toEqual(createStoreResponseDTO(mockStore));
        expect(fileService.uploadImage).not.toHaveBeenCalled();
    });

    it('should create a store successfully with logo', async () => {
        const storeData = {
            userId: 'user123',
            storeName: 'Test Store',
            description: 'Test description',
        };
        const file = { filename: 'logo.jpg' };
        const logoUrl = 'https://example.com/logo.jpg';

        const mockStore = {
            id: 'store123',
            ...storeData,
            logo: logoUrl,
        };

        storeRepository.countByUserId.mockResolvedValue(0);
        fileService.uploadImage.mockResolvedValue(logoUrl);
        storeRepository.create.mockResolvedValue(mockStore);

        const result = await useCase(storeData, file);

        expect(fileService.uploadImage).toHaveBeenCalledWith(file, {
            folder: 'stores',
            prefix: 'logo',
        });
        expect(storeRepository.create).toHaveBeenCalledWith(
            createCreateStoreDTO({ ...storeData, logo: logoUrl }),
        );
        expect(result).toEqual(createStoreResponseDTO(mockStore));
    });

    it('should throw error when user has reached store limit', async () => {
        const storeData = {
            userId: 'user123',
            storeName: 'Test Store',
            description: 'Test description',
        };

        storeRepository.countByUserId.mockResolvedValue(2);

        await expect(useCase(storeData)).rejects.toThrow(
            'User has reached the maximum limit of 2 stores.',
        );
    });

    it('should throw error when userId is missing', async () => {
        const storeData = {
            storeName: 'Test Store',
            description: 'Test description',
        };

        await expect(useCase(storeData)).rejects.toThrow(
            'userId and storeName are required to create a store.',
        );
    });

    it('should throw error when storeName is missing', async () => {
        const storeData = {
            userId: 'user123',
            description: 'Test description',
        };

        await expect(useCase(storeData)).rejects.toThrow(
            'userId and storeName are required to create a store.',
        );
    });

    it('should handle file upload errors', async () => {
        const storeData = {
            userId: 'user123',
            storeName: 'Test Store',
            description: 'Test description',
        };
        const file = { filename: 'logo.jpg' };
        const uploadError = new Error('Upload failed');

        storeRepository.countByUserId.mockResolvedValue(0);
        fileService.uploadImage.mockRejectedValue(uploadError);

        await expect(useCase(storeData, file)).rejects.toThrow('Upload failed');
    });

    it('should handle repository errors', async () => {
        const storeData = {
            userId: 'user123',
            storeName: 'Test Store',
            description: 'Test description',
        };
        const repositoryError = new Error('Database error');

        storeRepository.countByUserId.mockResolvedValue(0);
        storeRepository.create.mockRejectedValue(repositoryError);

        await expect(useCase(storeData)).rejects.toThrow('Database error');
    });
});
