export default function ShippingPolicy() {
  return (
    <div className="min-h-screen pt-20 pb-8" style={{ backgroundColor: 'var(--main-bg)' }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gold mb-4">Delivery Policy</h1>
          <p className="text-cream/70">How and when your Instagram growth is delivered</p>
        </div>
        <div className="bg-charcoal rounded-2xl p-8 border border-gold/20 space-y-6 text-cream/80 leading-relaxed">
          <div>
            <h3 className="text-gold font-bold text-lg mb-2"><i className="fas fa-rocket mr-2"></i>Instant Processing</h3>
            <p>All orders start processing within 0-15 minutes after payment. Our system is automated and works 24/7, even on festivals and Sundays. You will see initial growth within 30 mins.</p>
          </div>
          <div>
            <h3 className="text-gold font-bold text-lg mb-2"><i className="fas fa-clock mr-2"></i>Delivery Time by Service</h3>
            <ul className="list-disc list-inside space-y-1 text-sm bg-charcoal-dark p-4 rounded-lg">
              <li><b>Followers:</b> 1K in 2-6 hours, 10K in 12-24 hours (drip fed for safety)</li>
              <li><b>Likes:</b> Instant - 1000 likes in 5-10 mins</li>
              <li><b>Views:</b> Instant - 10K views in 10-15 mins</li>
              <li><b>Comments:</b> 10-30 mins - custom comments take 1-2 hours</li>
              <li><b>Story Views:</b> Instant delivery</li>
            </ul>
          </div>
          <div>
            <h3 className="text-gold font-bold text-lg mb-2"><i className="fas fa-shield-alt mr-2"></i>Safe & Gradual Delivery</h3>
            <p>We use drip-feed for followers to keep your account safe. Sudden 10K followers can trigger Instagram spam filter. We deliver 1000 followers, pause 30 mins, then next 1000. This is why big orders take time. You can request instant delivery in order notes but at your own risk.</p>
          </div>
          <div>
            <h3 className="text-gold font-bold text-lg mb-2"><i className="fas fa-exclamation-triangle mr-2"></i>What Can Delay Delivery?</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Private account - make it public before ordering</li>
              <li>Wrong username - double check @username</li>
              <li>Instagram server down - rare, we retry automatically</li>
              <li>You changed username mid-order - contact support with new username</li>
              <li>Content deleted - we can't deliver to deleted post</li>
            </ul>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-400/20 rounded-lg">
            <h4 className="text-green-400 font-bold mb-1">Need faster delivery?</h4>
            <p className="text-sm">Contact Telegram @instaboostpro_support with Order ID, we prioritize paid orders. Premium members get 2x faster delivery.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
