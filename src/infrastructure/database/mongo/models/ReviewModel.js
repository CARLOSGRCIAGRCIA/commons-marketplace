import { Schema, model } from 'mongoose';

const reviewSchema = new Schema(
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

reviewSchema.index({ score: 1 });

reviewSchema.index({ userId: 1, createdAt: -1 });

export default model('review', reviewSchema);
