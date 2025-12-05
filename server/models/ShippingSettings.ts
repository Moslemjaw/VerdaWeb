import mongoose, { Schema, Document } from 'mongoose';

export interface IShippingSettings extends Document {
  _id: mongoose.Types.ObjectId;
  baseRate: number;
  freeThreshold: number;
  enableFreeThreshold: boolean;
  updatedAt: Date;
}

const ShippingSettingsSchema = new Schema<IShippingSettings>({
  baseRate: { type: Number, required: true, default: 2, min: 0 },
  freeThreshold: { type: Number, required: true, default: 50, min: 0 },
  enableFreeThreshold: { type: Boolean, required: true, default: true },
}, { timestamps: true });

export const ShippingSettings = mongoose.model<IShippingSettings>('ShippingSettings', ShippingSettingsSchema);

export async function getShippingSettings(): Promise<IShippingSettings> {
  let settings = await ShippingSettings.findOne();
  if (!settings) {
    settings = await ShippingSettings.create({
      baseRate: 2,
      freeThreshold: 50,
      enableFreeThreshold: true,
    });
  }
  return settings;
}
