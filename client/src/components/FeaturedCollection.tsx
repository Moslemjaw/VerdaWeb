import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  inStock: boolean;
  featured: boolean;
}

export default function FeaturedCollection() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
      const res = await fetch('/api/products/featured');
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto">
          <div className="text-center">Loading featured products...</div>
        </div>
      </section>
    );
  }

  // If no products in database, show placeholder message
  if (products.length === 0) {
    return (
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h3 className="text-sm font-sans uppercase tracking-widest text-muted-foreground mb-2">Curated Selection</h3>
              <h2 className="text-4xl md:text-5xl font-serif text-primary">Featured Collection</h2>
            </div>
          </div>
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg">No featured products yet. Check back soon!</p>
            <p className="text-sm mt-2">Admins can add products from the admin dashboard.</p>
          </div>
        </div>
      </section>
    );
  }

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
          {products.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-6">
                <img 
                  src={product.imageUrl} 
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
                <span className="text-lg font-serif">${product.price}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
