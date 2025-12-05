import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import Navbar from '@/components/Navbar';
import { ShoppingBag, X, RotateCcw, ArrowLeft } from 'lucide-react';

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

const sampleProducts: Product[] = [
  { _id: 'e1', name: 'The Enchanté Gown', price: 1200, description: 'Elegant evening gown with flowing silhouette', category: 'Dresses', imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80', inStock: true, featured: true },
  { _id: 'e2', name: 'Midnight Silk Slip', price: 890, description: 'Luxurious silk slip dress in midnight blue', category: 'Dresses', imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80', inStock: true, featured: true },
  { _id: 'e3', name: 'Classic Leather Tote', price: 590, description: 'Handcrafted leather tote bag', category: 'Bags', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', inStock: true, featured: true },
  { _id: 'e4', name: 'Cashmere Wrap Coat', price: 1450, description: 'Soft cashmere coat with wrap design', category: 'Outerwear', imageUrl: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80', inStock: true, featured: true },
  { _id: 'e5', name: 'Pearl Drop Earrings', price: 320, description: 'Elegant freshwater pearl earrings', category: 'Accessories', imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80', inStock: true, featured: true },
  { _id: 'e6', name: 'Velvet Blazer', price: 780, description: 'Rich velvet blazer in deep burgundy', category: 'Outerwear', imageUrl: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800&q=80', inStock: true, featured: true },
  { _id: 'e7', name: 'Silk Scarf', price: 180, description: 'Hand-painted silk scarf with floral motif', category: 'Accessories', imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80', inStock: true, featured: true },
  { _id: 'e8', name: 'Embroidered Blouse', price: 420, description: 'Delicate embroidered cotton blouse', category: 'Tops', imageUrl: 'https://images.unsplash.com/photo-1551803091-e20673f15770?w=800&q=80', inStock: true, featured: true },
];

function ProductCard({ 
  product, 
  onSwipe, 
  isTop 
}: { 
  product: Product; 
  onSwipe: (direction: 'left' | 'right') => void;
  isTop: boolean;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  
  const leftIndicatorOpacity = useTransform(x, [-100, 0], [1, 0]);
  const rightIndicatorOpacity = useTransform(x, [0, 100], [0, 1]);

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const swipeThreshold = 100;
    const velocityThreshold = 500;
    
    if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      onSwipe('right');
    } else if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      className="absolute w-full h-full cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 20 }}
      animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 20 }}
      exit={{ 
        x: x.get() > 0 ? 300 : -300, 
        opacity: 0,
        transition: { duration: 0.3 }
      }}
      whileDrag={{ scale: 1.02 }}
    >
      <div className="relative w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <motion.div 
          className="absolute top-8 left-8 bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg"
          style={{ opacity: leftIndicatorOpacity }}
        >
          SKIP
        </motion.div>
        
        <motion.div 
          className="absolute top-8 right-8 bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg"
          style={{ opacity: rightIndicatorOpacity }}
        >
          ADD TO CART
        </motion.div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <p className="text-sm uppercase tracking-widest opacity-70 mb-2">{product.category}</p>
          <h2 className="text-3xl font-serif mb-2">{product.name}</h2>
          <p className="text-lg opacity-80 mb-4">{product.description}</p>
          <p className="text-2xl font-bold">{product.price} KWD</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Explore() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cart, setCart] = useState<Product[]>([]);
  const [skipped, setSkipped] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);

  const { data: apiProducts = [] } = useQuery<Product[]>({
    queryKey: ['allProducts'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  const products = apiProducts.length > 0 ? apiProducts : sampleProducts;
  const currentProduct = products[currentIndex];
  const nextProduct = products[currentIndex + 1];
  const isComplete = currentIndex >= products.length;

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      setCart(prev => [...prev, currentProduct]);
    } else {
      setSkipped(prev => [...prev, currentProduct]);
    }
    setCurrentIndex(prev => prev + 1);
  };

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    handleSwipe(direction);
  };

  const resetExplore = () => {
    setCurrentIndex(0);
    setCart([]);
    setSkipped([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="pt-24 px-6 pb-6 h-screen flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <span className="bg-white/10 hover:bg-white/20 transition-colors rounded-full p-3 flex items-center justify-center cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-white" />
              </span>
            </Link>
            <div>
              <h1 className="text-2xl font-serif text-white">Explore</h1>
              <p className="text-white/60 text-sm">Swipe right to add, left to skip</p>
            </div>
          </div>
          <button 
            onClick={() => setShowCart(!showCart)}
            className="relative bg-white/10 hover:bg-white/20 transition-colors rounded-full p-3"
          >
            <ShoppingBag className="w-6 h-6 text-white" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-black w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        {showCart && cart.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-4"
          >
            <h3 className="text-white font-medium mb-3">Your Cart ({cart.length} items)</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between text-white/80 text-sm">
                  <span className="truncate flex-1 mr-2">{item.name}</span>
                  <span>{item.price} KWD</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/20 mt-3 pt-3 flex justify-between text-white font-bold">
              <span>Total</span>
              <span>{cartTotal} KWD</span>
            </div>
          </motion.div>
        )}

        <div className="flex-1 relative max-w-md mx-auto w-full">
          {isComplete ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 w-full">
                <h2 className="text-3xl font-serif text-white mb-4">All Done!</h2>
                <p className="text-white/70 mb-6">
                  You've explored all products.<br />
                  {cart.length > 0 ? `${cart.length} items in your cart` : 'Your cart is empty'}
                </p>
                <div className="space-y-3">
                  {cart.length > 0 && (
                    <button className="w-full bg-white text-black py-4 rounded-full font-medium hover:bg-white/90 transition-colors">
                      Checkout ({cartTotal} KWD)
                    </button>
                  )}
                  <button 
                    onClick={resetExplore}
                    className="w-full bg-white/10 text-white py-4 rounded-full font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Explore Again
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence>
              {nextProduct && (
                <ProductCard 
                  key={nextProduct._id + '-next'}
                  product={nextProduct} 
                  onSwipe={() => {}} 
                  isTop={false}
                />
              )}
              {currentProduct && (
                <ProductCard 
                  key={currentProduct._id}
                  product={currentProduct} 
                  onSwipe={handleSwipe} 
                  isTop={true}
                />
              )}
            </AnimatePresence>
          )}
        </div>

        {!isComplete && (
          <div className="flex justify-center gap-6 mt-6">
            <button 
              onClick={() => handleButtonSwipe('left')}
              className="w-16 h-16 rounded-full bg-white/10 hover:bg-red-500/50 transition-colors flex items-center justify-center group"
            >
              <X className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
            </button>
            <button 
              onClick={() => handleButtonSwipe('right')}
              className="w-16 h-16 rounded-full bg-white/10 hover:bg-green-500/50 transition-colors flex items-center justify-center group"
            >
              <ShoppingBag className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}

        {!isComplete && (
          <div className="flex justify-center gap-1 mt-4">
            {products.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentIndex ? 'bg-white' : i < currentIndex ? 'bg-white/40' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
