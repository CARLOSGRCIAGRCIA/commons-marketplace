import { AuthDTO } from '../../dtos/users/AuthDTO.js';

export const loginUseCase = (authRepository) => async (authDTO) => {
    const { email, password } = authDTO;

    const loginResponse = await authRepository.signIn(email, password);
    return AuthDTO.loginResponse(loginResponse.session);
};
