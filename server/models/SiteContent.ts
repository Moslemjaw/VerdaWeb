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
    seasonText?: string;
    heading?: string;
    navLabel?: string;
    useCategoryImages?: boolean;
    heroImages?: string[];
    categories?: Array<{
      name: string;
      image: string;
    }>;
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
      enum: ['hero', 'featured_collection', 'brand_story', 'newsletter', 'categories', 'new_collection', 'best_sellers', 'new_in'],
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
      seasonText: String,
      heading: String,
      navLabel: String,
      useCategoryImages: Boolean,
      heroImages: [String],
      categories: [{
        name: String,
        image: String,
      }],
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
