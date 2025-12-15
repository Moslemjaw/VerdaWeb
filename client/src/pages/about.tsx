import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";
const verdaAtelier = "/verdaLogo.png";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-16 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
              Our Story
            </h3>
            <h1 className="text-5xl md:text-6xl font-serif mb-8">
              About Verda
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Founded on the belief that every woman deserves to feel
              extraordinary, Verda brings timeless elegance to the modern
              wardrobe.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspect-[4/5] bg-secondary rounded-lg overflow-hidden">
                <img
                  src={verdaAtelier}
                  alt="Verda atelier"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-serif">The Beginning</h2>
              <p className="text-muted-foreground leading-relaxed">
                Verda was born in 2010 in Kuwait, inspired by a Turkish vision
                of timeless elegance, craftsmanship, and modern femininity.
                Founded with the belief that fashion should reflect both
                strength and grace, Verda blends the rich heritage of Turkish
                design with the dynamic spirit of women in the Middle East.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Drawing from refined tailoring traditions and contemporary
                aesthetics, each piece is thoughtfully created to balance luxury
                with everyday wearability. We focus on premium fabrics, precise
                details, and silhouettes that empower women to feel confident
                and effortlessly elegant. At Verda, true luxury is not just
                seen—it is felt.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-secondary/30">
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-serif text-center mb-16"
          >
            Our Values
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-full border-2 border-primary flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">💎</span>
              </div>
              <h3 className="font-serif text-xl mb-4">Luxury</h3>
              <p className="text-muted-foreground">
                True luxury should feel effortless and attainable. We bridge
                refined design with everyday wearability, offering elevated
                fashion that fits seamlessly into modern life.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-full border-2 border-primary flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="font-serif text-xl mb-4">Craftsmanship</h3>
              <p className="text-muted-foreground">
                Every stitch tells a story. Our pieces are crafted by skilled
                artisans who take pride in creating garments that last.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-full border-2 border-primary flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">💫</span>
              </div>
              <h3 className="font-serif text-xl mb-4">Empowerment</h3>
              <p className="text-muted-foreground">
                We design for the woman who knows her worth. Our fashion is a
                celebration of confidence, individuality, and self-expression.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-serif mb-6">Join Our Journey</h2>
            <p className="text-muted-foreground mb-8">
              We're more than a brand – we're a community of women who believe
              in the power of looking and feeling their best. Join us as we
              continue to redefine luxury fashion for the modern woman.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop">
                <span className="inline-block bg-primary text-primary-foreground px-8 py-4 text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors cursor-pointer">
                  Shop Now
                </span>
              </Link>
              <a
                href="mailto:hello@verda.com"
                className="inline-block border border-primary px-8 py-4 text-sm uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
