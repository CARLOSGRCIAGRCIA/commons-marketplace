import { Schema, model } from 'mongoose';

const sellerRequestSchema = new Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
            index: true,
        },
        message: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        adminComment: {
            type: String,
            trim: true,
            maxlength: 500,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

sellerRequestSchema.index({ userId: 1, createdAt: -1 });
sellerRequestSchema.index({ status: 1, createdAt: -1 });

export default model('SellerRequest', sellerRequestSchema);
