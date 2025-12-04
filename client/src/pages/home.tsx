import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedCollection from "@/components/FeaturedCollection";
import BestSellers from "@/components/BestSellers";
import Intersection from "@/components/Intersection";
import BlackDressShowcase from "@/components/BlackDressShowcase";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-black selection:text-white">
      <Navbar />
      
      <main>
        <Hero />
        
        <div className="relative z-10 bg-background">
          <FeaturedCollection />

          <div className="py-20 text-center max-w-2xl mx-auto px-6">
            <p className="text-2xl md:text-3xl font-serif leading-relaxed text-primary">
              Lumière creates timeless pieces for the modern woman. 
              Merging classic silhouettes with contemporary attitude.
            </p>
          </div>
          
          <BlackDressShowcase />

          <BestSellers />
          
          <section className="py-24 px-6 bg-secondary/30">
            <div className="container mx-auto text-center">
              <h2 className="text-4xl font-serif mb-4">Join the World of Lumière</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Subscribe to receive updates, access to exclusive deals, and more.
              </p>
              <div className="flex max-w-md mx-auto border-b border-black pb-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 bg-transparent outline-none placeholder:text-black/40"
                />
                <button className="uppercase text-xs font-bold tracking-widest hover:opacity-60 transition-opacity">
                  Subscribe
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-black text-white py-16 px-6">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h2 className="text-3xl font-serif font-bold mb-6">LUMIÈRE</h2>
            <p className="text-white/60 max-w-sm">
              Defining modern luxury through exceptional craftsmanship and timeless design.
            </p>
          </div>
          <div>
            <h4 className="uppercase tracking-widest text-xs font-bold mb-6 text-white/40">Shop</h4>
            <ul className="space-y-4 text-sm text-white/80">
              <li><a href="#" className="hover:text-white transition-colors">New Arrivals</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Dresses</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Accessories</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sale</a></li>
            </ul>
          </div>
          <div>
            <h4 className="uppercase tracking-widest text-xs font-bold mb-6 text-white/40">Customer Care</h4>
            <ul className="space-y-4 text-sm text-white/80">
              <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Size Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-white/40">
          <p>© 2025 Lumière. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#">Instagram</a>
            <a href="#">Pinterest</a>
            <a href="#">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
