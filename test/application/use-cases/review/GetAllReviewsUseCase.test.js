import { getAllReviewsUseCase } from '../../../../src/application/use-cases/review/GetAllReviewsUseCase.js';

describe('GetAllReviewsUseCase', () => {
    let mockReviewRepository;

    beforeEach(() => {
        mockReviewRepository = {
            findAll: jest.fn(),
        };
    });

    it('should return all reviews when no filters are provided', async () => {
        const reviews = [
            {
                id: 'review1',
                userId: 'user1',
                commentary: 'Great product!',
                score: 5,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 'review2',
                userId: 'user2',
                commentary: 'Good value for money',
                score: 4,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        mockReviewRepository.findAll.mockResolvedValue(reviews);

        const useCase = getAllReviewsUseCase(mockReviewRepository);
        const result = await useCase();

        expect(mockReviewRepository.findAll).toHaveBeenCalledWith({});
        expect(result).toEqual(reviews);
    });

    it('should return reviews with filters applied', async () => {
        const filters = { userId: 'user123', score: 5 };
        const reviews = [
            {
                id: 'review1',
                userId: 'user123',
                commentary: 'Great product!',
                score: 5,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        mockReviewRepository.findAll.mockResolvedValue(reviews);

        const useCase = getAllReviewsUseCase(mockReviewRepository);
        const result = await useCase(filters);

        expect(mockReviewRepository.findAll).toHaveBeenCalledWith(filters);
        expect(result).toEqual(reviews);
    });

    it('should return empty array when no reviews found', async () => {
        mockReviewRepository.findAll.mockResolvedValue([]);

        const useCase = getAllReviewsUseCase(mockReviewRepository);
        const result = await useCase();

        expect(mockReviewRepository.findAll).toHaveBeenCalledWith({});
        expect(result).toEqual([]);
    });

    it('should propagate repository errors', async () => {
        mockReviewRepository.findAll.mockRejectedValue(new Error('Database error'));

        const useCase = getAllReviewsUseCase(mockReviewRepository);

        await expect(useCase()).rejects.toThrow('Database error');
    });
});
