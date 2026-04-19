import { cacheManager, CACHE_TTL, CACHE_KEYS, invalidateCache, getCachedOrFetch } from '../../../src/infrastructure/cache/cacheManager.js';

describe('CacheManager', () => {
    describe('Constants', () => {
        it('should have CACHE_TTL defined', () => {
            expect(CACHE_TTL).toBeDefined();
        });

        it('should have CACHE_KEYS defined', () => {
            expect(CACHE_KEYS).toBeDefined();
        });
    });

    describe('cacheManager', () => {
        it('should have get method', () => {
            expect(typeof cacheManager.get).toBe('function');
        });

        it('should have set method', () => {
            expect(typeof cacheManager.set).toBe('function');
        });

        it('should have del method', () => {
            expect(typeof cacheManager.del).toBe('function');
        });

        it('should have has method', () => {
            expect(typeof cacheManager.has).toBe('function');
        });

        it('should have flushAll method', () => {
            expect(typeof cacheManager.flushAll).toBe('function');
        });

        it('should have getStats method', () => {
            expect(typeof cacheManager.getStats).toBe('function');
        });
    });

    describe('invalidateCache', () => {
        it('should be a function', () => {
            expect(typeof invalidateCache).toBe('function');
        });
    });

    describe('getCachedOrFetch', () => {
        it('should be a function', () => {
            expect(typeof getCachedOrFetch).toBe('function');
        });
    });
});