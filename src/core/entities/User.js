export const User = {
    create: (data) => ({
        _id: data._id,
        name: data.name ?? null,
        lastName: data.lastName ?? null,
        phoneNumber: data.phoneNumber ?? null,
        address: data.address ?? null,
        profilePicUrl: data.profilePicUrl ?? 'https://api.dicebear.com/9.x/lorelei/svg',
        isApprovedSeller: data.isApprovedSeller ?? false,
        email: data.email ?? null,
        role: data.role ?? 'buyer',
        createdAt: data.createdAt ?? new Date(),
        updatedAt: data.updatedAt ?? new Date(),
    }),

    validate: (user) => {
        if (!user._id || typeof user._id !== 'string') {
            return { valid: false, error: 'User ID must be a non-empty string' };
        }
        if (!['buyer', 'seller', 'admin'].includes(user.role)) {
            return { valid: false, error: 'Role must be one of: buyer, seller, admin' };
        }
        return { valid: true };
    },
};
