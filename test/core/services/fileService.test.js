import supabase from '../../../src/infrastructure/supabase/config/supabaseClient.js';
import { internalServerError } from '../../../src/presentation/exceptions/internalServerError.js';
import { log } from '../../../src/infrastructure/logger/logger.js';
import {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    deleteMultipleImages,
    replaceImage,
} from '../../../src/core/services/fileService.js';

jest.mock('../../../src/infrastructure/supabase/config/supabaseClient.js');
jest.mock('../../../src/presentation/exceptions/internalServerError.js');

describe('FileService', () => {
    const mockBucket = 'test-bucket';
    const mockFile = {
        originalname: 'test-image.jpg',
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
    };

    beforeAll(() => {
        process.env.SUPABASE_STORAGE_BUCKET = mockBucket;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        internalServerError.mockImplementation((msg) => new Error(msg));
    });

    describe('uploadImage', () => {
        it('should upload image successfully and return public URL', async () => {
            const mockPublicUrl =
                'https://example.com/storage/v1/object/public/test-bucket/users/file.jpg';
            const mockUploadData = { path: 'users/file.jpg' };

            supabase.storage.from.mockReturnValue({
                upload: jest.fn().mockResolvedValue({
                    data: mockUploadData,
                    error: null,
                }),
                getPublicUrl: jest.fn().mockReturnValue({
                    data: { publicUrl: mockPublicUrl },
                }),
            });

            const result = await uploadImage(mockFile, {
                folder: 'users',
                prefix: 'user',
            });

            expect(result).toBe(mockPublicUrl);
            expect(supabase.storage.from).toHaveBeenCalledWith(mockBucket);
            expect(log.debug).toHaveBeenCalledWith('Uploading image', expect.any(Object));
            expect(log.info).toHaveBeenCalledWith('Image uploaded successfully', {
                publicUrl: mockPublicUrl,
            });
        });

        it('should upload image without folder and prefix', async () => {
            const mockPublicUrl =
                'https://example.com/storage/v1/object/public/test-bucket/file.jpg';

            supabase.storage.from.mockReturnValue({
                upload: jest.fn().mockResolvedValue({
                    data: { path: 'file.jpg' },
                    error: null,
                }),
                getPublicUrl: jest.fn().mockReturnValue({
                    data: { publicUrl: mockPublicUrl },
                }),
            });

            const result = await uploadImage(mockFile);

            expect(result).toBe(mockPublicUrl);
        });

        it('should throw error when upload fails', async () => {
            const mockError = new Error('Upload failed');

            supabase.storage.from.mockReturnValue({
                upload: jest.fn().mockResolvedValue({
                    data: null,
                    error: mockError,
                }),
                getPublicUrl: jest.fn(),
            });

            await expect(uploadImage(mockFile)).rejects.toThrow();
            expect(log.error).toHaveBeenCalledWith('Upload error', expect.any(Object));
            expect(log.error).toHaveBeenCalledWith('Error uploading image', expect.any(Object));
            expect(internalServerError).toHaveBeenCalled();
        });
    });

    describe('uploadMultipleImages', () => {
        const mockFiles = [
            { ...mockFile, originalname: 'image1.jpg' },
            { ...mockFile, originalname: 'image2.jpg' },
        ];

        it('should upload multiple images successfully', async () => {
            const mockUrls = [
                'https://example.com/storage/v1/object/public/test-bucket/products/image1.jpg',
                'https://example.com/storage/v1/object/public/test-bucket/products/image2.jpg',
            ];

            supabase.storage.from.mockReturnValue({
                upload: jest
                    .fn()
                    .mockResolvedValueOnce({ data: { path: 'products/image1.jpg' }, error: null })
                    .mockResolvedValueOnce({ data: { path: 'products/image2.jpg' }, error: null }),
                getPublicUrl: jest
                    .fn()
                    .mockReturnValueOnce({ data: { publicUrl: mockUrls[0] } })
                    .mockReturnValueOnce({ data: { publicUrl: mockUrls[1] } }),
            });

            const result = await uploadMultipleImages(mockFiles, {
                folder: 'products',
                prefix: 'product',
            });

            expect(result).toHaveLength(2);
            expect(result).toEqual(mockUrls);
            expect(log.debug).toHaveBeenCalledWith('Uploading multiple images', expect.any(Object));
            expect(log.info).toHaveBeenCalledWith('Multiple images uploaded successfully', {
                count: 2,
            });
        });

        it('should throw error if one or more uploads fail', async () => {
            supabase.storage.from.mockReturnValue({
                upload: jest
                    .fn()
                    .mockResolvedValueOnce({ data: { path: 'image1.jpg' }, error: null })
                    .mockResolvedValueOnce({ data: null, error: new Error('Upload failed') }),
                getPublicUrl: jest.fn(),
            });

            await expect(uploadMultipleImages(mockFiles)).rejects.toThrow();
            expect(log.error).toHaveBeenCalledWith('Multiple upload errors', expect.any(Object));
            expect(log.error).toHaveBeenCalledWith(
                'Error uploading multiple images',
                expect.any(Object),
            );
            expect(internalServerError).toHaveBeenCalled();
        });
    });

    describe('deleteImage', () => {
        it('should delete image successfully', async () => {
            const imageUrl =
                'https://example.com/storage/v1/object/public/test-bucket/users/file.jpg';

            supabase.storage.from.mockReturnValue({
                remove: jest.fn().mockResolvedValue({
                    data: null,
                    error: null,
                }),
            });

            const result = await deleteImage(imageUrl);

            expect(result).toBe(true);
            expect(supabase.storage.from).toHaveBeenCalledWith(mockBucket);
            expect(log.debug).toHaveBeenCalledWith('Deleting image', expect.any(Object));
            expect(log.info).toHaveBeenCalledWith('Image deleted successfully', expect.any(Object));
        });

        it('should extract path correctly from different URL formats', async () => {
            const imageUrl =
                'https://example.com/storage/v1/object/public/test-bucket/folder/file.jpg';
            const mockRemove = jest.fn().mockResolvedValue({ data: null, error: null });

            supabase.storage.from.mockReturnValue({
                remove: mockRemove,
            });

            await deleteImage(imageUrl);

            expect(mockRemove).toHaveBeenCalledWith(['folder/file.jpg']);
        });

        it('should throw error when no image URL is provided', async () => {
            await expect(deleteImage(null)).rejects.toThrow();
            expect(log.error).toHaveBeenCalledWith('Error deleting image', expect.any(Object));
            expect(internalServerError).toHaveBeenCalled();
        });

        it('should throw error when delete fails', async () => {
            const imageUrl = 'https://example.com/storage/v1/object/public/test-bucket/file.jpg';

            supabase.storage.from.mockReturnValue({
                remove: jest.fn().mockResolvedValue({
                    data: null,
                    error: new Error('Delete failed'),
                }),
            });

            await expect(deleteImage(imageUrl)).rejects.toThrow();
            expect(log.error).toHaveBeenCalledWith('Supabase delete error', expect.any(Object));
            expect(log.error).toHaveBeenCalledWith('Error deleting image', expect.any(Object));
            expect(internalServerError).toHaveBeenCalled();
        });
    });

    describe('deleteMultipleImages', () => {
        it('should delete multiple images successfully', async () => {
            const imageUrls = [
                'https://example.com/storage/v1/object/public/test-bucket/folder/image1.jpg',
                'https://example.com/storage/v1/object/public/test-bucket/folder/image2.jpg',
            ];

            supabase.storage.from.mockReturnValue({
                remove: jest.fn().mockResolvedValue({
                    data: [{ name: 'image1.jpg' }, { name: 'image2.jpg' }],
                    error: null,
                }),
            });

            const result = await deleteMultipleImages(imageUrls);

            expect(result.success).toBe(2);
            expect(result.failed).toBe(0);
            expect(result.deletedPaths).toHaveLength(2);
            expect(log.debug).toHaveBeenCalledWith('Deleting multiple images', expect.any(Object));
            expect(log.info).toHaveBeenCalledWith('Multiple images deleted', expect.any(Object));
        });

        it('should filter out null/undefined URLs', async () => {
            const imageUrls = [
                'https://example.com/storage/v1/object/public/test-bucket/image1.jpg',
                null,
                'https://example.com/storage/v1/object/public/test-bucket/image2.jpg',
                undefined,
            ];

            const mockRemove = jest.fn().mockResolvedValue({
                data: [{ name: 'image1.jpg' }, { name: 'image2.jpg' }],
                error: null,
            });

            supabase.storage.from.mockReturnValue({
                remove: mockRemove,
            });

            await deleteMultipleImages(imageUrls);

            expect(mockRemove).toHaveBeenCalledWith(['image1.jpg', 'image2.jpg']);
        });

        it('should throw error when no URLs are provided', async () => {
            await expect(deleteMultipleImages([])).rejects.toThrow();
            expect(log.error).toHaveBeenCalledWith(
                'Error deleting multiple images',
                expect.any(Object),
            );
            expect(internalServerError).toHaveBeenCalled();
        });

        it('should throw error when delete fails', async () => {
            const imageUrls = [
                'https://example.com/storage/v1/object/public/test-bucket/image.jpg',
            ];

            supabase.storage.from.mockReturnValue({
                remove: jest.fn().mockResolvedValue({
                    data: null,
                    error: new Error('Delete failed'),
                }),
            });

            await expect(deleteMultipleImages(imageUrls)).rejects.toThrow();
            expect(log.error).toHaveBeenCalledWith(
                'Supabase multiple delete error',
                expect.any(Object),
            );
            expect(log.error).toHaveBeenCalledWith(
                'Error deleting multiple images',
                expect.any(Object),
            );
            expect(internalServerError).toHaveBeenCalled();
        });
    });

    describe('replaceImage', () => {
        const oldImageUrl =
            'https://example.com/storage/v1/object/public/test-bucket/old-image.jpg';
        const newImageUrl =
            'https://example.com/storage/v1/object/public/test-bucket/new-image.jpg';

        it('should replace image successfully', async () => {
            supabase.storage.from.mockReturnValue({
                upload: jest.fn().mockResolvedValue({
                    data: { path: 'new-image.jpg' },
                    error: null,
                }),
                getPublicUrl: jest.fn().mockReturnValue({
                    data: { publicUrl: newImageUrl },
                }),
                remove: jest.fn().mockResolvedValue({
                    data: null,
                    error: null,
                }),
            });

            const result = await replaceImage(oldImageUrl, mockFile, { folder: 'users' });

            expect(result).toBe(newImageUrl);
            expect(log.debug).toHaveBeenCalledWith('Replacing image', expect.any(Object));
            expect(log.info).toHaveBeenCalledWith(
                'Image replaced successfully',
                expect.any(Object),
            );
        });

        it('should not delete default image', async () => {
            const defaultImageUrl =
                'https://example.com/storage/v1/object/public/test-bucket/default.jpg';
            const mockRemove = jest.fn();

            supabase.storage.from.mockReturnValue({
                upload: jest.fn().mockResolvedValue({
                    data: { path: 'new-image.jpg' },
                    error: null,
                }),
                getPublicUrl: jest.fn().mockReturnValue({
                    data: { publicUrl: newImageUrl },
                }),
                remove: mockRemove,
            });

            await replaceImage(defaultImageUrl, mockFile, {}, defaultImageUrl);

            expect(mockRemove).not.toHaveBeenCalled();
        });

        it('should handle when old image URL is null', async () => {
            supabase.storage.from.mockReturnValue({
                upload: jest.fn().mockResolvedValue({
                    data: { path: 'new-image.jpg' },
                    error: null,
                }),
                getPublicUrl: jest.fn().mockReturnValue({
                    data: { publicUrl: newImageUrl },
                }),
                remove: jest.fn(),
            });

            const result = await replaceImage(null, mockFile);

            expect(result).toBe(newImageUrl);
        });

        it('should continue if old image deletion fails', async () => {
            const mockRemove = jest.fn().mockResolvedValue({
                data: null,
                error: new Error('Delete failed'),
            });

            supabase.storage.from.mockReturnValue({
                upload: jest.fn().mockResolvedValue({
                    data: { path: 'new-image.jpg' },
                    error: null,
                }),
                getPublicUrl: jest.fn().mockReturnValue({
                    data: { publicUrl: newImageUrl },
                }),
                remove: mockRemove,
            });

            const result = await replaceImage(oldImageUrl, mockFile);

            expect(result).toBe(newImageUrl);
            expect(log.warn).toHaveBeenCalledWith('Could not delete old image', expect.any(Object));
        });

        it('should throw error if upload fails', async () => {
            supabase.storage.from.mockReturnValue({
                upload: jest.fn().mockResolvedValue({
                    data: null,
                    error: new Error('Upload failed'),
                }),
                getPublicUrl: jest.fn(),
            });

            await expect(replaceImage(oldImageUrl, mockFile)).rejects.toThrow();
            expect(log.error).toHaveBeenCalledWith('Error replacing image', expect.any(Object));
            expect(internalServerError).toHaveBeenCalled();
        });
    });
});
