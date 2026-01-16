import { createUpdateStoreDTO, createStoreResponseDTO } from '../../dtos/stores/index.js';
import { log } from '../../../infrastructure/logger/logger.js';

/**
 * Use case for updating a store.
 * Can be used by the owner or admin.
 * @param {object} storeRepository - The repository for store data.
 * @param {object} fileService - The file service for handling images.
 * @returns {function(string, object, object): Promise<object|null>} A function to execute the use case.
 */
export const updateStoreUseCase =
    (storeRepository, fileService) =>
    async (storeId, updateData, file = null) => {
        try {
            if (!storeId) {
                log.warn('Attempted to update store without ID');
                throw new Error('Store ID is required for update.');
            }

            log.info('Attempting to update store', {
                storeId,
                hasNewLogo: !!file,
            });

            const store = await storeRepository.findById(storeId);
            if (!store) {
                log.warn('Store not found for update', { storeId });
                throw new Error('Store not found.');
            }

            if (file) {
                log.debug('Uploading new store logo', { storeId });
                const newLogoUrl = await fileService.uploadImage(file, {
                    folder: 'stores',
                    prefix: 'logo',
                });

                if (store.logo) {
                    log.debug('Deleting old store logo', {
                        storeId,
                        oldLogo: store.logo,
                    });
                    try {
                        await fileService.deleteImage(store.logo);
                        log.debug('Old store logo deleted successfully', { storeId });
                    } catch (error) {
                        log.warn('Could not delete old logo', {
                            storeId,
                            oldLogo: store.logo,
                            error: error.message,
                        });
                    }
                }

                updateData.logo = newLogoUrl;
                log.debug('New store logo uploaded successfully', {
                    storeId,
                    newLogo: newLogoUrl,
                });
            }

            const updateStoreDTO = createUpdateStoreDTO(updateData);
            const updatedStore = await storeRepository.updateById(storeId, updateStoreDTO);

            log.info('Store updated successfully', {
                storeId,
                storeName: updatedStore.name,
            });

            return createStoreResponseDTO(updatedStore);
        } catch (error) {
            log.error('Error in updateStoreUseCase', {
                storeId,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };
