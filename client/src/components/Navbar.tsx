import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Search, Menu, User, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const { data: newInContent } = useQuery({
    queryKey: ['newInNavLabel'],
    queryFn: async () => {
      const res = await fetch('/api/content/new_in');
      if (!res.ok) return { navLabel: 'New In' };
      const data = await res.json();
      return { navLabel: data.content?.navLabel || 'New In' };
    },
  });

  const darkPages = ['/', '/new-in'];
  const isOnDarkPage = darkPages.includes(location);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/new-in", label: newInContent?.navLabel || "New In" },
    { href: "/explore", label: "Explore" },
    { href: "/shop", label: "Shop" },
    { href: "/about", label: "About" },
  ];

  const handleNavClick = (href: string) => {
    setLocation(href);
    setIsSheetOpen(false);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out",
        isScrolled
          ? "bg-background/80 backdrop-blur-md py-4 border-b text-foreground"
          : isOnDarkPage
            ? "bg-transparent py-6 text-white"
            : "bg-transparent py-6 text-foreground"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/">
          <span className="text-2xl font-serif font-bold tracking-widest uppercase cursor-pointer">
            Lumière
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-8 text-sm tracking-widest uppercase font-medium">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span 
                className={cn(
                  "cursor-pointer hover:opacity-70 transition-opacity",
                  location === link.href && "underline underline-offset-4"
                )}
                data-testid={`nav-link-${link.label.toLowerCase().replace(' ', '-')}`}
              >
                {link.label}
              </span>
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-4 md:space-x-6">
          <Link href="/shop">
            <span className="p-2 -m-2 cursor-pointer hover:opacity-70 transition-opacity inline-flex" data-testid="nav-search-icon">
              <Search className="w-5 h-5" />
            </span>
          </Link>
          <Link href="/shop">
            <span className="relative p-2 -m-2 cursor-pointer hover:opacity-70 transition-opacity inline-flex" data-testid="nav-cart-icon">
              <ShoppingBag className="w-5 h-5" />
            </span>
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex items-center space-x-2 hover:opacity-70 transition-opacity"
                  data-testid="nav-user-menu"
                >
                  <User className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="flex flex-col items-start">
                  <span className="font-medium">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem onClick={() => setLocation('/admin')} data-testid="nav-admin-link">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => logout()} data-testid="nav-logout">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <span 
                className="text-sm tracking-widest uppercase font-medium hover:opacity-70 transition-opacity cursor-pointer"
                data-testid="nav-login-link"
              >
                Login
              </span>
            </Link>
          )}

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden" data-testid="nav-mobile-menu">
                <Menu className="w-5 h-5 cursor-pointer" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-[400px]">
              <div className="flex flex-col space-y-4 mt-10 text-xl font-serif">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className={cn(
                      "text-left py-2 hover:text-muted-foreground transition-colors min-h-[44px]",
                      location === link.href && "underline underline-offset-4"
                    )}
                    data-testid={`mobile-nav-${link.label.toLowerCase().replace(' ', '-')}`}
                  >
                    {link.label}
                  </button>
                ))}
                {isAuthenticated ? (
                  <>
                    {isAdmin && (
                      <button 
                        onClick={() => handleNavClick('/admin')} 
                        className="text-left hover:text-muted-foreground"
                        data-testid="mobile-nav-admin"
                      >
                        Admin Dashboard
                      </button>
                    )}
                    <button 
                      onClick={() => { logout(); setIsSheetOpen(false); }} 
                      className="text-left hover:text-muted-foreground"
                      data-testid="mobile-nav-logout"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleNavClick('/login')}
                      className="text-left hover:text-muted-foreground"
                      data-testid="mobile-nav-login"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => handleNavClick('/signup')}
                      className="text-left hover:text-muted-foreground"
                      data-testid="mobile-nav-signup"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
