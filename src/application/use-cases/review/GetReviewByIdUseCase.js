import { ReviewResponseDTO } from '../../dtos/review/ReviewDTO.js';

export const getReviewByIdUseCase = (reviewRepository) => async (reviewId) => {
    const review = await reviewRepository.findById(reviewId);

    if (!review) {
        throw new Error('Review not found');
    }

    return ReviewResponseDTO.from(review);
};
