import { UserResponseDTO } from '../../dtos/users/index.js';
import { replaceImage } from '../../../core/services/fileService.js';

export const updateUserProfilePictureUseCase = (userRepository) => async (userId, file) => {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        throw Error('A valid user ID must be provided');
    }

    if (!file) {
        throw Error('No file provided');
    }

    const user = await userRepository.findById(userId.trim());
    if (!user) {
        throw Error(`User with ID '${userId}' not found`);
    }

    const defaultProfilePic = 'https://api.dicebear.com/9.x/lorelei/svg';

    const newProfilePicUrl = await replaceImage(
        user.profilePicUrl,
        file,
        { folder: 'users', prefix: 'profile' },
        defaultProfilePic,
    );

    const updatedUser = await userRepository.updateById(userId.trim(), {
        profilePicUrl: newProfilePicUrl,
    });

    return UserResponseDTO.from(updatedUser);
};
