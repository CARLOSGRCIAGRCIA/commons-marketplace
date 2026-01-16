export const deleteUserUseCase = (userRepository) => async (userId) => {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        throw Error('A valid user ID must be provided for deletion');
    }

    const deletedUser = await userRepository.deleteById(userId.trim());
    if (!deletedUser) {
        throw Error(`User with ID '${userId}' not found for deletion`);
    }
    return true;
};
