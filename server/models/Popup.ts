import mongoose, { Document, Schema } from 'mongoose';

export type PopupType = 'global_discount' | 'new_account_discount' | 'announcement';

export interface IPopup extends Document {
  type: PopupType;
  title: string;
  description: string;
  discountCode?: string;
  linkUrl?: string;
  linkText?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const popupSchema = new Schema<IPopup>({
  type: {
    type: String,
    enum: ['global_discount', 'new_account_discount', 'announcement'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  discountCode: {
    type: String,
    default: null,
  },
  linkUrl: {
    type: String,
    default: null,
  },
  linkText: {
    type: String,
    default: 'Learn More',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export const Popup = mongoose.model<IPopup>('Popup', popupSchema);
