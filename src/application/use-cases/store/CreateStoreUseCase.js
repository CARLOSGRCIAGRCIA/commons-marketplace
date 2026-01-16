import { createCreateStoreDTO, createStoreResponseDTO } from '../../dtos/stores/index.js';

/**
 * Use case for creating a new store.
 * Users can create a maximum of 2 stores.
 * @param {object} storeRepository - The repository for store data.
 * @param {object} fileService - The file service for handling images.
 * @returns {function(object, object): Promise<object>} A function to execute the use case.
 */
export const createStoreUseCase =
    (storeRepository, fileService) =>
    async (storeData, file = null) => {
        const storeCount = await storeRepository.countByUserId(storeData.userId);

        if (storeCount >= 2) {
            throw new Error('User has reached the maximum limit of 2 stores.');
        }

        let logoUrl = null;
        if (file) {
            logoUrl = await fileService.uploadImage(file, {
                folder: 'stores',
                prefix: 'logo',
            });
        }

        const createStoreDTO = createCreateStoreDTO({
            ...storeData,
            logo: logoUrl,
        });

        const newStore = await storeRepository.create(createStoreDTO);
        return createStoreResponseDTO(newStore);
    };
