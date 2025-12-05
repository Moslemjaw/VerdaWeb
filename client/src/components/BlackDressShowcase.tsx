import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import model1 from "@assets/generated_images/full_body_shot_of_model_in_black_dress_1.png";
import model2 from "@assets/generated_images/full_body_shot_of_model_in_black_dress_2.png";
import model3 from "@assets/generated_images/full_body_shot_of_model_in_black_dress_3.png";
import model4 from "@assets/generated_images/full_body_shot_of_model_in_black_dress_4.png";
import model5 from "@assets/generated_images/full_body_shot_of_model_in_black_dress_5.png";

const defaultImages = [model1, model2, model3, model4, model5];

export default function BlackDressShowcase() {
  const [animationPhase, setAnimationPhase] = useState(0);
  const { data: siteContent } = useSiteContent();
  
  const newCollectionContent = siteContent?.new_collection;
  
  const seasonText = (newCollectionContent as any)?.seasonText || "New Collection\nFall / Winter 2025\nLimited Edition";
  const heading = (newCollectionContent as any)?.heading || "DESIGNED\nTO MAKE\nAN ENTRANCE";
  const buttonText = newCollectionContent?.buttonText || "View All Products";
  const cmsImages = (newCollectionContent as any)?.images || [];
  
  const validCmsImages = cmsImages.filter((img: string) => img && img.trim() !== '');
  const heroImages = validCmsImages.length === 5 
    ? validCmsImages 
    : defaultImages;

  const products = Array.from({ length: 5 }).map((_, i) => ({
    id: i + 1,
    name: [
      "The Enchanté Gown",
      "Midnight Silk Slip",
      "Noir Cocktail Dress",
      "Obsidian Maxi",
      "Eclipse Evening Wear",
    ][i],
    price: ["120 KWD", "180 KWD", "250 KWD", "320 KWD", "150 KWD"][i],
    image: heroImages[i % 5]
  }));

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
            {seasonLines.map((line, i) => (
              <span key={i}>{line}{i < seasonLines.length - 1 && <br />}</span>
            ))}
          </motion.p>
        </div>

        <div className="absolute top-10 right-10 md:top-20 md:right-20 z-10 text-right max-w-xl pointer-events-none">
           <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-sans font-bold tracking-tighter leading-[0.9] text-white mix-blend-difference"
          >
            {headingLines.map((line, i) => (
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
             <img src={heroImages[2]} alt="Center Model" className="w-full h-full object-cover" />
          </motion.div>

          <AnimatePresence>
            {animationPhase === 1 && (
              <>
                <motion.div
                  initial={{ x: 0, opacity: 0, scale: 0.8 }}
                  animate={{ x: "-220%", opacity: 1, scale: 0.9 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  className="absolute z-10 h-[60%] md:h-[70%] aspect-[3/4] shadow-xl"
                >
                   <img src={heroImages[0]} alt="Model 1" className="w-full h-full object-cover brightness-75 hover:brightness-100 transition-all" />
                </motion.div>

                <motion.div
                  initial={{ x: 0, opacity: 0, scale: 0.85 }}
                  animate={{ x: "-110%", opacity: 1, scale: 0.95 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                  className="absolute z-20 h-[65%] md:h-[75%] aspect-[3/4] shadow-xl"
                >
                   <img src={heroImages[1]} alt="Model 2" className="w-full h-full object-cover brightness-90 hover:brightness-100 transition-all" />
                </motion.div>

                <motion.div
                  initial={{ x: 0, opacity: 0, scale: 0.85 }}
                  animate={{ x: "110%", opacity: 1, scale: 0.95 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                  className="absolute z-20 h-[65%] md:h-[75%] aspect-[3/4] shadow-xl"
                >
                   <img src={heroImages[3]} alt="Model 4" className="w-full h-full object-cover brightness-90 hover:brightness-100 transition-all" />
                </motion.div>

                <motion.div
                  initial={{ x: 0, opacity: 0, scale: 0.8 }}
                  animate={{ x: "220%", opacity: 1, scale: 0.9 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  className="absolute z-10 h-[60%] md:h-[70%] aspect-[3/4] shadow-xl"
                >
                   <img src={heroImages[4]} alt="Model 5" className="w-full h-full object-cover brightness-75 hover:brightness-100 transition-all" />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-black px-6 py-20 z-40 relative">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-12">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: animationPhase === 1 ? 1 : 0, y: animationPhase === 1 ? 0 : 50 }}
                transition={{ duration: 0.8, delay: 1 + (index * 0.1), ease: "easeOut" }}
                className="group cursor-pointer"
              >
                <div className="aspect-[3/4] overflow-hidden mb-4 bg-white/5">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-white font-serif text-sm tracking-wide mb-1 group-hover:underline underline-offset-4 decoration-white/50">{product.name}</h3>
                <p className="text-white font-bold text-sm">{product.price}</p>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: animationPhase === 1 ? 1 : 0, y: animationPhase === 1 ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 1.8, ease: "easeOut" }}
            className="flex justify-center mt-16"
          >
            <button className="px-8 py-3 border border-white/30 text-white hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-widest text-xs font-semibold">
              {buttonText}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
