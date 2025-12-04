import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ShoppingBag, Search, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

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
          <a href="#" className="hover:opacity-70 transition-opacity">Collection</a>
          <a href="#" className="hover:opacity-70 transition-opacity">Accessories</a>
          <a href="#" className="hover:opacity-70 transition-opacity">Editorial</a>
        </div>

        <div className="flex items-center space-x-6">
          <Search className="w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity" />
          <div className="relative cursor-pointer hover:opacity-70 transition-opacity">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Menu className="w-5 h-5 md:hidden cursor-pointer" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-6 mt-10 text-lg font-serif">
                <a href="#" className="hover:text-muted-foreground">New In</a>
                <a href="#" className="hover:text-muted-foreground">Collection</a>
                <a href="#" className="hover:text-muted-foreground">Accessories</a>
                <a href="#" className="hover:text-muted-foreground">Editorial</a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
