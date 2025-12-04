import type { Express } from "express";
import { createServer, type Server } from "http";
import { connectDB } from "./db";
import { User, IUser } from "./models/User";
import { Product, IProduct } from "./models/Product";
import { SiteContent, ISiteContent } from "./models/SiteContent";
import { requireAuth, requireAdmin, AuthRequest } from "./middleware/auth";
import { Request, Response } from "express";

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
      const [totalUsers, totalProducts, totalCategories, featuredProducts, inStockProducts, outOfStockProducts] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Product.distinct('category').then(cats => cats.length),
        Product.countDocuments({ featured: true }),
        Product.countDocuments({ inStock: true }),
        Product.countDocuments({ inStock: false }),
      ]);

      const recentUsers = await User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(5);

      const recentProducts = await Product.find()
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
        },
        recentUsers,
        recentProducts,
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

  return httpServer;
}
