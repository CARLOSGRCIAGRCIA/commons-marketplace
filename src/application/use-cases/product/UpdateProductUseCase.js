import { createUpdateProductDTO, createProductResponseDTO } from '../../dtos/products/index.js';
import {
    uploadMultipleImages,
    deleteMultipleImages,
    replaceImage,
} from '../../../core/services/fileService.js';
import { log } from '../../../infrastructure/logger/logger.js';

/**
 * Use case for updating an existing product with optional image updates.
 * Now supports category and subcategory validation.
 * @param {object} productRepository - The repository for product data.
 * @param {object} categoryRepository - The repository for category data.
 * @returns {Function} A function to execute the use case.
 */
export const updateProductUseCase =
    (productRepository, categoryRepository) =>
    async (
        productId,
        updateData,
        newMainImageFile = null,
        newAdditionalImagesFiles = [],
        action = 'keep',
    ) => {
        try {
            log.info('Attempting to update product', {
                productId,
                action,
                hasNewMainImage: !!newMainImageFile,
                newAdditionalImagesCount: newAdditionalImagesFiles.length,
            });

            const currentProduct = await productRepository.findById(productId);
            if (!currentProduct) {
                log.warn('Product not found for update', { productId });
                throw new Error('Product not found');
            }

            log.debug('Current product found', {
                productId,
                currentMainImage: currentProduct.mainImageUrl,
                currentImagesCount: currentProduct.imageUrls?.length || 0,
            });

            const updatedData = { ...updateData };

            // Category validation
            if (updateData.categoryId) {
                log.debug('Validating category', { categoryId: updateData.categoryId });
                const category = await categoryRepository.findById(updateData.categoryId);
                if (!category || !category.isActive) {
                    log.warn('Category not found or inactive', {
                        categoryId: updateData.categoryId,
                    });
                    throw new Error('Category not found or inactive.');
                }
                updatedData.categoryName = category.name;

                if (!updateData.subCategoryId) {
                    updatedData.subCategoryId = null;
                    updatedData.subCategoryName = null;
                }
            }

            // Subcategory validation
            if (updateData.subCategoryId) {
                log.debug('Validating subcategory', { subCategoryId: updateData.subCategoryId });
                const subCategory = await categoryRepository.findById(updateData.subCategoryId);
                if (!subCategory || !subCategory.isActive) {
                    log.warn('Subcategory not found or inactive', {
                        subCategoryId: updateData.subCategoryId,
                    });
                    throw new Error('Subcategory not found or inactive.');
                }

                const targetCategoryId = updateData.categoryId || currentProduct.categoryId;
                if (subCategory.parent?.toString() !== targetCategoryId) {
                    log.warn('Subcategory does not belong to category', {
                        subCategoryId: updateData.subCategoryId,
                        subCategoryParent: subCategory.parent,
                        targetCategoryId,
                    });
                    throw new Error('Subcategory does not belong to the selected category.');
                }

                updatedData.subCategoryName = subCategory.name;
            }

            // Main image update
            if (newMainImageFile) {
                log.debug('Replacing main image', { productId });
                const newMainImageUrl = await replaceImage(
                    currentProduct.mainImageUrl,
                    newMainImageFile,
                    { folder: 'products', prefix: 'main' },
                );
                updatedData.mainImageUrl = newMainImageUrl;
                log.debug('Main image replaced successfully', { productId, newMainImageUrl });
            }

            // Additional images handling
            if (action === 'replace') {
                log.debug('Replacing all additional images', {
                    productId,
                    currentImagesCount: currentProduct.imageUrls?.length || 0,
                    newImagesCount: newAdditionalImagesFiles.length,
                });

                if (currentProduct.imageUrls && currentProduct.imageUrls.length > 0) {
                    await deleteMultipleImages(currentProduct.imageUrls);
                }

                if (newAdditionalImagesFiles && newAdditionalImagesFiles.length > 0) {
                    const filesToUpload = newAdditionalImagesFiles.slice(0, 5);
                    const newImageUrls = await uploadMultipleImages(filesToUpload, {
                        folder: 'products',
                        prefix: 'gallery',
                    });
                    updatedData.imageUrls = newImageUrls;
                    log.debug('Additional images replaced', {
                        productId,
                        count: newImageUrls.length,
                    });
                } else {
                    updatedData.imageUrls = [];
                    log.debug('All additional images removed', { productId });
                }
            } else if (action === 'add') {
                const currentImages = currentProduct.imageUrls || [];
                const remainingSlots = 5 - currentImages.length;

                log.debug('Adding additional images', {
                    productId,
                    currentImagesCount: currentImages.length,
                    remainingSlots,
                    newImagesCount: newAdditionalImagesFiles.length,
                });

                if (
                    remainingSlots > 0 &&
                    newAdditionalImagesFiles &&
                    newAdditionalImagesFiles.length > 0
                ) {
                    const filesToUpload = newAdditionalImagesFiles.slice(0, remainingSlots);
                    const newImageUrls = await uploadMultipleImages(filesToUpload, {
                        folder: 'products',
                        prefix: 'gallery',
                    });
                    updatedData.imageUrls = [...currentImages, ...newImageUrls];
                    log.debug('Additional images added', {
                        productId,
                        addedCount: newImageUrls.length,
                        totalCount: updatedData.imageUrls.length,
                    });
                }
            }

            const updateProductDTO = createUpdateProductDTO(updatedData);
            const updatedProduct = await productRepository.updateById(productId, updateProductDTO);

            log.info('Product updated successfully', {
                productId,
                productName: updatedProduct.name,
                action,
            });

            return createProductResponseDTO(updatedProduct);
        } catch (error) {
            log.error('Error in updateProductUseCase', {
                productId,
                error: error.message,
                stack: error.stack,
            });
            throw new Error(`Failed to update product: ${error.message}`);
        }
    };
