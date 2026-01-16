import { updateReviewUseCase } from '../../../../src/application/use-cases/review/UpdateReviewUseCase.js';

describe('UpdateReviewUseCase', () => {
    let mockReviewRepository;

    beforeEach(() => {
        mockReviewRepository = {
            findById: jest.fn(),
            updateById: jest.fn(),
        };
    });

    it('should update a review successfully when user is authorized', async () => {
        const existingReview = {
            id: 'review123',
            userId: 'user123',
            commentary: 'Good product',
            score: 4,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const updatedReview = {
            id: 'review123',
            userId: 'user123',
            commentary: 'Great product!',
            score: 5,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const updateData = {
            commentary: 'Great product!',
            score: 5,
        };

        mockReviewRepository.findById.mockResolvedValue(existingReview);
        mockReviewRepository.updateById.mockResolvedValue(updatedReview);

        const useCase = updateReviewUseCase(mockReviewRepository);
        const result = await useCase('review123', 'user123', updateData);

        expect(mockReviewRepository.findById).toHaveBeenCalledWith('review123');
        expect(mockReviewRepository.updateById).toHaveBeenCalledWith('review123', {
            commentary: 'Great product!',
            score: 5,
            updatedAt: expect.any(Date),
        });
        expect(result).toEqual(updatedReview);
    });

    it('should throw an error when review does not exist', async () => {
        mockReviewRepository.findById.mockResolvedValue(null);

        const useCase = updateReviewUseCase(mockReviewRepository);

        await expect(useCase('review123', 'user123', { commentary: 'Updated' })).rejects.toThrow(
            'Review not found',
        );
        expect(mockReviewRepository.findById).toHaveBeenCalledWith('review123');
    });

    it('should throw an error when user is not authorized to update the review', async () => {
        const existingReview = {
            id: 'review123',
            userId: 'differentUser',
            commentary: 'Good product',
            score: 4,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        mockReviewRepository.findById.mockResolvedValue(existingReview);

        const useCase = updateReviewUseCase(mockReviewRepository);

        await expect(useCase('review123', 'user123', { commentary: 'Updated' })).rejects.toThrow(
            'Not authorized to update this review',
        );
        expect(mockReviewRepository.findById).toHaveBeenCalledWith('review123');
    });

    it('should propagate repository errors', async () => {
        mockReviewRepository.findById.mockRejectedValue(new Error('Database error'));

        const useCase = updateReviewUseCase(mockReviewRepository);

        await expect(useCase('review123', 'user123', { commentary: 'Updated' })).rejects.toThrow(
            'Database error',
        );
    });
});
