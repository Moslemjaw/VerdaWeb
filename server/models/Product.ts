import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  inStock: boolean;
  featured: boolean;
  createdAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
