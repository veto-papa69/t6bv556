import { useState } from "react";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "How fast are the services delivered?",
    answer: "Our services are delivered almost instantly. Likes and views start within 0-5 minutes, followers within 15-30 minutes. Big orders (10K+) are drip-fed over 12-24 hours to keep your account safe from Instagram spam detection. You can track live in Orders page."
  },
  {
    question: "Are the services safe for my account? Will I get banned?",
    answer: "100% safe if you follow our guidelines. We deliver gradually, use real Indian accounts, not bots. Never had a single account banned in 2 years. Safety tips: Don't order more than 10K followers in one day for new accounts (<1K followers), keep account public during delivery, don't change username mid-order. We also provide 30-day refill guarantee if followers drop."
  },
  {
    question: "What payment methods do you accept? Is UPI safe?",
    answer: "We accept all UPI - PhonePe, Google Pay, Paytm, BHIM, plus Net Banking and Crypto (USDT). QR code is of our verified merchant account. UPI is safest - instant and you have UTR as proof. Minimum deposit ₹30. Funds added within 5-15 mins after admin verification. We never store your UPI ID."
  },
  {
    question: "How do I claim the welcome bonus and referral 50% OFF?",
    answer: "Welcome bonus: Login > Homepage > Claim ₹10 bonus (one time per UID). Referral: Go to Referrals page, copy your link REF-XXXX, share with 5 friends. When they signup using your link, you get 1 count. After 5 counts, Claim Reward button appears, click it to unlock lifetime 50% discount on ALL services. Discount auto-applies at checkout."
  },
  {
    question: "Can I get a refund if followers drop or not delivered?",
    answer: "Yes! If we deliver less than 80% after 7 days, you get partial refund or free refill. If no delivery within 72 hours, 100% refund. For drop: We provide 30-day refill guarantee - if followers drop within 30 days, contact support with Order ID, we refill free within 24h. Refund goes to wallet instantly, bank refund 5-7 days. See Refund Policy page for details."
  },
  {
    question: "How can I contact customer support? How fast you reply?",
    answer: "Fastest: Telegram @instaboostpro_support - reply in 5-15 mins, 24/7 even on Diwali. Email support@instaboostpro.com for non-urgent (2-6 hours). Before contacting keep UID and Order ID ready. We support Hindi and English. For payment issues, contact @instaboost_payments with UTR screenshot."
  },
  {
    question: "What is the minimum order quantity and minimum deposit?",
    answer: "Minimum order: Followers 100, Likes 50, Views 100, Comments 10. Minimum deposit ₹30. We keep minimum low so small creators can also afford. For new accounts, we recommend starting with 500 followers + 100 likes to look natural."
  },
  {
    question: "Do you provide real followers or bots? Will they like/comment?",
    answer: "We provide high-quality real Indian followers from active accounts (not dead bots). Retention 80-90% for 30 days. They may like/comment naturally but we don't guarantee engagement from followers - for guaranteed engagement order likes/comments separately. Our followers have profile pics, posts, stories - look 100% real. Cheap bots at ₹5/1000 drop in 2 days, our premium at ₹24/1000 stay longer."
  },
  {
    question: "Why my order is stuck in processing? What to do?",
    answer: "Common reasons: 1) Private account - make public, 2) Wrong username - check spelling, 3) You deleted post - re-upload and contact support with new link, 4) Instagram is down - we auto-retry. If stuck more than 6 hours, contact support with Order ID. Don't place duplicate order - we will cancel and refund one."
  },
  {
    question: "Can I order for someone else? Can I split 1000 followers to 2 accounts?",
    answer: "Yes you can order for any public Instagram account (friend, client). No need their password. For splitting: No, 1 order = 1 link/username. If you want 500 + 500 for 2 accounts, place 2 separate orders of 500 each. Same for likes - each post needs separate order."
  },
  {
    question: "What is the difference between Normal and Premium followers?",
    answer: "Normal (₹11/1000): Mixed Indian + International, 30% drop possible, no refill. Premium (₹24/1000): 100% Indian, real accounts, 90% retention, 30-day refill, faster delivery. For influencers/brands we recommend Premium. For meme pages, Normal is okay."
  },
  {
    question: "Is there any monthly subscription or hidden charges?",
    answer: "No subscription, no hidden charges. Pay only for what you order. Wallet never expires. No monthly fee. Our pricing is transparent - rate shown is final. GST included. What you see is what you pay."
  }
];

export default function FAQ() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const toggleFAQ = (index: number) => { setOpenFAQ(openFAQ === index ? null : index); };

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-cream/70">Everything you need to know about InstaBoost Pro - Real answers from 50K+ customers</p>
          <div className="mt-4 flex justify-center gap-4 text-sm">
            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full">✓ 50K+ Customers</span>
            <span className="bg-gold/20 text-gold px-3 py-1 rounded-full">✓ 4.8★ Rating</span>
            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">✓ 24/7 Support</span>
          </div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-charcoal border border-gold/20 rounded-xl overflow-hidden hover:border-gold/40 transition-colors">
              <button className="w-full p-6 text-left flex items-center justify-between hover:bg-charcoal-dark/50 transition-colors" onClick={() => toggleFAQ(index)}>
                <span className="text-lg font-semibold text-gold pr-4">{index+1}. {faq.question}</span>
                <i className={`fas fa-chevron-down text-gold transition-transform duration-200 ${openFAQ === index ? "rotate-180" : ""}`}></i>
              </button>
              {openFAQ === index && (
                <div className="px-6 pb-6 text-cream/80 leading-relaxed">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-gold/10 to-tan/10 border border-gold/20 rounded-2xl p-8 text-center">
          <i className="fas fa-headset text-gold text-4xl mb-4"></i>
          <h3 className="text-2xl font-bold text-gold mb-4">Still Have Questions?</h3>
          <p className="text-cream/70 mb-6">Our support team replies in 5-15 minutes, even at 2 AM. We speak Hindi & English.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://t.me/instaboostpro_support" target="_blank" className="btn-primary inline-flex items-center justify-center">
              <i className="fab fa-telegram mr-2"></i>Telegram Support - 24/7
            </a>
            <a href="/contact" className="btn-outline inline-flex items-center justify-center">
              <i className="fas fa-envelope mr-2"></i>Contact Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
