# Lumière - Modern Women's Fashion E-commerce Platform

## Overview

Lumière is a luxury women's fashion e-commerce web application that provides an elegant shopping experience with high-end visual design. The platform features product browsing, user authentication, and an admin dashboard for managing products and users. Built with a modern full-stack architecture, it emphasizes smooth animations, minimalist aesthetics, and responsive design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing
- Component architecture follows a modular, reusable pattern

**UI & Styling**
- Tailwind CSS v4 with custom design tokens for consistent theming
- shadcn/ui component library (New York style variant) for pre-built, accessible components
- Radix UI primitives for headless, accessible component foundations
- Custom CSS variables for theme configuration (light/dark mode support)
- Framer Motion for animations and transitions throughout the UI
- Custom fonts: Inter for UI elements, Playfair Display for elegant typography

**State Management**
- TanStack Query (React Query) for server state management, caching, and data fetching
- React Hook Form with Zod resolvers for form validation
- Session-based authentication state synchronized with backend

**Key Design Patterns**
- Container/Presentational component separation
- Custom hooks for reusable logic (useAuth, useIsMobile, useToast)
- Component composition using Radix Slot pattern
- Path aliases for clean imports (@/, @shared/, @assets/)

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for the REST API server
- HTTP server created with Node's native `http` module for WebSocket support potential
- Session-based authentication using express-session
- Middleware pattern for request logging, authentication, and authorization

**Database Layer**
- MongoDB with Mongoose ODM for document-based data storage
- Schema definitions for User and Product models
- Connection pooling with cached connections to optimize performance
- Bcrypt for password hashing with pre-save hooks

**Authentication & Authorization**
- Session-based authentication (cookies with express-session)
- Role-based access control (user vs admin roles)
- Custom middleware for route protection (requireAuth, requireAdmin)
- Password hashing using bcryptjs

**API Design**
- RESTful API endpoints under `/api` namespace
- Structured error handling with appropriate HTTP status codes
- JSON request/response format
- Separate route handlers for auth, products, and admin operations

**Build & Deployment**
- ESBuild for server-side bundling with selective dependency bundling
- Vite for client-side bundling and static asset generation
- Production build outputs to `dist/` directory
- Environment-based configuration (development vs production)

### Code Organization

**Directory Structure**
- `/client` - Frontend React application
  - `/src/components` - Reusable UI components and shadcn/ui components
  - `/src/pages` - Route-level page components
  - `/src/hooks` - Custom React hooks
  - `/src/lib` - Utility functions and client configuration
- `/server` - Backend Express application
  - `/models` - Mongoose schema definitions
  - `/middleware` - Express middleware functions
  - Route handlers and database connection
- `/shared` - Code shared between client and server
  - Originally configured for Drizzle/PostgreSQL schemas (currently using MongoDB)
- `/attached_assets` - Static assets and generated images

**Configuration Files**
- TypeScript configuration with path aliases and ESNext module resolution
- Separate Vite configuration for client development and build
- Drizzle configuration present but not actively used (MongoDB in use instead)

### Development Workflow

**Development Mode**
- Vite dev server runs on port 5000 for the client with HMR
- Express server runs with tsx for TypeScript execution
- Separate `dev` and `dev:client` npm scripts
- Runtime error overlay plugin for better DX on Replit

**Build Process**
- Custom build script coordinates Vite and ESBuild
- Client assets compiled to `dist/public`
- Server bundled to `dist/index.cjs`
- Selective dependency bundling to reduce cold start times

## External Dependencies

### Core Framework Dependencies
- **React & React DOM** (v18+) - Frontend framework
- **Express** - Backend web server framework
- **Mongoose** - MongoDB object modeling
- **TypeScript** - Type safety across the stack

### UI & Styling Libraries
- **Tailwind CSS** - Utility-first CSS framework
- **@radix-ui/* packages** - Headless UI component primitives (accordion, dialog, dropdown, etc.)
- **Framer Motion** - Animation library
- **lucide-react** - Icon library
- **embla-carousel-react** - Carousel/slider component

### State & Data Management
- **@tanstack/react-query** - Server state management and caching
- **react-hook-form** - Form state management
- **@hookform/resolvers** - Form validation resolvers
- **zod** - Schema validation library
- **drizzle-zod** - Drizzle to Zod schema conversion (not actively used)

### Authentication & Security
- **bcryptjs** - Password hashing
- **express-session** - Session management
- **connect-pg-simple** - PostgreSQL session store (configured but using MongoDB)

### Build Tools & Development
- **Vite** - Frontend build tool and dev server
- **ESBuild** - Server-side bundling
- **tsx** - TypeScript execution for Node.js
- **PostCSS & Autoprefixer** - CSS processing

### Routing & Navigation
- **wouter** - Lightweight client-side routing

### Database
- **MongoDB** - NoSQL database (via MONGODB_URI environment variable)
- **Drizzle ORM** - Configured for PostgreSQL but not actively used

### Replit-Specific Plugins
- **@replit/vite-plugin-runtime-error-modal** - Error overlay
- **@replit/vite-plugin-cartographer** - Development tooling
- **@replit/vite-plugin-dev-banner** - Development banner

### Utilities
- **class-variance-authority** - CSS class variance utility
- **clsx & tailwind-merge** - Class name utilities
- **date-fns** - Date manipulation
- **nanoid** - Unique ID generation

## Environment Variables

The application requires the following environment variables to run. All sensitive values should be stored as secrets.

### Required Environment Variables

| Variable | Type | Description |
|----------|------|-------------|
| `MONGODB_URI` | Secret | MongoDB connection string for database access |
| `SESSION_SECRET` | Secret | Secret key for signing session cookies (must be a secure random string) |

### Optional Environment Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NODE_ENV` | Env | `development` | Set to `production` for production builds |
| `PORT` | Env | `5000` | Port for the server to listen on |
| `MYFATOORAH_API_KEY` | Secret | - | MyFatoorah payment gateway API key (for credit card payments) |
| `MYFATOORAH_SECRET_KEY` | Secret | - | MyFatoorah payment gateway secret key |

### Replit-Managed Variables

These are automatically set by Replit and should not be modified:
- `REPLIT_DOMAINS` - Available domains for the deployment
- `REPLIT_DEV_DOMAIN` - Development domain
- `REPL_ID` - Unique Repl identifier
- `DATABASE_URL`, `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - PostgreSQL credentials (available but not used, app uses MongoDB)

## MERN Stack Architecture

This application is built on the MERN stack:
- **M**ongoDB - Document database for storing users, products, and content
- **E**xpress.js - Backend web framework for REST API
- **R**eact - Frontend library for building the user interface
- **N**ode.js - JavaScript runtime for the server

## Checkout & Payment System

### Payment Methods
The checkout system supports three payment methods:

1. **Cash on Delivery (COD)**
   - Customer pays when the order arrives
   - Order created with `paymentStatus: 'unpaid'`
   - Fully functional

2. **WhatsApp Payment**
   - Opens WhatsApp with pre-formatted order message
   - Includes order details, customer info, and total
   - Store owner sends payment link via WhatsApp
   - Fully functional

3. **Credit Card (MyFatoorah)**
   - Infrastructure ready for MyFatoorah integration
   - Requires `MYFATOORAH_API_KEY` and `MYFATOORAH_SECRET_KEY` secrets
   - Shows "Coming Soon" badge until keys are configured

### Cart System
- Global cart context (`CartContext.tsx`) manages cart state across the app
- Cart items persisted to localStorage for session continuity
- Integration with Explore page's swipe-to-add functionality

### Order Model
- Order numbers auto-generated with format: `LUM-TIMESTAMP-RANDOM`
- Tracks customer info, shipping address, items, and payment status
- Status progression: pending → processing → shipped → delivered

### Multi-Currency System
- **Base Currency**: Kuwaiti Dinar (KWD) - all prices stored in database in KWD
- **Supported Currencies**: KWD, USD, EUR, GBP, SAR, AED, BHD, OMR, QAR
- **Auto-Detection**: Currency detected via IP-based geolocation on first visit
- **Manual Override**: Users can select preferred currency from navbar dropdown
- **Exchange Rates**: Fetched from server with 1-hour caching
- **User Preference**: Selected currency stored in localStorage for persistence

#### CurrencyContext
- Global context provider wraps entire application (`CurrencyContext.tsx`)
- `useCurrency()` hook provides:
  - `currency`: Current currency object with code, symbol, name
  - `setCurrency(code)`: Function to change currency
  - `formatPrice(priceInKWD)`: Converts KWD amount to selected currency and formats
  - `availableCurrencies`: List of all supported currencies

#### Technical Details
- Exchange rates fetched via `/api/currency/rates` with sensible fallback defaults
- Geolocation via `/api/currency/detect` returns country and suggested currency
- All price displays use `formatPrice()` helper for consistent currency conversion
- Admin dashboard uses KWD for all inputs/labels (base currency for management)
- Free shipping threshold: 50 KWD (approximately $163 USD)