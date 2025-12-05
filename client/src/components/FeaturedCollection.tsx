import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useSiteContent } from "@/hooks/useSiteContent";

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  brand: string;
  imageUrl: string;
  inStock: boolean;
  featured: boolean;
}

export default function FeaturedCollection() {
  const { data: siteContent } = useSiteContent();
  const featuredSettings = siteContent?.featured_collection;

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
      const res = await fetch('/api/products/featured');
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  const sectionTitle = featuredSettings?.title || "Collections";
  const buttonText = featuredSettings?.buttonText || "View All Products";
  const buttonLink = featuredSettings?.buttonLink || "/shop";

  if (isLoading) {
    return (
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-muted mb-6 rounded" />
                <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                <div className="h-6 bg-muted rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif text-primary">{sectionTitle}</h2>
            </div>
          </div>
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg">No collections yet. Check back soon!</p>
            <p className="text-sm mt-2">Admins can add products from the admin dashboard.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6 bg-background">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif text-primary">{sectionTitle}</h2>
          </div>
          <Link href={buttonLink}>
            <span className="text-sm border-b border-primary pb-1 hover:opacity-60 transition-opacity mt-4 md:mt-0 cursor-pointer">
              {buttonText}
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 lg:gap-6">
          {products.map((product, index) => (
            <Link href={`/product/${product._id}`} key={product._id}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group cursor-pointer"
                data-testid={`card-product-${product._id}`}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-white text-black py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 text-xs uppercase tracking-widest font-medium text-center"
                  >
                    View Product
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-primary group-hover:underline decoration-1 underline-offset-4 transition-all line-clamp-1">
                    {product.name}
                  </h3>
                  <span className="text-sm font-medium">{product.price} KWD</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
