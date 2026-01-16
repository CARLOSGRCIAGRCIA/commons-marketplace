import { deleteImage, deleteMultipleImages } from '../../../core/services/fileService.js';
import { createProductResponseDTO } from '../../dtos/products/index.js';
import { log } from '../../../infrastructure/logger/logger.js';

/**
 * Use case for deleting a product and its associated images.
 * @param {object} productRepository - The repository for product data.
 * @returns {Function} A function to execute the use case.
 */
export const deleteProductUseCase =
    (productRepository) =>
    /**
     * Executes the delete product use case.
     * @param {string} productId - The ID of the product to delete.
     * @returns {Promise<object|null>} The deleted product DTO or null if not found.
     */
    async (productId) => {
        try {
            log.info('Attempting to delete product', { productId });

            const product = await productRepository.findById(productId);
            if (!product) {
                log.warn('Product not found for deletion', { productId });
                return null;
            }

            log.debug('Product found, proceeding with image deletion', {
                productId,
                hasMainImage: !!product.mainImageUrl,
                additionalImagesCount: product.imageUrls?.length || 0,
            });

            if (product.mainImageUrl) {
                try {
                    await deleteImage(product.mainImageUrl);
                    log.debug('Main image deleted successfully', { productId });
                } catch (error) {
                    log.warn('Failed to delete main image', {
                        productId,
                        error: error.message,
                        imageUrl: product.mainImageUrl,
                    });
                }
            }

            if (product.imageUrls && product.imageUrls.length > 0) {
                try {
                    await deleteMultipleImages(product.imageUrls);
                    log.debug('Additional images deleted successfully', {
                        productId,
                        count: product.imageUrls.length,
                    });
                } catch (error) {
                    log.warn('Failed to delete additional images', {
                        productId,
                        error: error.message,
                        count: product.imageUrls.length,
                    });
                }
            }

            const deletedProduct = await productRepository.deleteById(productId);
            log.info('Product deleted successfully', {
                productId,
                productName: deletedProduct.name,
            });

            return createProductResponseDTO(deletedProduct);
        } catch (error) {
            log.error('Error in deleteProductUseCase', {
                productId,
                error: error.message,
                stack: error.stack,
            });
            throw new Error(`Failed to delete product: ${error.message}`);
        }
    };
