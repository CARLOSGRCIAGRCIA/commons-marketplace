import { CreateReviewDTO, ReviewResponseDTO } from '../../dtos/review/ReviewDTO.js';
import { createReview } from '../../../core/entities/Review.js';

export const createReviewUseCase = (reviewRepository, userRepository) => async (reviewData) => {
    const createReviewDTO = CreateReviewDTO.from(reviewData);

    const user = await userRepository.findById(createReviewDTO.userId);
    if (!user) {
        throw new Error('User not found');
    }

    const reviewEntity = createReview({
        userId: createReviewDTO.userId,
        commentary: createReviewDTO.commentary,
        score: createReviewDTO.score,
    });

    const reviewToSave = {
        _id: reviewEntity.id,
        userId: reviewEntity.userId,
        commentary: reviewEntity.commentary,
        score: reviewEntity.score,
        createdAt: reviewEntity.createdAt,
        updatedAt: reviewEntity.updatedAt,
    };

    const savedReview = await reviewRepository.create(reviewToSave);

    return ReviewResponseDTO.from(savedReview);
};
