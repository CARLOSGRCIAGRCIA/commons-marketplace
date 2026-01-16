import { createCreateProductDTO, createProductResponseDTO } from '../../dtos/products/index.js';
import { uploadImage, uploadMultipleImages } from '../../../core/services/fileService.js';
import { log } from '../../../infrastructure/logger/logger.js';

/**
 * Use case for creating a new product with image uploads.
 * Validates that the store exists, is approved, and belongs to the seller.
 * Also validates that the category and subcategory exist and are related.
 * @param {object} productRepository - The repository for product data.
 * @param {object} storeRepository - The repository for store data.
 * @param {object} categoryRepository - The repository for category data.
 * @returns {Function} A function to execute the use case.
 */
export const createProductUseCase =
    (productRepository, storeRepository, categoryRepository) =>
    /**
     * Executes the create product use case.
     * @param {object} productData - The product data to create.
     * @param {object} mainImageFile - The main image file (required).
     * @param {Array} [additionalImagesFiles] - Additional image files (max 5).
     * @returns {Promise<object>} The created product DTO.
     */
    async (productData, mainImageFile, additionalImagesFiles = []) => {
        log.info('Creating new product', {
            productName: productData.name,
            sellerId: productData.sellerId,
            storeId: productData.storeId,
        });

        if (!mainImageFile) {
            log.warn('Product creation failed: Main image not provided');
            throw new Error('Main product image is required');
        }

        if (!productData.storeId) {
            log.warn('Product creation failed: Store ID not provided');
            throw new Error('Store ID is required. Products must be associated with a store.');
        }

        if (!productData.categoryId) {
            log.warn('Product creation failed: Category ID not provided');
            throw new Error(
                'Category ID is required. Products must be associated with a category.',
            );
        }

        try {
            log.debug('Validating store', { storeId: productData.storeId });
            const store = await storeRepository.findById(productData.storeId);
            if (!store) {
                log.warn('Store not found', { storeId: productData.storeId });
                throw new Error('Store not found.');
            }

            if (store.userId !== productData.sellerId) {
                log.warn('Store ownership validation failed', {
                    storeUserId: store.userId,
                    sellerId: productData.sellerId,
                });
                throw new Error('You can only create products for your own stores.');
            }

            if (store.status !== 'Approved') {
                log.warn('Store not approved', {
                    storeId: productData.storeId,
                    status: store.status,
                });
                throw new Error(
                    `Cannot create products for a store with status: ${store.status}. Store must be Approved.`,
                );
            }

            log.debug('Validating category', { categoryId: productData.categoryId });
            const category = await categoryRepository.findById(productData.categoryId);
            if (!category || !category.isActive) {
                log.warn('Category not found or inactive', { categoryId: productData.categoryId });
                throw new Error('Category not found or inactive.');
            }

            let subCategory = null;
            let subCategoryName = null;

            if (productData.subCategoryId) {
                log.debug('Validating subcategory', { subCategoryId: productData.subCategoryId });
                subCategory = await categoryRepository.findById(productData.subCategoryId);
                if (!subCategory || !subCategory.isActive) {
                    log.warn('Subcategory not found or inactive', {
                        subCategoryId: productData.subCategoryId,
                    });
                    throw new Error('Subcategory not found or inactive.');
                }

                if (subCategory.parent?.toString() !== productData.categoryId) {
                    log.warn('Subcategory does not belong to category', {
                        subCategoryId: productData.subCategoryId,
                        categoryId: productData.categoryId,
                        subCategoryParent: subCategory.parent,
                    });
                    throw new Error('Subcategory does not belong to the selected category.');
                }

                subCategoryName = subCategory.name;
            }

            log.debug('Uploading main image');
            const mainImageUrl = await uploadImage(mainImageFile, {
                folder: 'products',
                prefix: 'main',
            });

            let imageUrls = [];
            if (additionalImagesFiles && additionalImagesFiles.length > 0) {
                const filesToUpload = additionalImagesFiles.slice(0, 5);
                log.debug('Uploading additional images', { count: filesToUpload.length });
                imageUrls = await uploadMultipleImages(filesToUpload, {
                    folder: 'products',
                    prefix: 'gallery',
                });
            }

            const productDataWithImages = {
                ...productData,
                categoryName: category.name,
                subCategoryId: productData.subCategoryId || null,
                subCategoryName: subCategoryName || null,
                mainImageUrl,
                imageUrls,
            };

            log.debug('Creating product in repository');
            const createProductDTO = createCreateProductDTO(productDataWithImages);
            const newProduct = await productRepository.create(createProductDTO);

            log.info('Product created successfully', {
                productId: newProduct.id,
                productName: newProduct.name,
            });

            return createProductResponseDTO(newProduct);
        } catch (error) {
            log.error('Error in createProductUseCase', {
                error: error.message,
                stack: error.stack,
                productData: {
                    name: productData.name,
                    storeId: productData.storeId,
                    categoryId: productData.categoryId,
                },
            });
            throw new Error(`Failed to create product: ${error.message}`);
        }
    };
