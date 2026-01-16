import { deleteSellerRequestUseCase } from '../../../../src/application/use-cases/sellerRequest/DeleteSellerRequestUseCase.js';

describe('DeleteSellerRequestUseCase', () => {
    let sellerRequestRepository;
    let useCase;

    beforeEach(() => {
        sellerRequestRepository = {
            findById: jest.fn(),
            deleteById: jest.fn(),
        };
        useCase = deleteSellerRequestUseCase(sellerRequestRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should delete a seller request successfully', async () => {
        const requestId = 'req123';
        const existingRequest = {
            id: requestId,
            userId: 'user123',
            status: 'pending',
            message: 'Test message',
        };
        const deletedRequest = { ...existingRequest, deleted: true };

        sellerRequestRepository.findById.mockResolvedValue(existingRequest);
        sellerRequestRepository.deleteById.mockResolvedValue(deletedRequest);

        const result = await useCase(requestId);

        expect(sellerRequestRepository.findById).toHaveBeenCalledWith(requestId);
        expect(sellerRequestRepository.deleteById).toHaveBeenCalledWith(requestId);
        expect(result).toEqual(deletedRequest);
    });

    it('should throw notFoundException when request does not exist', async () => {
        const requestId = 'nonexistent123';

        sellerRequestRepository.findById.mockResolvedValue(null);

        await expect(useCase(requestId)).rejects.toThrow('Seller request not found');
        expect(sellerRequestRepository.findById).toHaveBeenCalledWith(requestId);
        expect(sellerRequestRepository.deleteById).not.toHaveBeenCalled();
    });

    it('should delete request regardless of its status', async () => {
        const requestId = 'req123';
        const approvedRequest = {
            id: requestId,
            userId: 'user123',
            status: 'approved',
        };

        sellerRequestRepository.findById.mockResolvedValue(approvedRequest);
        sellerRequestRepository.deleteById.mockResolvedValue(approvedRequest);

        const result = await useCase(requestId);

        expect(sellerRequestRepository.deleteById).toHaveBeenCalledWith(requestId);
        expect(result).toEqual(approvedRequest);
    });
});
