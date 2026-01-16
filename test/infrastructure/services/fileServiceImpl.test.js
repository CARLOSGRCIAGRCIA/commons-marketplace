import { FileServiceImpl } from '../../../src/infrastructure/services/fileServiceImpl.js';
import * as fileService from '../../../src/core/services/fileService.js';

jest.mock('../../../src/core/services/fileService.js');

describe('FileServiceImpl', () => {
    it('should call fileService.uploadImage when uploadImage is called', async () => {
        const file = { buffer: Buffer.from('test'), mimetype: 'image/png' };
        await FileServiceImpl.uploadImage(file);
        expect(fileService.uploadImage).toHaveBeenCalledWith(file);
    });

    it('should call fileService.deleteImage when deleteImage is called', async () => {
        const imageUrl = 'test_url';
        await FileServiceImpl.deleteImage(imageUrl);
        expect(fileService.deleteImage).toHaveBeenCalledWith(imageUrl);
    });
});
