import { createAuthController } from '../../../src/presentation/controllers/authController.js';
import { AuthDTO } from '../../../src/application/dtos/users/AuthDTO.js';

jest.mock('../../../src/application/dtos/users/AuthDTO.js', () => ({
    AuthDTO: {
        registerRequest: jest.fn(),
        loginRequest: jest.fn(),
    },
}));

describe('AuthController Tests', () => {
    let req;
    let res;
    let next;
    let registerUC;
    let loginUC;
    let logoutUC;
    let authController;

    beforeEach(() => {
        req = { body: {}, headers: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();

        registerUC = jest.fn();
        loginUC = jest.fn();
        logoutUC = jest.fn();

        authController = createAuthController(registerUC, loginUC, logoutUC);

        jest.clearAllMocks();
    });

    describe('Register Controller Tests', () => {
        it('should return 201 with response on successful register', async () => {
            req.body = { email: 'test@mail.com', password: 'pass123' };
            const mockDTO = { email: 'test@mail.com', password: 'pass123' };
            const mockResponse = { message: 'User registered successfully' };

            AuthDTO.registerRequest.mockReturnValue(mockDTO);
            registerUC.mockResolvedValue(mockResponse);

            await authController.register(req, res, next);

            expect(AuthDTO.registerRequest).toHaveBeenCalledWith(req.body);
            expect(registerUC).toHaveBeenCalledWith(mockDTO);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockResponse);
        });

        it('should call next with error on failure', async () => {
            req.body = { email: 'test@mail.com', password: 'pass123' };
            const error = new Error('Register failed');

            AuthDTO.registerRequest.mockReturnValue({
                email: 'test@mail.com',
                password: 'pass123',
            });
            registerUC.mockRejectedValue(error);

            await authController.register(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('Login Controller Tests', () => {
        it('should return 200 with response on successful login', async () => {
            req.body = { email: 'login@mail.com', password: '123456' };
            const mockDTO = { email: 'login@mail.com', password: '123456' };
            const mockResponse = { message: 'Login successful' };

            AuthDTO.loginRequest.mockReturnValue(mockDTO);
            loginUC.mockResolvedValue(mockResponse);

            await authController.login(req, res, next);

            expect(AuthDTO.loginRequest).toHaveBeenCalledWith(req.body);
            expect(loginUC).toHaveBeenCalledWith(mockDTO);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResponse);
        });

        it('should call next with error on login failure', async () => {
            req.body = { email: 'login@mail.com', password: '123456' };
            const error = new Error('Login error');

            AuthDTO.loginRequest.mockReturnValue({ email: 'login@mail.com', password: '123456' });
            loginUC.mockRejectedValue(error);

            await authController.login(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('Logout Controller Tests', () => {
        it('should return 200 with response on successful logout', async () => {
            req.headers.authorization = 'Bearer valid-token';
            const mockResponse = { message: 'Logged out successfully' };

            logoutUC.mockResolvedValue(mockResponse);

            await authController.logout(req, res, next);

            expect(logoutUC).toHaveBeenCalledWith('valid-token');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResponse);
        });

        it('should call next with error on logout failure', async () => {
            req.headers.authorization = 'Bearer token123';
            const error = new Error('Logout failed');

            logoutUC.mockRejectedValue(error);

            await authController.logout(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
