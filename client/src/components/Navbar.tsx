import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Search, Menu, User, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out",
        isScrolled
          ? "bg-background/80 backdrop-blur-md py-4 border-b"
          : "bg-transparent py-6 text-white"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/">
          <a className="text-2xl font-serif font-bold tracking-widest uppercase cursor-pointer">
            Lumière
          </a>
        </Link>

        <div className="hidden md:flex items-center space-x-8 text-sm tracking-widest uppercase font-medium">
          <a href="#" className="hover:opacity-70 transition-opacity">New In</a>
          <a href="#" className="hover:opacity-70 transition-opacity">Best</a>
          <a href="#" className="hover:opacity-70 transition-opacity">Shop</a>
          <a href="#" className="hover:opacity-70 transition-opacity">About</a>
        </div>

        <div className="flex items-center space-x-6">
          <Search className="w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity" />
          <div className="relative cursor-pointer hover:opacity-70 transition-opacity">
            <ShoppingBag className="w-5 h-5" />
          </div>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 hover:opacity-70 transition-opacity">
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
                  <DropdownMenuItem onClick={() => setLocation('/admin')}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <a className="text-sm tracking-widest uppercase font-medium hover:opacity-70 transition-opacity">
                Login
              </a>
            </Link>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Menu className="w-5 h-5 md:hidden cursor-pointer" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-6 mt-10 text-lg font-serif">
                <a href="#" className="hover:text-muted-foreground">New In</a>
                <a href="#" className="hover:text-muted-foreground">Best</a>
                <a href="#" className="hover:text-muted-foreground">Shop</a>
                <a href="#" className="hover:text-muted-foreground">About</a>
                {isAuthenticated ? (
                  <>
                    {isAdmin && (
                      <button onClick={() => setLocation('/admin')} className="text-left hover:text-muted-foreground">
                        Admin Dashboard
                      </button>
                    )}
                    <button onClick={() => logout()} className="text-left hover:text-muted-foreground">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <a className="hover:text-muted-foreground">Login</a>
                    </Link>
                    <Link href="/signup">
                      <a className="hover:text-muted-foreground">Sign Up</a>
                    </Link>
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
