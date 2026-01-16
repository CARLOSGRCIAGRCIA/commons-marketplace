import { authenticate } from '../../../src/presentation/middlewares/authMiddleware.js';
import supabase from '../../../src/infrastructure/supabase/config/supabaseClient.js';
import { unauthorizedException } from '../../../src/presentation/exceptions/unauthorizedException.js';

jest.mock('../../../src/infrastructure/supabase/config/supabaseClient.js', () => ({
    auth: {
        getUser: jest.fn(),
    },
}));

describe('Authenticate Middleware Tests', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {
            headers: {
                authorization: 'Bearer valid-token',
            },
        };
        res = {};
        next = jest.fn();
    });

    it('should call next with user if token is valid', async () => {
        const mockUser = { id: '123', email: 'test@mail.com' };

        supabase.auth.getUser.mockResolvedValue({
            data: { user: mockUser },
            error: null,
        });

        await authenticate(req, res, next);

        expect(req.user).toEqual(mockUser);
        expect(next).toHaveBeenCalledWith();
    });

    it('should call next with unauthorizedException if token is missing', async () => {
        req.headers.authorization = undefined;

        await authenticate(req, res, next);

        expect(next).toHaveBeenCalledWith(unauthorizedException('Token missing'));
    });

    it('should call next with unauthorizedException if Supabase returns error', async () => {
        supabase.auth.getUser.mockResolvedValue({
            data: null,
            error: { message: 'Invalid token' },
        });

        await authenticate(req, res, next);

        expect(next).toHaveBeenCalledWith(unauthorizedException('Invalid or expired token'));
    });

    it('should call next with unauthorizedException if user is not returned', async () => {
        supabase.auth.getUser.mockResolvedValue({
            data: {},
            error: null,
        });

        await authenticate(req, res, next);

        expect(next).toHaveBeenCalledWith(unauthorizedException('Invalid or expired token'));
    });
});
