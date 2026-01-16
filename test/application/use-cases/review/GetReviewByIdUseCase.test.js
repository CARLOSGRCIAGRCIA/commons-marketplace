import { getReviewByIdUseCase } from '../../../../src/application/use-cases/review/GetReviewByIdUseCase.js';

describe('GetReviewByIdUseCase', () => {
    let mockReviewRepository;

    beforeEach(() => {
        mockReviewRepository = {
            findById: jest.fn(),
        };
    });

    it('should return a review when it exists', async () => {
        const review = {
            id: 'review123',
            userId: 'user123',
            commentary: 'Great product!',
            score: 5,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        mockReviewRepository.findById.mockResolvedValue(review);

        const useCase = getReviewByIdUseCase(mockReviewRepository);
        const result = await useCase('review123');

        expect(mockReviewRepository.findById).toHaveBeenCalledWith('review123');
        expect(result).toEqual(review);
    });

    it('should throw an error when review does not exist', async () => {
        mockReviewRepository.findById.mockResolvedValue(null);

        const useCase = getReviewByIdUseCase(mockReviewRepository);

        await expect(useCase('review123')).rejects.toThrow('Review not found');
        expect(mockReviewRepository.findById).toHaveBeenCalledWith('review123');
    });

    it('should propagate repository errors', async () => {
        mockReviewRepository.findById.mockRejectedValue(new Error('Database error'));

        const useCase = getReviewByIdUseCase(mockReviewRepository);

        await expect(useCase('review123')).rejects.toThrow('Database error');
    });
});
