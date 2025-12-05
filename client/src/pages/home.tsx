import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedCollection from "@/components/FeaturedCollection";
import BestSellers from "@/components/BestSellers";
import BlackDressShowcase from "@/components/BlackDressShowcase";
import Footer from "@/components/Footer";
import { useSiteContent } from "@/hooks/useSiteContent";

export default function Home() {
  const { data: siteContent } = useSiteContent();
  
  const brandStory = siteContent?.brand_story;
  const newsletter = siteContent?.newsletter;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-black selection:text-white">
      <Navbar />
      
      <main>
        <Hero />
        
        <div className="relative z-10 bg-background">
          <BestSellers />

          <div className="py-20 text-center max-w-2xl mx-auto px-6">
            <p className="text-2xl md:text-3xl font-serif leading-relaxed text-primary">
              {brandStory?.description || "Lumière creates timeless pieces for the modern woman. Merging classic silhouettes with contemporary attitude."}
            </p>
          </div>
          
          <BlackDressShowcase />

          <FeaturedCollection />
          
          <section className="py-24 px-6 bg-secondary/30">
            <div className="container mx-auto text-center">
              <h2 className="text-4xl font-serif mb-4">
                {newsletter?.title || "Join the World of Lumière"}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {newsletter?.subtitle || "Subscribe to receive updates, access to exclusive deals, and more."}
              </p>
              <div className="flex max-w-md mx-auto border-b border-black pb-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 bg-transparent outline-none placeholder:text-black/40"
                  data-testid="input-home-newsletter"
                />
                <button 
                  className="uppercase text-xs font-bold tracking-widest hover:opacity-60 transition-opacity"
                  data-testid="button-home-subscribe"
                >
                  {newsletter?.buttonText || "Subscribe"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
