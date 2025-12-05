import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Edit, Users, Package, Tag, TrendingUp, Image, Settings, LayoutDashboard, ShoppingBag, FileText, DollarSign, Clock, CheckCircle, XCircle, Truck, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  });

  const [newCollectionContent, setNewCollectionContent] = useState({
    seasonText: '',
    heading: '',
    buttonText: '',
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

  if (!isLoading && (!user || !isAdmin)) {
    setLocation('/');
    return null;
  }

  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('all');

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
        setFeaturedContent({
          title: featuredData.content.title || '',
          subtitle: featuredData.content.subtitle || '',
          category: featuredData.content.category || '',
          buttonText: featuredData.content.buttonText || '',
          buttonLink: featuredData.content.buttonLink || '',
        });
      }

      const newCollectionData = siteContent.find(c => c.section === 'new_collection');
      if (newCollectionData?.content) {
        const images = (newCollectionData.content as any).images || [];
        setNewCollectionContent({
          seasonText: (newCollectionData.content as any).seasonText || '',
          heading: (newCollectionData.content as any).heading || '',
          buttonText: newCollectionData.content.buttonText || '',
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
    }
  }, [siteContent]);

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

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Orders
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Products
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
                    <div className="space-y-2">
                      <Label className="font-medium">Background Image URL</Label>
                      <Input
                        value={heroContent.imageUrl}
                        onChange={(e) => setHeroContent({ ...heroContent, imageUrl: e.target.value })}
                        placeholder="Paste image URL here"
                      />
                      <p className="text-xs text-muted-foreground">Paste a URL to an image (e.g., from Unsplash or your image hosting)</p>
                    </div>
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
                  <Tag className="w-6 h-6" /> 2. Featured Collection
                </CardTitle>
                <CardDescription>The product showcase section displaying your featured items by category</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-medium">Section Title</Label>
                      <Input
                        value={featuredContent.title}
                        onChange={(e) => setFeaturedContent({ ...featuredContent, title: e.target.value })}
                        placeholder="e.g., Featured Collection"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Subtitle (small text above title)</Label>
                      <Input
                        value={featuredContent.subtitle}
                        onChange={(e) => setFeaturedContent({ ...featuredContent, subtitle: e.target.value })}
                        placeholder="e.g., Curated Selection"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Display Category</Label>
                      <Select
                        value={featuredContent.category}
                        onValueChange={(value) => setFeaturedContent({ ...featuredContent, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select which category to display" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories (Featured Products)</SelectItem>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">This determines which products appear in this section</p>
                    </div>
                  </div>
                  <div className="space-y-4">
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
                </div>
                <Button onClick={handleSaveFeaturedContent} className="mt-6" disabled={updateContentMutation.isPending}>
                  Save Featured Collection
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ShoppingBag className="w-6 h-6" /> 3. New Collection Gallery
                </CardTitle>
                <CardDescription>The dramatic black section with 5 model images and "DESIGNED TO MAKE AN ENTRANCE" text</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  </div>
                  
                  <div className="border-t pt-4">
                    <Label className="font-medium text-lg mb-4 block">Gallery Images (5 images)</Label>
                    <p className="text-sm text-muted-foreground mb-4">Enter URLs for 5 model images. They will display in a fanning animation.</p>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Image 1 (far left)</Label>
                        <Input
                          value={newCollectionContent.image1}
                          onChange={(e) => setNewCollectionContent({ ...newCollectionContent, image1: e.target.value })}
                          placeholder="Image URL"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Image 2 (mid left)</Label>
                        <Input
                          value={newCollectionContent.image2}
                          onChange={(e) => setNewCollectionContent({ ...newCollectionContent, image2: e.target.value })}
                          placeholder="Image URL"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Image 3 (center)</Label>
                        <Input
                          value={newCollectionContent.image3}
                          onChange={(e) => setNewCollectionContent({ ...newCollectionContent, image3: e.target.value })}
                          placeholder="Image URL"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Image 4 (mid right)</Label>
                        <Input
                          value={newCollectionContent.image4}
                          onChange={(e) => setNewCollectionContent({ ...newCollectionContent, image4: e.target.value })}
                          placeholder="Image URL"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Image 5 (far right)</Label>
                        <Input
                          value={newCollectionContent.image5}
                          onChange={(e) => setNewCollectionContent({ ...newCollectionContent, image5: e.target.value })}
                          placeholder="Image URL"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Leave empty to use default images</p>
                  </div>
                </div>
                <Button onClick={handleSaveNewCollectionContent} className="mt-6" disabled={updateContentMutation.isPending}>
                  Save New Collection
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 border-primary/20">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" /> 4. Brand Story Quote
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
                    <Settings className="w-5 h-5" /> 5. Newsletter Section
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
