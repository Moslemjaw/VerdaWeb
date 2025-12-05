import { motion } from "framer-motion";
import { Link } from "wouter";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState, useEffect } from "react";

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
}

const bestSellerProducts: Product[] = [
  { _id: 'bs1', name: 'Poncho with Draped Collar', price: 93, imageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80', category: 'Outerwear' },
  { _id: 'bs2', name: 'Faux Fur Embellished Poncho', price: 62, imageUrl: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80', category: 'Outerwear' },
  { _id: 'bs3', name: 'Fleece Shawl Poncho', price: 149, imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80', category: 'Outerwear' },
  { _id: 'bs4', name: 'Double Face Faux Fur Shawl', price: 85, imageUrl: 'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=800&q=80', category: 'Accessories' },
  { _id: 'bs5', name: 'Solid Midi Belted Coat', price: 159, imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80', category: 'Outerwear' },
  { _id: 'bs6', name: 'Contrast Double-Faced Jacket', price: 145, imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80', category: 'Outerwear' },
  { _id: 'bs7', name: 'Wool Blend Oversized Coat', price: 189, imageUrl: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=800&q=80', category: 'Outerwear' },
  { _id: 'bs8', name: 'Cashmere Wrap Cardigan', price: 125, imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80', category: 'Tops' },
  { _id: 'bs9', name: 'Quilted Puffer Jacket', price: 175, imageUrl: 'https://images.unsplash.com/photo-1544923246-77307dd628b8?w=800&q=80', category: 'Outerwear' },
  { _id: 'bs10', name: 'Leather Trim Blazer', price: 210, imageUrl: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800&q=80', category: 'Outerwear' },
];

export default function BestSellers() {
  const { data: siteContent } = useSiteContent();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  
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

  const products = apiProducts.length >= 10 
    ? apiProducts.slice(0, 10)
    : [...apiProducts, ...bestSellerProducts].slice(0, 10);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollElement;
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;
      setScrollProgress(progress);
    };

    scrollElement.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="py-12 md:py-16 bg-white">
      {/* Mobile Layout */}
      <div className="md:hidden px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl font-bold tracking-tight text-black mb-2">{title}</h2>
          <p className="text-gray-500 text-sm mb-4">Shop our bestselling styles.</p>
        </motion.div>

        <div 
          ref={scrollRef}
          className="overflow-x-auto scroll-smooth hide-scrollbar -mx-4 px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
          <div className="flex gap-3 pb-4">
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex-shrink-0 w-[140px] group cursor-pointer"
              >
                <div className="aspect-[3/4] bg-gray-100 mb-2 overflow-hidden rounded-lg">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xs uppercase tracking-wide text-gray-700 mb-1 truncate">{product.name}</h3>
                <p className="text-sm font-medium text-black">{product.price} KWD</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-4 mb-4">
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-black rounded-full transition-all duration-150 ease-out"
              style={{ width: `${Math.max(20, scrollProgress * 100)}%`, marginLeft: `${scrollProgress * (100 - Math.max(20, scrollProgress * 100))}%` }} />
          </div>
        </div>

        <div className="text-center">
          <Link href="/shop?filter=bestsellers">
            <span className="inline-block border border-black text-black px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-black hover:text-white transition-all cursor-pointer min-h-[44px]">
              {buttonText}
            </span>
          </Link>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="flex items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-[28%] flex-shrink-0 px-6 text-center flex flex-col items-center justify-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-black mb-3">{title}</h2>
            <p className="text-gray-500 text-sm mb-8">Shop our bestselling styles.</p>
            <Link href="/shop?filter=bestsellers">
              <span className="inline-block border border-black text-black px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-black hover:text-white transition-all cursor-pointer">
                {buttonText}
              </span>
            </Link>
          </motion.div>

          <div 
            className="w-[72%] overflow-x-auto scroll-smooth pr-8 hide-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onScroll={(e) => {
              const el = e.target as HTMLDivElement;
              const progress = el.scrollLeft / (el.scrollWidth - el.clientWidth);
              setScrollProgress(Math.max(0, Math.min(1, progress)));
            }}
          >
            <div className="flex gap-5 pb-4">
              {products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex-shrink-0 w-[200px] group cursor-pointer"
                >
                  <div className="aspect-[3/4] bg-gray-100 mb-3 overflow-hidden">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <h3 className="text-xs uppercase tracking-wide text-gray-700 mb-1 truncate">{product.name}</h3>
                  <p className="text-sm font-medium text-black">{product.price} KWD</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 px-8">
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-black rounded-full transition-all duration-150 ease-out"
              style={{ width: `${Math.max(15, scrollProgress * 100)}%`, marginLeft: `${scrollProgress * (100 - Math.max(15, scrollProgress * 100))}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
