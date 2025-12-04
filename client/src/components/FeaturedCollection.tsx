import { motion } from "framer-motion";
import handbag from "@assets/generated_images/product_shot_of_a_black_leather_handbag.png";
import necklace from "@assets/generated_images/close_up_of_gold_jewelry_necklace.png";
import dress from "@assets/generated_images/fashion_model_in_a_red_silk_dress.png";

const products = [
  {
    id: 1,
    name: "The Classic Tote",
    price: "$590",
    image: handbag,
    category: "Accessories",
    delay: 0.2
  },
  {
    id: 2,
    name: "Silk Evening Gown",
    price: "$1,200",
    image: dress,
    category: "Ready to Wear",
    delay: 0.4
  },
  {
    id: 3,
    name: "Gold Chain No. 5",
    price: "$350",
    image: necklace,
    category: "Jewelry",
    delay: 0.6
  }
];

export default function FeaturedCollection() {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div>
            <h3 className="text-sm font-sans uppercase tracking-widest text-muted-foreground mb-2">Curated Selection</h3>
            <h2 className="text-4xl md:text-5xl font-serif text-primary">Featured Collection</h2>
          </div>
          <a href="#" className="text-sm border-b border-primary pb-1 hover:opacity-60 transition-opacity mt-4 md:mt-0">
            View All Products
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: product.delay }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-6">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                <button className="absolute bottom-0 left-0 right-0 bg-white text-black py-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 text-xs uppercase tracking-widest font-medium">
                  Add to Cart
                </button>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.category}</p>
                  <h3 className="text-xl font-serif text-primary group-hover:underline decoration-1 underline-offset-4 transition-all">
                    {product.name}
                  </h3>
                </div>
                <span className="text-lg font-serif">{product.price}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
