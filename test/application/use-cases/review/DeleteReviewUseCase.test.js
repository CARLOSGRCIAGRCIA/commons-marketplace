import { deleteReviewUseCase } from '../../../../src/application/use-cases/review/DeleteReviewUseCase.js';

describe('DeleteReviewUseCase', () => {
    let mockReviewRepository;

    beforeEach(() => {
        mockReviewRepository = {
            findByUserIdAndId: jest.fn(),
            deleteById: jest.fn(),
        };
    });

    it('should delete a review successfully when user is authorized', async () => {
        const review = {
            _id: 'review123',
            userId: 'user123',
            commentary: 'Great product!',
            score: 5,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        mockReviewRepository.findByUserIdAndId.mockResolvedValue(review);
        mockReviewRepository.deleteById.mockResolvedValue(review);

        const useCase = deleteReviewUseCase(mockReviewRepository);
        const result = await useCase('review123', 'user123');

        expect(mockReviewRepository.findByUserIdAndId).toHaveBeenCalledWith('user123', 'review123');
        expect(mockReviewRepository.deleteById).toHaveBeenCalledWith('review123');
        expect(result).toBe(true);
    });

    it('should throw error when review does not exist or user is not authorized', async () => {
        mockReviewRepository.findByUserIdAndId.mockResolvedValue(null);

        const useCase = deleteReviewUseCase(mockReviewRepository);

        await expect(useCase('review123', 'user123')).rejects.toThrow(
            'Review not found or not authorized to delete',
        );
        expect(mockReviewRepository.findByUserIdAndId).toHaveBeenCalledWith('user123', 'review123');
        expect(mockReviewRepository.deleteById).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
        mockReviewRepository.findByUserIdAndId.mockRejectedValue(new Error('Database error'));

        const useCase = deleteReviewUseCase(mockReviewRepository);

        await expect(useCase('review123', 'user123')).rejects.toThrow('Database error');
    });
});
