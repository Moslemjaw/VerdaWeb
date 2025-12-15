import { motion } from "framer-motion";
import { Link } from "wouter";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState, useEffect } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
}

export default function BestSellers() {
  const { data: siteContent } = useSiteContent();
  const { formatPrice } = useCurrency();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const bestSellersContent = siteContent?.best_sellers;
  const title = bestSellersContent?.title || "BEST SELLERS";
  const description = (bestSellersContent as any)?.description || "Shop our bestselling styles.";
  const selectedCategory = (bestSellersContent as any)?.category || "";
  const buttonText = bestSellersContent?.buttonText || "SHOP BEST SELLERS";
  
  // Build the shop link based on selected category
  const shopLink = selectedCategory && selectedCategory !== 'all' 
    ? `/shop?category=${encodeURIComponent(selectedCategory)}`
    : '/shop';

  const { data: apiProducts = [] } = useQuery<Product[]>({
    queryKey: ['bestSellersProducts', selectedCategory],
    queryFn: async () => {
      // Fetch products filtered by category
      if (selectedCategory && selectedCategory !== 'all') {
        const res = await fetch(`/api/products?category=${encodeURIComponent(selectedCategory)}&limit=10`);
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      }
      // Otherwise fetch all products
      const res = await fetch('/api/products?limit=10');
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  // Use API products only - no fallback to static data
  const products = apiProducts.slice(0, 10);

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
          <p className="text-gray-500 text-sm mb-4">{description}</p>
        </motion.div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {products.slice(0, 4).map((product, index) => (
              <Link href={`/product/${product._id}`} key={product._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[3/4] bg-gray-100 mb-2 overflow-hidden rounded-lg p-2">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-xs uppercase tracking-wide text-gray-700 mb-1 truncate">{product.name}</h3>
                  <p className="text-sm font-medium text-black">{formatPrice(product.price)}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No products available in this category</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href={shopLink}>
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
            <p className="text-gray-500 text-sm mb-8">{description}</p>
            <Link href={shopLink}>
              <span className="inline-block border border-black text-black px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-black hover:text-white transition-all cursor-pointer">
                {buttonText}
              </span>
            </Link>
          </motion.div>

          {products.length > 0 ? (
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
                  <Link href={`/product/${product._id}`} key={product._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="flex-shrink-0 w-[200px] group cursor-pointer"
                    >
                      <div className="aspect-[3/4] bg-gray-100 mb-3 overflow-hidden p-2">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
                      </div>
                      <h3 className="text-xs uppercase tracking-wide text-gray-700 mb-1 truncate">{product.name}</h3>
                      <p className="text-sm font-medium text-black">{formatPrice(product.price)}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-[72%] flex items-center justify-center py-16">
              <p className="text-gray-500 text-sm">No products available in this category</p>
            </div>
          )}
        </div>

        {products.length > 0 && (
          <div className="mt-8 px-8">
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-black rounded-full transition-all duration-150 ease-out"
                style={{ width: `${Math.max(15, scrollProgress * 100)}%`, marginLeft: `${scrollProgress * (100 - Math.max(15, scrollProgress * 100))}%` }} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
