import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import AdminDashboard from "@/pages/admin";
import Shop from "@/pages/shop";
import NewIn from "@/pages/new-in";
import Explore from "@/pages/explore";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import ProductDetails from "@/pages/product";
import About from "@/pages/about";
import FAQ from "@/pages/faq";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/shop" component={Shop} />
      <Route path="/new-in" component={NewIn} />
      <Route path="/explore" component={Explore} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/product/:id" component={ProductDetails} />
      <Route path="/about" component={About} />
      <Route path="/faq" component={FAQ} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </CurrencyProvider>
    </QueryClientProvider>
  );
}

export default App;
