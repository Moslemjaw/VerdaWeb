import mongoose, { Document, Schema } from 'mongoose';

export interface ISiteContent extends Document {
  section: string;
  content: {
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    imageUrl?: string;
    images?: string[];
    category?: string;
    items?: Array<{
      title: string;
      description?: string;
      imageUrl?: string;
      link?: string;
    }>;
  };
  isActive: boolean;
  updatedAt: Date;
}

const SiteContentSchema = new Schema<ISiteContent>(
  {
    section: {
      type: String,
      required: true,
      unique: true,
      enum: ['hero', 'featured_collection', 'brand_story', 'newsletter', 'categories'],
    },
    content: {
      title: String,
      subtitle: String,
      description: String,
      buttonText: String,
      buttonLink: String,
      imageUrl: String,
      images: [String],
      category: String,
      items: [{
        title: String,
        description: String,
        imageUrl: String,
        link: String,
      }],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const SiteContent = mongoose.model<ISiteContent>('SiteContent', SiteContentSchema);
