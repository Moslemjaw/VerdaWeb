import { useQuery } from '@tanstack/react-query';

export interface SiteContentData {
  hero?: {
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    imageUrl?: string;
    images?: string[];
  };
  featured_collection?: {
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    category?: string;
  };
  new_collection?: {
    seasonText?: string;
    heading?: string;
    buttonText?: string;
    images?: string[];
  };
  brand_story?: {
    title?: string;
    description?: string;
  };
  newsletter?: {
    title?: string;
    subtitle?: string;
    buttonText?: string;
  };
}

export function useSiteContent() {
  return useQuery<SiteContentData>({
    queryKey: ['siteContent'],
    queryFn: async () => {
      const res = await fetch('/api/content');
      if (!res.ok) throw new Error('Failed to fetch content');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
