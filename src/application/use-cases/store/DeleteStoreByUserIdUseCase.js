import { createStoreResponseDTO } from '../../dtos/stores/index.js';
import { log } from '../../../infrastructure/logger/logger.js';

/**
 * Use case for deleting a store by its ID.
 * Can be used by the owner or admin.
 * @param {object} storeRepository - The repository for store data.
 * @param {object} fileService - The file service for handling images.
 * @returns {function(string): Promise<object|null>} A function to execute the use case.
 */
export const deleteStoreUseCase = (storeRepository, fileService) => async (storeId) => {
    try {
        if (!storeId) {
            log.warn('Attempted to delete store without ID');
            throw new Error('Store ID is required to delete a store.');
        }

        log.info('Attempting to delete store', { storeId });

        const store = await storeRepository.findById(storeId);
        if (!store) {
            log.warn('Store not found for deletion', { storeId });
            return null;
        }

        if (store.logo) {
            log.debug('Deleting store logo', { storeId, logo: store.logo });
            try {
                await fileService.deleteImage(store.logo);
                log.debug('Store logo deleted successfully', { storeId });
            } catch (error) {
                log.warn('Could not delete store logo', {
                    storeId,
                    logo: store.logo,
                    error: error.message,
                });
            }
        }

        const deletedStore = await storeRepository.deleteById(storeId);
        log.info('Store deleted successfully', {
            storeId,
            storeName: deletedStore.name,
        });

        return createStoreResponseDTO(deletedStore);
    } catch (error) {
        log.error('Error in deleteStoreUseCase', {
            storeId,
            error: error.message,
            stack: error.stack,
        });
        throw error;
    }
};
