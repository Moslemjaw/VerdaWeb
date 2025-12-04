import type { Express } from "express";
import { createServer, type Server } from "http";
import { connectDB } from "./db";
import { User, IUser } from "./models/User";
import { Product, IProduct } from "./models/Product";
import { requireAuth, requireAdmin, AuthRequest } from "./middleware/auth";
import { Request, Response } from "express";

// Extend session type
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
  // Initialize database connection
  connectDB().catch(console.error);

  // ============================================
  // AUTH ROUTES
  // ============================================
  
  // Sign up
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }
      
      // Create new user
      const user = new User({ email, password, name, role: 'user' });
      await user.save();
      
      // Create session
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

  // Login
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
      
      // Create session
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

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
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
  
  // Get all products
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get featured products
  app.get("/api/products/featured", async (req: Request, res: Response) => {
    try {
      const products = await Product.find({ featured: true }).limit(3);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured products" });
    }
  });

  // Get product by ID
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

  // Create product (admin only)
  app.post("/api/products", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const product = new Product(req.body);
      await product.save();
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  // Update product (admin only)
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

  // Delete product (admin only)
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
  // ADMIN ROUTES
  // ============================================
  
  // Get all users (admin only)
  app.get("/api/admin/users", requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Update user role (admin only)
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

  return httpServer;
}
