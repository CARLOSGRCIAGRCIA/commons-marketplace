/**
 * Factory function to create a coupon controller.
 *
 * @param {object} deps
 * @param {(userId: string) => Promise<object>} deps.claimCouponUseCase
 */
export const createCouponController = ({ claimCouponUseCase }) => {
    return {
        /**
         * GET /api/coupons/claim
         * Protected endpoint. Requires Authorization: Bearer <token>
         */
        async claimCoupon(req, res, next) {
            try {
                const userId = req.user?.id;
                const coupon = await claimCouponUseCase(userId);
                return res.status(200).json(coupon);
            } catch (error) {
                next(error);
            }
        },
    };
};
