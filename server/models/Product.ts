import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  category: string;
  categories: string[];
  brand: string;
  imageUrl: string;
  images: string[];
  inStock: boolean;
  featured: boolean;
  newArrival: boolean;
  sizes: string[];
  colors: string[];
  material: string;
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
  compareAtPrice: {
    type: Number,
    default: null,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: false,
    default: '',
  },
  categories: {
    type: [String],
    default: [],
  },
  brand: {
    type: String,
    default: 'Lumière',
  },
  imageUrl: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    default: [],
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  newArrival: {
    type: Boolean,
    default: true,
  },
  sizes: {
    type: [String],
    default: ['XS', 'S', 'M', 'L', 'XL'],
  },
  colors: {
    type: [String],
    default: [],
  },
  material: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
