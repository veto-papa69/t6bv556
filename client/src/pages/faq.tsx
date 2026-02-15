import { useState } from "react";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "How fast are the services delivered?",
    answer: "Our services are delivered almost instantly. Most orders start processing within 0-15 minutes and complete within a few hours depending on the service type and quantity."
  },
  {
    question: "Are the services safe for my account?",
    answer: "Yes, all our services are 100% safe and comply with Instagram's terms. We use real, active accounts and organic methods to ensure your account remains secure and never gets banned."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major UPI payments including PhonePe, Google Pay, Paytm, as well as net banking and cryptocurrency. All payments are processed securely through our UPI QR code system."
  },
  {
    question: "How do I claim the welcome bonus?",
    answer: "After signing up, you can claim your ₹10 welcome bonus from the homepage or dashboard. This bonus can be used to purchase any of our services and is available for a limited time only."
  },
  {
    question: "Can I get a refund if I'm not satisfied?",
    answer: "We offer a satisfaction guarantee. If you're not satisfied with the quality of our services, please contact our support team within 24 hours and we'll work to resolve the issue or provide a refund."
  },
  {
    question: "How can I contact customer support?",
    answer: "You can reach our 24/7 customer support team via Telegram. We typically respond within 5-15 minutes and are always ready to help with any questions or issues you may have."
  },
  {
    question: "What is the minimum order quantity?",
    answer: "Minimum order quantities vary by service. For followers it's typically 100, for likes it's 50, for views it's 100, and for comments it's 10."
  },
  {
    question: "Do you provide real followers and engagement?",
    answer: "Yes, we provide high-quality real followers and engagement from active accounts. All our services comply with platform guidelines and provide authentic growth."
  }
];

export default function FAQ() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-cream/70">Find answers to common questions about our services</p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-charcoal border border-gold/20 rounded-xl overflow-hidden">
              <button
                className="w-full p-6 text-left flex items-center justify-between hover:bg-charcoal-dark/50 transition-colors duration-200"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-semibold text-gold">{faq.question}</span>
                <i 
                  className={`fas fa-chevron-down text-gold transition-transform duration-200 ${
                    openFAQ === index ? "rotate-180" : ""
                  }`}
                ></i>
              </button>
              {openFAQ === index && (
                <div className="px-6 pb-6 text-cream/80">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support Card */}
        <div className="mt-12 bg-gradient-to-r from-gold/10 to-tan/10 border border-gold/20 rounded-2xl p-8 text-center">
          <i className="fas fa-headset text-gold text-4xl mb-4"></i>
          <h3 className="text-2xl font-bold text-gold mb-4">Still Have Questions?</h3>
          <p className="text-cream/70 mb-6 text-lg">Our support team is available 24/7 to help you with any questions</p>
          <Button className="btn-primary">
            <i className="fab fa-telegram mr-2"></i>Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
