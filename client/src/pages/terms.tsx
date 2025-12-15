import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsConditions() {
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
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6 tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-neutral-400">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="prose prose-invert prose-neutral max-w-none"
          >
            <div className="space-y-10 text-neutral-300 leading-relaxed">
              <section>
                <p>
                  This page sets out the legal terms and conditions under which Verda sells any of the products listed on this website to you. We seek to comply with international standards in distance-selling and e-commerce at all times. If you have any concerns, please contact us.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-serif text-white mb-4">Your Order</h2>
                <p>
                  By placing an order for products through our website, you are confirming that you intend to enter into a contract with us for the purchase of those products. You place the order by clicking the 'Place Order' button at the end of the checkout process.
                </p>
                <p className="mt-4">
                  During the checkout process, you will be asked to complete your details. All fields indicated as required must be completed, including providing us with a valid phone number and email address.
                </p>
                <p className="mt-4">
                  Please note that neither completion of the online checkout process nor our confirmatory email constitute our acceptance of your order. Our acceptance of your order will take place only upon receipt of full payment from you.
                </p>
                <p className="mt-4">
                  If we cannot supply you with the products you ordered for whatever reason, we will not process your order and will inform you of this. If you have already paid for the products, we will provide you with a full refund as soon as reasonably possible.
                </p>
                <p className="mt-4">
                  We have the right to change product prices from time to time, for example during promotional periods or in cases of pricing errors. If the corrected price at the time of your order is higher than the price displayed, we will contact you for guidance before accepting your order.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-serif text-white mb-4">Delivery</h2>
                <p>
                  We can only process orders for delivery within countries in which we are permitted to sell the products. Delivery charges and timescales vary depending on the type of products ordered, the service you select, and the delivery address.
                </p>
                <p className="mt-4">
                  We will try our best to deliver the products to your address by the estimated delivery date set out in our order confirmation. If we are unable to meet our estimated delivery date, we will contact you as soon as we can with a revised estimated date.
                </p>
                <p className="mt-4">
                  If no one is available at the specified address at the time of delivery, our delivery company will contact you to arrange re-delivery. The products will only be left with a third party with your express authority.
                </p>
                <p className="mt-4">
                  All risk in the products you order (including risk of loss and/or damage) shall pass to you when they are delivered to the delivery address specified in your order.
                </p>
                <p className="mt-4">
                  Occasionally, the supply of your products may be delayed or prevented for reasons beyond our control (e.g. material shortages, import delays, or higher than anticipated demand). Where this is the case, we will make every effort to keep you informed.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-serif text-white mb-4">Returns & Refunds</h2>
                <p>
                  We accept returns within 14 days of delivery. Items must be unworn, unwashed, and in their original condition with all tags attached. Sale items and intimate wear are final sale and cannot be returned.
                </p>
                <p className="mt-4">
                  To initiate a return, please contact our customer service team via WhatsApp with your order number and reason for return. We will provide instructions and arrange pickup from your location.
                </p>
                <p className="mt-4">
                  Once we receive and inspect your return, refunds are processed within 5-7 business days. The amount will be credited to your original payment method.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-serif text-white mb-4">Copyright</h2>
                <p>
                  Verda holds full intellectual property rights to all content including images on this website, with the exclusion of images from third parties. Permission from Verda must be given before any content or images may be used by anyone else.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-serif text-white mb-4">Applicable Law and Jurisdiction</h2>
                <p>
                  These Terms and Conditions shall be governed by the applicable laws in the territory in which you are registered to use our website and shall be subject to the exclusive jurisdiction of the courts of that relevant territory.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-serif text-white mb-4">Contact Us</h2>
                <p>
                  For any questions about these Terms and Conditions, please contact us through WhatsApp.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
