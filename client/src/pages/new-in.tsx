import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'wouter';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Product {
  _id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  category: string;
  imageUrl: string;
  inStock: boolean;
  featured: boolean;
  createdAt: string;
}

interface NewInContent {
  navLabel: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  buttonText: string;
}

export default function NewIn() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { formatPrice } = useCurrency();

  const { data: pageContent } = useQuery<NewInContent>({
    queryKey: ['newInContent'],
    queryFn: async () => {
      const res = await fetch('/api/content/new_in');
      if (!res.ok) {
        return {
          navLabel: 'New In',
          title: 'New In',
          subtitle: 'Just Arrived',
          description: 'Discover our latest arrivals, fresh from the runway to your wardrobe.',
          category: '',
          buttonText: 'View All Products',
        };
      }
      const data = await res.json();
      return {
        navLabel: data.content?.navLabel || 'New In',
        title: data.content?.title || 'New In',
        subtitle: data.content?.subtitle || 'Just Arrived',
        description: data.content?.description || 'Discover our latest arrivals, fresh from the runway to your wardrobe.',
        category: data.content?.category || '',
        buttonText: data.content?.buttonText || 'View All Products',
      };
    },
  });

  const content = pageContent || {
    navLabel: 'New In',
    title: 'New In',
    subtitle: 'Just Arrived',
    description: 'Discover our latest arrivals, fresh from the runway to your wardrobe.',
    category: '',
    buttonText: 'View All Products',
  };

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['newProducts', content.category],
    queryFn: async () => {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      
      let filteredProducts = data;
      if (content.category && content.category !== '') {
        filteredProducts = data.filter((p: Product) => p.category === content.category);
      }
      
      return filteredProducts.slice(0, 10);
    },
  });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <section className="pt-24 sm:pt-32 pb-8 sm:pb-12 px-4 sm:px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-3 sm:mb-4">{content.subtitle}</p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif mb-4 sm:mb-6 tracking-tight">{content.title}</h1>
            {content.description && (
              <p className="text-white/60 max-w-md mx-auto text-sm tracking-wide px-4">
                {content.description}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-8 sm:py-16">
        <div className="relative">
          {isLoading ? (
            <div className="container mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-white/10 mb-4" />
                    <div className="h-3 bg-white/10 w-3/4 mb-2" />
                    <div className="h-3 bg-white/10 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-white/60 mb-4">No new products yet</p>
              <Link href="/shop">
                <span className="text-white underline cursor-pointer">Browse all products</span>
              </Link>
            </div>
          ) : (
            <>
              <button
                onClick={() => scroll('left')}
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={() => scroll('right')}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div 
                ref={scrollContainerRef}
                className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide px-4 sm:px-6 md:px-12 pb-4 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {products.map((product, index) => (
                  <Link href={`/product/${product._id}`} key={product._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                      className="group cursor-pointer flex-shrink-0 w-[45vw] sm:w-[40vw] md:w-[280px] snap-start"
                      data-testid={`card-product-${product._id}`}
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-neutral-800 to-neutral-900 mb-2 sm:mb-4 p-2 sm:p-3">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-full h-full object-contain transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm md:text-base text-white/90 font-light tracking-wide mb-1 group-hover:text-white transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {product.compareAtPrice && (
                            <span className="text-xs text-white/40 line-through">{formatPrice(product.compareAtPrice)}</span>
                          )}
                          <span className="text-sm text-white/70 font-medium">{formatPrice(product.price)}</span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mt-12 sm:mt-20 px-4"
          >
            <Link href={content.category ? `/shop?category=${encodeURIComponent(content.category)}` : '/shop'}>
              <span className="inline-block border border-white/30 px-8 sm:px-10 py-3 sm:py-4 text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black active:bg-white/90 transition-all duration-300 cursor-pointer font-medium min-h-[44px]">
                {content.buttonText}
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
