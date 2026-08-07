import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Terms() {
  const termsData = [
    {
      id: "usage-rules",
      question: "What are the usage rules?",
      answer: "Our services are designed for legitimate social media growth. Users must not use our services for spam, fake engagement, or any activities that violate Instagram's terms of service. All orders must be for authentic Instagram accounts that you own or have permission to manage."
    },
    {
      id: "refund-policy",
      question: "What is your refund policy?",
      answer: "Refunds are processed on a case-by-case basis. If our service fails to deliver as promised, we will issue a full refund. However, refunds are not available for completed orders or if the issue is caused by changes to your Instagram account settings or privacy changes."
    },
    {
      id: "one-bonus-per-uid",
      question: "Bonus Policy",
      answer: "Each user is entitled to only one bonus per UID (User Identification). The bonus is a one-time offer for new users and cannot be claimed multiple times. Attempting to create multiple accounts to claim multiple bonuses will result in account suspension."
    },
    {
      id: "service-misuse",
      question: "What constitutes service misuse?",
      answer: "Service misuse includes but is not limited to: using our services for illegal activities, attempting to hack or manipulate our system, providing false information, using our services to harm others, or violating any platform's terms of service. Misuse will result in immediate account termination."
    },
    {
      id: "account-responsibility",
      question: "Account Responsibility",
      answer: "Users are responsible for maintaining the security of their account credentials. You must not share your login details with others. Any activity conducted through your account is your responsibility. We recommend using strong passwords and enabling two-factor authentication where available."
    },
    {
      id: "service-availability",
      question: "Service Availability",
      answer: "While we strive to provide 24/7 service availability, we do not guarantee uninterrupted service. Maintenance windows and unforeseen technical issues may cause temporary service interruptions. We will notify users of planned maintenance whenever possible."
    },
    {
      id: "payment-terms",
      question: "Payment Terms",
      answer: "All payments must be made through our approved payment methods. Payments are processed securely and funds are added to your wallet balance upon confirmation. Chargebacks or payment disputes may result in account suspension pending investigation."
    },
    {
      id: "content-policy",
      question: "Content Policy",
      answer: "Our services cannot be used to promote illegal content, hate speech, harassment, or content that violates platform guidelines. We reserve the right to refuse service for any content that we deem inappropriate or potentially harmful."
    }
  ];

  return (
    <div className="min-h-screen pt-20 pb-8" style={{ backgroundColor: 'var(--main-bg)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gold mb-4">Terms of Service</h1>
          <p className="text-xl text-cream/80 max-w-2xl mx-auto">
            Please read our terms of service carefully to understand our policies and your responsibilities as a user.
          </p>
        </div>

        {/* Terms Content */}
        <div className="bg-charcoal rounded-2xl p-8 border border-gold/20 shadow-xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gold mb-4">
              <i className="fas fa-gavel mr-3"></i>
              Legal Terms & Conditions
            </h2>
            <p className="text-cream/80 leading-relaxed">
              By using InstaBoost Pro services, you agree to comply with these terms and conditions. 
              These terms are designed to ensure fair usage and protect both our users and our platform.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {termsData.map((term) => (
              <AccordionItem
                key={term.id}
                value={term.id}
                className="bg-charcoal-dark border border-gold/20 rounded-lg overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-4 text-left hover:bg-gold/5 transition-colors duration-300">
                  <div className="flex items-center">
                    <i className="fas fa-balance-scale text-gold mr-3"></i>
                    <span className="text-cream font-semibold">{term.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <div className="text-cream/80 leading-relaxed">
                    {term.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Contact Section */}
          <div className="mt-12 p-6 bg-gold/10 rounded-lg border border-gold/30">
            <h3 className="text-xl font-bold text-gold mb-3">
              <i className="fas fa-envelope mr-2"></i>
              Need Help?
            </h3>
            <p className="text-cream/80 mb-4">
              If you have any questions about our terms of service or need clarification on any policy, 
              please don't hesitate to contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center text-cream">
                <i className="fas fa-envelope text-gold mr-2"></i>
                <span>support@instaboostpro.com</span>
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