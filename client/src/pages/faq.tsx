import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowLeft, Plus, Minus } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    title: "Orders & Shopping",
    items: [
      {
        question: "How do I place an order?",
        answer: "Browse our collections and select the pieces you love. Choose your size, add items to your bag, and proceed to checkout. You can complete your purchase as a guest or create an account to save your details for future orders."
      },
      {
        question: "Can I modify or cancel my order?",
        answer: "Orders can be modified or cancelled within 1 hour of placement. After this window, our team begins processing your order for dispatch. Please contact us immediately via WhatsApp if you need to make changes."
      },
      {
        question: "How do I find the right size?",
        answer: "Each product page includes a detailed size guide with measurements. We recommend taking your measurements and comparing them to our guide. If you're between sizes, we suggest sizing up for a more comfortable fit."
      },
      {
        question: "What payment options are available?",
        answer: "We accept Cash on Delivery for your convenience, as well as secure payment via WhatsApp where our team will guide you through the process. Credit card payments are coming soon."
      }
    ]
  },
  {
    title: "Shipping & Delivery",
    items: [
      {
        question: "Where do you deliver?",
        answer: "We deliver across Kuwait and to select countries in the Gulf region. Shipping rates and delivery times vary by location. You can view the available countries and their shipping rates during checkout."
      },
      {
        question: "How long will my order take to arrive?",
        answer: "Within Kuwait, expect delivery in 2-3 business days. For other Gulf countries, delivery typically takes 5-7 business days. You'll receive tracking information once your order ships."
      },
      {
        question: "Is there free shipping?",
        answer: "Yes! We offer free shipping on orders above a certain amount, which varies by country. The free shipping threshold for your location will be displayed at checkout."
      },
      {
        question: "Can I track my order?",
        answer: "Absolutely. Once your order is dispatched, you'll receive an email and WhatsApp message with your tracking details. You can monitor your package's journey until it arrives at your door."
      }
    ]
  },
  {
    title: "Returns & Exchanges",
    items: [
      {
        question: "What is your return policy?",
        answer: "We accept returns within 14 days of delivery. Items must be unworn, unwashed, and in their original condition with all tags attached. Sale items and intimate wear are final sale and cannot be returned."
      },
      {
        question: "How do I initiate a return?",
        answer: "Contact our team via WhatsApp with your order number and reason for return. We'll provide instructions and arrange pickup from your location at a convenient time."
      },
      {
        question: "How long do refunds take?",
        answer: "Once we receive and inspect your return, refunds are processed within 5-7 business days. The amount will be credited to your original payment method, or as store credit if you prefer."
      },
      {
        question: "Can I exchange for a different size?",
        answer: "Yes, we're happy to exchange items for a different size, subject to availability. Contact us to arrange an exchange, and we'll guide you through the process."
      }
    ]
  },
  {
    title: "Account & Support",
    items: [
      {
        question: "Do I need an account to shop?",
        answer: "No, you can checkout as a guest. However, creating an account lets you track orders, save your favorite items, access your order history, and enjoy a faster checkout experience."
      },
      {
        question: "How can I contact customer support?",
        answer: "Our team is available via WhatsApp for quick assistance. We typically respond within a few hours during business hours. You can also reach us through the contact form on our website."
      },
      {
        question: "Are my payment details secure?",
        answer: "Your security is our priority. We use industry-standard encryption to protect your information. For Cash on Delivery orders, no payment details are required until delivery."
      }
    ]
  }
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleFAQ = (categoryIndex: number, itemIndex: number) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isOpen = (categoryIndex: number, itemIndex: number) => {
    return openItems[`${categoryIndex}-${itemIndex}`] || false;
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/">
            <button className="flex items-center gap-2 text-neutral-400 hover:text-white mb-12 transition-colors text-sm tracking-wide" data-testid="back-home">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6 tracking-tight">
              How Can We Help?
            </h1>
            <p className="text-neutral-400 text-lg max-w-xl leading-relaxed">
              Find answers to common questions about shopping with Verda, from orders and shipping to returns and account support.
            </p>
          </motion.div>

          <div className="space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              >
                <h2 className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-6 font-medium">
                  {category.title}
                </h2>
                
                <div className="border-t border-neutral-800">
                  {category.items.map((faq, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="border-b border-neutral-800"
                      data-testid={`faq-item-${categoryIndex}-${itemIndex}`}
                    >
                      <button
                        onClick={() => toggleFAQ(categoryIndex, itemIndex)}
                        className="w-full py-6 flex items-center justify-between text-left group"
                        data-testid={`faq-toggle-${categoryIndex}-${itemIndex}`}
                      >
                        <span className="text-white text-base md:text-lg pr-8 group-hover:text-neutral-300 transition-colors">
                          {faq.question}
                        </span>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center group-hover:border-neutral-500 transition-colors">
                          {isOpen(categoryIndex, itemIndex) ? (
                            <Minus className="w-4 h-4 text-neutral-400" />
                          ) : (
                            <Plus className="w-4 h-4 text-neutral-400" />
                          )}
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {isOpen(categoryIndex, itemIndex) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <p className="pb-6 text-neutral-400 leading-relaxed pr-12">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-20 text-center py-12 px-8 border border-neutral-800 rounded-sm"
          >
            <h2 className="text-2xl md:text-3xl font-serif text-white mb-4">
              Need More Help?
            </h2>
            <p className="text-neutral-400 mb-8 max-w-md mx-auto">
              Our team is ready to assist you with any questions not covered here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://wa.me/96599999999" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-8 py-3.5 bg-white text-neutral-950 hover:bg-neutral-200 transition-colors text-sm tracking-wide font-medium"
                data-testid="whatsapp-button"
              >
                Chat on WhatsApp
              </a>
              <Link href="/about">
                <button className="px-8 py-3.5 border border-neutral-700 text-white hover:bg-neutral-900 transition-colors text-sm tracking-wide font-medium" data-testid="about-button">
                  Learn About Us
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
