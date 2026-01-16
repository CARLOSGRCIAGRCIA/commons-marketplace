import { createReviewUseCase } from '../../../../src/application/use-cases/review/CreateReviewUseCase.js';

describe('CreateReviewUseCase', () => {
    let mockReviewRepository;
    let mockUserRepository;

    beforeEach(() => {
        mockReviewRepository = {
            create: jest.fn(),
        };
        mockUserRepository = {
            findById: jest.fn(),
        };
    });

    it('should create a review successfully when all data is valid', async () => {
        const reviewData = {
            userId: 'user123',
            commentary: 'Great product!',
            score: 5,
        };

        const user = { _id: 'user123', name: 'Test User' };
        const createdReview = {
            id: 'generatedId123',
            userId: 'user123',
            commentary: 'Great product!',
            score: 5,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        mockUserRepository.findById.mockResolvedValue(user);
        mockReviewRepository.create.mockResolvedValue(createdReview);

        const useCase = createReviewUseCase(mockReviewRepository, mockUserRepository);
        const result = await useCase(reviewData);

        expect(mockUserRepository.findById).toHaveBeenCalledWith('user123');
        expect(mockReviewRepository.create).toHaveBeenCalledWith({
            _id: expect.any(String),
            userId: 'user123',
            commentary: 'Great product!',
            score: 5,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
        expect(result).toEqual(createdReview);
    });

    it('should throw an error when user does not exist', async () => {
        const reviewData = {
            userId: 'nonexistent-user',
            commentary: 'Great product!',
            score: 5,
        };

        mockUserRepository.findById.mockResolvedValue(null);

        const useCase = createReviewUseCase(mockReviewRepository, mockUserRepository);

        await expect(useCase(reviewData)).rejects.toThrow('User not found');
        expect(mockUserRepository.findById).toHaveBeenCalledWith('nonexistent-user');
    });

    it('should propagate repository errors', async () => {
        const reviewData = {
            userId: 'user123',
            commentary: 'Great product!',
            score: 5,
        };

        const user = { _id: 'user123', name: 'Test User' };

        mockUserRepository.findById.mockResolvedValue(user);
        mockReviewRepository.create.mockRejectedValue(new Error('Database error'));

        const useCase = createReviewUseCase(mockReviewRepository, mockUserRepository);

        await expect(useCase(reviewData)).rejects.toThrow('Database error');
    });
});
