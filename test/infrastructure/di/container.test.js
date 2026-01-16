import { createContainer } from '../../../src/infrastructure/di/container.js';

describe('DI Container', () => {
    let container;

    beforeAll(() => {
        container = createContainer();
    });

    it('should create a container with all dependencies resolved', () => {
        expect(container).toBeDefined();

        expect(container.userController).toBeDefined();
        expect(container.authController).toBeDefined();
        expect(container.categoryController).toBeDefined();
        expect(container.productController).toBeDefined();
        expect(container.storeController).toBeDefined();
        expect(container.reviewController).toBeDefined();
        expect(container.chatController).toBeDefined();
        expect(container.adminController).toBeDefined();
        expect(container.sellerRequestController).toBeDefined();

        expect(container.canModifyProduct).toBeDefined();
        expect(container.canModifyStore).toBeDefined();

        expect(container.messageRepository).toBeDefined();
        expect(container.conversationRepository).toBeDefined();
        expect(container.chatRepository).toBeDefined();
        expect(container.storeRepository).toBeDefined();
        expect(container.categoryRepository).toBeDefined();
    });

    it('should have working auth controller methods', () => {
        expect(typeof container.authController.register).toBe('function');
        expect(typeof container.authController.login).toBe('function');
        expect(typeof container.authController.logout).toBe('function');
    });

    it('should have working user controller methods', () => {
        expect(typeof container.userController.createUser).toBe('function');
        expect(typeof container.userController.getAllUsers).toBe('function');
        expect(typeof container.userController.getUserById).toBe('function');
        expect(typeof container.userController.updateUserById).toBe('function');
        expect(typeof container.userController.deleteUserById).toBe('function');
        expect(typeof container.userController.getUserProfile).toBe('function');
        expect(typeof container.userController.updateProfilePicture).toBe('function');
    });

    it('should have working product controller methods', () => {
        expect(typeof container.productController.createProduct).toBe('function');
        expect(typeof container.productController.getAllProducts).toBe('function');
        expect(typeof container.productController.getProductById).toBe('function');
        expect(typeof container.productController.updateProduct).toBe('function');
        expect(typeof container.productController.deleteProduct).toBe('function');
        expect(typeof container.productController.getStoreProducts).toBe('function');
    });

    it('should have working store controller methods', () => {
        expect(container.storeController).toBeDefined();

        expect(typeof container.storeController.createStore).toBe('function');
        expect(typeof container.storeController.getMyStores).toBe('function');
        expect(typeof container.storeController.getAllStores).toBe('function');
        expect(typeof container.storeController.updateStore).toBe('function');
        expect(typeof container.storeController.deleteStore).toBe('function');
    });

    it('should have working category controller methods', () => {
        expect(typeof container.categoryController.createCategory).toBe('function');
        expect(typeof container.categoryController.getAllCategories).toBe('function');
        expect(typeof container.categoryController.getCategoryById).toBe('function');
        expect(typeof container.categoryController.updateCategory).toBe('function');
        expect(typeof container.categoryController.deleteCategory).toBe('function');
        expect(typeof container.categoryController.getMainCategories).toBe('function');
        expect(typeof container.categoryController.getSubcategories).toBe('function');
    });

    it('should have working chat controller methods', () => {
        expect(typeof container.chatController.sendMessage).toBe('function');
        expect(typeof container.chatController.getConversationMessages).toBe('function');
        expect(typeof container.chatController.getUserConversations).toBe('function');
        expect(typeof container.chatController.markMessagesAsRead).toBe('function');
        expect(typeof container.chatController.generateChatToken).toBe('function');
        expect(typeof container.chatController.getConversationByParticipant).toBe('function');
    });

    it('should have working review controller methods', () => {
        expect(typeof container.reviewController.createReview).toBe('function');
        expect(typeof container.reviewController.getAllReviews).toBe('function');
        expect(typeof container.reviewController.getReviewById).toBe('function');
        expect(typeof container.reviewController.updateReview).toBe('function');
        expect(typeof container.reviewController.deleteReview).toBe('function');
    });

    it('should have working admin controller methods', () => {
        expect(container.adminController).toBeDefined();
        expect(Object.keys(container.adminController).length).toBeGreaterThan(0);
    });

    it('should have working seller request controller methods', () => {
        expect(container.sellerRequestController).toBeDefined();
        expect(Object.keys(container.sellerRequestController).length).toBeGreaterThan(0);
    });

    it('should have middleware functions', () => {
        expect(typeof container.canModifyProduct).toBe('function');
        expect(typeof container.canModifyStore).toBe('function');
    });
});
