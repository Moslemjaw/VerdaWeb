import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Heart, Check, Minus, Plus, Share2, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  brand: string;
  imageUrl: string;
  images: string[];
  inStock: boolean;
  featured: boolean;
  sizes: string[];
  colors: string[];
  material: string;
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { addItem, items } = useCart();
  const { toast } = useToast();
  
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error('Failed to fetch product');
      return res.json();
    },
  });

  const isInCart = items.some(item => item._id === id);

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.sizes?.length > 0 && !selectedSize) {
      toast({
        title: 'Please select a size',
        variant: 'destructive',
      });
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addItem({
        _id: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
      });
    }

    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied',
        description: 'Product link copied to clipboard',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-serif mb-4">Product not found</h1>
        <Link href="/shop">
          <Button data-testid="button-back-to-shop">Back to Shop</Button>
        </Link>
      </div>
    );
  }

  const allImages = [product.imageUrl, ...(product.images || [])].filter(Boolean);
  const currentImage = allImages[selectedImageIndex] || product.imageUrl;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <button 
            onClick={() => window.history.back()}
            className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Link href="/">
            <span className="font-serif text-lg tracking-wider">LUMIÈRE</span>
          </Link>
          <button 
            onClick={handleShare}
            className="p-2 -mr-2 hover:bg-secondary rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            data-testid="button-share"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="pt-14 sm:pt-16 pb-32">
        {/* Desktop Layout: Side-by-side */}
        <div className="hidden lg:block">
          <div className="container mx-auto px-6 py-8">
            <div className="flex gap-8">
              {/* Image Gallery - Left Side */}
              <div className="flex gap-4 flex-1">
                {/* Thumbnails */}
                {allImages.length > 1 && (
                  <div className="flex flex-col gap-3 w-20">
                    {allImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-[3/4] overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index 
                            ? 'border-primary' 
                            : 'border-transparent hover:border-muted-foreground/30'
                        }`}
                        data-testid={`button-thumbnail-${index}`}
                      >
                        <img 
                          src={img} 
                          alt={`${product.name} view ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Main Image */}
                <div className="flex-1 relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="aspect-[3/4] bg-secondary/30 overflow-hidden"
                    >
                      <img 
                        src={currentImage} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        data-testid="img-product-main"
                      />
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Zoom indicator */}
                  <div className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-sm">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Product Info - Right Side */}
              <div className="w-[420px] flex-shrink-0">
                <ProductInfo 
                  product={product}
                  selectedSize={selectedSize}
                  setSelectedSize={setSelectedSize}
                  quantity={quantity}
                  setQuantity={setQuantity}
                  isWishlisted={isWishlisted}
                  setIsWishlisted={setIsWishlisted}
                  handleAddToCart={handleAddToCart}
                  isInCart={isInCart}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout: Stacked */}
        <div className="lg:hidden">
          {/* Image Gallery */}
          <div className="relative">
            {/* Main Image with Swipe */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="aspect-[3/4] sm:aspect-[4/5] bg-secondary/30 overflow-hidden"
              >
                <img 
                  src={currentImage} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  data-testid="img-product-main-mobile"
                />
              </motion.div>
            </AnimatePresence>

            {/* Image Dots Indicator */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      selectedImageIndex === index 
                        ? 'bg-primary w-6' 
                        : 'bg-primary/30'
                    }`}
                    data-testid={`button-dot-${index}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {allImages.length > 1 && (
            <div className="px-4 py-3 overflow-x-auto">
              <div className="flex gap-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-16 h-20 flex-shrink-0 overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-primary' 
                        : 'border-transparent'
                    }`}
                    data-testid={`button-thumbnail-mobile-${index}`}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product Info */}
          <div className="container mx-auto px-4 py-6 sm:py-8">
            <ProductInfo 
              product={product}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              quantity={quantity}
              setQuantity={setQuantity}
              isWishlisted={isWishlisted}
              setIsWishlisted={setIsWishlisted}
              handleAddToCart={handleAddToCart}
              isInCart={isInCart}
            />
          </div>
        </div>
      </main>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t p-4 safe-area-inset">
        <div className="container mx-auto flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-bold">{product.price * quantity} KWD</p>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="h-14 px-8 text-base font-medium gap-2"
            data-testid="button-add-to-cart"
          >
            {isInCart ? (
              <>
                <Check className="w-5 h-5" />
                Add More
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Extracted ProductInfo component to avoid duplication
interface ProductInfoProps {
  product: Product;
  selectedSize: string | null;
  setSelectedSize: (size: string | null) => void;
  quantity: number;
  setQuantity: (qty: number) => void;
  isWishlisted: boolean;
  setIsWishlisted: (val: boolean) => void;
  handleAddToCart: () => void;
  isInCart: boolean;
}

function ProductInfo({
  product,
  selectedSize,
  setSelectedSize,
  quantity,
  setQuantity,
  isWishlisted,
  setIsWishlisted,
}: ProductInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <p className="text-xs sm:text-sm uppercase tracking-widest text-muted-foreground mb-1">
            {product.category}
          </p>
          <h1 className="text-2xl sm:text-3xl font-serif" data-testid="text-product-name">
            {product.name}
          </h1>
        </div>
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="p-2 hover:bg-secondary rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          data-testid="button-wishlist"
        >
          <Heart 
            className={`w-6 h-6 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} 
          />
        </button>
      </div>

      <p className="text-2xl sm:text-3xl font-medium mt-4" data-testid="text-product-price">
        {product.price} KWD
      </p>

      <p className="text-muted-foreground mt-4 text-sm sm:text-base leading-relaxed" data-testid="text-product-description">
        {product.description}
      </p>

      {/* Stock Status */}
      <div className="mt-4 flex items-center gap-2">
        {product.inStock ? (
          <>
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-green-600">In Stock</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-sm text-red-600">Out of Stock</span>
          </>
        )}
      </div>

      {/* Color Selection */}
      {product.colors && product.colors.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3">Color</h3>
          <div className="flex flex-wrap gap-2">
            {product.colors.map(color => (
              <div
                key={color}
                className="w-8 h-8 rounded-full border-2 border-border cursor-pointer hover:border-primary transition-all"
                style={{ backgroundColor: color.toLowerCase() }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3">Size</h3>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`min-w-[44px] h-11 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                  selectedSize === size 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : 'border-border hover:border-primary'
                }`}
                data-testid={`button-size-${size}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-3">Quantity</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-11 h-11 rounded-lg border-2 border-border flex items-center justify-center hover:border-primary transition-colors"
            data-testid="button-quantity-minus"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-lg font-medium w-8 text-center" data-testid="text-quantity">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-11 h-11 rounded-lg border-2 border-border flex items-center justify-center hover:border-primary transition-colors"
            data-testid="button-quantity-plus"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Details */}
      {(product.brand || product.material) && (
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-sm font-medium mb-3">Details</h3>
          <dl className="space-y-2 text-sm">
            {product.brand && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Brand</dt>
                <dd>{product.brand}</dd>
              </div>
            )}
            {product.material && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Material</dt>
                <dd>{product.material}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Category</dt>
              <dd>{product.category}</dd>
            </div>
          </dl>
        </div>
      )}
    </motion.div>
  );
}
