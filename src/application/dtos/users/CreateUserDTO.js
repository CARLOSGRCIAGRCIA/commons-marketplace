export const CreateUserDTO = {
    from: (data) => ({
        _id: data._id,
        name: data.name ?? null,
        lastName: data.lastName ?? null,
        phoneNumber: data.phoneNumber ?? null,
        address: data.address ?? null,
        profilePicUrl: data.profilePicUrl ?? null,
        isApprovedSeller: data.isApprovedSeller ?? false,
        email: data.email ?? null,
    }),

    validate: (dto) => {
        if (!dto._id || typeof dto._id !== 'string' || dto._id.trim() === '') {
            return {
                valid: false,
                errors: ['User ID (_id) is required and must be a non-empty string'],
            };
        }
        return { valid: true, errors: [] };
    },
};
