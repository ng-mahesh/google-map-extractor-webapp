import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploadController } from './upload.controller';

describe('UploadController', () => {
  let controller: UploadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
    }).compile();

    controller = module.get<UploadController>(UploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadProfileImage', () => {
    it('should return image URL when file is uploaded successfully', () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        filename: 'profile-1234567890-123456789.jpg',
        path: '/uploads/profile-images/profile-1234567890-123456789.jpg',
        buffer: Buffer.from(''),
      } as Express.Multer.File;

      const result = controller.uploadProfileImage(mockFile);

      expect(result).toHaveProperty('imageUrl');
      expect(result.imageUrl).toContain('/uploads/profile-images/');
      expect(result.imageUrl).toContain(mockFile.filename);
    });

    it('should throw BadRequestException when no file is provided', () => {
      expect(() => {
        controller.uploadProfileImage(null);
      }).toThrow(BadRequestException);
    });

    it('should throw BadRequestException when undefined file is provided', () => {
      expect(() => {
        controller.uploadProfileImage(undefined);
      }).toThrow(BadRequestException);
    });
  });
});
