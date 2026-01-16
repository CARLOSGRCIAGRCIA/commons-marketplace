import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            ref: 'User',
        },
        storeName: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        description: {
            type: String,
            required: false,
            default: '',
        },
        logo: {
            type: String,
            required: false,
            default: null,
        },
        status: {
            type: String,
            required: true,
            enum: ['Pending', 'Approved', 'Rejected', 'Suspended'],
            default: 'Pending',
        },
    },
    {
        timestamps: true,
    },
);

storeSchema.index({ userId: 1 });
storeSchema.index({ userId: 1, storeName: 1 }, { unique: true });

const StoreModel = mongoose.model('Store', storeSchema);
export default StoreModel;
