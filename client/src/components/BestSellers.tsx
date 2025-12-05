import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import handbag from "@assets/generated_images/product_shot_of_a_black_leather_handbag.png";
import necklace from "@assets/generated_images/close_up_of_gold_jewelry_necklace.png";
import dress from "@assets/generated_images/fashion_model_in_a_red_silk_dress.png";

const products = [
  { id: 1, name: "Velvet Evening Clutch", price: "$450", image: handbag },
  { id: 2, name: "Pearl Drop Earrings", price: "$290", image: necklace },
  { id: 3, name: "Cashmere Wrap", price: "$890", image: dress },
  { id: 4, name: "Leather Crossbody", price: "$550", image: handbag },
  { id: 5, name: "Silk Scarf", price: "$180", image: dress },
];

export default function BestSellers() {
  const [emblaRef] = useEmblaCarousel({ align: "start", loop: true });
  const { data: siteContent } = useSiteContent();
  
  const bestSellersContent = siteContent?.best_sellers;
  const title = bestSellersContent?.title || "Best Sellers";
  const buttonText = bestSellersContent?.buttonText || "Shop All";

  return (
    <section className="py-24 border-t border-black/5">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-4xl font-serif text-primary">{title}</h2>
          <div className="flex items-center space-x-2 text-sm font-medium uppercase tracking-widest cursor-pointer hover:opacity-60 transition-opacity">
            <span>{buttonText}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-6">
            {products.map((product) => (
              <div className="flex-[0_0_80%] md:flex-[0_0_40%] lg:flex-[0_0_25%] min-w-0 pl-6" key={product.id}>
                <motion.div 
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[3/4] bg-secondary mb-4 overflow-hidden relative">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute top-4 left-4 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                      Best Seller
                    </div>
                  </div>
                  <h3 className="text-lg font-serif">{product.name}</h3>
                  <p className="text-muted-foreground">{product.price}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
