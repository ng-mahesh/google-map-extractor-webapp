import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(userData: Partial<User>): Promise<UserDocument> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async updateQuota(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const now = new Date();
    const resetDate = new Date(user.quotaResetDate);

    // Reset quota if a day has passed
    if (now > resetDate) {
      user.usedQuotaToday = 0;
      user.quotaResetDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }

    user.usedQuotaToday += 1;
    return user.save();
  }

  async hasQuotaRemaining(userId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      return false;
    }

    const now = new Date();
    const resetDate = new Date(user.quotaResetDate);

    // Reset quota if a day has passed
    if (now > resetDate) {
      user.usedQuotaToday = 0;
      user.quotaResetDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      await user.save();
    }

    return user.usedQuotaToday < user.dailyQuota;
  }

  async getRemainingQuota(userId: string): Promise<number> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      return 0;
    }

    const now = new Date();
    const resetDate = new Date(user.quotaResetDate);

    // Reset quota if a day has passed
    if (now > resetDate) {
      return user.dailyQuota;
    }

    return Math.max(0, user.dailyQuota - user.usedQuotaToday);
  }

  /**
   * Refund quota when extraction fails with no results
   */
  async refundQuota(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Only refund if user has used quota
    if (user.usedQuotaToday > 0) {
      user.usedQuotaToday -= 1;
      return user.save();
    }

    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateProfileDto.name !== undefined) {
      user.name = updateProfileDto.name;
    }

    if (updateProfileDto.phone !== undefined) {
      user.phone = updateProfileDto.phone;
    }

    if (updateProfileDto.profileImage !== undefined) {
      user.profileImage = updateProfileDto.profileImage;
    }

    return user.save();
  }
}
