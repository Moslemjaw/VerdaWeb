import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useSiteContent } from "@/hooks/useSiteContent";

interface CMSCategory {
  name: string;
  image: string;
}

interface DBCategory {
  _id: string;
  name: string;
  slug: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
}

interface DisplayCategory {
  name: string;
  image: string;
}

const defaultImages: Record<string, string> = {
  "Dresses": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600",
  "Evening Wear": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600",
  "Accessories": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600",
  "Outerwear": "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600",
  "Tops": "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600",
  "Bottoms": "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600",
};

const defaultPlaceholder = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600";

export default function FeaturedCollection() {
  const { data: siteContent } = useSiteContent();
  const collectionSettings = siteContent?.featured_collection;

  // Fetch actual categories from database to get their images
  const { data: dbCategories = [] } = useQuery<DBCategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const sectionTitle = collectionSettings?.title || "Collections";
  const buttonText = collectionSettings?.buttonText || "View All Products";
  const buttonLink = collectionSettings?.buttonLink || "/shop";
  
  const cmsCategories: CMSCategory[] = (collectionSettings as any)?.categories || [];
  
  // Build display categories: use CMS names but always get images from DB categories
  const categories: DisplayCategory[] = cmsCategories.length > 0 
    ? cmsCategories.map(cmsCat => {
        // Find matching category in database (case-insensitive)
        const dbCat = dbCategories.find(
          db => db.name.toLowerCase() === cmsCat.name.toLowerCase() && db.isActive
        );
        
        // Always use DB category image, fallback to default image by name, then placeholder
        const image = dbCat?.imageUrl && dbCat.imageUrl.trim() !== ''
          ? dbCat.imageUrl
          : defaultImages[cmsCat.name] || defaultPlaceholder;
        
        return { name: cmsCat.name, image };
      })
    : dbCategories
        .filter(cat => cat.isActive)
        .slice(0, 6)
        .map(cat => ({
          name: cat.name,
          image: cat.imageUrl && cat.imageUrl.trim() !== '' 
            ? cat.imageUrl 
            : defaultImages[cat.name] || defaultPlaceholder
        }));

  return (
    <section className="py-20 md:py-24 px-6 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-4xl md:text-5xl font-serif text-primary mb-4">{sectionTitle}</h2>
          <Link href={buttonLink}>
            <span className="text-sm border-b border-primary pb-1 hover:opacity-60 transition-opacity cursor-pointer">
              {buttonText}
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
          {categories.map((category, index) => (
            <Link href={`/shop?category=${encodeURIComponent(category.name)}`} key={category.name}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group cursor-pointer"
                data-testid={`card-category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="relative aspect-[2/3] overflow-hidden mb-2">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-white text-black py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 text-xs uppercase tracking-widest font-medium text-center"
                  >
                    Shop Now
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-medium text-primary group-hover:underline decoration-1 underline-offset-4 transition-all">
                    {category.name}
                  </h3>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
