import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useCurrency } from "@/contexts/CurrencyContext";
import model1 from "@assets/generated_images/full_body_shot_of_model_in_black_dress_1.png";
import model2 from "@assets/generated_images/full_body_shot_of_model_in_black_dress_2.png";
import model3 from "@assets/generated_images/full_body_shot_of_model_in_black_dress_3.png";
import model4 from "@assets/generated_images/full_body_shot_of_model_in_black_dress_4.png";
import model5 from "@assets/generated_images/full_body_shot_of_model_in_black_dress_5.png";

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
}

const defaultImages = [model1, model2, model3, model4, model5];

export default function BlackDressShowcase() {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [rotationIndex, setRotationIndex] = useState(0);
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
  const cmsImages = (newCollectionContent as any)?.images || [];
  
  const { data: apiProducts = [] } = useQuery<Product[]>({
    queryKey: ['newCollectionProducts', selectedCategory],
    queryFn: async () => {
      if (!selectedCategory || selectedCategory === 'all') {
        const res = await fetch('/api/products/featured?limit=4');
        if (!res.ok) return [];
        return res.json();
      }
      const res = await fetch(`/api/products?category=${encodeURIComponent(selectedCategory)}&limit=4`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const validCmsImages = cmsImages.filter((img: string) => img && img.trim() !== '');
  const baseImages = validCmsImages.length === 5 
    ? validCmsImages 
    : defaultImages;

  const heroImages = [
    baseImages[(0 + rotationIndex) % 5],
    baseImages[(1 + rotationIndex) % 5],
    baseImages[(2 + rotationIndex) % 5],
    baseImages[(3 + rotationIndex) % 5],
    baseImages[(4 + rotationIndex) % 5],
  ];

  const products = apiProducts.length > 0 ? apiProducts.slice(0, 4) : [];

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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
              {products.map((product, index) => (
                <Link href={`/product/${product._id}`} key={product._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: animationPhase === 1 ? 1 : 0, y: animationPhase === 1 ? 0 : 50 }}
                    transition={{ duration: 0.8, delay: 1 + (index * 0.1), ease: "easeOut" }}
                    className="group cursor-pointer"
                    data-testid={`new-collection-product-${product._id}`}
                  >
                    <div className="aspect-[3/4] overflow-hidden mb-4 bg-white/5">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="text-white font-serif text-sm tracking-wide mb-1 group-hover:underline underline-offset-4 decoration-white/50">{product.name}</h3>
                    <p className="text-white font-bold text-sm">{formatPrice(product.price)}</p>
                  </motion.div>
                </Link>
              ))}
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
