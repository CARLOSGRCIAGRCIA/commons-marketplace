import { log } from '../../../infrastructure/logger/logger.js';
import { ok, err } from '../../../core/either/Result.js';
import { InfrastructureError } from '../../../core/errors/index.js';

/**
 * Use case for clearing all items from a user's wishlist.
 * @param {object} wishlistRepository - The repository for wishlist data.
 * @returns {Function} A function to execute the use case.
 */
export const clearWishlistUseCase = (wishlistRepository) => async (userId) => {
    try {
        log.info('Clearing wishlist', { userId });

        const wishlist = await wishlistRepository.clear(userId);

        log.info('Wishlist cleared', { userId });

        return ok(wishlist);
    } catch (error) {
        log.error('Error in clearWishlistUseCase', {
            userId,
            error: error.message,
            stack: error.stack,
        });
        return err(new InfrastructureError('Failed to clear wishlist', error));
    }
};
