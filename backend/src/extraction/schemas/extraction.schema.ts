import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExtractionDocument = Extraction & Document;

export interface Review {
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface ExtractedPlace {
  category: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  rating: number;
  reviewsCount: number;
  reviews?: Review[];
  openingHours?: string[];
  isOpen?: boolean;
  placeId?: string;
}

@Schema({ timestamps: true })
export class Extraction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  keyword: string;

  @Prop({ default: 'pending' })
  status: string; // pending, processing, completed, failed

  @Prop({ type: [Object], default: [] })
  results: ExtractedPlace[];

  @Prop({ default: 0 })
  totalResults: number;

  @Prop({ default: 0 })
  duplicatesSkipped: number;

  @Prop({ default: 0 })
  withoutPhoneSkipped: number;

  @Prop({ default: true })
  skipDuplicates: boolean;

  @Prop({ default: true })
  skipWithoutPhone: boolean;

  @Prop({ default: false })
  skipWithoutWebsite: boolean;

  @Prop({ type: [String], default: [] })
  logs: string[];

  @Prop({ default: '' })
  errorMessage: string;

  @Prop()
  startedAt: Date;

  @Prop()
  completedAt: Date;
}

export const ExtractionSchema = SchemaFactory.createForClass(Extraction);

// Index for faster queries
ExtractionSchema.index({ userId: 1, createdAt: -1 });
ExtractionSchema.index({ status: 1 });
