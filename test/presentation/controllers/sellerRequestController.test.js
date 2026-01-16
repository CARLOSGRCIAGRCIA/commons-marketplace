import { createSellerRequestController } from '../../../src/presentation/controllers/sellerRequestController.js';
import {
    sellerRequestResponseDTO,
    sellerRequestListResponseDTO,
} from '../../../src/application/dtos/sellerRequests/index.js';

jest.mock('../../../src/application/dtos/sellerRequests/index.js');

describe('SellerRequestController', () => {
    let controller;
    let useCases;
    let req;
    let res;
    let next;

    beforeEach(() => {
        useCases = {
            createSellerRequest: jest.fn(),
            getAllSellerRequests: jest.fn(),
            getSellerRequestById: jest.fn(),
            getSellerRequestByUserId: jest.fn(),
            updateSellerRequestStatus: jest.fn(),
            deleteSellerRequest: jest.fn(),
        };

        controller = createSellerRequestController(useCases);

        req = {
            user: { id: 'user123' },
            body: {},
            params: {},
            query: {},
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        next = jest.fn();

        sellerRequestResponseDTO.mockImplementation((data) => data);
        sellerRequestListResponseDTO.mockImplementation((data) => data);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createSellerRequest', () => {
        it('should create a new seller request successfully', async () => {
            const requestData = { message: 'I want to be a seller' };
            const newRequest = {
                id: 'req123',
                userId: 'user123',
                message: requestData.message,
                status: 'pending',
            };

            req.body = requestData;
            useCases.createSellerRequest.mockResolvedValue(newRequest);

            await controller.createSellerRequest(req, res, next);

            expect(useCases.createSellerRequest).toHaveBeenCalledWith('user123', requestData);
            expect(sellerRequestResponseDTO).toHaveBeenCalledWith(newRequest);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(newRequest);
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when use case fails', async () => {
            const error = new Error('Creation failed');
            req.body = { message: 'Test' };
            useCases.createSellerRequest.mockRejectedValue(error);

            await controller.createSellerRequest(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(res.status).not.toHaveBeenCalled();
        });
    });

    describe('getAllSellerRequests', () => {
        it('should get all seller requests without filter', async () => {
            const requests = [
                { id: 'req1', status: 'pending' },
                { id: 'req2', status: 'approved' },
            ];

            useCases.getAllSellerRequests.mockResolvedValue(requests);

            await controller.getAllSellerRequests(req, res, next);

            expect(useCases.getAllSellerRequests).toHaveBeenCalledWith(
                {},
                { sort: { createdAt: -1 } },
            );
            expect(sellerRequestListResponseDTO).toHaveBeenCalledWith(requests);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(requests);
        });

        it('should filter requests by status', async () => {
            const requests = [{ id: 'req1', status: 'pending' }];
            req.query.status = 'pending';

            useCases.getAllSellerRequests.mockResolvedValue(requests);

            await controller.getAllSellerRequests(req, res, next);

            expect(useCases.getAllSellerRequests).toHaveBeenCalledWith(
                { status: 'pending' },
                { sort: { createdAt: -1 } },
            );
        });

        it('should call next with error when use case fails', async () => {
            const error = new Error('Fetch failed');
            useCases.getAllSellerRequests.mockRejectedValue(error);

            await controller.getAllSellerRequests(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getSellerRequestById', () => {
        it('should get seller request by id successfully', async () => {
            const request = { id: 'req123', status: 'pending' };
            req.params.id = 'req123';

            useCases.getSellerRequestById.mockResolvedValue(request);

            await controller.getSellerRequestById(req, res, next);

            expect(useCases.getSellerRequestById).toHaveBeenCalledWith('req123');
            expect(sellerRequestResponseDTO).toHaveBeenCalledWith(request);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(request);
        });

        it('should call next with error when request not found', async () => {
            const error = new Error('Not found');
            req.params.id = 'nonexistent';
            useCases.getSellerRequestById.mockRejectedValue(error);

            await controller.getSellerRequestById(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getUserSellerRequest', () => {
        it('should get authenticated user seller request', async () => {
            const request = { id: 'req123', userId: 'user123', status: 'pending' };
            useCases.getSellerRequestByUserId.mockResolvedValue(request);

            await controller.getUserSellerRequest(req, res, next);

            expect(useCases.getSellerRequestByUserId).toHaveBeenCalledWith('user123');
            expect(sellerRequestResponseDTO).toHaveBeenCalledWith(request);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(request);
        });

        it('should return not_found status without DTO transformation', async () => {
            const notFoundResponse = {
                status: 'not_found',
                message: 'No seller request found for this user',
            };
            useCases.getSellerRequestByUserId.mockResolvedValue(notFoundResponse);

            await controller.getUserSellerRequest(req, res, next);

            expect(sellerRequestResponseDTO).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(notFoundResponse);
        });

        it('should call next with error when use case fails', async () => {
            const error = new Error('Fetch failed');
            useCases.getSellerRequestByUserId.mockRejectedValue(error);

            await controller.getUserSellerRequest(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('updateSellerRequestStatus', () => {
        it('should update seller request status successfully', async () => {
            const updateData = { status: 'approved', adminComment: 'Approved' };
            const updatedRequest = {
                id: 'req123',
                status: 'approved',
                adminComment: 'Approved',
            };

            req.params.id = 'req123';
            req.body = updateData;
            useCases.updateSellerRequestStatus.mockResolvedValue(updatedRequest);

            await controller.updateSellerRequestStatus(req, res, next);

            expect(useCases.updateSellerRequestStatus).toHaveBeenCalledWith('req123', updateData);
            expect(sellerRequestResponseDTO).toHaveBeenCalledWith(updatedRequest);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(updatedRequest);
        });

        it('should call next with error when update fails', async () => {
            const error = new Error('Update failed');
            req.params.id = 'req123';
            req.body = { status: 'approved' };
            useCases.updateSellerRequestStatus.mockRejectedValue(error);

            await controller.updateSellerRequestStatus(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('deleteSellerRequest', () => {
        it('should delete seller request successfully', async () => {
            const deletedRequest = { id: 'req123', status: 'pending' };
            req.params.id = 'req123';

            useCases.deleteSellerRequest.mockResolvedValue(deletedRequest);

            await controller.deleteSellerRequest(req, res, next);

            expect(useCases.deleteSellerRequest).toHaveBeenCalledWith('req123');
            expect(sellerRequestResponseDTO).toHaveBeenCalledWith(deletedRequest);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Seller request deleted successfully',
                data: deletedRequest,
            });
        });

        it('should call next with error when deletion fails', async () => {
            const error = new Error('Deletion failed');
            req.params.id = 'req123';
            useCases.deleteSellerRequest.mockRejectedValue(error);

            await controller.deleteSellerRequest(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
