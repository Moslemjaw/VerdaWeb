import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';

export default function Cart() {
  const { items, totalPrice, updateQuantity, removeItem } = useCart();

  const shippingCost = totalPrice >= 50 ? 0 : 3;
  const finalTotal = totalPrice + shippingCost;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b">
          <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
            <button 
              onClick={() => window.history.back()}
              className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-serif text-lg tracking-wider">Cart</span>
            <div className="w-10" />
          </div>
        </header>

        <main className="pt-20 pb-8 px-4">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-serif mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some items to get started</p>
            <Link href="/shop">
              <Button data-testid="button-continue-shopping">Continue Shopping</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <button 
            onClick={() => window.history.back()}
            className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-serif text-lg tracking-wider">Cart ({items.length})</span>
          <div className="w-10" />
        </div>
      </header>

      <main className="pt-16 pb-32 px-4">
        <div className="container mx-auto max-w-lg">
          <div className="space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex gap-4 p-4 bg-secondary/30 rounded-lg"
                data-testid={`cart-item-${item._id}`}
              >
                <div className="w-20 h-24 bg-secondary rounded overflow-hidden flex-shrink-0">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{item.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{item.category}</p>
                  <p className="font-bold">{item.price} KWD</p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-8 h-8 rounded border flex items-center justify-center hover:bg-secondary transition-colors"
                        data-testid={`button-decrease-${item._id}`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-8 h-8 rounded border flex items-center justify-center hover:bg-secondary transition-colors"
                        data-testid={`button-increase-${item._id}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item._id)}
                      className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                      data-testid={`button-remove-${item._id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-secondary/30 rounded-lg space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{totalPrice} KWD</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shippingCost === 0 ? 'Free' : `${shippingCost} KWD`}</span>
            </div>
            {totalPrice < 50 && (
              <p className="text-xs text-muted-foreground">
                Add {50 - totalPrice} KWD more for free shipping
              </p>
            )}
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total</span>
              <span>{finalTotal} KWD</span>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t p-4 safe-area-inset">
        <div className="container mx-auto max-w-lg">
          <Link href="/checkout">
            <Button className="w-full h-12 text-base font-medium" data-testid="button-checkout">
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
