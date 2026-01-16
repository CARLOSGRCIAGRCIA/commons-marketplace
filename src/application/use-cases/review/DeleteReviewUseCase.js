export const deleteReviewUseCase = (reviewRepository) => async (reviewId, userId) => {
    const review = await reviewRepository.findByUserIdAndId(userId, reviewId);
    if (!review) {
        throw new Error('Review not found or not authorized to delete');
    }

    const deletedReview = await reviewRepository.deleteById(reviewId);

    return deletedReview !== null;
};
