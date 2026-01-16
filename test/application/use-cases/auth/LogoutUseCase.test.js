import { logoutUseCase } from '../../../../src/application/use-cases/auth/LogoutUseCase.js';
import { AuthDTO } from '../../../../src/application/dtos/users/AuthDTO.js';

describe('LogoutUseCase', () => {
    let authRepository;
    let useCase;

    beforeEach(() => {
        authRepository = {
            signOut: jest.fn(),
        };
        useCase = logoutUseCase(authRepository);
    });

    it('should call authRepository.signOut and return a success message', async () => {
        const token = 'test_token';
        authRepository.signOut.mockResolvedValue({});

        const result = await useCase(token);

        expect(authRepository.signOut).toHaveBeenCalledWith(token);
        expect(result).toEqual(AuthDTO.logoutResponse());
    });

    it('should throw an error when signOut fails', async () => {
        const token = 'invalid_token';
        const error = new Error('Invalid token');
        authRepository.signOut.mockRejectedValue(error);

        await expect(useCase(token)).rejects.toThrow(error);
    });
});
