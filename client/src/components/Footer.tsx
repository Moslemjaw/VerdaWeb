import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/">
              <span className="text-2xl font-serif font-bold tracking-widest uppercase cursor-pointer">
                Lumière
              </span>
            </Link>
            <p className="mt-4 text-sm opacity-80">
              Timeless elegance for the modern woman.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-serif text-lg mb-4">Shop</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link href="/new-in">
                  <span className="hover:opacity-100 cursor-pointer transition-opacity">New Arrivals</span>
                </Link>
              </li>
              <li>
                <Link href="/best">
                  <span className="hover:opacity-100 cursor-pointer transition-opacity">Best Sellers</span>
                </Link>
              </li>
              <li>
                <Link href="/shop">
                  <span className="hover:opacity-100 cursor-pointer transition-opacity">All Products</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-serif text-lg mb-4">Help</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link href="/about">
                  <span className="hover:opacity-100 cursor-pointer transition-opacity">About Us</span>
                </Link>
              </li>
              <li>
                <span className="hover:opacity-100 cursor-pointer transition-opacity">Contact</span>
              </li>
              <li>
                <span className="hover:opacity-100 cursor-pointer transition-opacity">Shipping & Returns</span>
              </li>
              <li>
                <span className="hover:opacity-100 cursor-pointer transition-opacity">FAQ</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-serif text-lg mb-4">Stay Connected</h4>
            <p className="text-sm opacity-80 mb-4">
              Subscribe to receive updates on new arrivals and special offers.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 text-sm bg-transparent border border-primary-foreground/30 focus:border-primary-foreground outline-none placeholder:text-primary-foreground/50"
                data-testid="input-newsletter-email"
              />
              <button 
                className="px-4 py-2 bg-primary-foreground text-primary text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
                data-testid="button-newsletter-subscribe"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm opacity-60">
          <p>&copy; {new Date().getFullYear()} Lumière. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="hover:opacity-100 cursor-pointer transition-opacity">Privacy Policy</span>
            <span className="hover:opacity-100 cursor-pointer transition-opacity">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
