/**
 * Factory function to create a coupon controller.
 * @param {object} deps - Dependencies
 * @param {Function} deps.claimCouponUseCase - Use case to claim coupon
 * @returns {object} Coupon controller
 */
export const createCouponController = ({ claimCouponUseCase }) => {
    return {
        /**
         * Handle coupon claim request.
         * @param {object} req - Express request
         * @param {object} res - Express response
         * @param {Function} next - Express next
         * @returns {Promise<void>}
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
