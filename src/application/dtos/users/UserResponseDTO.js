export const UserResponseDTO = {
    from: (user) => ({
        _id: user._id,
        name: user.name,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profilePicUrl: user.profilePicUrl,
        isApprovedSeller: user.isApprovedSeller,
        email: user.email,
        role: user.role,
    }),

    fromWithEmail: (user, email) => ({
        _id: user._id,
        name: user.name,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profilePicUrl: user.profilePicUrl,
        email,
        role: user.role,
    }),
};
