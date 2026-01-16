import { AuthDTO } from '../../dtos/users/AuthDTO.js';

export const logoutUseCase = (authRepository) => async (token) => {
    await authRepository.signOut(token);
    return AuthDTO.logoutResponse();
};
