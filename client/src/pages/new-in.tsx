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
      return data.slice(0, 6);
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-32 pb-16 px-6 bg-secondary/30">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">Just Arrived</h3>
            <h1 className="text-5xl md:text-6xl font-serif mb-6">New In</h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Discover our latest arrivals, fresh from the runway to your wardrobe.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-muted rounded-lg mb-4" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-4">No new products yet</p>
              <Link href="/shop">
                <span className="text-primary underline cursor-pointer">Browse all products</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group cursor-pointer"
                  data-testid={`card-product-${product._id}`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4 rounded-lg">
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-white text-black text-xs uppercase tracking-wider px-3 py-1">
                        New
                      </span>
                    </div>
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
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        {product.category}
                      </p>
                      <h3 className="font-serif text-xl group-hover:underline decoration-1 underline-offset-4">
                        {product.name}
                      </h3>
                    </div>
                    <span className="text-lg font-serif">${product.price}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-16">
            <Link href="/shop">
              <span className="inline-block border border-primary px-8 py-4 text-sm uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                View All Products
              </span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
