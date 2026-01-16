import {
    isRole,
    createIsProductOwnerOrAdmin,
    isAdmin,
} from '../../../src/presentation/middlewares/authorizationMiddleware.js';
import { forbiddenException } from '../../../src/presentation/exceptions/forbiddenException.js';

describe('Authorization Middleware', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {
            user: {},
            params: {},
        };
        res = {};
        next = jest.fn();
    });

    describe('isRole', () => {
        it('should call next if user has the required role', () => {
            req.user.userMetadata = { role: 'Admin' };
            const middleware = isRole('Admin', 'Seller');
            middleware(req, res, next);
            expect(next).toHaveBeenCalledWith();
        });

        it('should call next with a forbidden exception if user does not have the required role', () => {
            req.user.userMetadata = { role: 'Buyer' };
            const middleware = isRole('Admin', 'Seller');
            middleware(req, res, next);
            expect(next).toHaveBeenCalledWith(forbiddenException('Insufficient permissions.'));
        });

        it('should call next with a forbidden exception if user role is not defined', () => {
            const middleware = isRole('Admin');
            middleware(req, res, next);
            expect(next).toHaveBeenCalledWith(forbiddenException('Insufficient permissions.'));
        });
    });

    describe('createIsProductOwnerOrAdmin', () => {
        let getProductByIdUseCase;
        let middleware;

        beforeEach(() => {
            getProductByIdUseCase = jest.fn();
            middleware = createIsProductOwnerOrAdmin(getProductByIdUseCase);
        });

        it('should call next if user is an Admin', async () => {
            req.user = { id: 'user_id', userMetadata: { role: 'Admin' } };
            req.params.productId = 'product_id';
            getProductByIdUseCase.mockResolvedValue({ sellerId: 'owner_id' });
            await middleware(req, res, next);
            expect(next).toHaveBeenCalledWith();
        });

        it('should call next if user is the product owner', async () => {
            req.user = { id: 'owner_id', userMetadata: { role: 'Seller' } };
            req.params.productId = 'product_id';
            getProductByIdUseCase.mockResolvedValue({ sellerId: 'owner_id' });
            await middleware(req, res, next);
            expect(next).toHaveBeenCalledWith();
        });

        it('should call next with a forbidden exception if user is not the owner or an admin', async () => {
            req.user = { id: 'user_id', userMetadata: { role: 'Buyer' } };
            req.params.productId = 'product_id';
            getProductByIdUseCase.mockResolvedValue({ sellerId: 'owner_id' });
            await middleware(req, res, next);
            expect(next).toHaveBeenCalledWith(
                forbiddenException('You are not allowed to modify this product.'),
            );
        });

        it('should call next with an error if getProductByIdUseCase throws an error', async () => {
            const error = new Error('Product not found');
            req.user = { id: 'user_id', userMetadata: { role: 'Buyer' } };
            req.params.productId = 'product_id';
            getProductByIdUseCase.mockRejectedValue(error);
            await middleware(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('isAdmin', () => {
        it('should call next if user is an Admin', () => {
            req.user = { userMetadata: { role: 'Admin' } };
            isAdmin(req, res, next);
            expect(next).toHaveBeenCalledWith();
        });

        it('should call next with a forbidden exception if user is not an Admin', () => {
            req.user = { userMetadata: { role: 'Buyer' } };
            isAdmin(req, res, next);
            expect(next).toHaveBeenCalledWith(forbiddenException('Admin access only.'));
        });

        it('should call next with a forbidden exception if user role is not defined', () => {
            isAdmin(req, res, next);
            expect(next).toHaveBeenCalledWith(forbiddenException('Admin access only.'));
        });
    });
});
