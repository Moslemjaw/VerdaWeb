import mongoose, { Schema, Document } from 'mongoose';

export interface IShippingCountry extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
  shippingRate: number;
  freeThreshold: number;
  enableFreeThreshold: boolean;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShippingCountrySchema = new Schema<IShippingCountry>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  shippingRate: { type: Number, required: true, default: 2, min: 0 },
  freeThreshold: { type: Number, required: true, default: 50, min: 0 },
  enableFreeThreshold: { type: Boolean, required: true, default: true },
  isActive: { type: Boolean, required: true, default: true },
  isDefault: { type: Boolean, required: true, default: false },
}, { timestamps: true });

ShippingCountrySchema.index({ isDefault: 1 });

export const ShippingCountry = mongoose.model<IShippingCountry>('ShippingCountry', ShippingCountrySchema);

export async function getDefaultCountry(): Promise<IShippingCountry | null> {
  let country = await ShippingCountry.findOne({ isDefault: true, isActive: true });
  if (!country) {
    country = await ShippingCountry.findOne({ isActive: true });
  }
  return country;
}

export async function initializeDefaultCountries(): Promise<void> {
  const count = await ShippingCountry.countDocuments();
  if (count === 0) {
    await ShippingCountry.create({
      name: 'Kuwait',
      code: 'KW',
      shippingRate: 2,
      freeThreshold: 50,
      enableFreeThreshold: true,
      isActive: true,
      isDefault: true,
    });
  }
}
