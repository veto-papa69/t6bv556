export default function About() {
  return (
    <div className="min-h-screen pt-20 pb-8" style={{ backgroundColor: 'var(--main-bg)' }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <img src="https://files.catbox.moe/95hr3x.png" alt="logo" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gold mb-4">About InstaBoost Pro</h1>
          <p className="text-cream/70">India's Most Trusted SMM Panel Since 2022</p>
        </div>
        <div className="bg-charcoal rounded-2xl p-8 border border-gold/20 space-y-6 text-cream/80 leading-relaxed">
          <p><b className="text-gold">InstaBoost Pro</b> started in 2022 with a simple mission - make Instagram growth affordable for every Indian creator, influencer, small business. Today we have 50,000+ happy customers, 2M+ orders delivered, 99.2% satisfaction rate.</p>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-charcoal-dark rounded-lg"><div className="text-3xl font-bold text-gold">50K+</div><div className="text-sm">Customers</div></div>
            <div className="p-4 bg-charcoal-dark rounded-lg"><div className="text-3xl font-bold text-gold">2M+</div><div className="text-sm">Orders Delivered</div></div>
            <div className="p-4 bg-charcoal-dark rounded-lg"><div className="text-3xl font-bold text-gold">4.8★</div><div className="text-sm">Rating</div></div>
          </div>
          <h3 className="text-gold font-bold text-lg">Why We Are Different?</h3>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li><b>Real Indian Followers:</b> Not bots, real active Indian accounts, high retention</li>
            <li><b>Cheapest in India:</b> Followers from ₹11/1000, Likes from ₹6/1000 - direct from source, no middleman</li>
            <li><b>Instant Start:</b> 90% orders start within 5 mins, fully automated</li>
            <li><b>24/7 Hindi + English Support:</b> Telegram support that actually replies</li>
            <li><b>Safe:</b> No password needed, we never ask for Instagram password (except login for our panel which is different), gradual delivery to avoid ban</li>
            <li><b>Wallet System:</b> Add funds once, use anytime, no need to pay each time</li>
            <li><b>Refer & Earn 50% OFF:</b> Refer 5 friends, get lifetime 50% discount - best in industry</li>
          </ul>
          <h3 className="text-gold font-bold text-lg">Our Story</h3>
          <p className="text-sm">Founder from Panipat, Haryana started this after struggling to grow his own meme page. Tried many SMM panels - costly, fake followers that drop, no support. So built InstaBoost Pro with direct suppliers, honest pricing, real support. Now team of 8 people managing support, development, supplier relations.</p>
          <div className="p-4 bg-gold/10 rounded-lg border border-gold/20">
            <p className="text-sm"><b className="text-gold">Our Promise:</b> We will never sell you fake bots that disappear in 2 days. We deliver real, high-quality followers that stay. If they drop, we refill free for 30 days. Your growth is our reputation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
