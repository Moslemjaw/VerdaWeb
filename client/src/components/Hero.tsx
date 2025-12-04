import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { useSiteContent } from "@/hooks/useSiteContent";
import heroImage from "@assets/generated_images/hero_image_of_a_fashion_model_in_a_trench_coat.png";

export default function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  const { data: siteContent } = useSiteContent();
  const heroContent = siteContent?.hero;

  const title = heroContent?.title || "ELEGANCE";
  const subtitle = heroContent?.subtitle || "REDEFINED";
  const seasonText = heroContent?.description || "Spring / Summer 2025";
  const buttonText = heroContent?.buttonText || "Explore Collection";
  const buttonLink = heroContent?.buttonLink || "/shop";
  const backgroundImage = heroContent?.imageUrl || heroImage;

  return (
    <section className="relative h-screen w-full overflow-hidden bg-stone-900">
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0 w-full h-full"
      >
        <div className="absolute inset-0 bg-black/30 z-10" />
        <motion.img
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          src={backgroundImage}
          alt="Hero Fashion Model"
          className="w-full h-full object-cover object-center"
        />
      </motion.div>

      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center text-white px-4">
        <div className="overflow-hidden">
          <motion.h2
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.6, 0.01, -0.05, 0.95], delay: 0.5 }}
            className="text-sm md:text-base font-sans tracking-[0.3em] uppercase mb-4"
          >
            {seasonText}
          </motion.h2>
        </div>
        
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: 150 }}
            animate={{ y: 0 }}
            transition={{ duration: 1, ease: [0.6, 0.01, -0.05, 0.95], delay: 0.7 }}
            className="text-6xl md:text-8xl lg:text-9xl font-serif font-medium tracking-tight"
          >
            {title}
          </motion.h1>
        </div>

        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: 150 }}
            animate={{ y: 0 }}
            transition={{ duration: 1, ease: [0.6, 0.01, -0.05, 0.95], delay: 0.9 }}
            className="text-6xl md:text-8xl lg:text-9xl font-serif italic font-medium tracking-tight"
          >
            {subtitle}
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mt-12"
        >
          <Link href={buttonLink}>
            <span className="px-8 py-4 border border-white/50 text-white hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-widest text-xs font-semibold cursor-pointer inline-block">
              {buttonText}
            </span>
          </Link>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="w-[1px] h-20 bg-white/20 relative overflow-hidden">
          <motion.div 
            animate={{ y: [0, 80] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="absolute top-0 w-full h-1/2 bg-white"
          />
        </div>
      </motion.div>
    </section>
  );
}
