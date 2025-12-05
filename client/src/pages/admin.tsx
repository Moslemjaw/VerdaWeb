import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Edit, Users, Package, Tag, TrendingUp, Image, Settings, LayoutDashboard, ShoppingBag, FileText, DollarSign, Clock, CheckCircle, XCircle, Truck, Eye, Upload, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function ImageUploadInput({ 
  value, 
  onChange, 
  label, 
  placeholder = "Paste image URL or upload file" 
}: { 
  value: string; 
  onChange: (url: string) => void; 
  label: string;
  placeholder?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label className="font-medium">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          title="Upload image"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        </Button>
      </div>
      {value && (
        <div className="mt-2 relative w-20 h-20 rounded border overflow-hidden">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}

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
  newArrival: boolean;
  sizes: string[];
  colors: string[];
  material: string;
}

interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  featuredProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  todayRevenue: number;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentMethod: 'card' | 'cod' | 'paypal';
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface SiteContent {
  _id: string;
  section: string;
  content: {
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    imageUrl?: string;
    images?: string[];
    category?: string;
  };
  isActive: boolean;
}

interface Discount {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

interface ShippingCountry {
  _id: string;
  name: string;
  code: string;
  shippingRate: number;
  freeThreshold: number;
  enableFreeThreshold: boolean;
  isActive: boolean;
  isDefault: boolean;
}

const CATEGORIES = ['Dresses', 'Evening Wear', 'Accessories', 'Outerwear', 'Tops', 'Bottoms', 'Shoes'];
const BRANDS = ['Lumière', 'Maison Élégance', 'Atelier Noir', 'Belle Couture', 'Chic Parisien'];

export default function AdminDashboard() {
  const { user, isLoading, isAdmin, logout } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    brand: 'Lumière',
    imageUrl: '',
    images: '',
    inStock: true,
    featured: false,
    newArrival: true,
    sizes: 'XS,S,M,L,XL',
    colors: '',
    material: '',
  });

  const [heroContent, setHeroContent] = useState({
    title: '',
    subtitle: '',
    description: '',
    buttonText: '',
    buttonLink: '',
    imageUrl: '',
  });

  const [featuredContent, setFeaturedContent] = useState({
    title: '',
    subtitle: '',
    category: '',
    buttonText: '',
    buttonLink: '',
    categories: [
      { name: 'Dresses', image: '' },
      { name: 'Evening Wear', image: '' },
      { name: 'Accessories', image: '' },
      { name: 'Outerwear', image: '' },
      { name: 'Tops', image: '' },
      { name: 'Bottoms', image: '' },
    ],
  });

  const [newCollectionContent, setNewCollectionContent] = useState({
    seasonText: '',
    heading: '',
    buttonText: '',
    category: '',
    image1: '',
    image2: '',
    image3: '',
    image4: '',
    image5: '',
  });

  const [brandStoryContent, setBrandStoryContent] = useState({
    description: '',
  });

  const [newsletterContent, setNewsletterContent] = useState({
    title: '',
    subtitle: '',
    buttonText: '',
  });

  const [bestSellersContent, setBestSellersContent] = useState({
    title: '',
    buttonText: '',
  });

  const [newInContent, setNewInContent] = useState({
    navLabel: 'New In',
    title: 'New In',
    subtitle: 'Just Arrived',
    description: '',
    category: '',
    buttonText: 'View All Products',
  });

  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('all');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [isAddDiscountOpen, setIsAddDiscountOpen] = useState(false);
  const [discountForm, setDiscountForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    minOrderAmount: '',
    maxUses: '',
    expiresAt: '',
  });

  const [shippingForm, setShippingForm] = useState({
    baseRate: 2,
    freeThreshold: 50,
    enableFreeThreshold: true,
  });

  const [isAddCountryOpen, setIsAddCountryOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<ShippingCountry | null>(null);
  const [countryForm, setCountryForm] = useState({
    name: '',
    code: '',
    shippingRate: 2,
    freeThreshold: 50,
    enableFreeThreshold: true,
    isDefault: false,
  });

  const { data: statsData } = useQuery<{ stats: Stats; recentUsers: User[]; recentProducts: Product[]; recentOrders: Order[] }>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    enabled: isAdmin,
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      return res.json();
    },
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
    enabled: isAdmin,
  });

  const { data: siteContent = [] } = useQuery<SiteContent[]>({
    queryKey: ['adminContent'],
    queryFn: async () => {
      const res = await fetch('/api/admin/content', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch content');
      return res.json();
    },
    enabled: isAdmin,
  });

  const { data: ordersData } = useQuery<{ orders: Order[]; pagination: { page: number; limit: number; total: number; pages: number } }>({
    queryKey: ['adminOrders', orderStatusFilter, orderPaymentFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (orderStatusFilter !== 'all') params.append('status', orderStatusFilter);
      if (orderPaymentFilter !== 'all') params.append('paymentStatus', orderPaymentFilter);
      const res = await fetch(`/api/admin/orders?${params.toString()}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
    enabled: isAdmin,
  });

  const orders = ordersData?.orders || [];

  const { data: discounts = [] } = useQuery<Discount[]>({
    queryKey: ['adminDiscounts'],
    queryFn: async () => {
      const res = await fetch('/api/admin/discounts', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch discounts');
      return res.json();
    },
    enabled: isAdmin,
  });

  const createDiscountMutation = useMutation({
    mutationFn: async (data: typeof discountForm) => {
      const res = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          code: data.code,
          type: data.type,
          value: Number(data.value),
          minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : 0,
          maxUses: data.maxUses ? Number(data.maxUses) : 0,
          expiresAt: data.expiresAt || null,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create discount');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDiscounts'] });
      setIsAddDiscountOpen(false);
      setDiscountForm({
        code: '',
        type: 'percentage',
        value: '',
        minOrderAmount: '',
        maxUses: '',
        expiresAt: '',
      });
    },
  });

  const toggleDiscountMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/admin/discounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error('Failed to update discount');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDiscounts'] });
    },
  });

  const deleteDiscountMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/discounts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete discount');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDiscounts'] });
    },
  });

  const { data: shippingSettings } = useQuery<{ baseRate: number; freeThreshold: number; enableFreeThreshold: boolean }>({
    queryKey: ['adminShipping'],
    queryFn: async () => {
      const res = await fetch('/api/admin/shipping', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch shipping settings');
      return res.json();
    },
    enabled: isAdmin,
  });

  useEffect(() => {
    if (shippingSettings) {
      setShippingForm({
        baseRate: shippingSettings.baseRate,
        freeThreshold: shippingSettings.freeThreshold,
        enableFreeThreshold: shippingSettings.enableFreeThreshold,
      });
    }
  }, [shippingSettings]);

  const updateShippingMutation = useMutation({
    mutationFn: async (data: typeof shippingForm) => {
      const res = await fetch('/api/admin/shipping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update shipping settings');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminShipping'] });
    },
  });

  const { data: shippingCountries = [] } = useQuery<ShippingCountry[]>({
    queryKey: ['adminShippingCountries'],
    queryFn: async () => {
      const res = await fetch('/api/admin/shipping/countries', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch shipping countries');
      return res.json();
    },
    enabled: isAdmin,
  });

  const createCountryMutation = useMutation({
    mutationFn: async (data: typeof countryForm) => {
      const res = await fetch('/api/admin/shipping/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create country');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminShippingCountries'] });
      setIsAddCountryOpen(false);
      setCountryForm({
        name: '',
        code: '',
        shippingRate: 2,
        freeThreshold: 50,
        enableFreeThreshold: true,
        isDefault: false,
      });
    },
  });

  const updateCountryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ShippingCountry> }) => {
      const res = await fetch(`/api/admin/shipping/countries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update country');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminShippingCountries'] });
      setEditingCountry(null);
    },
  });

  const deleteCountryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/shipping/countries/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete country');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminShippingCountries'] });
    },
  });

  useEffect(() => {
    if (siteContent.length > 0) {
      const heroData = siteContent.find(c => c.section === 'hero');
      if (heroData?.content) {
        setHeroContent({
          title: heroData.content.title || '',
          subtitle: heroData.content.subtitle || '',
          description: heroData.content.description || '',
          buttonText: heroData.content.buttonText || '',
          buttonLink: heroData.content.buttonLink || '',
          imageUrl: heroData.content.imageUrl || '',
        });
      }
      
      const featuredData = siteContent.find(c => c.section === 'featured_collection');
      if (featuredData?.content) {
        const savedCategories = (featuredData.content as any).categories || [];
        setFeaturedContent({
          title: featuredData.content.title || '',
          subtitle: featuredData.content.subtitle || '',
          category: featuredData.content.category || '',
          buttonText: featuredData.content.buttonText || '',
          buttonLink: featuredData.content.buttonLink || '',
          categories: savedCategories.length === 6 ? savedCategories : [
            { name: 'Dresses', image: '' },
            { name: 'Evening Wear', image: '' },
            { name: 'Accessories', image: '' },
            { name: 'Outerwear', image: '' },
            { name: 'Tops', image: '' },
            { name: 'Bottoms', image: '' },
          ],
        });
      }

      const newCollectionData = siteContent.find(c => c.section === 'new_collection');
      if (newCollectionData?.content) {
        const images = (newCollectionData.content as any).images || [];
        setNewCollectionContent({
          seasonText: (newCollectionData.content as any).seasonText || '',
          heading: (newCollectionData.content as any).heading || '',
          buttonText: newCollectionData.content.buttonText || '',
          category: (newCollectionData.content as any).category || '',
          image1: images[0] || '',
          image2: images[1] || '',
          image3: images[2] || '',
          image4: images[3] || '',
          image5: images[4] || '',
        });
      }

      const brandStoryData = siteContent.find(c => c.section === 'brand_story');
      if (brandStoryData?.content) {
        setBrandStoryContent({
          description: brandStoryData.content.description || '',
        });
      }

      const newsletterData = siteContent.find(c => c.section === 'newsletter');
      if (newsletterData?.content) {
        setNewsletterContent({
          title: newsletterData.content.title || '',
          subtitle: newsletterData.content.subtitle || '',
          buttonText: newsletterData.content.buttonText || '',
        });
      }

      const bestSellersData = siteContent.find(c => c.section === 'best_sellers');
      if (bestSellersData?.content) {
        setBestSellersContent({
          title: bestSellersData.content.title || '',
          buttonText: bestSellersData.content.buttonText || '',
        });
      }

      const newInData = siteContent.find(c => c.section === 'new_in');
      if (newInData?.content) {
        setNewInContent({
          navLabel: (newInData.content as any).navLabel || 'New In',
          title: newInData.content.title || 'New In',
          subtitle: newInData.content.subtitle || 'Just Arrived',
          description: newInData.content.description || '',
          category: newInData.content.category || '',
          buttonText: newInData.content.buttonText || 'View All Products',
        });
      }
    }
  }, [siteContent]);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      setLocation('/');
    }
  }, [isLoading, user, isAdmin, setLocation]);

  const createProductMutation = useMutation({
    mutationFn: async (product: any) => {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to create product');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      setIsAddProductOpen(false);
      resetForm();
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to update product');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      setEditingProduct(null);
      setIsAddProductOpen(false);
      resetForm();
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete product');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to update user role');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete user');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: async ({ section, content }: { section: string; content: any }) => {
      const res = await fetch(`/api/content/${section}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to update content');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminContent'] });
      queryClient.invalidateQueries({ queryKey: ['siteContent'] });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to update order status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  const updateOrderPaymentMutation = useMutation({
    mutationFn: async ({ id, paymentStatus }: { id: string; paymentStatus: string }) => {
      const res = await fetch(`/api/admin/orders/${id}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to update payment status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete order');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  const resetForm = () => {
    setProductForm({
      name: '',
      price: '',
      description: '',
      category: '',
      brand: 'Lumière',
      imageUrl: '',
      images: '',
      inStock: true,
      featured: false,
      newArrival: true,
      sizes: 'XS,S,M,L,XL',
      colors: '',
      material: '',
    });
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: productForm.name,
      price: parseFloat(productForm.price),
      description: productForm.description,
      category: productForm.category,
      brand: productForm.brand,
      imageUrl: productForm.imageUrl,
      images: productForm.images ? productForm.images.split(',').map(s => s.trim()) : [],
      inStock: productForm.inStock,
      featured: productForm.featured,
      newArrival: productForm.newArrival,
      sizes: productForm.sizes ? productForm.sizes.split(',').map(s => s.trim()) : [],
      colors: productForm.colors ? productForm.colors.split(',').map(s => s.trim()) : [],
      material: productForm.material,
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct._id, data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      category: product.category,
      brand: product.brand || 'Lumière',
      imageUrl: product.imageUrl,
      images: product.images?.join(', ') || '',
      inStock: product.inStock,
      featured: product.featured,
      newArrival: product.newArrival || false,
      sizes: product.sizes?.join(', ') || 'XS,S,M,L,XL',
      colors: product.colors?.join(', ') || '',
      material: product.material || '',
    });
    setIsAddProductOpen(true);
  };

  const handleSaveHeroContent = () => {
    updateContentMutation.mutate({
      section: 'hero',
      content: {
        title: heroContent.title,
        subtitle: heroContent.subtitle,
        description: heroContent.description,
        buttonText: heroContent.buttonText,
        buttonLink: heroContent.buttonLink,
        imageUrl: heroContent.imageUrl,
      },
    });
  };

  const handleSaveFeaturedContent = () => {
    updateContentMutation.mutate({
      section: 'featured_collection',
      content: {
        title: featuredContent.title,
        subtitle: featuredContent.subtitle,
        category: featuredContent.category,
        buttonText: featuredContent.buttonText,
        buttonLink: featuredContent.buttonLink,
        categories: featuredContent.categories,
      },
    });
  };

  const handleSaveNewCollectionContent = () => {
    const images = [
      newCollectionContent.image1,
      newCollectionContent.image2,
      newCollectionContent.image3,
      newCollectionContent.image4,
      newCollectionContent.image5,
    ].filter(img => img.trim() !== '');
    
    updateContentMutation.mutate({
      section: 'new_collection',
      content: {
        seasonText: newCollectionContent.seasonText,
        heading: newCollectionContent.heading,
        buttonText: newCollectionContent.buttonText,
        category: newCollectionContent.category,
        images,
      },
    });
  };

  const handleSaveBrandStoryContent = () => {
    updateContentMutation.mutate({
      section: 'brand_story',
      content: {
        description: brandStoryContent.description,
      },
    });
  };

  const handleSaveNewsletterContent = () => {
    updateContentMutation.mutate({
      section: 'newsletter',
      content: {
        title: newsletterContent.title,
        subtitle: newsletterContent.subtitle,
        buttonText: newsletterContent.buttonText,
      },
    });
  };

  const handleSaveBestSellersContent = () => {
    updateContentMutation.mutate({
      section: 'best_sellers',
      content: {
        title: bestSellersContent.title,
        buttonText: bestSellersContent.buttonText,
      },
    });
  };

  const handleSaveNewInContent = () => {
    updateContentMutation.mutate({
      section: 'new_in',
      content: {
        navLabel: newInContent.navLabel,
        title: newInContent.title,
        subtitle: newInContent.subtitle,
        description: newInContent.description,
        category: newInContent.category,
        buttonText: newInContent.buttonText,
      },
    });
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || !isAdmin) {
    return null;
  }

  const stats = statsData?.stats;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold">Lumière Admin</h1>
              <p className="text-xs text-muted-foreground">Welcome, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setLocation('/')}>
              View Site
            </Button>
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Orders
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Products
            </TabsTrigger>
            <TabsTrigger value="discounts" className="flex items-center gap-2">
              <Tag className="w-4 h-4" /> Discounts
            </TabsTrigger>
            <TabsTrigger value="shipping" className="flex items-center gap-2">
              <Truck className="w-4 h-4" /> Shipping
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Users
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900">${(stats?.totalRevenue || 0).toLocaleString()}</div>
                  <p className="text-xs text-green-700">Lifetime sales</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">Today's Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">${(stats?.todayRevenue || 0).toLocaleString()}</div>
                  <p className="text-xs text-blue-700">Sales today</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800">Total Orders</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900">{stats?.totalOrders || 0}</div>
                  <p className="text-xs text-purple-700">{stats?.pendingOrders || 0} pending</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800">In Progress</CardTitle>
                  <Truck className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-900">{(stats?.processingOrders || 0) + (stats?.shippedOrders || 0)}</div>
                  <p className="text-xs text-orange-700">{stats?.deliveredOrders || 0} delivered</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">Registered accounts</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.totalProducts || 0}</div>
                  <p className="text-xs text-muted-foreground">{stats?.inStockProducts || 0} in stock</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                  <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.totalCategories || 0}</div>
                  <p className="text-xs text-muted-foreground">Product categories</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Featured</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.featuredProducts || 0}</div>
                  <p className="text-xs text-muted-foreground">Featured products</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>Latest registered users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statsData?.recentUsers?.map((user) => (
                      <div key={user._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-medium text-primary">{user.name?.charAt(0) || 'U'}</span>
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                          {user.role}
                        </span>
                      </div>
                    ))}
                    {!statsData?.recentUsers?.length && (
                      <p className="text-muted-foreground text-center py-4">No users yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Products</CardTitle>
                  <CardDescription>Latest added products</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statsData?.recentProducts?.map((product) => (
                      <div key={product._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded object-cover" />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                          </div>
                        </div>
                        <span className="font-medium">${product.price}</span>
                      </div>
                    ))}
                    {!statsData?.recentProducts?.length && (
                      <p className="text-muted-foreground text-center py-4">No products yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statsData?.recentOrders?.map((order) => (
                    <div key={order._id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">{order.customerName} • {order.items.length} item(s)</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${order.total.toFixed(2)}</p>
                        <Badge variant={order.status === 'delivered' ? 'default' : order.status === 'cancelled' ? 'destructive' : 'secondary'} className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {!statsData?.recentOrders?.length && (
                    <p className="text-muted-foreground text-center py-4">No orders yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold">Orders</h2>
              <p className="text-muted-foreground">Manage customer orders and track fulfillment</p>
            </div>

            <div className="flex gap-4 flex-wrap">
              <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Select value={orderPaymentFilter} onValueChange={setOrderPaymentFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-medium">Order</th>
                      <th className="text-left p-4 font-medium">Customer</th>
                      <th className="text-left p-4 font-medium">Items</th>
                      <th className="text-left p-4 font-medium">Total</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Payment</th>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b hover:bg-muted/30">
                        <td className="p-4">
                          <p className="font-medium">{order.orderNumber}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{order.items.length} item(s)</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium">${order.total.toFixed(2)}</p>
                        </td>
                        <td className="p-4">
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatusMutation.mutate({ id: order._id, status: value })}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                              <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant={order.paymentStatus === 'paid' ? 'default' : order.paymentStatus === 'refunded' ? 'secondary' : 'destructive'}
                          >
                            {order.paymentStatus}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewingOrder(order)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteOrderMutation.mutate(order._id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Dialog open={!!viewingOrder} onOpenChange={(open) => !open && setViewingOrder(null)}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Order Details - {viewingOrder?.orderNumber}</DialogTitle>
                  </DialogHeader>
                  {viewingOrder && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-2">Customer Information</h3>
                        <div className="bg-muted/50 p-4 rounded-lg space-y-1 text-sm">
                          <p><span className="text-muted-foreground">Name:</span> {viewingOrder.customerName}</p>
                          <p><span className="text-muted-foreground">Email:</span> {viewingOrder.customerEmail}</p>
                          <p><span className="text-muted-foreground">Phone:</span> {viewingOrder.shippingAddress.phone || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Shipping Address</h3>
                        <div className="bg-muted/50 p-4 rounded-lg space-y-1 text-sm">
                          <p>{viewingOrder.shippingAddress.name}</p>
                          <p>{viewingOrder.shippingAddress.line1}</p>
                          {viewingOrder.shippingAddress.line2 && <p>{viewingOrder.shippingAddress.line2}</p>}
                          <p>{viewingOrder.shippingAddress.city}, {viewingOrder.shippingAddress.state}</p>
                          {viewingOrder.shippingAddress.postalCode && <p>{viewingOrder.shippingAddress.postalCode}</p>}
                          <p>{viewingOrder.shippingAddress.country}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Order Items</h3>
                        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                          {viewingOrder.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{item.name} x{item.quantity} {item.size ? `(${item.size})` : ''}</span>
                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="border-t pt-2 mt-2 font-medium flex justify-between">
                            <span>Total</span>
                            <span>${viewingOrder.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {viewingOrder.notes && (
                        <div>
                          <h3 className="font-medium mb-2">Order Notes</h3>
                          <div className="bg-muted/50 p-4 rounded-lg text-sm">
                            {viewingOrder.notes}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Badge variant={viewingOrder.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                          Payment: {viewingOrder.paymentStatus}
                        </Badge>
                        <Badge variant="outline">
                          Method: {viewingOrder.paymentMethod.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {orders.length === 0 && (
                <div className="p-12 text-center">
                  <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No orders found</p>
                  <p className="text-sm text-muted-foreground mt-2">Orders will appear here when customers make purchases</p>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-serif font-bold">Products</h2>
                <p className="text-muted-foreground">Manage your product catalog</p>
              </div>
              <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetForm(); setEditingProduct(null); }}>
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmitProduct} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                          id="name"
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          required
                          placeholder="e.g., Silk Evening Gown"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price ($) *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          required
                          placeholder="e.g., 299.99"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={productForm.category}
                          onValueChange={(value) => setProductForm({ ...productForm, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="brand">Brand *</Label>
                        <Select
                          value={productForm.brand}
                          onValueChange={(value) => setProductForm({ ...productForm, brand: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                          <SelectContent>
                            {BRANDS.map((brand) => (
                              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">Main Image URL *</Label>
                      <Input
                        id="imageUrl"
                        value={productForm.imageUrl}
                        onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                        required
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="images">Additional Images (comma-separated URLs)</Label>
                      <Input
                        id="images"
                        value={productForm.images}
                        onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                        placeholder="https://url1.jpg, https://url2.jpg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        required
                        rows={3}
                        placeholder="Describe the product..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                        <Input
                          id="sizes"
                          value={productForm.sizes}
                          onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                          placeholder="XS, S, M, L, XL"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="colors">Colors (comma-separated)</Label>
                        <Input
                          id="colors"
                          value={productForm.colors}
                          onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })}
                          placeholder="Black, White, Red"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="material">Material</Label>
                      <Input
                        id="material"
                        value={productForm.material}
                        onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                        placeholder="e.g., 100% Silk"
                      />
                    </div>

                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="inStock"
                          checked={productForm.inStock}
                          onCheckedChange={(checked) => setProductForm({ ...productForm, inStock: checked })}
                        />
                        <Label htmlFor="inStock">In Stock</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="featured"
                          checked={productForm.featured}
                          onCheckedChange={(checked) => setProductForm({ ...productForm, featured: checked })}
                        />
                        <Label htmlFor="featured">Featured</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="newArrival"
                          checked={productForm.newArrival}
                          onCheckedChange={(checked) => setProductForm({ ...productForm, newArrival: checked })}
                        />
                        <Label htmlFor="newArrival">New Arrival</Label>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={createProductMutation.isPending || updateProductMutation.isPending}>
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product._id} className="overflow-hidden">
                  <div className="aspect-[3/4] relative">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      {!product.inStock && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">Out of Stock</span>}
                      {product.featured && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">Featured</span>}
                      {product.newArrival && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">New</span>}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-serif font-bold line-clamp-1">{product.name}</h3>
                        <p className="text-xs text-muted-foreground">{product.brand} · {product.category}</p>
                      </div>
                      <span className="font-bold">${product.price}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => startEdit(product)}>
                        <Edit className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteProductMutation.mutate(product._id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {products.length === 0 && (
              <Card className="p-12 text-center">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-serif text-xl mb-2">No products yet</h3>
                <p className="text-muted-foreground mb-4">Add your first product to get started</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="discounts" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-serif font-bold">Discount Codes</h2>
                <p className="text-muted-foreground">Create and manage promotional discount codes</p>
              </div>
              <Dialog open={isAddDiscountOpen} onOpenChange={setIsAddDiscountOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Tag className="w-4 h-4 mr-2" />
                    Create Discount
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Discount Code</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => { e.preventDefault(); createDiscountMutation.mutate(discountForm); }} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Discount Code *</Label>
                      <Input
                        value={discountForm.code}
                        onChange={(e) => setDiscountForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        placeholder="e.g. SAVE20"
                        className="uppercase"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type *</Label>
                        <Select value={discountForm.type} onValueChange={(v: 'percentage' | 'fixed') => setDiscountForm(prev => ({ ...prev, type: v }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed">Fixed Amount (KWD)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Value *</Label>
                        <Input
                          type="number"
                          value={discountForm.value}
                          onChange={(e) => setDiscountForm(prev => ({ ...prev, value: e.target.value }))}
                          placeholder={discountForm.type === 'percentage' ? 'e.g. 20' : 'e.g. 5'}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Min Order Amount (KWD)</Label>
                        <Input
                          type="number"
                          value={discountForm.minOrderAmount}
                          onChange={(e) => setDiscountForm(prev => ({ ...prev, minOrderAmount: e.target.value }))}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Uses (0 = unlimited)</Label>
                        <Input
                          type="number"
                          value={discountForm.maxUses}
                          onChange={(e) => setDiscountForm(prev => ({ ...prev, maxUses: e.target.value }))}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Expires At (optional)</Label>
                      <Input
                        type="datetime-local"
                        value={discountForm.expiresAt}
                        onChange={(e) => setDiscountForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={createDiscountMutation.isPending}>
                      {createDiscountMutation.isPending ? 'Creating...' : 'Create Discount Code'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="p-4 text-left font-medium">Code</th>
                      <th className="p-4 text-left font-medium">Type</th>
                      <th className="p-4 text-left font-medium">Value</th>
                      <th className="p-4 text-left font-medium">Min Order</th>
                      <th className="p-4 text-left font-medium">Usage</th>
                      <th className="p-4 text-left font-medium">Expires</th>
                      <th className="p-4 text-left font-medium">Status</th>
                      <th className="p-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.map((discount) => (
                      <tr key={discount._id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4">
                          <span className="font-mono font-bold bg-muted px-2 py-1 rounded">{discount.code}</span>
                        </td>
                        <td className="p-4 capitalize">{discount.type}</td>
                        <td className="p-4">
                          {discount.type === 'percentage' ? `${discount.value}%` : `${discount.value} KWD`}
                        </td>
                        <td className="p-4">
                          {discount.minOrderAmount > 0 ? `${discount.minOrderAmount} KWD` : '-'}
                        </td>
                        <td className="p-4">
                          {discount.usedCount}{discount.maxUses > 0 ? `/${discount.maxUses}` : ''}
                        </td>
                        <td className="p-4">
                          {discount.expiresAt ? new Date(discount.expiresAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="p-4">
                          <Switch
                            checked={discount.isActive}
                            onCheckedChange={(checked) => toggleDiscountMutation.mutate({ id: discount._id, isActive: checked })}
                          />
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteDiscountMutation.mutate(discount._id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {discounts.length === 0 && (
              <Card className="p-12 text-center">
                <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-serif text-xl mb-2">No discount codes yet</h3>
                <p className="text-muted-foreground mb-4">Create your first discount code to offer promotions</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="shipping" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-serif font-bold">Shipping Countries</h2>
                <p className="text-muted-foreground">Configure shipping rates for each country</p>
              </div>
              <Dialog open={isAddCountryOpen} onOpenChange={setIsAddCountryOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Truck className="w-4 h-4 mr-2" />
                    Add Country
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Country</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => { e.preventDefault(); createCountryMutation.mutate(countryForm); }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Country Name *</Label>
                        <Input
                          value={countryForm.name}
                          onChange={(e) => setCountryForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g. Saudi Arabia"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Country Code *</Label>
                        <Input
                          value={countryForm.code}
                          onChange={(e) => setCountryForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                          placeholder="e.g. SA"
                          maxLength={3}
                          className="uppercase"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Shipping Rate (KWD) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={countryForm.shippingRate}
                          onChange={(e) => setCountryForm(prev => ({ ...prev, shippingRate: parseFloat(e.target.value) || 0 }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Free Threshold (KWD)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={countryForm.freeThreshold}
                          onChange={(e) => setCountryForm(prev => ({ ...prev, freeThreshold: parseFloat(e.target.value) || 0 }))}
                          disabled={!countryForm.enableFreeThreshold}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={countryForm.enableFreeThreshold}
                        onCheckedChange={(checked) => setCountryForm(prev => ({ ...prev, enableFreeThreshold: checked }))}
                      />
                      <Label>Enable free shipping threshold</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={countryForm.isDefault}
                        onCheckedChange={(checked) => setCountryForm(prev => ({ ...prev, isDefault: checked }))}
                      />
                      <Label>Set as default country</Label>
                    </div>
                    <Button type="submit" className="w-full" disabled={createCountryMutation.isPending}>
                      {createCountryMutation.isPending ? 'Adding...' : 'Add Country'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="p-4 text-left font-medium">Country</th>
                      <th className="p-4 text-left font-medium">Code</th>
                      <th className="p-4 text-left font-medium">Shipping Rate</th>
                      <th className="p-4 text-left font-medium">Free Threshold</th>
                      <th className="p-4 text-left font-medium">Status</th>
                      <th className="p-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shippingCountries.map((country) => (
                      <tr key={country._id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{country.name}</span>
                            {country.isDefault && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Default</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-mono">{country.code}</td>
                        <td className="p-4">{country.shippingRate} KWD</td>
                        <td className="p-4">
                          {country.enableFreeThreshold ? `${country.freeThreshold} KWD` : 'Disabled'}
                        </td>
                        <td className="p-4">
                          <Switch
                            checked={country.isActive}
                            onCheckedChange={(checked) => updateCountryMutation.mutate({ id: country._id, data: { isActive: checked } })}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Dialog open={editingCountry?._id === country._id} onOpenChange={(open) => !open && setEditingCountry(null)}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingCountry(country)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Edit {country.name}</DialogTitle>
                                </DialogHeader>
                                {editingCountry && (
                                  <form onSubmit={(e) => { 
                                    e.preventDefault(); 
                                    const formData = new FormData(e.currentTarget);
                                    updateCountryMutation.mutate({
                                      id: editingCountry._id,
                                      data: {
                                        name: formData.get('name') as string,
                                        code: (formData.get('code') as string).toUpperCase(),
                                        shippingRate: parseFloat(formData.get('shippingRate') as string) || 0,
                                        freeThreshold: parseFloat(formData.get('freeThreshold') as string) || 0,
                                        enableFreeThreshold: formData.get('enableFreeThreshold') === 'on',
                                        isDefault: formData.get('isDefault') === 'on',
                                      }
                                    });
                                  }} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Country Name</Label>
                                        <Input name="name" defaultValue={editingCountry.name} required />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Code</Label>
                                        <Input name="code" defaultValue={editingCountry.code} maxLength={3} className="uppercase" required />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Shipping Rate (KWD)</Label>
                                        <Input name="shippingRate" type="number" step="0.01" min="0" defaultValue={editingCountry.shippingRate} required />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Free Threshold (KWD)</Label>
                                        <Input name="freeThreshold" type="number" step="0.01" min="0" defaultValue={editingCountry.freeThreshold} />
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <input type="checkbox" name="enableFreeThreshold" defaultChecked={editingCountry.enableFreeThreshold} className="h-4 w-4" />
                                      <Label>Enable free shipping threshold</Label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <input type="checkbox" name="isDefault" defaultChecked={editingCountry.isDefault} className="h-4 w-4" />
                                      <Label>Set as default country</Label>
                                    </div>
                                    <Button type="submit" className="w-full" disabled={updateCountryMutation.isPending}>
                                      {updateCountryMutation.isPending ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                  </form>
                                )}
                              </DialogContent>
                            </Dialog>
                            {!country.isDefault && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteCountryMutation.mutate(country._id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {shippingCountries.length === 0 && (
              <Card className="p-12 text-center">
                <Truck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-serif text-xl mb-2">No countries configured</h3>
                <p className="text-muted-foreground mb-4">Add your first shipping country to get started</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div>
              <h2 className="text-2xl font-serif font-bold">Users</h2>
              <p className="text-muted-foreground">Manage registered users</p>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="p-4 text-left font-medium">User</th>
                      <th className="p-4 text-left font-medium">Email</th>
                      <th className="p-4 text-left font-medium">Role</th>
                      <th className="p-4 text-left font-medium">Joined</th>
                      <th className="p-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-medium text-primary">{u.name?.charAt(0) || 'U'}</span>
                            </div>
                            <span className="font-medium">{u.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{u.email}</td>
                        <td className="p-4">
                          <Select
                            value={u.role}
                            onValueChange={(role) => updateUserRoleMutation.mutate({ id: u._id, role })}
                            disabled={u._id === user?.id}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteUserMutation.mutate(u._id)}
                            disabled={u._id === user?.id}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {users.length === 0 && (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No users found</p>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-8">
            <div>
              <h2 className="text-2xl font-serif font-bold">Website Content</h2>
              <p className="text-muted-foreground">Customize all sections of your homepage. Changes appear immediately after saving.</p>
            </div>

            <Card className="border-2 border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Image className="w-6 h-6" /> 1. Hero Section
                </CardTitle>
                <CardDescription>The main banner visitors see first - your hero section with background image and text</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-medium">Main Title</Label>
                      <Input
                        value={heroContent.title}
                        onChange={(e) => setHeroContent({ ...heroContent, title: e.target.value })}
                        placeholder="e.g., ELEGANCE"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Subtitle (italic text below title)</Label>
                      <Input
                        value={heroContent.subtitle}
                        onChange={(e) => setHeroContent({ ...heroContent, subtitle: e.target.value })}
                        placeholder="e.g., REDEFINED"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Season Text (small text above title)</Label>
                      <Input
                        value={heroContent.description}
                        onChange={(e) => setHeroContent({ ...heroContent, description: e.target.value })}
                        placeholder="e.g., Spring / Summer 2025"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-medium">Button Text</Label>
                      <Input
                        value={heroContent.buttonText}
                        onChange={(e) => setHeroContent({ ...heroContent, buttonText: e.target.value })}
                        placeholder="e.g., Explore Collection"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Button Link</Label>
                      <Input
                        value={heroContent.buttonLink}
                        onChange={(e) => setHeroContent({ ...heroContent, buttonLink: e.target.value })}
                        placeholder="e.g., /shop"
                      />
                    </div>
                    <ImageUploadInput
                      label="Background Image"
                      value={heroContent.imageUrl}
                      onChange={(url) => setHeroContent({ ...heroContent, imageUrl: url })}
                      placeholder="Paste URL or upload image"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveHeroContent} className="mt-6" disabled={updateContentMutation.isPending}>
                  Save Hero Section
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TrendingUp className="w-6 h-6" /> 2. Best Sellers Section
                </CardTitle>
                <CardDescription>The carousel showcasing your top-selling products</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-medium">Section Title</Label>
                    <Input
                      value={bestSellersContent.title}
                      onChange={(e) => setBestSellersContent({ ...bestSellersContent, title: e.target.value })}
                      placeholder="e.g., Best Sellers"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-medium">Button Text</Label>
                    <Input
                      value={bestSellersContent.buttonText}
                      onChange={(e) => setBestSellersContent({ ...bestSellersContent, buttonText: e.target.value })}
                      placeholder="e.g., Shop All"
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">Products displayed in this section are pulled from your product catalog. Mark products as "Featured" in the Products tab to show them here.</p>
                <Button onClick={handleSaveBestSellersContent} className="mt-6" disabled={updateContentMutation.isPending}>
                  Save Best Sellers
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ShoppingBag className="w-6 h-6" /> 3. New Collection Gallery
                </CardTitle>
                <CardDescription>The dramatic black section with 5 product cards. Products are clickable and link to their detail pages.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="font-medium">Season Text (left side)</Label>
                      <Textarea
                        value={newCollectionContent.seasonText}
                        onChange={(e) => setNewCollectionContent({ ...newCollectionContent, seasonText: e.target.value })}
                        placeholder="New Collection&#10;Fall / Winter 2025&#10;Limited Edition"
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">Each line appears on a new line</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Main Heading (right side)</Label>
                      <Textarea
                        value={newCollectionContent.heading}
                        onChange={(e) => setNewCollectionContent({ ...newCollectionContent, heading: e.target.value })}
                        placeholder="DESIGNED&#10;TO MAKE&#10;AN ENTRANCE"
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">Each line appears on a new line</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Button Text</Label>
                      <Input
                        value={newCollectionContent.buttonText}
                        onChange={(e) => setNewCollectionContent({ ...newCollectionContent, buttonText: e.target.value })}
                        placeholder="e.g., View All Products"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Product Category</Label>
                      <Select
                        value={newCollectionContent.category}
                        onValueChange={(value) => setNewCollectionContent({ ...newCollectionContent, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category to display" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories (Featured)</SelectItem>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Products from this category will appear in the gallery</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <Label className="font-medium text-lg mb-4 block">Gallery Images (5 images)</Label>
                    <p className="text-sm text-muted-foreground mb-4">Enter URLs for 5 model images. They will display in a fanning animation.</p>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <ImageUploadInput
                        label="Image 1 (far left)"
                        value={newCollectionContent.image1}
                        onChange={(url) => setNewCollectionContent({ ...newCollectionContent, image1: url })}
                        placeholder="Upload or paste URL"
                      />
                      <ImageUploadInput
                        label="Image 2 (mid left)"
                        value={newCollectionContent.image2}
                        onChange={(url) => setNewCollectionContent({ ...newCollectionContent, image2: url })}
                        placeholder="Upload or paste URL"
                      />
                      <ImageUploadInput
                        label="Image 3 (center)"
                        value={newCollectionContent.image3}
                        onChange={(url) => setNewCollectionContent({ ...newCollectionContent, image3: url })}
                        placeholder="Upload or paste URL"
                      />
                      <ImageUploadInput
                        label="Image 4 (mid right)"
                        value={newCollectionContent.image4}
                        onChange={(url) => setNewCollectionContent({ ...newCollectionContent, image4: url })}
                        placeholder="Upload or paste URL"
                      />
                      <ImageUploadInput
                        label="Image 5 (far right)"
                        value={newCollectionContent.image5}
                        onChange={(url) => setNewCollectionContent({ ...newCollectionContent, image5: url })}
                        placeholder="Upload or paste URL"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Upload all 5 images for custom gallery, or leave empty to use defaults</p>
                  </div>
                </div>
                <Button onClick={handleSaveNewCollectionContent} className="mt-6" disabled={updateContentMutation.isPending}>
                  Save New Collection
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Tag className="w-6 h-6" /> 4. Collection Section
                </CardTitle>
                <CardDescription>Display 6 category cards that link to your shop. Customize each category name and image.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="font-medium">Section Title</Label>
                      <Input
                        value={featuredContent.title}
                        onChange={(e) => setFeaturedContent({ ...featuredContent, title: e.target.value })}
                        placeholder="e.g., Collections"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Button Text</Label>
                      <Input
                        value={featuredContent.buttonText}
                        onChange={(e) => setFeaturedContent({ ...featuredContent, buttonText: e.target.value })}
                        placeholder="e.g., View All Products"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Button Link</Label>
                      <Input
                        value={featuredContent.buttonLink}
                        onChange={(e) => setFeaturedContent({ ...featuredContent, buttonLink: e.target.value })}
                        placeholder="e.g., /shop"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <Label className="font-medium text-lg mb-4 block">Category Cards (6 categories)</Label>
                    <p className="text-sm text-muted-foreground mb-4">Each category will show as a card linking to that category in your shop.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {featuredContent.categories.map((cat, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Category {index + 1}</Label>
                            <Select
                              value={cat.name}
                              onValueChange={(value) => {
                                const newCategories = [...featuredContent.categories];
                                newCategories[index] = { ...newCategories[index], name: value };
                                setFeaturedContent({ ...featuredContent, categories: newCategories });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORIES.map((category) => (
                                  <SelectItem key={category} value={category}>{category}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <ImageUploadInput
                            label={`Category ${index + 1} Image`}
                            value={cat.image}
                            onChange={(url) => {
                              const newCategories = [...featuredContent.categories];
                              newCategories[index] = { ...newCategories[index], image: url };
                              setFeaturedContent({ ...featuredContent, categories: newCategories });
                            }}
                            placeholder="Upload or paste URL"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <Button onClick={handleSaveFeaturedContent} className="mt-6" disabled={updateContentMutation.isPending}>
                  Save Collection Section
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 border-primary/20">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" /> 5. Brand Story Quote
                  </CardTitle>
                  <CardDescription>The inspirational quote shown between sections</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="font-medium">Quote Text</Label>
                    <Textarea
                      value={brandStoryContent.description}
                      onChange={(e) => setBrandStoryContent({ ...brandStoryContent, description: e.target.value })}
                      placeholder="Lumière creates timeless pieces for the modern woman. Merging classic silhouettes with contemporary attitude."
                      rows={4}
                    />
                  </div>
                  <Button onClick={handleSaveBrandStoryContent} className="w-full" disabled={updateContentMutation.isPending}>
                    Save Brand Story
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" /> 6. Newsletter Section
                  </CardTitle>
                  <CardDescription>The email signup section at the bottom of the page</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="font-medium">Title</Label>
                    <Input
                      value={newsletterContent.title}
                      onChange={(e) => setNewsletterContent({ ...newsletterContent, title: e.target.value })}
                      placeholder="e.g., Join the World of Lumière"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-medium">Subtitle</Label>
                    <Input
                      value={newsletterContent.subtitle}
                      onChange={(e) => setNewsletterContent({ ...newsletterContent, subtitle: e.target.value })}
                      placeholder="e.g., Subscribe to receive updates..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-medium">Button Text</Label>
                    <Input
                      value={newsletterContent.buttonText}
                      onChange={(e) => setNewsletterContent({ ...newsletterContent, buttonText: e.target.value })}
                      placeholder="e.g., Subscribe"
                    />
                  </div>
                  <Button onClick={handleSaveNewsletterContent} className="w-full" disabled={updateContentMutation.isPending}>
                    Save Newsletter
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="border-2 border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ShoppingBag className="w-6 h-6" /> 7. New In Page
                </CardTitle>
                <CardDescription>Configure the "New In" page - change the navigation label, page title, text, and product category</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-medium">Navigation Label</Label>
                      <Input
                        value={newInContent.navLabel}
                        onChange={(e) => setNewInContent({ ...newInContent, navLabel: e.target.value })}
                        placeholder="e.g., New In, New Arrivals, Fresh Drops"
                      />
                      <p className="text-xs text-muted-foreground">This is what appears in the navigation bar</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Page Title</Label>
                      <Input
                        value={newInContent.title}
                        onChange={(e) => setNewInContent({ ...newInContent, title: e.target.value })}
                        placeholder="e.g., New In"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Subtitle (Small text above title)</Label>
                      <Input
                        value={newInContent.subtitle}
                        onChange={(e) => setNewInContent({ ...newInContent, subtitle: e.target.value })}
                        placeholder="e.g., Just Arrived"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-medium">Description</Label>
                      <Textarea
                        value={newInContent.description}
                        onChange={(e) => setNewInContent({ ...newInContent, description: e.target.value })}
                        placeholder="e.g., Discover our latest arrivals, fresh from the runway to your wardrobe."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Product Category</Label>
                      <Select
                        value={newInContent.category}
                        onValueChange={(value) => setNewInContent({ ...newInContent, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category (or leave empty for all products)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Products</SelectItem>
                          <SelectItem value="Dresses">Dresses</SelectItem>
                          <SelectItem value="Evening Wear">Evening Wear</SelectItem>
                          <SelectItem value="Tops">Tops</SelectItem>
                          <SelectItem value="Bottoms">Bottoms</SelectItem>
                          <SelectItem value="Outerwear">Outerwear</SelectItem>
                          <SelectItem value="Accessories">Accessories</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Products from this category will be shown on the New In page</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Button Text</Label>
                      <Input
                        value={newInContent.buttonText}
                        onChange={(e) => setNewInContent({ ...newInContent, buttonText: e.target.value })}
                        placeholder="e.g., View All Products"
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={handleSaveNewInContent} className="mt-6" disabled={updateContentMutation.isPending}>
                  Save New In Page
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
