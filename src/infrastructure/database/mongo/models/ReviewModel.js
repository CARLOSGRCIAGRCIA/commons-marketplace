import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
            ref: 'user',
        },
        type: {
            type: String,
            enum: ['product', 'store'],
            required: true,
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: false,
        },
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: false,
        },
        commentary: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        score: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

reviewSchema.index({ userId: 1 });
reviewSchema.index({ type: 1 });
reviewSchema.index({ productId: 1 });
reviewSchema.index({ storeId: 1 });
reviewSchema.index({ score: 1 });
reviewSchema.index({ userId: 1, type: 1 });
reviewSchema.index({ userId: 1, createdAt: -1 });

const ReviewModel = mongoose.model('review', reviewSchema);
export default ReviewModel;
