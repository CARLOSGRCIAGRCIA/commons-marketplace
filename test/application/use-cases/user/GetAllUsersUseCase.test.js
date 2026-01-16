import { getAllUsersUseCase } from '../../../../src/application/use-cases/user/GetAllUsersUseCase.js';
import { UserResponseDTO } from '../../../../src/application/dtos/users/UserResponseDTO.js';

describe('GetAllUsersUseCase', () => {
    let userRepository;
    let useCase;

    beforeEach(() => {
        userRepository = {
            findAll: jest.fn(),
        };
        useCase = getAllUsersUseCase(userRepository);
    });

    it('should return an array of user response DTOs', async () => {
        const users = [{ _id: 'test_id_1' }, { _id: 'test_id_2' }];
        userRepository.findAll.mockResolvedValue(users);

        const result = await useCase();

        expect(userRepository.findAll).toHaveBeenCalledWith({}, {});
        expect(result).toEqual(users.map(UserResponseDTO.from));
    });

    it('should return an empty array if no users are found', async () => {
        userRepository.findAll.mockResolvedValue([]);

        const result = await useCase();

        expect(result).toEqual([]);
    });
});
