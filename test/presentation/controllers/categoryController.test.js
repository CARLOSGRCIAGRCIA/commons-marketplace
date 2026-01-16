import { categoryController as createCategoryController } from '../../../src/presentation/controllers/categoryController.js';
import { notFoundException } from '../../../src/presentation/exceptions/notFoundException.js';

describe('CategoryController Tests', () => {
    let req;
    let res;
    let next;
    let createCategoryUseCase;
    let getAllCategoriesUseCase;
    let getCategoryByIdUseCase;
    let updateCategoryUseCase;
    let deleteCategoryUseCase;
    let getMainCategoriesUseCase;
    let getSubcategoriesUseCase;
    let categoryController;
    let container;

    beforeEach(() => {
        req = { body: {}, params: {}, query: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };
        next = jest.fn();

        createCategoryUseCase = jest.fn();
        getAllCategoriesUseCase = jest.fn();
        getCategoryByIdUseCase = jest.fn();
        updateCategoryUseCase = jest.fn();
        deleteCategoryUseCase = jest.fn();
        getMainCategoriesUseCase = jest.fn();
        getSubcategoriesUseCase = jest.fn();

        container = {
            resolve: jest.fn((dependency) => {
                switch (dependency) {
                    case 'createCategoryUseCase':
                        return createCategoryUseCase;
                    case 'getAllCategoriesUseCase':
                        return getAllCategoriesUseCase;
                    case 'getCategoryByIdUseCase':
                        return getCategoryByIdUseCase;
                    case 'updateCategoryUseCase':
                        return updateCategoryUseCase;
                    case 'deleteCategoryUseCase':
                        return deleteCategoryUseCase;
                    case 'getMainCategoriesUseCase':
                        return getMainCategoriesUseCase;
                    case 'getSubcategoriesUseCase':
                        return getSubcategoriesUseCase;
                    default:
                        return null;
                }
            }),
        };

        categoryController = createCategoryController(container);
        jest.clearAllMocks();
    });

    describe('createCategory', () => {
        it('should return 201 with the created category on success', async () => {
            const mockCategory = {
                id: '1',
                name: 'Electronics',
                slug: 'electronics',
                description: 'Gadgets and devices',
                parent: null,
                level: 0,
                isActive: true,
            };
            req.body = {
                name: 'Electronics',
                slug: 'electronics',
                description: 'Gadgets and devices',
                parent: null,
            };
            createCategoryUseCase.mockResolvedValue(mockCategory);

            await categoryController.createCategory(req, res, next);

            expect(createCategoryUseCase).toHaveBeenCalledWith({
                name: 'Electronics',
                slug: 'electronics',
                description: 'Gadgets and devices',
                parent: null,
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockCategory);
        });

        it('should create subcategory when parent is provided', async () => {
            const mockCategory = {
                id: '2',
                name: 'Smartphones',
                slug: 'smartphones',
                description: 'Mobile phones',
                parent: '1',
                level: 1,
                isActive: true,
            };
            req.body = {
                name: 'Smartphones',
                slug: 'smartphones',
                description: 'Mobile phones',
                parent: '1',
            };
            createCategoryUseCase.mockResolvedValue(mockCategory);

            await categoryController.createCategory(req, res, next);

            expect(createCategoryUseCase).toHaveBeenCalledWith({
                name: 'Smartphones',
                slug: 'smartphones',
                description: 'Mobile phones',
                parent: '1',
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockCategory);
        });

        it('should call next with error on failure', async () => {
            const error = new Error('Creation failed');
            req.body = { name: 'Electronics', slug: 'electronics' };
            createCategoryUseCase.mockRejectedValue(error);

            await categoryController.createCategory(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getAllCategories', () => {
        it('should return 200 with all categories on success', async () => {
            const mockCategories = [
                { id: '1', name: 'Electronics', slug: 'electronics', level: 0 },
                { id: '2', name: 'Books', slug: 'books', level: 0 },
            ];
            getAllCategoriesUseCase.mockResolvedValue(mockCategories);

            await categoryController.getAllCategories(req, res, next);

            expect(getAllCategoriesUseCase).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockCategories);
        });

        it('should call next with error on failure', async () => {
            const error = new Error('Failed to fetch');
            getAllCategoriesUseCase.mockRejectedValue(error);

            await categoryController.getAllCategories(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getMainCategories', () => {
        it('should return 200 with main categories on success', async () => {
            const mockCategories = [
                { id: '1', name: 'Electronics', slug: 'electronics', level: 0, parent: null },
                { id: '2', name: 'Books', slug: 'books', level: 0, parent: null },
            ];
            getMainCategoriesUseCase.mockResolvedValue(mockCategories);

            await categoryController.getMainCategories(req, res, next);

            expect(getMainCategoriesUseCase).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockCategories);
        });

        it('should call next with error on failure', async () => {
            const error = new Error('Failed to fetch main categories');
            getMainCategoriesUseCase.mockRejectedValue(error);

            await categoryController.getMainCategories(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getSubcategories', () => {
        it('should return 200 with subcategories on success', async () => {
            const mockSubcategories = [
                { id: '2', name: 'Smartphones', slug: 'smartphones', level: 1, parent: '1' },
                { id: '3', name: 'Laptops', slug: 'laptops', level: 1, parent: '1' },
            ];
            req.params.parentId = '1';
            getSubcategoriesUseCase.mockResolvedValue(mockSubcategories);

            await categoryController.getSubcategories(req, res, next);

            expect(getSubcategoriesUseCase).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockSubcategories);
        });

        it('should call next with error on failure', async () => {
            const error = new Error('Failed to fetch subcategories');
            req.params.parentId = '1';
            getSubcategoriesUseCase.mockRejectedValue(error);

            await categoryController.getSubcategories(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getCategoryById', () => {
        it('should return 200 with the category on success', async () => {
            const mockCategory = {
                id: '1',
                name: 'Electronics',
                slug: 'electronics',
                level: 0,
                isActive: true,
            };
            req.params.id = '1';
            getCategoryByIdUseCase.mockResolvedValue(mockCategory);

            await categoryController.getCategoryById(req, res, next);

            expect(getCategoryByIdUseCase).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockCategory);
        });

        it('should call next with notFoundException if category is not found', async () => {
            req.params.id = '1';
            getCategoryByIdUseCase.mockResolvedValue(null);
            const expectedError = notFoundException('Category not found');

            await categoryController.getCategoryById(req, res, next);

            expect(next).toHaveBeenCalledWith(expectedError);
        });

        it('should call next with error on failure', async () => {
            const error = new Error('Failed to fetch by id');
            req.params.id = '1';
            getCategoryByIdUseCase.mockRejectedValue(error);

            await categoryController.getCategoryById(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('updateCategory', () => {
        it('should return 200 with the updated category on success', async () => {
            const mockCategory = {
                id: '1',
                name: 'Updated Electronics',
                slug: 'updated-electronics',
                description: 'Updated description',
                isActive: true,
            };
            req.params.id = '1';
            req.body = {
                name: 'Updated Electronics',
                slug: 'updated-electronics',
                description: 'Updated description',
                isActive: true,
            };
            updateCategoryUseCase.mockResolvedValue(mockCategory);

            await categoryController.updateCategory(req, res, next);

            expect(updateCategoryUseCase).toHaveBeenCalledWith('1', {
                name: 'Updated Electronics',
                slug: 'updated-electronics',
                description: 'Updated description',
                isActive: true,
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockCategory);
        });

        it('should handle partial updates', async () => {
            const mockCategory = {
                id: '1',
                name: 'Electronics',
                slug: 'electronics',
                description: 'Updated description',
                isActive: true,
            };
            req.params.id = '1';
            req.body = { description: 'Updated description' };
            updateCategoryUseCase.mockResolvedValue(mockCategory);

            await categoryController.updateCategory(req, res, next);

            expect(updateCategoryUseCase).toHaveBeenCalledWith('1', {
                description: 'Updated description',
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockCategory);
        });

        it('should call next with notFoundException if category to update is not found', async () => {
            req.params.id = '1';
            req.body = { name: 'Updated Electronics' };
            updateCategoryUseCase.mockResolvedValue(null);
            const expectedError = notFoundException('Category not found');

            await categoryController.updateCategory(req, res, next);

            expect(next).toHaveBeenCalledWith(expectedError);
        });

        it('should call next with error on failure', async () => {
            const error = new Error('Update failed');
            req.params.id = '1';
            req.body = { name: 'Updated Electronics' };
            updateCategoryUseCase.mockRejectedValue(error);

            await categoryController.updateCategory(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('deleteCategory', () => {
        it('should return 204 on successful deletion', async () => {
            req.params.id = '1';
            deleteCategoryUseCase.mockResolvedValue({ id: '1' });

            await categoryController.deleteCategory(req, res, next);

            expect(deleteCategoryUseCase).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        it('should call next with notFoundException if category to delete is not found', async () => {
            req.params.id = '1';
            deleteCategoryUseCase.mockResolvedValue(null);
            const expectedError = notFoundException('Category not found');

            await categoryController.deleteCategory(req, res, next);

            expect(next).toHaveBeenCalledWith(expectedError);
        });

        it('should call next with error on failure', async () => {
            const error = new Error('Deletion failed');
            req.params.id = '1';
            deleteCategoryUseCase.mockRejectedValue(error);

            await categoryController.deleteCategory(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('Error Handling', () => {
        it('should handle errors consistently across all methods', async () => {
            const testError = new Error('Test error');

            createCategoryUseCase.mockRejectedValue(testError);
            await categoryController.createCategory(req, res, next);
            expect(next).toHaveBeenCalledWith(testError);

            next.mockClear();
            getAllCategoriesUseCase.mockRejectedValue(testError);
            await categoryController.getAllCategories(req, res, next);
            expect(next).toHaveBeenCalledWith(testError);

            next.mockClear();
            getMainCategoriesUseCase.mockRejectedValue(testError);
            await categoryController.getMainCategories(req, res, next);
            expect(next).toHaveBeenCalledWith(testError);

            next.mockClear();
            req.params.parentId = '1';
            getSubcategoriesUseCase.mockRejectedValue(testError);
            await categoryController.getSubcategories(req, res, next);
            expect(next).toHaveBeenCalledWith(testError);
        });
    });

    describe('Container Resolution', () => {
        it('should resolve all required use cases from container', () => {
            createCategoryController(container);

            expect(container.resolve).toHaveBeenCalledWith('createCategoryUseCase');
            expect(container.resolve).toHaveBeenCalledWith('getAllCategoriesUseCase');
            expect(container.resolve).toHaveBeenCalledWith('getCategoryByIdUseCase');
            expect(container.resolve).toHaveBeenCalledWith('updateCategoryUseCase');
            expect(container.resolve).toHaveBeenCalledWith('deleteCategoryUseCase');
            expect(container.resolve).toHaveBeenCalledWith('getMainCategoriesUseCase');
            expect(container.resolve).toHaveBeenCalledWith('getSubcategoriesUseCase');
        });

        it('should handle missing use cases gracefully', () => {
            const incompleteContainer = {
                resolve: jest.fn(() => null),
            };

            expect(() => createCategoryController(incompleteContainer)).not.toThrow();
        });
    });
});
