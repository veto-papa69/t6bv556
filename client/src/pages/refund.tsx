import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function RefundPolicy() {
  const refundData = [
    {
      id: "eligible",
      question: "When am I eligible for a refund?",
      answer: "You are eligible for a full refund if: (1) We fail to deliver your order within 72 hours of the promised delivery time, (2) The delivered quantity is less than 80% of ordered quantity after 7 days, (3) Your order was marked completed but no growth observed due to our error, (4) Duplicate payment deducted. Refund is NOT eligible if you provided wrong username, made account private after ordering, or deleted post/reel."
    },
    {
      id: "timeframe",
      question: "Refund Timeframe & Process",
      answer: "Refund requests must be raised within 7 days of order completion. Once approved, refund is credited to your InstaBoost wallet within 24 hours. Bank/UPI refunds take 5-7 working days. To request: Go to Orders > Select Order > Report Issue > Attach screenshot proof. Our team verifies within 12 hours."
    },
    {
      id: "partial",
      question: "Partial Delivery & Partial Refund",
      answer: "If we deliver 800 out of 1000 followers (80%), we consider it completed. If delivery is below 80% even after 7 days and refill, you get partial refund for undelivered quantity OR free refill. Example: Ordered 1000, got 600, refund = (400/1000)*order amount. For likes/views, minimum 90% delivery expected."
    },
    {
      id: "non-refundable",
      question: "Non-Refundable Cases",
      answer: "No refund for: (1) You changed username after order, (2) Account is private, (3) You deleted the content, (4) Order already in processing and you want to cancel, (5) Instagram removed followers due to your account activity, (6) You ordered for someone else without permission and they removed it. Always double-check username before ordering."
    },
    {
      id: "wallet",
      question: "Wallet Refund vs Bank Refund",
      answer: "By default, all refunds go to your InstaBoost wallet so you can reuse instantly. If you want bank refund, contact support with payment proof. Wallet refunds are instant, bank refunds 5-7 days. Minimum wallet refund ₹20. Bonus amount (₹10 welcome bonus) is non-refundable and non-transferable."
    },
    {
      id: "chargeback",
      question: "Chargeback & Fraud Policy",
      answer: "Raising false chargeback without contacting us first will result in permanent account ban and legal action. If payment deducted but not added to wallet, wait 15 mins, then contact support with UTR. We verify with our payment gateway and add funds manually. Never do chargeback for pending payments - they are manually approved within 15 mins."
    }
  ];

  return (
    <div className="min-h-screen pt-20 pb-8" style={{ backgroundColor: 'var(--main-bg)' }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gold mb-4">Refund & Cancellation Policy</h1>
          <p className="text-xl text-cream/70">Transparent, fair and customer-friendly refund policy for InstaBoost Pro</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 rounded-full px-4 py-2">
            <i className="fas fa-shield-alt text-green-400"></i>
            <span className="text-green-400 text-sm font-semibold">100% Refund if we fail to deliver</span>
          </div>
        </div>

        <div className="bg-charcoal rounded-2xl p-8 border border-gold/20 shadow-xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gold mb-4"><i className="fas fa-undo mr-3"></i>Our Refund Promise</h2>
            <p className="text-cream/80 leading-relaxed">
              At InstaBoost Pro, we value your trust. We have served 50,000+ customers with 99.2% satisfaction. If we fail to deliver as promised, we refund you - no questions asked. We don't want your money if we can't deliver growth.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {refundData.map((item) => (
              <AccordionItem key={item.id} value={item.id} className="bg-charcoal-dark border border-gold/20 rounded-lg">
                <AccordionTrigger className="px-6 py-4 text-left">
                  <div className="flex items-center"><i className="fas fa-file-invoice-dollar text-gold mr-3"></i><span className="text-cream font-semibold">{item.question}</span></div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-cream/80 leading-relaxed">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gold/10 rounded-lg border border-gold/20 text-center">
              <i className="fas fa-clock text-gold text-2xl mb-2"></i>
              <h4 className="text-gold font-bold">24H Refund</h4>
              <p className="text-cream/70 text-sm">Wallet refund within 24 hours</p>
            </div>
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-400/20 text-center">
              <i className="fas fa-check-circle text-green-400 text-2xl mb-2"></i>
              <h4 className="text-green-400 font-bold">99.2% Success</h4>
              <p className="text-cream/70 text-sm">Rarely need refunds</p>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-400/20 text-center">
              <i className="fas fa-headset text-blue-400 text-2xl mb-2"></i>
              <h4 className="text-blue-400 font-bold">24/7 Support</h4>
              <p className="text-cream/70 text-sm">Quick refund resolution</p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gold/10 rounded-lg border border-gold/30">
            <h3 className="text-gold font-bold mb-2">How to Request Refund?</h3>
            <ol className="list-decimal list-inside text-cream/80 space-y-1 text-sm">
              <li>Go to Orders page and find your order</li>
              <li>Click Report Issue and select reason</li>
              <li>Upload screenshot proof (if delivery less than promised)</li>
              <li>Our team checks within 12 hours</li>
              <li>Refund credited to wallet instantly after approval</li>
            </ol>
          </div>

          <div className="mt-6 text-center text-cream/50 text-sm">
            Last updated: {new Date().toLocaleDateString()} | Contact: support@instaboostpro.com | Telegram: @instaboostpro_support
          </div>
        </div>
      </div>
    </div>
  );
}
