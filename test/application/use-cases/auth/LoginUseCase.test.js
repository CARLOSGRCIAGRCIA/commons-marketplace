import { loginUseCase } from '../../../../src/application/use-cases/auth/LoginUseCase.js';
import { AuthDTO } from '../../../../src/application/dtos/users/AuthDTO.js';

describe('LoginUseCase', () => {
    let authRepository;
    let useCase;

    beforeEach(() => {
        authRepository = {
            signIn: jest.fn(),
        };
        useCase = loginUseCase(authRepository);
    });

    it('should return a session when login is successful', async () => {
        const authDTO = { email: 'test@example.com', password: 'password' };
        const session = { accessToken: 'test_token' };
        authRepository.signIn.mockResolvedValue({ session });

        const result = await useCase(authDTO);

        expect(authRepository.signIn).toHaveBeenCalledWith(authDTO.email, authDTO.password);
        expect(result).toEqual(AuthDTO.loginResponse(session));
    });

    it('should throw an error when login fails', async () => {
        const authDTO = { email: 'test@example.com', password: 'wrong_password' };
        const error = new Error('Invalid credentials');
        authRepository.signIn.mockRejectedValue(error);

        await expect(useCase(authDTO)).rejects.toThrow(error);
    });
});
