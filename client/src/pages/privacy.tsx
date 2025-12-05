import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
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
              Privacy & Cookie Policy
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
                  This Privacy & Cookie Policy applies to information collected and processed via the Lumière website and associated customer service channels. We take your privacy as a priority and want you to know how your data is collected, used, shared, and stored.
                </p>
                <p className="mt-4">
                  Lumière is a women's fashion company offering luxury and contemporary fashion pieces. By visiting our website or supplying information through our customer service channels, you are consenting to the practices described in this Privacy and Cookie Policy and our Terms and Conditions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-serif text-white mb-4">Customer Details We May Collect</h2>
                <p>
                  By accessing our website, you are indicating your express consent and agreement to the collection, processing, use, and storage in accordance with this privacy policy of any personal information obtained from you.
                </p>
                <p className="mt-4">
                  We collect and process your data for processing your purchase and any possible later claims, and to provide you with our services. We may collect your:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>First name and last name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Postal and delivery address</li>
                  <li>Payment details</li>
                </ul>
                <p className="mt-4">
                  Please note that your full payment card details are captured only for the purposes of processing your transaction and are not stored, sold, or rented by us. All card transactions are managed by trusted, certified, and legally authorized partners who ensure your payment details remain secure.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-serif text-white mb-4">Usage of Customer Information</h2>
                <p>
                  Lumière never shares your personal information with third parties for marketing purposes. We never transfer, sell, or trade your data with any party outside of Lumière. However, we may share some customer information with our partners and government agencies when necessary.
                </p>
                <p className="mt-4">We use your information for:</p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>Processing or fulfillment of your order</li>
                  <li>Verifying and executing financial transactions</li>
                  <li>Assisting with customer service queries</li>
                  <li>Managing your account</li>
                  <li>Providing a personalized shopping experience</li>
                  <li>Analytical and statistical purposes</li>
                  <li>Marketing communications (if you have opted in)</li>
                  <li>Improving our services</li>
                  <li>Protecting our rights and preventing fraud</li>
                  <li>Any purpose required by law or regulation</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-serif text-white mb-4">Sharing Information</h2>
                <p>We may share your information with:</p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>Service providers who perform services on our behalf (payment processing, website maintenance, logistics, couriers)</li>
                  <li>Professional services providers (legal, audit, financial advisers)</li>
                  <li>Legal, regulatory, law enforcement, or government bodies when required</li>
                  <li>Gift recipients in relation to your order</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-serif text-white mb-4">Cookies</h2>
                <p>
                  Lumière uses cookies for essential operations such as site navigation, allowing you to add items to the shopping cart, and providing you with the best user experience. You may manage cookies by:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>Changing your browser settings to get notified when a cookie tries to access your computer</li>
                  <li>Setting your browser to block all or third-party cookies</li>
                  <li>Browsing through incognito mode</li>
                  <li>Clearing cookies after visiting our website</li>
                </ul>
                <p className="mt-4">
                  Please note that disabling cookies may prevent or inaccurately display some pages of our website.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-serif text-white mb-4">Customer Rights</h2>
                <p>As our customer, you have the following rights regarding your personal data:</p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li><strong className="text-white">Right to access:</strong> You have the right to request information about the personal data we hold about you.</li>
                  <li><strong className="text-white">Right to object:</strong> You have the right to object to processing of your personal data.</li>
                  <li><strong className="text-white">Right to rectification:</strong> You have the right to request correction of your personal data if the information is incorrect.</li>
                  <li><strong className="text-white">Right to restriction:</strong> You have the right to request that Lumière restrict the processing of your personal data.</li>
                  <li><strong className="text-white">Right to delete:</strong> You have the right to delete your account with Lumière, in which case all your personal data will no longer be available with us.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-serif text-white mb-4">Contact Us</h2>
                <p>
                  Please contact Lumière customer support through our WhatsApp for any privacy-related inquiries.
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
