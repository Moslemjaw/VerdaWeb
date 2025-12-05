import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'wouter';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  inStock: boolean;
  featured: boolean;
  createdAt: string;
}

export default function NewIn() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['newProducts'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      return data.slice(0, 5);
    },
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <section className="pt-32 pb-12 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-4">Just Arrived</p>
            <h1 className="text-5xl md:text-7xl font-serif mb-6 tracking-tight">New In</h1>
            <p className="text-white/60 max-w-md mx-auto text-sm tracking-wide">
              Discover our latest arrivals, fresh from the runway to your wardrobe.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="container mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-white/10 mb-4" />
                  <div className="h-3 bg-white/10 w-3/4 mb-2" />
                  <div className="h-3 bg-white/10 w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-white/60 mb-4">No new products yet</p>
              <Link href="/shop">
                <span className="text-white underline cursor-pointer">Browse all products</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
              {products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group cursor-pointer"
                  data-testid={`card-product-${product._id}`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-neutral-800 to-neutral-900 mb-4">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base text-white/90 font-light tracking-wide mb-1 group-hover:text-white transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-white/70 font-medium">{product.price} KWD</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mt-20"
          >
            <Link href="/shop?filter=newin">
              <span className="inline-block border border-white/30 px-10 py-4 text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-300 cursor-pointer font-medium">
                View All Products
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
