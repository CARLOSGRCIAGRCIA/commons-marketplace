import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: false,
            default: '',
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            default: null,
        },
        level: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);

categorySchema.index({ parent: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });

categorySchema.methods.getHierarchy = async function () {
    const hierarchy = [this];
    let current = this;

    while (current.parent) {
        current = await mongoose.model('Category').findById(current.parent);
        if (current) {
            hierarchy.unshift(current);
        }
    }

    return hierarchy;
};

categorySchema.statics.findSubcategories = function (parentId) {
    return this.find({ parent: parentId, isActive: true });
};

categorySchema.statics.findMainCategories = function () {
    return this.find({ parent: null, isActive: true });
};

const CategoryModel = mongoose.model('Category', categorySchema);
export default CategoryModel;
