import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        categoryName: {
            type: String,
            required: true,
        },
        subCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: false,
        },
        subCategoryName: {
            type: String,
            required: false,
        },
        sellerId: {
            type: String,
            required: true,
            ref: 'User',
        },
        storeId: {
            type: String,
            required: true,
            ref: 'Store',
        },
        mainImageUrl: {
            type: String,
            required: true,
        },
        imageUrls: {
            type: [String],
            default: [],
        },
        status: {
            type: String,
            required: true,
            enum: ['Active', 'Inactive', 'OutOfStock', 'Deleted'],
            default: 'Active',
        },
    },
    {
        timestamps: true,
    },
);

productSchema.index({ storeId: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ subCategoryId: 1 });
productSchema.index({ sellerId: 1 });
productSchema.index({ status: 1 });
productSchema.index({ createdAt: -1 });

const ProductModel = mongoose.model('Product', productSchema);
export default ProductModel;
