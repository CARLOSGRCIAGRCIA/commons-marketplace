import * as fileService from '../../core/services/fileService.js';

export const FileServiceImpl = {
    uploadImage: (file) => fileService.uploadImage(file),
    deleteImage: (imageUrl) => fileService.deleteImage(imageUrl),
};
