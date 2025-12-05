import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How do I make a purchase at the Lumière online store?",
    answer: `To make a purchase at the Lumière online store, follow these steps:
1. Browse our collection and click on a product to view details.
2. Select your preferred size and color options.
3. Click "Add to Cart" to add the item to your shopping bag.
4. Click the cart icon to review your items.
5. Proceed to checkout and enter your shipping details.
6. Choose your preferred payment method and complete your order.`
  },
  {
    question: "How do I find my size?",
    answer: "You can find a complete size guide on each product page. Click on the 'Size Guide' link to view detailed measurements for each size option. We recommend measuring yourself and comparing with our size chart for the best fit."
  },
  {
    question: "What currencies do you accept?",
    answer: "Our primary currency is Kuwaiti Dinar (KWD). All prices on our website are displayed in KWD. We accept payments in KWD for orders shipped within Kuwait and the GCC region."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We currently accept the following payment methods:\n• Credit/Debit Cards (Visa, MasterCard)\n• Cash on Delivery (COD)\n• WhatsApp Payment\n• KNET (for Kuwait customers)\n\nAdditional payment methods may be introduced in the future."
  },
  {
    question: "What is the refund process?",
    answer: "The refund process typically takes 7 to 14 business days after we receive your returned item. Refunds will be credited to the original payment method used for the purchase. For Cash on Delivery orders, refunds will be processed via bank transfer."
  },
  {
    question: "Where do you ship to?",
    answer: "We currently ship to Kuwait and select countries in the GCC region including Saudi Arabia, UAE, Bahrain, Qatar, and Oman. International shipping to other countries may be available - please contact us for more information."
  },
  {
    question: "How long does delivery take?",
    answer: "Delivery times vary by location:\n• Kuwait: 1-3 business days\n• GCC Countries: 3-7 business days\n• International: 7-14 business days\n\nPlease note that delivery times may be affected by customs clearance and local holidays."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order is dispatched, you will receive an email with your tracking number. You can use this number to track your package on the courier's website. You can also check your order status by logging into your account and viewing 'My Orders'."
  },
  {
    question: "Can I change my delivery address after placing an order?",
    answer: "You can change your delivery address as long as your order has not been dispatched. Once the package leaves our warehouse, we cannot modify the delivery address. Please contact us immediately if you need to make changes to your shipping details."
  },
  {
    question: "Will I have to pay customs charges?",
    answer: "Customs policies vary by country. For orders within Kuwait and most GCC countries, no customs charges apply. For international orders, customs duties may be charged by your local authorities. We recommend checking with your local customs office for specific policies."
  },
  {
    question: "How can I exchange an item?",
    answer: "To exchange an item, please return the original item and place a new order for the size or color you need. Both the return and new order can be processed simultaneously. Please ensure the item is unworn, with original tags attached, and in its original packaging."
  },
  {
    question: "How can I return an item?",
    answer: "To return an item:\n1. Contact our customer service within 14 days of receiving your order.\n2. Ensure the item is unworn, unwashed, with original tags attached.\n3. Pack the item securely in its original packaging.\n4. We will arrange for pickup or provide return shipping instructions.\n\nPlease refer to our Returns & Exchanges page for complete details."
  },
  {
    question: "How will I be refunded?",
    answer: "Refunds are processed to the original payment method:\n• Credit/Debit Card orders: Refunded to the same card\n• Cash on Delivery orders: Bank transfer to your account\n• Store credit can also be issued upon request for faster processing."
  },
  {
    question: "Do I have to pay for return shipping?",
    answer: "Return shipping is free for items that are defective or do not match your order. For other returns (wrong size, change of mind, etc.), return shipping costs are the responsibility of the customer unless otherwise specified in a promotion."
  },
  {
    question: "Do I need to create an account to place an order?",
    answer: "No, you can checkout as a guest. However, creating an account offers these benefits:\n• Save your shipping addresses for faster checkout\n• View your order history and track orders\n• Receive exclusive offers and early access to sales\n• Earn loyalty rewards on purchases\n• Manage your wishlist"
  },
  {
    question: "How do I contact customer service?",
    answer: "You can reach our customer service team through:\n• WhatsApp: Click the WhatsApp icon on our website\n• Email: support@lumiere.com\n• Phone: Available during business hours\n\nWe aim to respond to all inquiries within 24 hours."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/">
            <button className="flex items-center gap-2 text-gray-600 hover:text-black mb-8 transition-colors" data-testid="back-home">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Welcome to the Lumière FAQ! Here you can find answers to common questions about shopping at our online store, including orders, shipping, returns, and more.
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="border border-gray-200 rounded-lg overflow-hidden"
                data-testid={`faq-item-${index}`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  data-testid={`faq-toggle-${index}`}
                >
                  <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-2 text-gray-600 whitespace-pre-line border-t border-gray-100">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 text-center p-8 bg-gray-50 rounded-2xl"
          >
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3">
              Still have questions?
            </h2>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Our customer service team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <button className="px-8 py-3 bg-black text-white hover:bg-gray-800 transition-colors rounded-full font-medium" data-testid="contact-button">
                  Contact Us
                </button>
              </Link>
              <a 
                href="https://wa.me/96512345678" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-8 py-3 border border-black text-black hover:bg-black hover:text-white transition-colors rounded-full font-medium"
                data-testid="whatsapp-button"
              >
                WhatsApp Support
              </a>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
