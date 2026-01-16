import { getSellerRequestByUserIdUseCase } from '../../../../src/application/use-cases/sellerRequest/GetSellerRequestByUserIdUseCase.js';

describe('GetSellerRequestByUserIdUseCase', () => {
    let sellerRequestRepository;
    let useCase;

    beforeEach(() => {
        sellerRequestRepository = {
            findByUserId: jest.fn(),
        };
        useCase = getSellerRequestByUserIdUseCase(sellerRequestRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return seller request when it exists for user', async () => {
        const userId = 'user123';
        const mockRequest = {
            id: 'req123',
            userId,
            status: 'pending',
            message: 'I want to be a seller',
            createdAt: new Date(),
        };

        sellerRequestRepository.findByUserId.mockResolvedValue(mockRequest);

        const result = await useCase(userId);

        expect(sellerRequestRepository.findByUserId).toHaveBeenCalledWith(userId);
        expect(result).toEqual(mockRequest);
    });

    it('should return not_found status when no request exists for user', async () => {
        const userId = 'user123';

        sellerRequestRepository.findByUserId.mockResolvedValue(null);

        const result = await useCase(userId);

        expect(sellerRequestRepository.findByUserId).toHaveBeenCalledWith(userId);
        expect(result).toEqual({
            status: 'not_found',
            message: 'No seller request found for this user',
        });
    });

    it('should return pending request for user', async () => {
        const userId = 'user456';
        const mockRequest = {
            id: 'req456',
            userId,
            status: 'pending',
            message: 'My request',
        };

        sellerRequestRepository.findByUserId.mockResolvedValue(mockRequest);

        const result = await useCase(userId);

        expect(result).toEqual(mockRequest);
        expect(result.status).toBe('pending');
    });

    it('should return approved request for user', async () => {
        const userId = 'user789';
        const mockRequest = {
            id: 'req789',
            userId,
            status: 'approved',
            adminComment: 'Welcome as seller',
        };

        sellerRequestRepository.findByUserId.mockResolvedValue(mockRequest);

        const result = await useCase(userId);

        expect(result).toEqual(mockRequest);
        expect(result.status).toBe('approved');
    });

    it('should return rejected request for user', async () => {
        const userId = 'user999';
        const mockRequest = {
            id: 'req999',
            userId,
            status: 'rejected',
            adminComment: 'Requirements not met',
        };

        sellerRequestRepository.findByUserId.mockResolvedValue(mockRequest);

        const result = await useCase(userId);

        expect(result).toEqual(mockRequest);
        expect(result.status).toBe('rejected');
    });
});
