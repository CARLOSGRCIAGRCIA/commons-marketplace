import { UpdateReviewDTO, ReviewResponseDTO } from '../../dtos/review/ReviewDTO.js';
import { updateReview } from '../../../core/entities/Review.js';

export const updateReviewUseCase = (reviewRepository) => async (reviewId, userId, reviewData) => {
    const updateReviewDTO = UpdateReviewDTO.from(reviewData);

    const currentReview = await reviewRepository.findById(reviewId);
    if (!currentReview) {
        throw new Error('Review not found');
    }

    if (currentReview.userId !== userId) {
        throw new Error('Not authorized to update this review');
    }

    const updatedReview = updateReview(currentReview, {
        commentary: updateReviewDTO.commentary,
        score: updateReviewDTO.score,
    });

    const savedReview = await reviewRepository.updateById(reviewId, {
        commentary: updatedReview.commentary,
        score: updatedReview.score,
        updatedAt: updatedReview.updatedAt,
    });

    return ReviewResponseDTO.from(savedReview);
};
