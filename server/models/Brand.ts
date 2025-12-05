import mongoose, { Document, Schema } from 'mongoose';

export interface IBrand extends Document {
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
}

const brandSchema = new Schema<IBrand>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: '',
  },
  logoUrl: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Brand = mongoose.models.Brand || mongoose.model<IBrand>('Brand', brandSchema);
