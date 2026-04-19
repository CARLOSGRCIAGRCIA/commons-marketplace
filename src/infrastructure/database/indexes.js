import { log } from '../logger/logger.js';
import UserModel from './mongo/models/UserModel.js';
import ProductModel from './mongo/models/ProductModel.js';
import StoreModel from './mongo/models/StoreModel.js';
import CategoryModel from './mongo/models/CategoryModel.js';
import ReviewModel from './mongo/models/ReviewModel.js';

/**
 * Create database indexes for improved query performance
 * @returns {Promise<void>}
 */
export const createIndexes = async () => {
    try {
        log.info('Creating database indexes...');

        await createUserIndexes();
        await createProductIndexes();
        await createStoreIndexes();
        await createCategoryIndexes();
        await createReviewIndexes();

        log.info('Database indexes created successfully');
    } catch (error) {
        log.error('Error creating database indexes', {
            error: error.message,
            stack: error.stack,
        });
        throw error;
    }
};

/**
 * Create user indexes
 * @returns {Promise<void>}
 */
const createUserIndexes = async () => {
    const indexes = [
        { key: { email: 1 }, unique: true, name: 'email_unique' },
        { key: { role: 1 }, name: 'role_index' },
        { key: { createdAt: -1 }, name: 'createdAt_index' },
    ];

    for (const index of indexes) {
        try {
            await UserModel.collection.createIndex(index.key, index);
        } catch (error) {
            if (error.code !== 85) {
                throw error;
            }
        }
    }

    log.debug('User indexes created');
};

/**
 * Create product indexes
 * @returns {Promise<void>}
 */
const createProductIndexes = async () => {
    const indexes = [
        { key: { store: 1, isActive: 1 }, name: 'store_active' },
        { key: { category: 1, isActive: 1 }, name: 'category_active' },
        { key: { price: 1 }, name: 'price_index' },
        { key: { name: 'text' }, name: 'name_text' },
        { key: { createdAt: -1 }, name: 'createdAt_index' },
    ];

    for (const index of indexes) {
        try {
            await ProductModel.collection.createIndex(index.key, index);
        } catch (error) {
            if (error.code !== 85) {
                throw error;
            }
        }
    }

    log.debug('Product indexes created');
};

/**
 * Create store indexes
 * @returns {Promise<void>}
 */
const createStoreIndexes = async () => {
    const indexes = [
        { key: { status: 1, createdAt: -1 }, name: 'status_created' },
        { key: { user: 1 }, name: 'user_index' },
        { key: { slug: 1 }, unique: true, name: 'slug_unique' },
        { key: { name: 'text' }, name: 'name_text' },
    ];

    for (const index of indexes) {
        try {
            await StoreModel.collection.createIndex(index.key, index);
        } catch (error) {
            if (error.code !== 85) {
                throw error;
            }
        }
    }

    log.debug('Store indexes created');
};

/**
 * Create category indexes
 * @returns {Promise<void>}
 */
const createCategoryIndexes = async () => {
    const indexes = [
        { key: { slug: 1 }, unique: true, name: 'slug_unique' },
        { key: { level: 1, parent: 1 }, name: 'level_parent' },
        { key: { isActive: 1 }, name: 'active_index' },
    ];

    for (const index of indexes) {
        try {
            await CategoryModel.collection.createIndex(index.key, index);
        } catch (error) {
            if (error.code !== 85) {
                throw error;
            }
        }
    }

    log.debug('Category indexes created');
};

/**
 * Create review indexes
 * @returns {Promise<void>}
 */
const createReviewIndexes = async () => {
    const indexes = [
        { key: { product: 1, createdAt: -1 }, name: 'product_created' },
        { key: { user: 1, product: 1 }, unique: true, name: 'user_product' },
        { key: { rating: 1 }, name: 'rating_index' },
    ];

    for (const index of indexes) {
        try {
            await ReviewModel.collection.createIndex(index.key, index);
        } catch (error) {
            if (error.code !== 85) {
                throw error;
            }
        }
    }

    log.debug('Review indexes created');
};

/**
 * Drop all indexes (for development/reset)
 * @returns {Promise<void>}
 */
export const dropIndexes = async () => {
    try {
        log.warn('Dropping all indexes...');

        await UserModel.collection.dropIndexes();
        await ProductModel.collection.dropIndexes();
        await StoreModel.collection.dropIndexes();
        await CategoryModel.collection.dropIndexes();
        await ReviewModel.collection.dropIndexes();

        log.info('All indexes dropped');
    } catch (error) {
        log.error('Error dropping indexes', { error: error.message });
    }
};

export default createIndexes;
