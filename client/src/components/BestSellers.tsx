import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useQuery } from "@tanstack/react-query";

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
}

const sampleProducts = [
  { _id: 's1', name: 'Poncho with Draped Collar', price: 93, imageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80', category: 'Outerwear' },
  { _id: 's2', name: 'Faux Fur Embellished Poncho', price: 62, imageUrl: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80', category: 'Outerwear' },
  { _id: 's3', name: 'Fleece Shawl Poncho', price: 149, imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80', category: 'Outerwear' },
  { _id: 's4', name: 'Double Face Faux Fur Shawl', price: 85, imageUrl: 'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=800&q=80', category: 'Accessories' },
  { _id: 's5', name: 'Solid Midi Belted Coat', price: 159, imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80', category: 'Outerwear' },
  { _id: 's6', name: 'Contrast Double-Faced Jacket', price: 145, imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80', category: 'Outerwear' },
];

export default function BestSellers() {
  const [emblaRef] = useEmblaCarousel({ align: "start", loop: false, dragFree: true });
  const { data: siteContent } = useSiteContent();
  
  const bestSellersContent = siteContent?.best_sellers;
  const title = bestSellersContent?.title || "BEST SELLERS";
  const buttonText = bestSellersContent?.buttonText || "SHOP BEST SELLERS";

  const { data: apiProducts = [] } = useQuery<Product[]>({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
      const res = await fetch('/api/products/featured');
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  const products = apiProducts.length > 0 
    ? [...apiProducts, ...sampleProducts.slice(0, Math.max(0, 8 - apiProducts.length))]
    : sampleProducts;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:w-64 flex-shrink-0"
          >
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">{title}</h2>
            <p className="text-muted-foreground text-sm mb-6">Shop our bestselling styles.</p>
            <Link href="/best">
              <span className="inline-block border border-foreground px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-foreground hover:text-background transition-all cursor-pointer">
                {buttonText}
              </span>
            </Link>
          </motion.div>

          <div className="flex-1 overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="flex-[0_0_160px] md:flex-[0_0_180px] min-w-0 group cursor-pointer"
                >
                  <div className="aspect-[3/4] bg-secondary/50 mb-3 overflow-hidden">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  </div>
                  <h3 className="text-xs uppercase tracking-wide text-foreground/80 mb-1 truncate">{product.name}</h3>
                  <p className="text-sm font-medium">{product.price} KWD</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center lg:justify-end">
          <div className="w-full max-w-md lg:max-w-xl h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-foreground rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
