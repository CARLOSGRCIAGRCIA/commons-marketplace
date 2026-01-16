import { Schema, model } from 'mongoose';

const userSchema = new Schema(
    {
        _id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            default: null,
            trim: true,
        },
        lastName: {
            type: String,
            default: null,
            trim: true,
        },
        email: {
            type: String,
            default: null,
            trim: true,
            lowercase: true,
        },
        phoneNumber: {
            type: String,
            default: null,
            trim: true,
        },
        address: {
            type: String,
            default: null,
            trim: true,
        },
        profilePicUrl: {
            type: String,
            default: 'https://api.dicebear.com/9.x/lorelei/svg',
        },
        isApprovedSeller: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            enum: ['buyer', 'seller', 'admin'],
            default: 'buyer',
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

export default model('user', userSchema);
