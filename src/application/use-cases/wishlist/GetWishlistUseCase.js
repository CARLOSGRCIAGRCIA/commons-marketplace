import { log } from '../../../infrastructure/logger/logger.js';
import { ok, err } from '../../../core/either/Result.js';
import { InfrastructureError } from '../../../core/errors/index.js';

/**
 * Use case for getting a user's wishlist.
 * Creates a new wishlist if one doesn't exist.
 * @param {object} wishlistRepository - The repository for wishlist data.
 * @returns {Function} A function to execute the use case.
 */
export const getWishlistUseCase = (wishlistRepository) => async (userId) => {
    try {
        log.debug('Fetching wishlist', { userId });

        let wishlist = await wishlistRepository.findByUserId(userId);

        if (!wishlist) {
            log.debug('Creating new wishlist', { userId });
            wishlist = await wishlistRepository.create(userId);
        }

        return ok(wishlist);
    } catch (error) {
        log.error('Error in getWishlistUseCase', {
            userId,
            error: error.message,
            stack: error.stack,
        });
        return err(new InfrastructureError('Failed to get wishlist', error));
    }
};
