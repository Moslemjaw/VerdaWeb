import { Link } from "wouter";
import { Instagram, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-white py-16 px-4 sm:px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/">
              <span className="text-2xl font-serif font-bold tracking-widest uppercase cursor-pointer">
                Lumière
              </span>
            </Link>
            <p className="mt-4 text-sm text-neutral-400 leading-relaxed">
              Timeless elegance for the modern woman.
            </p>
            <div className="flex gap-4 mt-6">
              <a 
                href="https://www.instagram.com/verda_kw?igsh=MXN2ajBkdHZ0c3RwZw==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-neutral-700 flex items-center justify-center hover:bg-white hover:text-neutral-950 transition-all"
                data-testid="link-instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://wa.me/96599999999" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-neutral-700 flex items-center justify-center hover:bg-white hover:text-neutral-950 transition-all"
                data-testid="link-whatsapp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-5 font-medium">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/new-in">
                  <span className="text-neutral-400 hover:text-white cursor-pointer transition-colors">New In</span>
                </Link>
              </li>
              <li>
                <Link href="/explore">
                  <span className="text-neutral-400 hover:text-white cursor-pointer transition-colors">Explore</span>
                </Link>
              </li>
              <li>
                <Link href="/shop">
                  <span className="text-neutral-400 hover:text-white cursor-pointer transition-colors">All Products</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-5 font-medium">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about">
                  <span className="text-neutral-400 hover:text-white cursor-pointer transition-colors">About Us</span>
                </Link>
              </li>
              <li>
                <a 
                  href="https://wa.me/96599999999" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white cursor-pointer transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-5 font-medium">Support</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/faq">
                  <span className="text-neutral-400 hover:text-white cursor-pointer transition-colors">FAQ</span>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <span className="text-neutral-400 hover:text-white cursor-pointer transition-colors">Shipping & Returns</span>
                </Link>
              </li>
              <li>
                <Link href="/cart">
                  <span className="text-neutral-400 hover:text-white cursor-pointer transition-colors">Cart</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-neutral-500 gap-4">
          <p>&copy; {new Date().getFullYear()} Lumière. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            </Link>
            <Link href="/terms">
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
