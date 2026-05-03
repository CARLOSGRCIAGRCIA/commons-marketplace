import { AuthDTO } from '../../dtos/users/AuthDTO.js';
import { CreateUserDTO } from '../../dtos/users/CreateUserDTO.js';
import { UserResponseDTO } from '../../dtos/users/UserResponseDTO.js';

export const loginUseCase = (authRepository, userRepository) => async (authDTO) => {
    const { email, password } = authDTO;

    const loginResponse = await authRepository.signIn(email, password);
    
    let user = await userRepository.findById(loginResponse.user.id);
    
    // If user doesn't exist in MongoDB, create them
    if (!user) {
        const supabaseRole = 
            loginResponse.user?.app_metadata?.role ||
            loginResponse.user?.raw_user_meta_data?.role ||
            loginResponse.user?.user_metadata?.role ||
            'buyer';
            
        const newUserData = {
            _id: loginResponse.user.id,
            email: email,
            name: loginResponse.user.user_metadata?.name || null,
            role: supabaseRole.toLowerCase(),
            isApprovedSeller: supabaseRole.toLowerCase() === 'seller',
        };
        
        const newUserDTO = CreateUserDTO.from(newUserData);
        user = await userRepository.create(newUserDTO);
    } else {
        // If user exists but role is different from Supabase, update MongoDB
        const supabaseRole = 
            loginResponse.user?.app_metadata?.role ||
            loginResponse.user?.raw_user_meta_data?.role ||
            loginResponse.user?.user_metadata?.role;
        
        if (supabaseRole && user.role !== supabaseRole.toLowerCase()) {
            await userRepository.updateById(loginResponse.user.id, { role: supabaseRole.toLowerCase() });
            user = await userRepository.findById(loginResponse.user.id);
        }
    }
    
    return AuthDTO.loginResponse(loginResponse.session, {
        token: loginResponse.session.access_token,
        user: user ? UserResponseDTO.from(user) : null,
    });
};