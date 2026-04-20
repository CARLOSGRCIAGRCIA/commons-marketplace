/**
 * Review DTO for creating new reviews
 * @typedef {object} CreateReviewDTO
 * @property {string} userId - The ID of the user submitting the review
 * @property {string} type - The type of review ('product' or 'store')
 * @property {string} [productId] - The ID of the product being reviewed (required if type='product')
 * @property {string} [storeId] - The ID of the store being reviewed (required if type='store')
 * @property {string} commentary - The review commentary text
 * @property {number} score - The review score (1-5)
 */

/**
 * Review DTO for updating existing reviews
 * @typedef {object} UpdateReviewDTO
 * @property {string} [commentary] - The updated review commentary text
 * @property {number} [score] - The updated review score (1-5)
 */

/**
 * Review Response DTO for returning review data
 * @typedef {object} ReviewResponseDTO
 * @property {string} id - The unique identifier of the review
 * @property {string} userId - The ID of the user who wrote the review
 * @property {string} type - The type of review ('product' or 'store')
 * @property {string} [productId] - The ID of the product reviewed
 * @property {string} [storeId] - The ID of the store reviewed
 * @property {string} commentary - The review commentary text
 * @property {number} score - The review score (1-5)
 * @property {Date} createdAt - When the review was created
 * @property {Date} updatedAt - When the review was last updated
 */

/**
 * Factory function to create a CreateReviewDTO from raw data
 * @param {object} data - Raw data for creating a review
 * @returns {CreateReviewDTO} A validated CreateReviewDTO
 */
export const CreateReviewDTO = {
    from: (data) => {
        if (!data.type || !['product', 'store'].includes(data.type)) {
            throw new Error('Review type is required and must be either "product" or "store"');
        }
        if (data.type === 'product' && !data.productId) {
            throw new Error('productId is required for product reviews');
        }
        if (data.type === 'store' && !data.storeId) {
            throw new Error('storeId is required for store reviews');
        }
        return {
            userId: data.userId,
            type: data.type,
            productId: data.productId || null,
            storeId: data.storeId || null,
            commentary: data.commentary,
            score: data.score,
        };
    },
};

/**
 * Factory function to create an UpdateReviewDTO from raw data
 * @param {object} data - Raw data for updating a review
 * @returns {UpdateReviewDTO} A validated UpdateReviewDTO
 */
export const UpdateReviewDTO = {
    from: (data) => {
        return {
            commentary: data.commentary,
            score: data.score,
        };
    },
};

/**
 * Factory function to create a ReviewResponseDTO from a review entity
 * @param {object} review - A review entity
 * @returns {ReviewResponseDTO} A ReviewResponseDTO
 */
export const ReviewResponseDTO = {
    from: (review) => {
        return {
            id: review.id || review._id,
            userId: review.userId,
            type: review.type,
            productId: review.productId || null,
            storeId: review.storeId || null,
            commentary: review.commentary,
            score: review.score,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
        };
    },
};

/**
 * Factory function to create an array of ReviewResponseDTOs from review entities
 * @param {Array} reviews - An array of review entities
 * @returns {Array<ReviewResponseDTO>} An array of ReviewResponseDTOs
 */
export const ReviewResponseListDTO = {
    from: (reviews) => {
        return reviews.map((review) => ReviewResponseDTO.from(review));
    },
};
