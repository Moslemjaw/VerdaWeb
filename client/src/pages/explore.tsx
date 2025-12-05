import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { ShoppingBag, X, RotateCcw, ArrowLeft, Heart } from 'lucide-react';

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
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  
  const leftIndicatorOpacity = useTransform(x, [-80, 0], [1, 0]);
  const rightIndicatorOpacity = useTransform(x, [0, 80], [0, 1]);

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const swipeThreshold = 80;
    const velocityThreshold = 400;
    
    if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      onSwipe('right');
    } else if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-pan-y"
      style={{ x, rotate, opacity }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
      animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
      exit={{ 
        x: x.get() > 0 ? 300 : -300, 
        opacity: 0,
        transition: { duration: 0.3 }
      }}
      whileDrag={{ scale: 1.02 }}
    >
      <div className="relative w-full h-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <motion.div 
          className="absolute top-4 sm:top-8 left-4 sm:left-8 bg-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-lg"
          style={{ opacity: leftIndicatorOpacity }}
        >
          SKIP
        </motion.div>
        
        <motion.div 
          className="absolute top-4 sm:top-8 right-4 sm:right-8 bg-green-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-lg"
          style={{ opacity: rightIndicatorOpacity }}
        >
          ADD
        </motion.div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 text-white">
          <p className="text-xs sm:text-sm uppercase tracking-widest opacity-70 mb-1 sm:mb-2">{product.category}</p>
          <h2 className="text-xl sm:text-3xl font-serif mb-1 sm:mb-2">{product.name}</h2>
          <p className="text-sm sm:text-lg opacity-80 mb-2 sm:mb-4 line-clamp-2">{product.description}</p>
          <p className="text-xl sm:text-2xl font-bold">{product.price} KWD</p>
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
    <div className="min-h-screen bg-black fixed inset-0">
      <div className="h-full flex flex-col p-4 sm:p-6 safe-area-inset">
        {/* Header */}
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/">
              <span className="bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors rounded-full p-2.5 sm:p-3 flex items-center justify-center cursor-pointer min-w-[44px] min-h-[44px]">
                <ArrowLeft className="w-5 h-5 text-white" />
              </span>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif text-white">Explore</h1>
              <p className="text-white/60 text-xs sm:text-sm">Swipe right to add, left to skip</p>
            </div>
          </div>
          <button 
            onClick={() => setShowCart(!showCart)}
            className="relative bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors rounded-full p-2.5 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-black w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        {/* Cart Panel */}
        {showCart && cart.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4"
          >
            <h3 className="text-white font-medium mb-2 sm:mb-3 text-sm sm:text-base">Your Cart ({cart.length} items)</h3>
            <div className="space-y-1.5 sm:space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between text-white/80 text-xs sm:text-sm">
                  <span className="truncate flex-1 mr-2">{item.name}</span>
                  <span>{item.price} KWD</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/20 mt-2 sm:mt-3 pt-2 sm:pt-3 flex justify-between text-white font-bold text-sm sm:text-base">
              <span>Total</span>
              <span>{cartTotal} KWD</span>
            </div>
          </motion.div>
        )}

        {/* Card Stack */}
        <div className="flex-1 relative max-w-sm mx-auto w-full min-h-0">
          {isComplete ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-4"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full">
                <h2 className="text-2xl sm:text-3xl font-serif text-white mb-3 sm:mb-4">All Done!</h2>
                <p className="text-white/70 mb-4 sm:mb-6 text-sm sm:text-base">
                  You've explored all products.<br />
                  {cart.length > 0 ? `${cart.length} items in your cart` : 'Your cart is empty'}
                </p>
                <div className="space-y-2 sm:space-y-3">
                  {cart.length > 0 && (
                    <button className="w-full bg-white text-black py-3 sm:py-4 rounded-full font-medium hover:bg-white/90 transition-colors min-h-[44px] text-sm sm:text-base">
                      Checkout ({cartTotal} KWD)
                    </button>
                  )}
                  <button 
                    onClick={resetExplore}
                    className="w-full bg-white/10 text-white py-3 sm:py-4 rounded-full font-medium hover:bg-white/20 active:bg-white/30 transition-colors flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
                  >
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
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

        {/* Action Buttons */}
        {!isComplete && (
          <div className="flex justify-center gap-4 sm:gap-6 mt-4 sm:mt-6 pb-2">
            <button 
              onClick={() => handleButtonSwipe('left')}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 hover:bg-red-500/50 active:bg-red-500/70 transition-colors flex items-center justify-center group"
            >
              <X className="w-6 h-6 sm:w-8 sm:h-8 text-white group-hover:scale-110 transition-transform" />
            </button>
            <button 
              onClick={() => handleButtonSwipe('right')}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 hover:bg-green-500/50 active:bg-green-500/70 transition-colors flex items-center justify-center group"
            >
              <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}

        {/* Progress Dots */}
        {!isComplete && (
          <div className="flex justify-center gap-1 mt-3 sm:mt-4 pb-2 flex-wrap max-w-xs mx-auto">
            {products.slice(0, 10).map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentIndex ? 'bg-white' : i < currentIndex ? 'bg-white/40' : 'bg-white/20'
                }`}
              />
            ))}
            {products.length > 10 && (
              <span className="text-white/40 text-xs ml-1">+{products.length - 10}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
