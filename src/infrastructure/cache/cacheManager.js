import NodeCache from 'node-cache';
import { getEnvironmentConfig } from '../../config/environment.js';
import { log } from '../logger/logger.js';

const envConfig = getEnvironmentConfig();

const isTest = envConfig.nodeEnv === 'test';

/**
 * Cache manager for application data.
 * Provides in-memory caching for categories, products, and admin stats.
 * Uses node-cache with automatic expiration.
 * @description In-memory cache manager class
 */
class CacheManager {
    /**
     * Constructs a new CacheManager instance.
     * @param {number} defaultTtl - Default time to live in seconds
     * @param {number} checkPeriod - Check period for expired keys
     */
    constructor(defaultTtl = 300, checkPeriod = 60) {
        this.cache = new NodeCache({
            stdTTL: isTest ? 1 : defaultTtl,
            checkperiod: isTest ? 1 : checkPeriod,
            useClones: false,
            enableEarlyTTL: true,
        });

        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            errors: 0,
        };

        this.cache.on('expired', (key, value) => {
            log.debug('Cache key expired', { key });
        });

        log.info('CacheManager initialized', {
            defaultTtl: isTest ? 1 : defaultTtl,
            checkPeriod: isTest ? 1 : checkPeriod,
        });
    }

    /**
     * Get value from cache
     * @param {string} key - Cache key
     * @returns {any|null} Cached value or null
     */
    get(key) {
        try {
            const value = this.cache.get(key);
            if (value === undefined) {
                this.stats.misses++;
                return null;
            }
            this.stats.hits++;
            return value;
        } catch (error) {
            log.error('Cache get error', { key, error: error.message });
            this.stats.errors++;
            return null;
        }
    }

    /**
     * Set value in cache
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} [ttl] - Time to live in seconds
     * @returns {boolean} Success
     */
    set(key, value, ttl) {
        try {
            const success = this.cache.set(key, value, ttl);
            if (success) {
                this.stats.sets++;
            }
            return success;
        } catch (error) {
            log.error('Cache set error', { key, error: error.message });
            this.stats.errors++;
            return false;
        }
    }

    /**
     * Delete key from cache
     * @param {string} key - Cache key
     * @returns {boolean} Success
     */
    del(key) {
        try {
            const success = this.cache.del(key) > 0;
            if (success) {
                this.stats.deletes++;
            }
            return success;
        } catch (error) {
            log.error('Cache delete error', { key, error: error.message });
            this.stats.errors++;
            return false;
        }
    }

    /**
     * Delete keys matching pattern
     * @param {string} pattern - Key pattern (prefix)
     * @returns {number} Number of deleted keys
     */
    delPattern(pattern) {
        try {
            const keys = this.cache.keys();
            const matchingKeys = keys.filter((key) => key.startsWith(pattern));
            let deleted = 0;
            matchingKeys.forEach((key) => {
                if (this.del(key)) {
                    deleted++;
                }
            });
            return deleted;
        } catch (error) {
            log.error('Cache delete pattern error', { pattern, error: error.message });
            this.stats.errors++;
            return 0;
        }
    }

    /**
     * Check if key exists
     * @param {string} key - Cache key
     * @returns {boolean} Exists
     */
    has(key) {
        try {
            return this.cache.has(key);
        } catch (error) {
            return false;
        }
    }

    /**
     * Clear all cache
     * @returns {void}
     */
    flushAll() {
        try {
            this.cache.flushAll();
            log.info('Cache flushed');
        } catch (error) {
            log.error('Cache flush error', { error: error.message });
        }
    }

    /**
     * Get cache statistics
     * @returns {object} Statistics
     */
    getStats() {
        return {
            ...this.stats,
            keys: this.cache.keys().length,
            hitRate:
                this.stats.hits + this.stats.misses > 0
                    ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
                    : 0,
        };
    }

    /**
     * Get TTL for key
     * @param {string} key - Cache key
     * @returns {number} TTL in seconds
     */
    getTtl(key) {
        try {
            const ttl = this.cache.getTtl(key);
            return ttl > 0 ? ttl : 0;
        } catch (error) {
            return 0;
        }
    }
}

/**
 * Default TTL values for different data types (in seconds)
 */
export const CACHE_TTL = {
    CATEGORIES: 600,
    MAIN_CATEGORIES: 600,
    SUBCATEGORIES: 600,
    PRODUCTS: 300,
    POPULAR_PRODUCTS: 300,
    ADMIN_STATS: 60,
    STORE_PRODUCTS: 300,
};

/**
 * Cache key prefixes
 */
export const CACHE_KEYS = {
    CATEGORIES: 'categories:all',
    MAIN_CATEGORIES: 'categories:main',
    SUBCATEGORIES: 'categories:sub:',
    PRODUCTS: 'products:all',
    POPULAR_PRODUCTS: 'products:popular',
    STORE_PRODUCTS: 'products:store:',
    ADMIN_STATS: 'admin:stats',
    SEARCH: 'search:',
};

/**
 * Default cache manager instance
 */
export const cacheManager = new CacheManager(300, 60);

/**
 * Get cached data or fetch from source
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Function to fetch data if not cached
 * @param {number} [ttl] - Time to live
 * @returns {Promise<any>} Cached or fetched data
 */
export const getCachedOrFetch = async (key, fetchFn, ttl) => {
    const cached = cacheManager.get(key);
    if (cached !== null) {
        return cached;
    }

    const data = await fetchFn();
    cacheManager.set(key, data, ttl);
    return data;
};

/**
 * Invalidate cache by prefix
 * @param {string} prefix - Key prefix
 * @returns {number} Number of invalidated keys
 */
export const invalidateCache = (prefix) => {
    return cacheManager.delPattern(prefix);
};

export default cacheManager;
