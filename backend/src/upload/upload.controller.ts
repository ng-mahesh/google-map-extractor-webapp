import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { extname } from 'path';

@Controller('upload')
export class UploadController {
  @Post('profile-image')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/profile-images',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `profile-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(
            new BadRequestException('Only image files (jpg, jpeg, png, gif, webp) are allowed'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  uploadProfileImage(@UploadedFile() file: Express.Multer.File): { imageUrl: string } {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Return the relative path to the uploaded file
    const imageUrl = `/uploads/profile-images/${file.filename}`;
    return { imageUrl };
  }
}
