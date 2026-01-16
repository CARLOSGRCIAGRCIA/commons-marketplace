import { CreateUserDTO } from '../../application/dtos/users/CreateUserDTO.js';
import { UpdateUserDTO } from '../../application/dtos/users/UpdateUserDTO.js';

export const createUserController = (
    createUserUC,
    getAllUsersUC,
    getUserByIdUC,
    updateUserUC,
    deleteUserUC,
    getCurrentUserProfileUC,
    updateUserProfilePictureUC,
) => ({
    createUser: async (req, res, next) => {
        try {
            const dto = CreateUserDTO.from(req.body);
            const result = await createUserUC(dto);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    },

    getAllUsers: async (req, res, next) => {
        try {
            const result = await getAllUsersUC(req.query);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    },

    getUserById: async (req, res, next) => {
        try {
            const result = await getUserByIdUC(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    },

    updateUserById: async (req, res, next) => {
        try {
            const dto = UpdateUserDTO.from(req.body);
            const result = await updateUserUC(req.params.id, dto);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    },

    deleteUserById: async (req, res, next) => {
        try {
            await deleteUserUC(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    },

    getUserProfile: async (req, res, next) => {
        try {
            const result = await getCurrentUserProfileUC(req.user.id, req.token);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    },

    updateProfilePicture: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const file = req.file;
            const result = await updateUserProfilePictureUC(userId, file);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    },
});
