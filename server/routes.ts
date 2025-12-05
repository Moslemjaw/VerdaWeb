import type { Express } from "express";
import { createServer, type Server } from "http";
import { connectDB } from "./db";
import { User, IUser } from "./models/User";
import { Product, IProduct } from "./models/Product";
import { SiteContent, ISiteContent } from "./models/SiteContent";
import { Order, IOrder } from "./models/Order";
import { Discount, IDiscount } from "./models/Discount";
import { ShippingSettings, getShippingSettings } from "./models/ShippingSettings";
import { ShippingCountry, initializeDefaultCountries } from "./models/ShippingCountry";
import { requireAuth, requireAdmin, AuthRequest } from "./middleware/auth";
import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

declare module 'express-session' {
  interface SessionData {
    userId: string;
    userEmail: string;
    userRole: string;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  connectDB().catch(console.error);

  // Serve uploaded files
  const express = await import('express');
  app.use('/uploads', express.default.static(uploadDir));

  // ============================================
  // IMAGE UPLOAD ROUTE
  // ============================================
  
  app.post("/api/upload", requireAdmin, upload.single('image'), (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ url: imageUrl, filename: req.file.filename });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  });

  // ============================================
  // CURRENCY ROUTES
  // ============================================

  // Cache for exchange rates
  let cachedRates: { rates: Record<string, number>; lastUpdated: number } | null = null;
  const RATES_CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

  const DEFAULT_RATES: Record<string, number> = {
    KWD: 1,
    SAR: 12.19,
    AED: 11.95,
    QAR: 11.85,
    BHD: 1.23,
    OMR: 1.25,
    USD: 3.26,
    EUR: 3.09,
    GBP: 2.59,
  };

  const COUNTRY_TO_CURRENCY: Record<string, string> = {
    KW: 'KWD', SA: 'SAR', AE: 'AED', QA: 'QAR', BH: 'BHD', OM: 'OMR',
    US: 'USD', GB: 'GBP', DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR',
    NL: 'EUR', BE: 'EUR', AT: 'EUR', IE: 'EUR', PT: 'EUR', GR: 'EUR',
  };

  app.get("/api/currency/rates", async (req: Request, res: Response) => {
    try {
      // Check cache
      if (cachedRates && Date.now() - cachedRates.lastUpdated < RATES_CACHE_DURATION) {
        return res.json({ rates: cachedRates.rates });
      }

      // Try to fetch live rates (using a free API)
      try {
        const response = await fetch('https://api.exchangerate.host/latest?base=KWD&symbols=SAR,AED,QAR,BHD,OMR,USD,EUR,GBP');
        if (response.ok) {
          const data = await response.json();
          if (data.rates) {
            const rates: Record<string, number> = { KWD: 1 };
            for (const [code, rate] of Object.entries(data.rates)) {
              rates[code] = Number(rate);
            }
            cachedRates = { rates, lastUpdated: Date.now() };
            return res.json({ rates });
          }
        }
      } catch (fetchError) {
        console.log('Failed to fetch live rates, using defaults');
      }

      // Fallback to default rates
      cachedRates = { rates: DEFAULT_RATES, lastUpdated: Date.now() };
      res.json({ rates: DEFAULT_RATES });
    } catch (error) {
      console.error('Currency rates error:', error);
      res.json({ rates: DEFAULT_RATES });
    }
  });

  app.get("/api/currency/detect", async (req: Request, res: Response) => {
    try {
      // Get IP from headers (works behind proxies like Replit)
      const ip = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() 
        || req.headers['x-real-ip']?.toString() 
        || req.socket.remoteAddress 
        || '';

      // Try to detect country from IP using free API
      try {
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`);
        if (response.ok) {
          const data = await response.json();
          if (data.countryCode) {
            const currency = COUNTRY_TO_CURRENCY[data.countryCode] || 'KWD';
            return res.json({ 
              country: data.countryCode, 
              currency,
              detected: true 
            });
          }
        }
      } catch (geoError) {
        console.log('Geolocation lookup failed');
      }

      // Default to Kuwait
      res.json({ country: 'KW', currency: 'KWD', detected: false });
    } catch (error) {
      console.error('Currency detection error:', error);
      res.json({ country: 'KW', currency: 'KWD', detected: false });
    }
  });

  // ============================================
  // AUTH ROUTES
  // ============================================
  
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }
      
      const user = new User({ email, password, name, role: 'user' });
      await user.save();
      
      req.session.userId = user._id.toString();
      req.session.userEmail = user.email;
      req.session.userRole = user.role;
      
      res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      req.session.userId = user._id.toString();
      req.session.userEmail = user.email;
      req.session.userRole = user.role;
      
      res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = await User.findById(req.session.userId).select('-password');
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // ============================================
  // PRODUCT ROUTES
  // ============================================
  
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (req: Request, res: Response) => {
    try {
      const products = await Product.find({ featured: true }).limit(3);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/categories", async (req: Request, res: Response) => {
    try {
      const categories = await Product.distinct('category');
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/products/brands", async (req: Request, res: Response) => {
    try {
      const brands = await Product.distinct('brand');
      res.json(brands);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch brands" });
    }
  });

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const product = new Product(req.body);
      await product.save();
      res.status(201).json(product);
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // ============================================
  // SITE CONTENT ROUTES (CMS)
  // ============================================

  app.get("/api/content", async (req: Request, res: Response) => {
    try {
      const content = await SiteContent.find({ isActive: true });
      const contentMap: Record<string, any> = {};
      content.forEach(item => {
        contentMap[item.section] = item.content;
      });
      res.json(contentMap);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  app.get("/api/content/:section", async (req: Request, res: Response) => {
    try {
      const content = await SiteContent.findOne({ section: req.params.section });
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  app.put("/api/content/:section", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { section } = req.params;
      const { content, isActive } = req.body;

      const siteContent = await SiteContent.findOneAndUpdate(
        { section },
        { content, isActive: isActive !== undefined ? isActive : true },
        { new: true, upsert: true, runValidators: true }
      );
      
      res.json(siteContent);
    } catch (error) {
      console.error('Update content error:', error);
      res.status(500).json({ error: "Failed to update content" });
    }
  });

  // ============================================
  // ADMIN ROUTES
  // ============================================
  
  app.get("/api/admin/stats", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const [
        totalUsers, 
        totalProducts, 
        totalCategories, 
        featuredProducts, 
        inStockProducts, 
        outOfStockProducts,
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
      ] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Product.distinct('category').then(cats => cats.length),
        Product.countDocuments({ featured: true }),
        Product.countDocuments({ inStock: true }),
        Product.countDocuments({ inStock: false }),
        Order.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Order.countDocuments({ status: 'processing' }),
        Order.countDocuments({ status: 'shipped' }),
        Order.countDocuments({ status: 'delivered' }),
        Order.countDocuments({ status: 'cancelled' }),
      ]);

      const revenueResult = await Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);
      const totalRevenue = revenueResult[0]?.total || 0;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayRevenueResult = await Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);
      const todayRevenue = todayRevenueResult[0]?.total || 0;

      const recentUsers = await User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(5);

      const recentProducts = await Product.find()
        .sort({ createdAt: -1 })
        .limit(5);

      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5);

      res.json({
        stats: {
          totalUsers,
          totalProducts,
          totalCategories,
          featuredProducts,
          inStockProducts,
          outOfStockProducts,
          totalOrders,
          pendingOrders,
          processingOrders,
          shippedOrders,
          deliveredOrders,
          cancelledOrders,
          totalRevenue,
          todayRevenue,
        },
        recentUsers,
        recentProducts,
        recentOrders,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id/role", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { role } = req.body;
      
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }
      
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      ).select('-password');
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user role" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.get("/api/admin/content", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const content = await SiteContent.find().sort({ section: 1 });
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  // ============================================
  // ORDER ROUTES
  // ============================================

  app.get("/api/admin/orders", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { status, paymentStatus, page = '1', limit = '20' } = req.query;
      
      const filter: any = {};
      if (status && status !== 'all') filter.status = status;
      if (paymentStatus && paymentStatus !== 'all') filter.paymentStatus = paymentStatus;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 20;
      const skip = (pageNum - 1) * limitNum;

      const [orders, total] = await Promise.all([
        Order.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Order.countDocuments(filter),
      ]);

      res.json({
        orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/admin/orders/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.patch("/api/admin/orders/:id/status", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { status } = req.body;
      
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  app.patch("/api/admin/orders/:id/payment", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { paymentStatus } = req.body;
      
      const validStatuses = ['unpaid', 'paid', 'refunded'];
      if (!validStatuses.includes(paymentStatus)) {
        return res.status(400).json({ error: "Invalid payment status" });
      }
      
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { paymentStatus },
        { new: true }
      );
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update payment status" });
    }
  });

  app.delete("/api/admin/orders/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const order = await Order.findByIdAndDelete(req.params.id);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json({ message: "Order deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete order" });
    }
  });

  // Create order (for testing/demo purposes)
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const orderData = req.body;
      const order = new Order(orderData);
      await order.save();
      res.status(201).json(order);
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // ============================================
  // DISCOUNT CODE ROUTES
  // ============================================

  app.get("/api/admin/discounts", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const discounts = await Discount.find().sort({ createdAt: -1 });
      res.json(discounts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch discounts" });
    }
  });

  app.post("/api/admin/discounts", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { code, type, value, minOrderAmount, maxUses, expiresAt } = req.body;
      
      const existingDiscount = await Discount.findOne({ code: code.toUpperCase() });
      if (existingDiscount) {
        return res.status(400).json({ error: "Discount code already exists" });
      }
      
      const discount = new Discount({
        code: code.toUpperCase(),
        type,
        value,
        minOrderAmount: minOrderAmount || 0,
        maxUses: maxUses || 0,
        expiresAt: expiresAt || null,
      });
      
      await discount.save();
      res.status(201).json(discount);
    } catch (error) {
      console.error('Create discount error:', error);
      res.status(500).json({ error: "Failed to create discount" });
    }
  });

  app.patch("/api/admin/discounts/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { isActive } = req.body;
      
      const discount = await Discount.findByIdAndUpdate(
        req.params.id,
        { isActive },
        { new: true }
      );
      
      if (!discount) {
        return res.status(404).json({ error: "Discount not found" });
      }
      
      res.json(discount);
    } catch (error) {
      res.status(500).json({ error: "Failed to update discount" });
    }
  });

  app.delete("/api/admin/discounts/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const discount = await Discount.findByIdAndDelete(req.params.id);
      
      if (!discount) {
        return res.status(404).json({ error: "Discount not found" });
      }
      
      res.json({ message: "Discount deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete discount" });
    }
  });

  app.post("/api/discounts/validate", async (req: Request, res: Response) => {
    try {
      const { code, orderTotal } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: "Discount code is required" });
      }
      
      const discount = await Discount.findOne({ code: code.toUpperCase(), isActive: true });
      
      if (!discount) {
        return res.status(404).json({ error: "Invalid discount code" });
      }
      
      if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
        return res.status(400).json({ error: "This discount code has expired" });
      }
      
      if (discount.maxUses > 0 && discount.usedCount >= discount.maxUses) {
        return res.status(400).json({ error: "This discount code has reached its usage limit" });
      }
      
      if (discount.minOrderAmount > 0 && orderTotal < discount.minOrderAmount) {
        return res.status(400).json({ error: `Minimum order amount is ${discount.minOrderAmount} KWD` });
      }
      
      let discountAmount = 0;
      if (discount.type === 'percentage') {
        discountAmount = (orderTotal * discount.value) / 100;
      } else {
        discountAmount = Math.min(discount.value, orderTotal);
      }
      
      res.json({
        valid: true,
        discount: {
          code: discount.code,
          type: discount.type,
          value: discount.value,
          discountAmount: Math.round(discountAmount * 100) / 100,
        },
      });
    } catch (error) {
      console.error('Validate discount error:', error);
      res.status(500).json({ error: "Failed to validate discount" });
    }
  });

  app.post("/api/discounts/use", async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      
      const discount = await Discount.findOneAndUpdate(
        { code: code.toUpperCase(), isActive: true },
        { $inc: { usedCount: 1 } },
        { new: true }
      );
      
      if (!discount) {
        return res.status(404).json({ error: "Discount not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to use discount" });
    }
  });

  // ============================================
  // SHIPPING SETTINGS ROUTES
  // ============================================

  app.get("/api/shipping", async (req: Request, res: Response) => {
    try {
      const settings = await getShippingSettings();
      res.json({
        baseRate: settings.baseRate,
        freeThreshold: settings.freeThreshold,
        enableFreeThreshold: settings.enableFreeThreshold,
      });
    } catch (error) {
      console.error('Get shipping settings error:', error);
      res.status(500).json({ error: "Failed to get shipping settings" });
    }
  });

  app.get("/api/admin/shipping", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const settings = await getShippingSettings();
      res.json(settings);
    } catch (error) {
      console.error('Get admin shipping settings error:', error);
      res.status(500).json({ error: "Failed to get shipping settings" });
    }
  });

  app.put("/api/admin/shipping", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { baseRate, freeThreshold, enableFreeThreshold } = req.body;

      if (typeof baseRate !== 'number' || baseRate < 0) {
        return res.status(400).json({ error: "Base rate must be a non-negative number" });
      }

      if (enableFreeThreshold && (typeof freeThreshold !== 'number' || freeThreshold < 0)) {
        return res.status(400).json({ error: "Free threshold must be a non-negative number" });
      }

      let settings = await ShippingSettings.findOne();
      if (!settings) {
        settings = new ShippingSettings({
          baseRate,
          freeThreshold: freeThreshold || 50,
          enableFreeThreshold: enableFreeThreshold ?? true,
        });
      } else {
        settings.baseRate = baseRate;
        settings.freeThreshold = freeThreshold || settings.freeThreshold;
        settings.enableFreeThreshold = enableFreeThreshold ?? settings.enableFreeThreshold;
      }

      await settings.save();
      res.json(settings);
    } catch (error) {
      console.error('Update shipping settings error:', error);
      res.status(500).json({ error: "Failed to update shipping settings" });
    }
  });

  // ============================================
  // SHIPPING COUNTRIES ROUTES
  // ============================================

  app.get("/api/shipping/countries", async (req: Request, res: Response) => {
    try {
      await initializeDefaultCountries();
      const countries = await ShippingCountry.find({ isActive: true }).sort({ isDefault: -1, name: 1 });
      res.json(countries);
    } catch (error) {
      console.error('Get shipping countries error:', error);
      res.status(500).json({ error: "Failed to get shipping countries" });
    }
  });

  app.get("/api/admin/shipping/countries", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      await initializeDefaultCountries();
      const countries = await ShippingCountry.find().sort({ isDefault: -1, name: 1 });
      res.json(countries);
    } catch (error) {
      console.error('Get admin shipping countries error:', error);
      res.status(500).json({ error: "Failed to get shipping countries" });
    }
  });

  app.post("/api/admin/shipping/countries", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { name, code, shippingRate, freeThreshold, enableFreeThreshold, isDefault } = req.body;

      if (!name || !code) {
        return res.status(400).json({ error: "Country name and code are required" });
      }

      if (typeof shippingRate !== 'number' || shippingRate < 0) {
        return res.status(400).json({ error: "Shipping rate must be a non-negative number" });
      }

      const existingCountry = await ShippingCountry.findOne({ code: code.toUpperCase() });
      if (existingCountry) {
        return res.status(400).json({ error: "Country with this code already exists" });
      }

      if (isDefault) {
        await ShippingCountry.updateMany({}, { isDefault: false });
      }

      const country = new ShippingCountry({
        name,
        code: code.toUpperCase(),
        shippingRate,
        freeThreshold: freeThreshold || 50,
        enableFreeThreshold: enableFreeThreshold ?? true,
        isActive: true,
        isDefault: isDefault || false,
      });

      await country.save();
      res.status(201).json(country);
    } catch (error) {
      console.error('Create shipping country error:', error);
      res.status(500).json({ error: "Failed to create shipping country" });
    }
  });

  app.put("/api/admin/shipping/countries/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { name, code, shippingRate, freeThreshold, enableFreeThreshold, isActive, isDefault } = req.body;

      const country = await ShippingCountry.findById(id);
      if (!country) {
        return res.status(404).json({ error: "Country not found" });
      }

      if (code && code.toUpperCase() !== country.code) {
        const existingCountry = await ShippingCountry.findOne({ code: code.toUpperCase(), _id: { $ne: id } });
        if (existingCountry) {
          return res.status(400).json({ error: "Country with this code already exists" });
        }
      }

      if (isDefault && !country.isDefault) {
        await ShippingCountry.updateMany({ _id: { $ne: id } }, { isDefault: false });
      }

      if (name !== undefined) country.name = name;
      if (code !== undefined) country.code = code.toUpperCase();
      if (shippingRate !== undefined) country.shippingRate = shippingRate;
      if (freeThreshold !== undefined) country.freeThreshold = freeThreshold;
      if (enableFreeThreshold !== undefined) country.enableFreeThreshold = enableFreeThreshold;
      if (isActive !== undefined) country.isActive = isActive;
      if (isDefault !== undefined) country.isDefault = isDefault;

      await country.save();
      res.json(country);
    } catch (error) {
      console.error('Update shipping country error:', error);
      res.status(500).json({ error: "Failed to update shipping country" });
    }
  });

  app.delete("/api/admin/shipping/countries/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      const country = await ShippingCountry.findById(id);
      if (!country) {
        return res.status(404).json({ error: "Country not found" });
      }

      if (country.isDefault) {
        return res.status(400).json({ error: "Cannot delete the default country" });
      }

      await ShippingCountry.findByIdAndDelete(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete shipping country error:', error);
      res.status(500).json({ error: "Failed to delete shipping country" });
    }
  });

  return httpServer;
}
