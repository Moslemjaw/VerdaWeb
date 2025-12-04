import { motion, useScroll, useTransform } from "framer-motion";
import silkTexture from "@assets/generated_images/abstract_texture_of_silk_fabric.png";

export default function Intersection() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <section className="relative h-[80vh] w-full overflow-hidden flex items-center justify-center my-12">
      <motion.div className="absolute inset-0 w-full h-[120%]" style={{ y }}>
        <img 
          src={silkTexture} 
          alt="Silk Texture" 
          className="w-full h-full object-cover brightness-75"
        />
      </motion.div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-white/80 text-sm md:text-base font-sans tracking-[0.2em] uppercase mb-8"
        >
          The Art of Dressing
        </motion.p>
        
        <motion.h2 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-4xl md:text-6xl lg:text-7xl font-serif text-white leading-tight italic"
        >
          "Fashion is not something that exists in dresses only. Fashion is in the sky, in the street, fashion has to do with ideas."
        </motion.h2>
        
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: "100px" }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.8 }}
          className="h-[1px] bg-white mx-auto mt-12"
        />
      </div>
    </section>
  );
}
