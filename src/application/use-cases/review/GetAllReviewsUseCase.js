import { ReviewResponseListDTO } from '../../dtos/review/ReviewDTO.js';

export const getAllReviewsUseCase =
    (reviewRepository) =>
    async (filters = {}) => {
        const reviews = await reviewRepository.findAll(filters);
        return ReviewResponseListDTO.from(reviews);
    };
