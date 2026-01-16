import { updateUserProfilePictureUseCase } from '../../../../src/application/use-cases/user/UpdateUserProfilePictureUseCase.js';
import { UserResponseDTO } from '../../../../src/application/dtos/users/UserResponseDTO.js';
import * as fileService from '../../../../src/core/services/fileService.js';

jest.mock('../../../../src/core/services/fileService.js', () => ({
    replaceImage: jest.fn(),
}));

describe('UpdateUserProfilePictureUseCase', () => {
    let userRepository;
    let useCase;

    beforeEach(() => {
        userRepository = {
            findById: jest.fn(),
            updateById: jest.fn(),
        };
        useCase = updateUserProfilePictureUseCase(userRepository);
    });

    it('should update the user profile picture and return a user response DTO', async () => {
        const userId = 'test_id';
        const file = { buffer: Buffer.from('test'), mimetype: 'image/png' };
        const user = { _id: userId, profilePicUrl: 'old_url' };
        const newProfilePicUrl = 'new_url';
        const updatedUser = { ...user, profilePicUrl: newProfilePicUrl };

        userRepository.findById.mockResolvedValue(user);
        fileService.replaceImage.mockResolvedValue(newProfilePicUrl);
        userRepository.updateById.mockResolvedValue(updatedUser);

        const result = await useCase(userId, file);

        expect(userRepository.findById).toHaveBeenCalledWith(userId);
        expect(fileService.replaceImage).toHaveBeenCalledWith(
            user.profilePicUrl,
            file,
            { folder: 'users', prefix: 'profile' },
            'https://api.dicebear.com/9.x/lorelei/svg',
        );
        expect(userRepository.updateById).toHaveBeenCalledWith(userId, {
            profilePicUrl: newProfilePicUrl,
        });
        expect(result).toEqual(UserResponseDTO.from(updatedUser));
    });

    it('should throw an error if userId is not provided', async () => {
        await expect(useCase(null, {})).rejects.toThrow('A valid user ID must be provided');
    });

    it('should throw an error if file is not provided', async () => {
        await expect(useCase('test_id', null)).rejects.toThrow('No file provided');
    });

    it('should throw an error if user is not found', async () => {
        const userId = 'non_existent_id';
        userRepository.findById.mockResolvedValue(null);

        await expect(useCase(userId, {})).rejects.toThrow(`User with ID '${userId}' not found`);
    });
});
