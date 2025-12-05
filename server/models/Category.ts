import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
}

const categorySchema = new Schema<ICategory>({
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
  imageUrl: {
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

export const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema);
