import crypto from 'crypto';

/**
 * Generates a simple, fictitious coupon for an authenticated user.
 *
 * Notes:
 * - No DB persistence.
 * - No "only once" validation.
 * - Route protection is handled by the auth middleware.
 *
 * @returns {(userId: string) => Promise<{code: string, discountPercent: number, expiresAt: string, message: string}>}
 */
export const claimCouponUseCase = () => async (userId) => {
    const prefix = 'NB';
    const discountPercent = 10;
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    const code = `${prefix}-${discountPercent}-${random}`;

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    return {
        code,
        discountPercent,
        expiresAt,
        message: `Coupon generated for user ${userId}. (Fictitious, not persisted)`,
    };
};
