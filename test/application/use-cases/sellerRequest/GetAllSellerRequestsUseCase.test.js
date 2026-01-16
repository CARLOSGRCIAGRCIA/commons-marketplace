import { getAllSellerRequestsUseCase } from '../../../../src/application/use-cases/sellerRequest/GetAllSellerRequestsUseCase.js';

describe('GetAllSellerRequestsUseCase', () => {
    let sellerRequestRepository;
    let useCase;

    beforeEach(() => {
        sellerRequestRepository = {
            findAll: jest.fn(),
        };
        useCase = getAllSellerRequestsUseCase(sellerRequestRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return all seller requests without filters', async () => {
        const mockRequests = [
            { id: 'req1', userId: 'user1', status: 'pending' },
            { id: 'req2', userId: 'user2', status: 'approved' },
            { id: 'req3', userId: 'user3', status: 'rejected' },
        ];

        sellerRequestRepository.findAll.mockResolvedValue(mockRequests);

        const result = await useCase();

        expect(sellerRequestRepository.findAll).toHaveBeenCalledWith({}, {});
        expect(result).toEqual(mockRequests);
    });

    it('should return filtered seller requests by status', async () => {
        const filter = { status: 'pending' };
        const mockRequests = [
            { id: 'req1', userId: 'user1', status: 'pending' },
            { id: 'req3', userId: 'user3', status: 'pending' },
        ];

        sellerRequestRepository.findAll.mockResolvedValue(mockRequests);

        const result = await useCase(filter);

        expect(sellerRequestRepository.findAll).toHaveBeenCalledWith(filter, {});
        expect(result).toEqual(mockRequests);
    });

    it('should return seller requests with pagination options', async () => {
        const filter = {};
        const options = { limit: 10, skip: 0, sort: { createdAt: -1 } };
        const mockRequests = [{ id: 'req1', userId: 'user1', status: 'pending' }];

        sellerRequestRepository.findAll.mockResolvedValue(mockRequests);

        const result = await useCase(filter, options);

        expect(sellerRequestRepository.findAll).toHaveBeenCalledWith(filter, options);
        expect(result).toEqual(mockRequests);
    });

    it('should return empty array when no requests exist', async () => {
        sellerRequestRepository.findAll.mockResolvedValue([]);

        const result = await useCase();

        expect(result).toEqual([]);
    });

    it('should pass complex filters to repository', async () => {
        const filter = {
            status: { $in: ['pending', 'approved'] },
            createdAt: { $gte: new Date('2024-01-01') },
        };
        const options = { limit: 20 };
        const mockRequests = [{ id: 'req1', userId: 'user1', status: 'pending' }];

        sellerRequestRepository.findAll.mockResolvedValue(mockRequests);

        const result = await useCase(filter, options);

        expect(sellerRequestRepository.findAll).toHaveBeenCalledWith(filter, options);
        expect(result).toEqual(mockRequests);
    });
});
