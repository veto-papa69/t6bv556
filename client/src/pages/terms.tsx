import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Terms() {
  const termsData = [
    {
      id: "usage-rules",
      question: "Usage Rules & Eligibility",
      answer: "You must be 13+ to use our services. Our services are for legitimate growth only - you must own the Instagram account or have written permission from owner. We prohibit using our services for spam, fake engagement pods that violate Instagram TOS, or for accounts promoting illegal activities, hate speech, adult content involving minors. Each UID can have only one account. Creating multiple accounts to claim multiple bonuses will lead to ban and forfeiture of wallet balance."
    },
    {
      id: "refund-policy",
      question: "Refund, Cancellation & Delivery Policy",
      answer: "Full details in Refund Policy page, but summary: 100% refund if we fail to deliver within 72 hours beyond promised time. Partial refund if delivery <80% after 7 days. No refund if you provided wrong username, made account private after order, deleted post, or changed username. Orders once placed cannot be cancelled if status is Processing (as we already sent to supplier). Delivery: Followers 2-24 hours, Likes/Views 5-15 mins, Comments 30 mins - 2 hours. Drip-feed used for safety. 30-day refill guarantee for followers drop. Wallet refunds instant, bank refunds 5-7 days."
    },
    {
      id: "payment-terms",
      question: "Payments, Wallet & UTR Verification",
      answer: "Minimum deposit ₹30. All payments via UPI QR - PhonePe, GPay, Paytm, Net Banking, Crypto accepted. After paying, you must submit UTR/Transaction ID in Add Funds form. Funds added after admin verification (5-15 mins, max 2 hours). If payment deducted but not added in 1 hour, contact Telegram @instaboost_payments with UTR screenshot, UID. Never do chargeback without contacting us - chargeback = permanent ban. Wallet balance never expires. Bonus ₹10 is one-time, non-transferable, non-refundable. Wallet to wallet transfer not allowed."
    },
    {
      id: "one-bonus-per-uid",
      question: "Bonus & Referral Policy",
      answer: "Welcome bonus ₹10: One per UID, new users only, must claim within 7 days of signup, valid for 30 days. Referral program: Refer 5 unique friends who signup using your REF-XXXX code and create account - you get 1 count per successful signup. Fake accounts, same IP bulk signups don't count. After 5 referrals, Claim Reward button appears in Referrals page. Once claimed, you get lifetime 50% OFF on all services (auto-applied). Discount cannot be combined with festival discounts - higher discount applies. Referral discount is non-transferable. If we detect self-referral or fake referrals, we reset count and ban account."
    },
    {
      id: "service-quality",
      question: "Service Quality & Guarantee",
      answer: "We provide real Indian followers (premium) and mixed followers (cheap). Retention: Premium 80-90% for 30 days, Cheap 50-60%. Likes/Views retention 95%+. Comments are from real accounts, custom comments delivered as you wrote. If followers drop within 30 days, we refill free - contact support with Order ID within 30 days of order completion. After 30 days no refill. Likes/views/comments drop refill not available as they rarely drop. Services are for vanity metrics, we don't guarantee real business leads or sales - followers are real but may not engage with your content."
    },
    {
      id: "account-responsibility",
      question: "Account Security & Your Responsibility",
      answer: "You are responsible for your InstaBoost panel password, not your Instagram password (we never ask Instagram password for services). Don't share panel login. Use strong password. If you forget, contact support with UID and Instagram username for reset. You are responsible for keeping target Instagram account public during delivery. Private account = delivery fails, no refund. Don't change username or delete post during processing. If you do, contact support immediately with new username/link, we will try to update if supplier allows. Any illegal activity via your panel account = ban."
    },
    {
      id: "service-availability",
      question: "Service Availability & Maintenance",
      answer: "We aim for 24/7 uptime but Instagram API changes, supplier issues, server maintenance can cause downtime. Planned maintenance announced on Telegram channel @instaboostpro_updates and homepage banner. During maintenance, orders may be delayed but will be delivered after. We are not liable for Instagram's own outages or if Instagram changes algorithm and removes followers. In such case we provide refill if within 30 days. We reserve right to discontinue any service with 7-day notice and refund wallet balance for that service's pending orders."
    },
    {
      id: "prohibited",
      question: "Prohibited Uses & Ban Policy",
      answer: "Prohibited: (1) Ordering for private accounts of others without permission, (2) Using our panel to resell at higher price without permission (contact for reseller API), (3) Hacking, scraping our site, DDoS, (4) Creating multiple accounts to abuse bonus/referral, (5) Threatening support staff, (6) Chargeback fraud. First violation = warning + order cancellation, Second = 7-day ban, Third = permanent ban + wallet forfeiture + legal action if fraud. We log IP, device fingerprint for fraud prevention."
    },
    {
      id: "privacy-data",
      question: "Privacy & Data (Summary)",
      answer: "We collect only Instagram username (for login), encrypted panel password, wallet balance, orders, payments. We don't ask your real name, phone, email unless you provide. Instagram password you enter during panel login is used only for verifying you own account (we don't store plain text, only hash) and for bonus fraud prevention - we never post from your account. Your data is encrypted, stored in MongoDB Atlas, not shared with third parties except suppliers who need only username/link to deliver. See Privacy Policy page for full details."
    },
    {
      id: "limitation",
      question: "Limitation of Liability",
      answer: "Our liability is limited to amount you paid for the specific order that failed. We are not liable for: (1) Instagram banning your account (never happened but if you violate Instagram TOS via spam), (2) Loss of business, reputation, (3) Indirect damages, (4) Instagram removing followers due to their purge. Our services are for social proof, not guaranteed business growth. Use at your own risk. We provide best effort delivery. For any dispute, jurisdiction is Panipat, Haryana, India."
    },
    {
      id: "changes",
      question: "Changes to Terms & Contact",
      answer: "We may update terms with 7-day notice via homepage banner and email (if provided). Continued use after notice means acceptance. If you disagree, stop using and request wallet refund (if eligible) before effective date. Contact: support@instaboostpro.com, Telegram @instaboostpro_support, Panipat, Haryana. Last updated: " + new Date().toLocaleDateString()
    }
  ];

  return (
    <div className="min-h-screen pt-20 pb-8" style={{ backgroundColor: 'var(--main-bg)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gold mb-4">Terms of Service</h1>
          <p className="text-xl text-cream/80 max-w-2xl mx-auto">Real, honest terms - no legal jargon. Please read, we are transparent unlike other panels.</p>
          <div className="mt-4 inline-flex gap-2">
            <span className="bg-gold/20 text-gold text-xs px-3 py-1 rounded-full">✓ No Hidden Charges</span>
            <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full">✓ 30-Day Refill</span>
            <span className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full">✓ 24/7 Support</span>
          </div>
        </div>

        <div className="bg-charcoal rounded-2xl p-8 border border-gold/20 shadow-xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gold mb-4"><i className="fas fa-gavel mr-3"></i>Legal Terms & Conditions - InstaBoost Pro</h2>
            <p className="text-cream/80 leading-relaxed">Welcome to InstaBoost Pro - India's #1 SMM Panel. By using our services you agree to these terms. We keep terms simple and fair. If you have any doubt, contact Telegram @instaboostpro_support before ordering.</p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {termsData.map((term) => (
              <AccordionItem key={term.id} value={term.id} className="bg-charcoal-dark border border-gold/20 rounded-lg overflow-hidden">
                <AccordionTrigger className="px-6 py-4 text-left hover:bg-gold/5 transition-colors">
                  <div className="flex items-center"><i className="fas fa-balance-scale text-gold mr-3"></i><span className="text-cream font-semibold text-left">{term.question}</span></div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4"><div className="text-cream/80 leading-relaxed text-sm">{term.answer}</div></AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 p-6 bg-gold/10 rounded-lg border border-gold/30">
            <h3 className="text-xl font-bold text-gold mb-3"><i className="fas fa-envelope mr-2"></i>Need Help with Terms?</h3>
            <p className="text-cream/80 mb-4 text-sm">Our support explains terms in Hindi/English. Don't hesitate to ask.</p>
            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <div className="flex items-center text-cream"><i className="fas fa-envelope text-gold mr-2"></i><span>support@instaboostpro.com</span></div>
              <div className="flex items-center text-cream"><i className="fab fa-telegram text-gold mr-2"></i><span>@instaboostpro_support</span></div>
            </div>
          </div>

          <div className="mt-8 text-center text-cream/60 text-xs">
            <i className="fas fa-clock mr-2"></i>Last updated: {new Date().toLocaleDateString()} | InstaBoost Pro, Panipat, Haryana, India | Version 2.5
          </div>
        </div>
      </div>
    </div>
  );
}
