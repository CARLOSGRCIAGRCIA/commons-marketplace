import { getSellerRequestByIdUseCase } from '../../../../src/application/use-cases/sellerRequest/GetSellerRequestByIdUseCase.js';

describe('GetSellerRequestByIdUseCase', () => {
    let sellerRequestRepository;
    let useCase;

    beforeEach(() => {
        sellerRequestRepository = {
            findById: jest.fn(),
        };
        useCase = getSellerRequestByIdUseCase(sellerRequestRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return seller request when it exists', async () => {
        const requestId = 'req123';
        const mockRequest = {
            id: requestId,
            userId: 'user123',
            status: 'pending',
            message: 'I want to be a seller',
            createdAt: new Date(),
        };

        sellerRequestRepository.findById.mockResolvedValue(mockRequest);

        const result = await useCase(requestId);

        expect(sellerRequestRepository.findById).toHaveBeenCalledWith(requestId);
        expect(result).toEqual(mockRequest);
    });

    it('should throw notFoundException when request does not exist', async () => {
        const requestId = 'nonexistent123';

        sellerRequestRepository.findById.mockResolvedValue(null);

        await expect(useCase(requestId)).rejects.toThrow('Seller request not found');
        expect(sellerRequestRepository.findById).toHaveBeenCalledWith(requestId);
    });

    it('should return approved request', async () => {
        const requestId = 'req123';
        const mockRequest = {
            id: requestId,
            userId: 'user123',
            status: 'approved',
            adminComment: 'Approved by admin',
        };

        sellerRequestRepository.findById.mockResolvedValue(mockRequest);

        const result = await useCase(requestId);

        expect(result).toEqual(mockRequest);
        expect(result.status).toBe('approved');
    });

    it('should return rejected request', async () => {
        const requestId = 'req123';
        const mockRequest = {
            id: requestId,
            userId: 'user123',
            status: 'rejected',
            adminComment: 'Does not meet requirements',
        };

        sellerRequestRepository.findById.mockResolvedValue(mockRequest);

        const result = await useCase(requestId);

        expect(result).toEqual(mockRequest);
        expect(result.status).toBe('rejected');
    });
});
