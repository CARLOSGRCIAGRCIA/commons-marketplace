import { createSellerRequestUseCase } from '../../../../src/application/use-cases/sellerRequest/CreateSellerRequestUseCase.js';

describe('CreateSellerRequestUseCase', () => {
    let sellerRequestRepository;
    let useCase;

    beforeEach(() => {
        sellerRequestRepository = {
            findByUserId: jest.fn(),
            create: jest.fn(),
        };
        useCase = createSellerRequestUseCase(sellerRequestRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new seller request when user has no existing request', async () => {
        const userId = 'user123';
        const requestData = { message: 'I want to become a seller' };
        const expectedRequest = {
            id: 'req123',
            userId,
            message: requestData.message,
            status: 'pending',
        };

        sellerRequestRepository.findByUserId.mockResolvedValue(null);
        sellerRequestRepository.create.mockResolvedValue(expectedRequest);

        const result = await useCase(userId, requestData);

        expect(sellerRequestRepository.findByUserId).toHaveBeenCalledWith(userId);
        expect(sellerRequestRepository.create).toHaveBeenCalledWith({
            userId,
            message: requestData.message,
        });
        expect(result).toEqual(expectedRequest);
    });

    it('should create request with empty message when message is not provided', async () => {
        const userId = 'user123';
        const requestData = {};
        const expectedRequest = {
            id: 'req123',
            userId,
            message: '',
            status: 'pending',
        };

        sellerRequestRepository.findByUserId.mockResolvedValue(null);
        sellerRequestRepository.create.mockResolvedValue(expectedRequest);

        const result = await useCase(userId, requestData);

        expect(sellerRequestRepository.create).toHaveBeenCalledWith({
            userId,
            message: '',
        });
        expect(result).toEqual(expectedRequest);
    });

    it('should throw error when user already has an approved request', async () => {
        const userId = 'user123';
        const requestData = { message: 'Test message' };
        const existingRequest = {
            id: 'req123',
            userId,
            status: 'approved',
        };

        sellerRequestRepository.findByUserId.mockResolvedValue(existingRequest);

        await expect(useCase(userId, requestData)).rejects.toThrow('User is already a seller');
        expect(sellerRequestRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when user already has a pending request', async () => {
        const userId = 'user123';
        const requestData = { message: 'Test message' };
        const existingRequest = {
            id: 'req123',
            userId,
            status: 'pending',
        };

        sellerRequestRepository.findByUserId.mockResolvedValue(existingRequest);

        await expect(useCase(userId, requestData)).rejects.toThrow(
            'User already has a pending request',
        );
        expect(sellerRequestRepository.create).not.toHaveBeenCalled();
    });

    it('should allow creating new request when previous request was rejected', async () => {
        const userId = 'user123';
        const requestData = { message: 'New attempt' };
        const existingRequest = {
            id: 'req123',
            userId,
            status: 'rejected',
        };
        const newRequest = {
            id: 'req456',
            userId,
            message: requestData.message,
            status: 'pending',
        };

        sellerRequestRepository.findByUserId.mockResolvedValue(existingRequest);
        sellerRequestRepository.create.mockResolvedValue(newRequest);

        const result = await useCase(userId, requestData);

        expect(result).toEqual(newRequest);
        expect(sellerRequestRepository.create).toHaveBeenCalled();
    });
});
