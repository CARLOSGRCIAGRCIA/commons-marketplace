import * as fileService from '../../../src/core/services/fileService.js';

jest.mock('../../../src/core/services/fileService.js', () => ({
    uploadImage: jest.fn(),
    deleteImage: jest.fn(),
    uploadMultipleImages: jest.fn(),
    deleteMultipleImages: jest.fn(),
    replaceImage: jest.fn(),
}));

describe('FileService', () => {
    it('should call uploadImage with file', async () => {
        const file = { buffer: Buffer.from('test'), mimetype: 'image/png' };
        await fileService.uploadImage(file);
        expect(fileService.uploadImage).toHaveBeenCalledWith(file);
    });

    it('should call deleteImage with imageUrl', async () => {
        const imageUrl = 'test_url';
        await fileService.deleteImage(imageUrl);
        expect(fileService.deleteImage).toHaveBeenCalledWith(imageUrl);
    });
});
