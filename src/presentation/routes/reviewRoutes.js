import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import * as ReviewValidator from '../validators/reviewValidator.js';

/**
 * Factory function to create and configure the router for review-related endpoints.
 * @param {object} reviewController - The controller containing the handler methods for reviews.
 * @returns {express.Router} An Express router instance with all review routes defined.
 */
export const createReviewRoutes = (reviewController) => {
    const router = express.Router();

    /**
     * @route   POST /api/reviews
     * @desc    Create a new review.
     * @access  private
     */
    router.post(
        '/',
        authenticate,
        ReviewValidator.createReviewValidation(),
        validate,
        reviewController.createReview,
    );

    /**
     * @route   GET /api/reviews
     * @desc    Get all reviews with optional filtering.
     * @access  public
     */
    router.get('/', reviewController.getAllReviews);

    /**
     * @route   GET /api/reviews/:id
     * @desc    Get a single review by its ID.
     * @access  public
     */
    router.get(
        '/:id',
        ReviewValidator.reviewIdParamValidation(),
        validate,
        reviewController.getReviewById,
    );

    /**
     * @route   PUT /api/reviews/:id
     * @desc    Update a review by its ID.
     * @access  private
     */
    router.put(
        '/:id',
        authenticate,
        ReviewValidator.reviewIdParamValidation(),
        ReviewValidator.updateReviewValidation(),
        validate,
        reviewController.updateReview,
    );

    /**
     * @route   DELETE /api/reviews/:id
     * @desc    Delete a review by its ID.
     * @access  private
     */
    router.delete(
        '/:id',
        authenticate,
        ReviewValidator.reviewIdParamValidation(),
        validate,
        reviewController.deleteReview,
    );

    return router;
};
