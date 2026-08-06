export default function Contact() {
  return (
    <div className="min-h-screen pt-20 pb-8" style={{ backgroundColor: 'var(--main-bg)' }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gold mb-4">Contact Us</h1>
          <p className="text-cream/70">We're here to help 24/7 - Average reply time 5 minutes</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-charcoal rounded-2xl p-8 border border-gold/20">
            <h3 className="text-gold font-bold text-xl mb-6"><i className="fab fa-telegram mr-2"></i>Telegram Support (Fastest)</h3>
            <div className="space-y-4">
              <div className="p-4 bg-charcoal-dark rounded-lg border border-gold/10">
                <p className="text-cream/60 text-sm">Main Support</p>
                <p className="text-gold font-mono font-bold">@instaboostpro_support</p>
                <p className="text-cream/50 text-xs">For orders, payments, general queries - 24/7</p>
              </div>
              <div className="p-4 bg-charcoal-dark rounded-lg border border-gold/10">
                <p className="text-cream/60 text-sm">Payment Support</p>
                <p className="text-gold font-mono font-bold">@instaboost_payments</p>
                <p className="text-cream/50 text-xs">UTR verification, fund addition</p>
              </div>
            </div>
          </div>
          <div className="bg-charcoal rounded-2xl p-8 border border-gold/20">
            <h3 className="text-gold font-bold text-xl mb-6"><i className="fas fa-envelope mr-2"></i>Email Support</h3>
            <div className="space-y-3 text-cream/80">
              <p><i className="fas fa-envelope text-gold mr-2"></i>support@instaboostpro.com - General</p>
              <p><i className="fas fa-credit-card text-gold mr-2"></i>payments@instaboostpro.com - Payments</p>
              <p><i className="fas fa-undo text-gold mr-2"></i>refund@instaboostpro.com - Refunds</p>
              <p><i className="fas fa-bug text-gold mr-2"></i>abuse@instaboostpro.com - Report abuse</p>
              <div className="mt-6 p-3 bg-gold/10 rounded-lg">
                <p className="text-sm"><b className="text-gold">Business Hours:</b> 24/7, 365 days</p>
                <p className="text-sm"><b className="text-gold">Location:</b> Panipat, Haryana, India</p>
                <p className="text-sm"><b className="text-gold">Response:</b> Telegram 5-15 min, Email 2-6 hours</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 bg-charcoal rounded-2xl p-8 border border-gold/20">
          <h3 className="text-gold font-bold mb-4">Before contacting, please keep ready:</h3>
          <ul className="list-disc list-inside text-cream/70 space-y-1 text-sm">
            <li>Your UID (shown in navbar after login)</li>
            <li>Order ID (if order related)</li>
            <li>UTR/Transaction ID (if payment related)</li>
            <li>Screenshot of issue</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
