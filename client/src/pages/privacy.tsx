import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Privacy() {
  const privacyData = [
    {
      id: "data-collection",
      question: "What data do we collect?",
      answer: "We collect only essential information required for our services: Instagram usernames, encrypted passwords, wallet balances, order history, and payment transaction details. We do not collect personal information like real names, phone numbers, or email addresses unless voluntarily provided."
    },
    {
      id: "credential-storage",
      question: "How are credentials stored?",
      answer: "All user credentials are stored securely using industry-standard encryption. Passwords are hashed using bcrypt encryption and cannot be reversed. Your Instagram credentials are encrypted and stored in our secure database with multiple layers of protection."
    },
    {
      id: "uid-system",
      question: "What is the UID system?",
      answer: "Each user is assigned a unique identifier (UID) for account management and tracking. UIDs are randomly generated alphanumeric codes that help us manage your account without exposing personal information. Your UID is used for order tracking and support purposes."
    },
    {
      id: "wallet-security",
      question: "How is wallet data protected?",
      answer: "Wallet balances and transaction history are stored in an encrypted database with restricted access. All financial transactions are logged securely and can only be accessed by authorized personnel for support purposes. We use SSL encryption for all payment-related communications."
    },
    {
      id: "order-privacy",
      question: "Order data privacy",
      answer: "Order information including service details, quantities, and target Instagram accounts are stored securely and used only for service delivery. We do not share your order history with third parties and maintain strict confidentiality of your social media growth strategies."
    },
    {
      id: "telegram-logging",
      question: "Telegram bot event logging",
      answer: "Our Telegram bot logs specific events for administrative purposes: new user registrations, payment requests, and order placements. These logs contain UIDs, service details, and transaction amounts but no personal identifying information. Logs are used for monitoring service performance and providing support."
    },
    {
      id: "data-sharing",
      question: "Do we share your data?",
      answer: "We do not sell, rent, or share your personal data with third parties for marketing purposes. Data may only be shared with authorized service providers who help us deliver our services, and only under strict confidentiality agreements. We may disclose information if required by law."
    },
    {
      id: "data-retention",
      question: "How long do we keep your data?",
      answer: "Account data is retained as long as your account remains active. Order history is kept for 12 months for support and record-keeping purposes. Payment transaction logs are maintained for 24 months as required by financial regulations. You can request account deletion at any time."
    },
    {
      id: "data-security",
      question: "Security measures",
      answer: "We implement multiple security layers including SSL encryption, secure database connections, regular security audits, and restricted access controls. Our servers are protected by firewalls and intrusion detection systems. We continuously monitor for security threats and update our protection measures."
    },
    {
      id: "user-rights",
      question: "Your privacy rights",
      answer: "You have the right to access, modify, or delete your personal data. You can request a copy of your data, correct inaccuracies, or request account deletion. Contact our support team for any privacy-related requests. We will respond to legitimate requests within 30 days."
    }
  ];

  return (
    <div className="min-h-screen pt-20 pb-8" style={{ backgroundColor: 'var(--main-bg)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gold mb-4">Privacy Policy</h1>
          <p className="text-xl text-cream/80 max-w-2xl mx-auto">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
        </div>

        {/* Privacy Content */}
        <div className="bg-charcoal rounded-2xl p-8 border border-gold/20 shadow-xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gold mb-4">
              <i className="fas fa-shield-alt mr-3"></i>
              Data Protection & Security
            </h2>
            <p className="text-cream/80 leading-relaxed">
              We are committed to protecting your privacy and ensuring the security of your data. 
              This policy explains how we handle your information with the highest standards of security and confidentiality.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {privacyData.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="bg-charcoal-dark border border-gold/20 rounded-lg overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-4 text-left hover:bg-gold/5 transition-colors duration-300">
                  <div className="flex items-center">
                    <i className="fas fa-lock text-gold mr-3"></i>
                    <span className="text-cream font-semibold">{item.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <div className="text-cream/80 leading-relaxed">
                    {item.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Security Features */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-gold/10 rounded-lg border border-gold/30 text-center">
              <i className="fas fa-certificate text-gold text-3xl mb-3"></i>
              <h3 className="text-lg font-bold text-gold mb-2">SSL Encrypted</h3>
              <p className="text-cream/80 text-sm">All data transmission is protected with industry-standard SSL encryption.</p>
            </div>
            <div className="p-6 bg-gold/10 rounded-lg border border-gold/30 text-center">
              <i className="fas fa-database text-gold text-3xl mb-3"></i>
              <h3 className="text-lg font-bold text-gold mb-2">Secure Storage</h3>
              <p className="text-cream/80 text-sm">Your data is stored in encrypted databases with multiple backup systems.</p>
            </div>
            <div className="p-6 bg-gold/10 rounded-lg border border-gold/30 text-center">
              <i className="fas fa-user-shield text-gold text-3xl mb-3"></i>
              <h3 className="text-lg font-bold text-gold mb-2">Privacy First</h3>
              <p className="text-cream/80 text-sm">We collect only necessary data and never share it without permission.</p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-12 p-6 bg-gold/10 rounded-lg border border-gold/30">
            <h3 className="text-xl font-bold text-gold mb-3">
              <i className="fas fa-envelope mr-2"></i>
              Privacy Concerns?
            </h3>
            <p className="text-cream/80 mb-4">
              If you have any questions about our privacy policy or want to exercise your privacy rights, 
              our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center text-cream">
                <i className="fas fa-envelope text-gold mr-2"></i>
                <span>privacy@instaboostpro.com</span>
              </div>
              <div className="flex items-center text-cream">
                <i className="fab fa-telegram text-gold mr-2"></i>
                <span>@instaboostpro_support</span>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-8 text-center text-cream/60 text-sm">
            <i className="fas fa-clock mr-2"></i>
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}