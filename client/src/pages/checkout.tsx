import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, MessageCircle, Truck, Check, Loader2, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

type PaymentMethod = 'cod' | 'whatsapp' | 'card';
type CheckoutMode = 'guest' | 'create-account';

interface CheckoutFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  block: string;
  street: string;
  houseNumber: string;
  apartmentNumber: string;
  area: string;
  notes: string;
  isGift: boolean;
  password: string;
  confirmPassword: string;
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>('guest');
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    block: '',
    street: '',
    houseNumber: '',
    apartmentNumber: '',
    area: '',
    notes: '',
    isGift: false,
    password: '',
    confirmPassword: '',
  });

  const shippingCost = totalPrice >= 50 ? 0 : 3;
  const finalTotal = totalPrice + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.customerName.trim()) {
      toast({ title: 'Please enter your name', variant: 'destructive' });
      return false;
    }
    if (!formData.customerEmail.trim() || !formData.customerEmail.includes('@')) {
      toast({ title: 'Please enter a valid email', variant: 'destructive' });
      return false;
    }
    if (!formData.customerPhone.trim()) {
      toast({ title: 'Please enter your phone number', variant: 'destructive' });
      return false;
    }
    if (!formData.area.trim()) {
      toast({ title: 'Please enter your area', variant: 'destructive' });
      return false;
    }
    if (!formData.block.trim()) {
      toast({ title: 'Please enter your block number', variant: 'destructive' });
      return false;
    }
    if (!formData.street.trim()) {
      toast({ title: 'Please enter your street', variant: 'destructive' });
      return false;
    }
    if (!isAuthenticated && checkoutMode === 'create-account') {
      if (!formData.password || formData.password.length < 6) {
        toast({ title: 'Password must be at least 6 characters', variant: 'destructive' });
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({ title: 'Passwords do not match', variant: 'destructive' });
        return false;
      }
    }
    return true;
  };

  const createOrder = async (paymentMethod: PaymentMethod) => {
    const orderData = {
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      items: items.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.selectedSize,
        image: item.imageUrl,
      })),
      subtotal: totalPrice,
      shipping: shippingCost,
      tax: 0,
      discount: 0,
      total: finalTotal,
      paymentMethod,
      paymentStatus: 'unpaid',
      status: 'pending',
      shippingAddress: {
        name: formData.customerName,
        line1: `Block ${formData.block}, Street ${formData.street}${formData.houseNumber ? `, House ${formData.houseNumber}` : ''}${formData.apartmentNumber ? `, Apt ${formData.apartmentNumber}` : ''}`,
        city: formData.area,
        state: formData.area,
        postalCode: '',
        country: 'Kuwait',
        phone: formData.customerPhone,
      },
      notes: formData.isGift ? `[GIFT ORDER] ${formData.notes}` : formData.notes,
    };

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    return response.json();
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    
    if (selectedPayment === 'card') {
      toast({
        title: 'Coming Soon',
        description: 'Credit card payment will be available soon. Please choose another payment method.',
      });
      return;
    }

    setIsProcessing(true);

    try {
      if (!isAuthenticated && checkoutMode === 'create-account') {
        const registerResponse = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: formData.customerEmail,
            password: formData.password,
            name: formData.customerName,
          }),
        });

        if (!registerResponse.ok) {
          const errorData = await registerResponse.json();
          toast({
            title: 'Account Creation Failed',
            description: errorData.error || 'Could not create account. You can still checkout as guest.',
            variant: 'destructive',
          });
          setCheckoutMode('guest');
          setIsProcessing(false);
          return;
        }

        toast({
          title: 'Account Created!',
          description: 'Your account has been created successfully.',
        });
      }

      if (selectedPayment === 'cod') {
        const order = await createOrder('cod');
        setOrderNumber(order.orderNumber);
        clearCart();
        setOrderComplete(true);
      } else if (selectedPayment === 'whatsapp') {
        const order = await createOrder('whatsapp');
        setOrderNumber(order.orderNumber);
        
        const message = encodeURIComponent(
          `Hi! I'd like to complete my Lumière order.\n\n` +
          `Order #: ${order.orderNumber}\n` +
          `Total: ${finalTotal} KWD\n` +
          `Name: ${formData.customerName}\n` +
          `Phone: ${formData.customerPhone}\n\n` +
          `Items:\n${items.map(item => `- ${item.name} (${item.quantity}x) - ${item.price * item.quantity} KWD`).join('\n')}\n\n` +
          `Please send me the payment link. Thank you!`
        );
        
        const whatsappNumber = '96599999999';
        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
        
        clearCart();
        setOrderComplete(true);
      }
    } catch (error) {
      console.error('Order error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-serif mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some items to your cart to checkout</p>
          <Link href="/shop">
            <Button data-testid="button-shop-now">Shop Now</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="font-serif text-xl tracking-widest">LUMIÈRE</Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-serif text-3xl mb-2">Order Confirmed!</h2>
            <p className="text-muted-foreground mb-2">Thank you for your order</p>
            <p className="text-lg font-medium mb-8">Order #{orderNumber}</p>
            
            <div className="bg-secondary/50 rounded-xl p-6 text-left mb-8 border border-border">
              <h3 className="font-medium mb-4">What's next?</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 text-primary" />
                  <span>You'll receive an email confirmation shortly</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 text-primary" />
                  <span>We'll notify you when your order ships</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 text-primary" />
                  <span>Delivery within 2-3 business days in Kuwait</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link href="/shop">
                <Button className="w-full h-12" data-testid="button-continue-shopping">
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full h-12" data-testid="button-go-home">
                  Back to Home
                </Button>
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="font-serif text-3xl mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {!isAuthenticated && (
              <section className="border border-border rounded-lg p-6 bg-card">
                <h2 className="font-serif text-lg mb-4">Account Options</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setCheckoutMode('guest')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      checkoutMode === 'guest'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                    data-testid="button-guest-checkout"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        checkoutMode === 'guest' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Guest Checkout</p>
                        <p className="text-xs text-muted-foreground">Continue without account</p>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutMode('create-account')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      checkoutMode === 'create-account'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                    data-testid="button-create-account"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        checkoutMode === 'create-account' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Create Account</p>
                        <p className="text-xs text-muted-foreground">Save info for future orders</p>
                      </div>
                    </div>
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {checkoutMode === 'guest' 
                    ? 'You can still track your order via email confirmation.'
                    : 'Create an account to track orders and save your preferences.'}
                </p>
              </section>
            )}

            <section className="border border-border rounded-lg p-6 bg-card">
              <h2 className="font-serif text-lg mb-4">Customer Information</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="text-xs uppercase tracking-wide text-muted-foreground">Full Name *</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder=""
                    className="h-11 bg-background border-border"
                    data-testid="input-customer-name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail" className="text-xs uppercase tracking-wide text-muted-foreground">Email *</Label>
                    <Input
                      id="customerEmail"
                      name="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      placeholder=""
                      className="h-11 bg-background border-border"
                      data-testid="input-customer-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone" className="text-xs uppercase tracking-wide text-muted-foreground">Phone *</Label>
                    <Input
                      id="customerPhone"
                      name="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      placeholder=""
                      className="h-11 bg-background border-border"
                      data-testid="input-customer-phone"
                    />
                  </div>
                </div>

                {!isAuthenticated && checkoutMode === 'create-account' && (
                  <div className="pt-4 border-t border-border space-y-4">
                    <p className="text-sm text-muted-foreground">Create a password for your account</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-xs uppercase tracking-wide text-muted-foreground">Password *</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder=""
                          className="h-11 bg-background border-border"
                          data-testid="input-password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-wide text-muted-foreground">Confirm Password *</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder=""
                          className="h-11 bg-background border-border"
                          data-testid="input-confirm-password"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="border border-border rounded-lg p-6 bg-card">
              <h2 className="font-serif text-lg mb-4">Delivery Address</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="area" className="text-xs uppercase tracking-wide text-muted-foreground">Area *</Label>
                  <Input
                    id="area"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder=""
                    className="h-11 bg-background border-border"
                    data-testid="input-area"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="block" className="text-xs uppercase tracking-wide text-muted-foreground">Block *</Label>
                    <Input
                      id="block"
                      name="block"
                      value={formData.block}
                      onChange={handleInputChange}
                      placeholder=""
                      className="h-11 bg-background border-border"
                      data-testid="input-block"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street" className="text-xs uppercase tracking-wide text-muted-foreground">Street *</Label>
                    <Input
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder=""
                      className="h-11 bg-background border-border"
                      data-testid="input-street"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="houseNumber" className="text-xs uppercase tracking-wide text-muted-foreground">House Number</Label>
                    <Input
                      id="houseNumber"
                      name="houseNumber"
                      value={formData.houseNumber}
                      onChange={handleInputChange}
                      placeholder=""
                      className="h-11 bg-background border-border"
                      data-testid="input-house-number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apartmentNumber" className="text-xs uppercase tracking-wide text-muted-foreground">Apartment Number</Label>
                    <Input
                      id="apartmentNumber"
                      name="apartmentNumber"
                      value={formData.apartmentNumber}
                      onChange={handleInputChange}
                      placeholder=""
                      className="h-11 bg-background border-border"
                      data-testid="input-apartment-number"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="border border-border rounded-lg p-6 bg-card">
              <h2 className="font-serif text-lg mb-4">Gift Options</h2>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="isGift"
                  checked={formData.isGift}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isGift: checked === true }))}
                  data-testid="checkbox-gift"
                />
                <Label htmlFor="isGift" className="text-sm cursor-pointer">
                  This order is a gift (deliver to someone else)
                </Label>
              </div>
            </section>

            <section className="border border-border rounded-lg p-6 bg-card">
              <h2 className="font-serif text-lg mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label 
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedPayment === 'cod' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={selectedPayment === 'cod'}
                    onChange={() => setSelectedPayment('cod')}
                    className="w-4 h-4 accent-primary"
                    data-testid="radio-cod"
                  />
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Cash on Delivery</p>
                    <p className="text-xs text-muted-foreground">Pay when you receive your order</p>
                  </div>
                </label>

                <label 
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedPayment === 'whatsapp' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="whatsapp"
                    checked={selectedPayment === 'whatsapp'}
                    onChange={() => setSelectedPayment('whatsapp')}
                    className="w-4 h-4 accent-primary"
                    data-testid="radio-whatsapp"
                  />
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Pay via WhatsApp</p>
                    <p className="text-xs text-muted-foreground">Our customer service will contact you to complete the payment</p>
                  </div>
                </label>

                <label 
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer opacity-50 ${
                    selectedPayment === 'card' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={selectedPayment === 'card'}
                    onChange={() => setSelectedPayment('card')}
                    className="w-4 h-4 accent-primary"
                    data-testid="radio-card"
                  />
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">Credit/Debit Card</p>
                      <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 bg-secondary text-muted-foreground rounded">Coming Soon</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Online payment gateway will be available soon</p>
                  </div>
                </label>
              </div>
            </section>

            <section className="border border-border rounded-lg p-6 bg-card">
              <h2 className="font-serif text-lg mb-4">Additional Notes</h2>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any special instructions for your order..."
                className="w-full px-3 py-3 text-sm border border-border rounded-lg bg-background resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                data-testid="input-notes"
              />
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="border border-border rounded-lg p-6 sticky top-20 bg-card">
              <h2 className="font-serif text-lg mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item._id} className="flex gap-3" data-testid={`order-item-${item._id}`}>
                    <div className="w-16 h-20 bg-secondary rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      {item.selectedSize && (
                        <p className="text-xs text-muted-foreground">Size: {item.selectedSize}</p>
                      )}
                    </div>
                    <p className="text-sm font-medium whitespace-nowrap">{item.price * item.quantity} KWD</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{totalPrice} KWD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : `${shippingCost} KWD`}</span>
                </div>
              </div>

              <div className="border-t border-border mt-4 pt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-serif">{finalTotal} KWD</span>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full h-12 font-medium"
                  data-testid="button-place-order"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'PLACE ORDER'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
