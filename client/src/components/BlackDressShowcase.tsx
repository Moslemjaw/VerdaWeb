import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useCurrency } from "@/contexts/CurrencyContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import model1 from "@assets/generated_images/full_body_shot_of_model_in_black_dress_1.png";
import model2 from "@assets/generated_images/full_body_shot_of_model_in_black_dress_2.png";
import model3 from "@assets/generated_images/full_body_shot_of_model_in_black_dress_3.png";
import model4 from "@assets/generated_images/full_body_shot_of_model_in_black_dress_4.png";
import model5 from "@assets/generated_images/full_body_shot_of_model_in_black_dress_5.png";

interface Product {
  _id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  imageUrl: string;
  category: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
}

const defaultImages = [model1, model2, model3, model4, model5];

export default function BlackDressShowcase() {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [rotationIndex, setRotationIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { data: siteContent } = useSiteContent();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (animationPhase === 1) {
      const interval = setInterval(() => {
        setRotationIndex((prev) => (prev + 1) % 5);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [animationPhase]);
  
  const newCollectionContent = siteContent?.new_collection;
  
  const seasonText = (newCollectionContent as any)?.seasonText || "New Collection\nFall / Winter 2025\nLimited Edition";
  const heading = (newCollectionContent as any)?.heading || "DESIGNED\nTO MAKE\nAN ENTRANCE";
  const buttonText = newCollectionContent?.buttonText || "View All Products";
  const selectedCategory = (newCollectionContent as any)?.category || "";
  
  // Fetch categories to use their images for the hero section
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) return [];
      return res.json();
    },
  });
  
  const { data: apiProducts = [] } = useQuery<Product[]>({
    queryKey: ['newCollectionProducts', selectedCategory],
    queryFn: async () => {
      if (!selectedCategory || selectedCategory === 'all') {
        const res = await fetch('/api/products?limit=10');
        if (!res.ok) return [];
        return res.json();
      }
      const res = await fetch(`/api/products?category=${encodeURIComponent(selectedCategory)}&limit=10`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Use category images for the hero section based on selected category
  const getCategoryImages = () => {
    // If a specific category is selected, prioritize it
    if (selectedCategory && selectedCategory !== 'all') {
      // Match by name (case-insensitive) or slug
      const selectedCat = categories.find(cat => 
        cat.name.toLowerCase() === selectedCategory.toLowerCase() ||
        cat.slug === selectedCategory.toLowerCase()
      );
      
      if (selectedCat && selectedCat.imageUrl && selectedCat.imageUrl.trim() !== '') {
        // Selected category has an image - use it first, then fill with defaults
        // (keeping it pure to the selected category rather than mixing with others)
        return [
          selectedCat.imageUrl,
          ...defaultImages.slice(0, 4)
        ];
      }
      
      // Selected category exists but has no image, or category not found - use defaults
      return defaultImages;
    }
    
    // For "all" or no selection, use first 5 categories with images (sorted by display order)
    // API returns sorted data, but we add defensive sort to guarantee order
    const categoryImages = [...categories]
      .sort((a, b) => a.order - b.order)
      .filter(cat => cat.imageUrl && cat.imageUrl.trim() !== '')
      .map(cat => cat.imageUrl)
      .slice(0, 5);
    
    return categoryImages.length >= 5 
      ? categoryImages 
      : categoryImages.length > 0 
        ? [...categoryImages, ...defaultImages.slice(categoryImages.length)]
        : defaultImages;
  };
  
  const baseImages = getCategoryImages();

  const heroImages = [
    baseImages[(0 + rotationIndex) % 5],
    baseImages[(1 + rotationIndex) % 5],
    baseImages[(2 + rotationIndex) % 5],
    baseImages[(3 + rotationIndex) % 5],
    baseImages[(4 + rotationIndex) % 5],
  ];

  const products = apiProducts.length > 0 ? apiProducts.slice(0, 10) : [];

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      checkScrollButtons();
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, [products]);

  const seasonLines = seasonText.split('\n');
  const headingLines = heading.split('\n');

  return (
    <section className="relative min-h-screen w-full bg-black text-white overflow-hidden flex flex-col">
      <div className="relative h-[70vh] flex items-center justify-center w-full">
        
        <div className="absolute top-10 left-10 md:top-20 md:left-20 z-20 max-w-xs">
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xs md:text-sm font-sans tracking-[0.2em] uppercase text-white/70 leading-relaxed"
          >
            {seasonLines.map((line: string, i: number) => (
              <span key={i}>{line}{i < seasonLines.length - 1 && <br />}</span>
            ))}
          </motion.p>
        </div>

        <div className="absolute bottom-4 right-4 md:bottom-auto md:top-20 md:right-20 z-40 md:z-10 text-right max-w-[200px] md:max-w-xl pointer-events-none">
           <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-2xl md:text-7xl lg:text-8xl font-sans font-bold tracking-tighter leading-[0.9] text-white"
          >
            {headingLines.map((line: string, i: number) => (
              <span key={i}>{line}{i < headingLines.length - 1 && <br />}</span>
            ))}
          </motion.h1>
        </div>

        <div className="relative w-full max-w-7xl mx-auto h-full flex items-center justify-center perspective-[1000px]">
          
          <motion.div
            className="absolute z-30 h-[70%] md:h-[80%] aspect-[3/4] shadow-2xl shadow-black/50"
            initial={{ scale: 0.9, x: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            onViewportEnter={() => setTimeout(() => setAnimationPhase(1), 500)}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <AnimatePresence mode="wait">
              <motion.img 
                key={rotationIndex}
                src={heroImages[2]} 
                alt="Center Model" 
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {animationPhase === 1 && (
              <>
                <motion.div
                  initial={{ x: 0, opacity: 0, scale: 0.8 }}
                  animate={{ x: isMobile ? "-90%" : "-220%", opacity: 1, scale: isMobile ? 0.7 : 0.9 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  className="absolute z-10 h-[50%] md:h-[70%] aspect-[3/4] shadow-xl overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={`img0-${rotationIndex}`}
                      src={heroImages[0]} 
                      alt="Model 1" 
                      className="w-full h-full object-cover brightness-75 hover:brightness-100 transition-all"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  initial={{ x: 0, opacity: 0, scale: 0.85 }}
                  animate={{ x: isMobile ? "-45%" : "-110%", opacity: 1, scale: isMobile ? 0.8 : 0.95 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                  className="absolute z-20 h-[55%] md:h-[75%] aspect-[3/4] shadow-xl overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={`img1-${rotationIndex}`}
                      src={heroImages[1]} 
                      alt="Model 2" 
                      className="w-full h-full object-cover brightness-90 hover:brightness-100 transition-all"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  initial={{ x: 0, opacity: 0, scale: 0.85 }}
                  animate={{ x: isMobile ? "45%" : "110%", opacity: 1, scale: isMobile ? 0.8 : 0.95 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                  className="absolute z-20 h-[55%] md:h-[75%] aspect-[3/4] shadow-xl overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={`img3-${rotationIndex}`}
                      src={heroImages[3]} 
                      alt="Model 4" 
                      className="w-full h-full object-cover brightness-90 hover:brightness-100 transition-all"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  initial={{ x: 0, opacity: 0, scale: 0.8 }}
                  animate={{ x: isMobile ? "90%" : "220%", opacity: 1, scale: isMobile ? 0.7 : 0.9 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  className="absolute z-10 h-[50%] md:h-[70%] aspect-[3/4] shadow-xl overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={`img4-${rotationIndex}`}
                      src={heroImages[4]} 
                      alt="Model 5" 
                      className="w-full h-full object-cover brightness-75 hover:brightness-100 transition-all"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                  </AnimatePresence>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-black px-6 py-20 z-40 relative">
        <div className="container mx-auto">
          {products.length > 0 ? (
            <div className="relative">
              {/* Scroll Left Button */}
              {canScrollLeft && (
                <button
                  onClick={() => scroll('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black border border-white/20 rounded-full p-2 md:p-3 transition-all duration-300 -translate-x-2 md:-translate-x-4"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </button>
              )}
              
              {/* Scroll Right Button */}
              {canScrollRight && (
                <button
                  onClick={() => scroll('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black border border-white/20 rounded-full p-2 md:p-3 transition-all duration-300 translate-x-2 md:translate-x-4"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </button>
              )}

              {/* Scrollable Products Container */}
              <div 
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {products.map((product, index) => (
                  <Link href={`/product/${product._id}`} key={product._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: animationPhase === 1 ? 1 : 0, y: animationPhase === 1 ? 0 : 50 }}
                      transition={{ duration: 0.8, delay: 1 + (index * 0.1), ease: "easeOut" }}
                      className="group cursor-pointer flex-shrink-0 w-[calc((100%-16px)/2)] md:w-[calc((100%-64px)/5)]"
                      data-testid={`new-collection-product-${product._id}`}
                    >
                      <div className="aspect-[3/4] overflow-hidden mb-2 sm:mb-4 bg-gradient-to-b from-neutral-800 to-neutral-900">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
                        />
                      </div>
                      <h3 className="text-xs sm:text-sm text-white/90 font-light tracking-wide mb-1 group-hover:text-white transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {product.compareAtPrice && product.compareAtPrice < product.price && (
                          <span className="text-xs text-white/40 line-through">{formatPrice(product.price)}</span>
                        )}
                        <span className="text-sm text-white/70 font-medium">{formatPrice(product.compareAtPrice && product.compareAtPrice < product.price ? product.compareAtPrice : product.price)}</span>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: animationPhase === 1 ? 1 : 0, y: animationPhase === 1 ? 0 : 20 }}
              transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
              className="text-center py-12"
            >
              <p className="text-white/60 text-lg">No products found in this category. Select a different category in the admin dashboard.</p>
            </motion.div>
          )}
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: animationPhase === 1 ? 1 : 0, y: animationPhase === 1 ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 1.8, ease: "easeOut" }}
            className="flex justify-center mt-16"
          >
            <Link href={selectedCategory && selectedCategory !== 'all' ? `/shop?category=${encodeURIComponent(selectedCategory)}` : '/shop'}>
              <button className="px-8 py-3 border border-white/30 text-white hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-widest text-xs font-semibold">
                {buttonText}
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
