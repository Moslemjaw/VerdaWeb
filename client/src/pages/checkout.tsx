import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CreditCard, MessageCircle, Truck, Check, Loader2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type PaymentMethod = 'cod' | 'whatsapp' | 'card';

interface CheckoutFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  street: string;
  area: string;
  city: string;
  notes: string;
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    street: '',
    area: '',
    city: 'Kuwait City',
    notes: '',
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
    if (!formData.street.trim()) {
      toast({ title: 'Please enter your street address', variant: 'destructive' });
      return false;
    }
    if (!formData.area.trim()) {
      toast({ title: 'Please enter your area', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleContinueToPayment = () => {
    if (validateForm()) {
      setStep('payment');
    }
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
        image: item.imageUrl,
      })),
      subtotal: totalPrice,
      shipping: shippingCost,
      tax: 0,
      discount: 0,
      total: finalTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'unpaid',
      status: 'pending',
      shippingAddress: {
        name: formData.customerName,
        line1: formData.street,
        city: formData.city,
        state: formData.area,
        postalCode: '',
        country: 'Kuwait',
        phone: formData.customerPhone,
      },
      notes: formData.notes,
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

  const handlePaymentSelect = async (method: PaymentMethod) => {
    setSelectedPayment(method);
    setIsProcessing(true);

    try {
      if (method === 'cod') {
        const order = await createOrder('cod');
        setOrderNumber(order.orderNumber);
        clearCart();
        setStep('success');
      } else if (method === 'whatsapp') {
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
        setStep('success');
      } else if (method === 'card') {
        const myfatoorahKey = import.meta.env.VITE_MYFATOORAH_API_KEY;
        
        if (!myfatoorahKey) {
          toast({
            title: 'Coming Soon',
            description: 'Credit card payment will be available soon. Please choose another payment method.',
          });
          setIsProcessing(false);
          setSelectedPayment(null);
          return;
        }
        
        const order = await createOrder('card');
        setOrderNumber(order.orderNumber);
        toast({
          title: 'Redirecting to payment...',
          description: 'You will be redirected to complete your payment.',
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && step !== 'success') {
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

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => step === 'info' ? setLocation('/explore') : setStep('info')}
            className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-serif text-lg">Checkout</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="pt-20 pb-8 px-4">
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            {step === 'info' && (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-secondary/30 rounded-xl p-4 mb-6">
                  <h2 className="font-serif text-lg mb-3">Order Summary</h2>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {items.map(item => (
                      <div key={item._id} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span>{item.price * item.quantity} KWD</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-3 pt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{totalPrice} KWD</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>{shippingCost === 0 ? 'Free' : `${shippingCost} KWD`}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>Total</span>
                      <span>{finalTotal} KWD</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="font-serif text-xl">Your Information</h2>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Full Name</Label>
                    <Input
                      id="customerName"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      className="h-12 text-base"
                      data-testid="input-customer-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input
                      id="customerEmail"
                      name="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className="h-12 text-base"
                      data-testid="input-customer-email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone Number</Label>
                    <Input
                      id="customerPhone"
                      name="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      placeholder="+965 XXXX XXXX"
                      className="h-12 text-base"
                      data-testid="input-customer-phone"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="font-serif text-xl">Shipping Address</h2>
                  
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="Building, Street, Block"
                      className="h-12 text-base"
                      data-testid="input-street"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="area">Area</Label>
                      <Input
                        id="area"
                        name="area"
                        value={formData.area}
                        onChange={handleInputChange}
                        placeholder="Area"
                        className="h-12 text-base"
                        data-testid="input-area"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        className="h-12 text-base"
                        data-testid="input-city"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Special instructions for delivery..."
                      className="w-full px-3 py-3 text-base border rounded-lg bg-background resize-none h-24"
                      data-testid="input-notes"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleContinueToPayment}
                  className="w-full h-14 text-base font-medium"
                  data-testid="button-continue-payment"
                >
                  Continue to Payment
                </Button>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="font-serif text-2xl mb-2">Choose Payment Method</h2>
                  <p className="text-muted-foreground">Total: {finalTotal} KWD</p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => handlePaymentSelect('cod')}
                    disabled={isProcessing}
                    className="w-full p-5 border-2 rounded-xl flex items-center gap-4 hover:border-primary hover:bg-secondary/30 transition-all disabled:opacity-50"
                    data-testid="button-pay-cod"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Truck className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-medium text-lg">Cash on Delivery</h3>
                      <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                    </div>
                    {isProcessing && selectedPayment === 'cod' && (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    )}
                  </button>

                  <button
                    onClick={() => handlePaymentSelect('whatsapp')}
                    disabled={isProcessing}
                    className="w-full p-5 border-2 rounded-xl flex items-center gap-4 hover:border-primary hover:bg-secondary/30 transition-all disabled:opacity-50"
                    data-testid="button-pay-whatsapp"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-medium text-lg">Pay via WhatsApp</h3>
                      <p className="text-sm text-muted-foreground">Receive a payment link on WhatsApp</p>
                    </div>
                    {isProcessing && selectedPayment === 'whatsapp' && (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    )}
                  </button>

                  <button
                    onClick={() => handlePaymentSelect('card')}
                    disabled={isProcessing}
                    className="w-full p-5 border-2 rounded-xl flex items-center gap-4 hover:border-primary hover:bg-secondary/30 transition-all disabled:opacity-50 relative"
                    data-testid="button-pay-card"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-medium text-lg">Credit / Debit Card</h3>
                      <p className="text-sm text-muted-foreground">Secure payment via MyFatoorah</p>
                    </div>
                    <span className="absolute top-2 right-2 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                      Coming Soon
                    </span>
                    {isProcessing && selectedPayment === 'card' && (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    )}
                  </button>
                </div>

                <p className="text-center text-sm text-muted-foreground mt-8">
                  Your payment information is secure and encrypted
                </p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="font-serif text-3xl mb-2">Order Confirmed!</h2>
                <p className="text-muted-foreground mb-2">Thank you for your order</p>
                <p className="text-lg font-medium mb-8">Order #{orderNumber}</p>
                
                <div className="bg-secondary/30 rounded-xl p-6 text-left mb-8">
                  <h3 className="font-medium mb-4">What's next?</h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 text-green-600" />
                      <span>You'll receive an email confirmation shortly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 text-green-600" />
                      <span>We'll notify you when your order ships</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 text-green-600" />
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
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
