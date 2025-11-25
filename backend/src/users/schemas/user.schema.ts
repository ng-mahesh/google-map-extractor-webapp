import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: '' })
  name: string;

  @Prop({ default: 100 })
  dailyQuota: number;

  @Prop({ default: 0 })
  usedQuotaToday: number;

  @Prop({ default: new Date() })
  quotaResetDate: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ default: '' })
  profileImage: string;

  @Prop({ default: '' })
  phone: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Method to check if user has exceeded quota
UserSchema.methods.hasQuotaRemaining = function () {
  const now = new Date();
  const resetDate = new Date(this.quotaResetDate);

  // Reset quota if a day has passed
  if (now > resetDate) {
    this.usedQuotaToday = 0;
    this.quotaResetDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }

  return this.usedQuotaToday < this.dailyQuota;
};

UserSchema.methods.incrementQuota = function () {
  this.usedQuotaToday += 1;
  return this.save();
};
