import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth, useClaimBonus } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";
import { FestivalBanner } from "@/components/festival-banner";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const claimBonus = useClaimBonus();
  const { toast } = useToast();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFromBonus, setIsFromBonus] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      sessionStorage.setItem('referralCode', refCode);
      toast({ title: "Referral Link Detected!", description: "Sign up now to help your friend get discount!" });
    }
  }, [toast]);

  const handleClaimBonus = async () => {
    if (!isAuthenticated) { setIsFromBonus(true); setIsAuthModalOpen(true); return; }
    if (user?.bonusClaimed) { toast({ title: "Bonus Already Claimed", variant: "destructive" }); return; }
    try { await claimBonus.mutateAsync(); toast({ title: "Bonus Claimed!", description: "₹10 added to wallet!" }); }
    catch { toast({ title: "Error", description: "Failed to claim bonus", variant: "destructive" }); }
  };

  const handleGetStarted = () => {
    if (!isAuthenticated) setIsAuthModalOpen(true);
    else setLocation("/services");
  };

  return (
    <>
      <FestivalBanner />
      <div className="pt-32 pb-16">
        <section className="px-4 mb-16">
          <div className="max-w-7xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-charcoal to-charcoal-dark border border-gold/20 mb-16" style={{ background: `linear-gradient(135deg, rgba(18, 38, 32, 0.95), rgba(28, 45, 36, 0.95)), linear-gradient(45deg, rgba(214, 173, 96, 0.1), rgba(214, 173, 96, 0.05))` }}>
              <div className="px-8 py-16 md:px-16 md:py-24 text-center">
                <div className="flex items-center justify-center mb-6">
                  <img src="https://files.catbox.moe/95hr3x.png" alt="InstaBoost Pro Logo" className="w-32 h-32 object-contain" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-gold mb-6 leading-tight">Boost Your Social Media<br /><span className="text-cream">Instantly</span></h1>
                <p className="text-xl md:text-2xl text-cream/80 mb-8 max-w-3xl mx-auto">Get premium followers, likes, views, and comments at competitive prices starting from ₹11/1000</p>
                
                <div className="inline-block bg-charcoal/90 backdrop-blur-sm border border-gold/30 rounded-2xl p-8 mb-8 shadow-2xl bonus-card">
                  <div className="text-center">
                    <div className="bonus-icon mb-4"><i className="fas fa-gift text-gold text-5xl heartbeat"></i></div>
                    <h3 className="text-2xl font-bold text-gold mb-2">Welcome Bonus</h3>
                    <p className="text-cream/80 mb-4 text-lg">Claim your free followers now!</p>
                    <Button onClick={handleClaimBonus} disabled={claimBonus.isPending || (isAuthenticated && user?.bonusClaimed)} className="btn-primary pulse-glow heartbeat">
                      {claimBonus.isPending ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-star mr-2"></i>}
                      {isAuthenticated && user?.bonusClaimed ? "Bonus Claimed" : "Claim Now"}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                  <Button onClick={handleGetStarted} className="btn-primary text-lg px-8 py-4 hover:scale-105 transition-all"> <i className="fas fa-rocket mr-2"></i>Get Started Free</Button>
                  <Link href="/services"><Button variant="outline" className="btn-outline text-lg px-8 py-4 hover:scale-105 transition-all"><i className="fas fa-eye mr-2"></i>View Services</Button></Link>
                </div>

                <div className="flex justify-center mb-12">
                  <Button onClick={() => { if (!isAuthenticated) setIsAuthModalOpen(true); else setLocation("/referrals"); }} className="premium-discount-button group relative overflow-hidden text-2xl px-20 py-8 rounded-3xl hover:scale-110 transition-all duration-500" style={{ width: 'fit-content', minWidth: '450px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)', backgroundSize: '400% 400%', border: '4px solid transparent', boxShadow: '0 15px 35px rgba(102, 126, 234, 0.6), 0 5px 15px rgba(0, 0, 0, 0.12)', animation: 'gradientShift 3s ease infinite, pulseGlow 2s ease-in-out infinite alternate' }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    <div className="relative z-10 flex items-center justify-center"><i className="fas fa-star mr-4 text-3xl animate-spin-slow text-yellow-300"></i><span className="font-black text-white drop-shadow-lg">Get 50% Flat Discount</span><i className="fas fa-gift ml-4 text-3xl animate-bounce text-pink-300"></i></div>
                  </Button>
                </div>
              </div>
            </div>

            {/* Features Grid - RESTORED */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="bg-charcoal border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-gold/20 to-tan/20 rounded-full flex items-center justify-center mb-4"><i className="fas fa-users text-gold text-2xl"></i></div>
                <h3 className="text-xl font-bold text-gold mb-2">Real Followers</h3>
                <p className="text-cream/80">High-quality Indian and international followers starting from ₹24/1000</p>
                <div className="mt-3 flex items-center gap-1"><i className="fas fa-star text-gold text-sm"></i><i className="fas fa-star text-gold text-sm"></i><i className="fas fa-star text-gold text-sm"></i><i className="fas fa-star text-gold text-sm"></i><i className="fas fa-star text-gold text-sm"></i><span className="text-cream/60 text-xs ml-2">4.9/5 (12K reviews)</span></div>
              </div>
              <div className="bg-charcoal border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-gold/20 to-tan/20 rounded-full flex items-center justify-center mb-4"><i className="fas fa-heart text-gold text-2xl"></i></div>
                <h3 className="text-xl font-bold text-gold mb-2">Instant Likes</h3>
                <p className="text-cream/80">Boost engagement with authentic likes starting from ₹12/1000</p>
                <div className="mt-3 flex items-center gap-1"><i className="fas fa-star text-gold text-sm"></i><i className="fas fa-star text-gold text-sm"></i><i className="fas fa-star text-gold text-sm"></i><i className="fas fa-star text-gold text-sm"></i><i className="fas fa-star-half-alt text-gold text-sm"></i><span className="text-cream/60 text-xs ml-2">4.8/5 (8K reviews)</span></div>
              </div>
              <div className="bg-charcoal border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-gold/20 to-tan/20 rounded-full flex items-center justify-center mb-4"><i className="fas fa-eye text-gold text-2xl"></i></div>
                <h3 className="text-xl font-bold text-gold mb-2">Video Views</h3>
                <p className="text-cream/80">Increase video reach with premium views starting from ₹11/1000</p>
                <div className="mt-3 flex items-center gap-1"><i className="fas fa-star text-gold text-sm"></i><i className="fas fa-star text-gold text-sm"></i><i className="fas fa-star text-gold text-sm"></i><i className="fas fa-star text-gold text-sm"></i><i className="fas fa-star text-gold text-sm"></i><span className="text-cream/60 text-xs ml-2">5.0/5 (15K reviews)</span></div>
              </div>
              <div className="bg-charcoal border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-gold/20 to-tan/20 rounded-full flex items-center justify-center mb-4"><i className="fas fa-comments text-gold text-2xl"></i></div>
                <h3 className="text-xl font-bold text-gold mb-2">Comments</h3>
                <p className="text-cream/80">Drive conversations with comments starting from ₹18/1000</p>
                <div className="mt-3 flex items-center gap-1"><i className="fas fa-star text-gold text-sm"></i><i className="fas fa-star text-gold text-sm"></i><i className="fas fa-star text-gold text-sm"></i><i className="fas fa-star text-gold text-sm"></i><i className="fas fa-star text-gold text-sm"></i><span className="text-cream/60 text-xs ml-2">4.9/5 (6K reviews)</span></div>
              </div>
            </div>

            {/* Stats Section - RESTORED with more details */}
            <div className="bg-charcoal border border-gold/20 rounded-2xl p-8 text-center mb-12">
              <h2 className="text-3xl font-bold text-gold mb-8">Why Choose InstaBoost Pro? - Trusted by 50K+</h2>
              <div className="grid md:grid-cols-4 gap-8">
                <div><div className="text-4xl font-bold text-gold mb-2">50K+</div><div className="text-cream/70">Happy Customers</div><div className="text-xs text-cream/40 mt-1">India's No.1</div></div>
                <div><div className="text-4xl font-bold text-gold mb-2">2M+</div><div className="text-cream/70">Orders Delivered</div><div className="text-xs text-cream/40 mt-1">Successfully</div></div>
                <div><div className="text-4xl font-bold text-gold mb-2">24/7</div><div className="text-cream/70">Customer Support</div><div className="text-xs text-cream/40 mt-1">Hindi & English</div></div>
                <div><div className="text-4xl font-bold text-gold mb-2">99.9%</div><div className="text-cream/70">Delivery Rate</div><div className="text-xs text-cream/40 mt-1">Guaranteed</div></div>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
                <span className="bg-gold/10 border border-gold/20 rounded-full px-4 py-2 text-gold"><i className="fas fa-check-circle mr-2"></i>Real Indian Followers</span>
                <span className="bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 text-green-400"><i className="fas fa-shield-alt mr-2"></i>100% Safe & Secure</span>
                <span className="bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 text-blue-400"><i className="fas fa-bolt mr-2"></i>Instant Delivery</span>
                <span className="bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 text-purple-400"><i className="fas fa-undo mr-2"></i>30-Day Refill Guarantee</span>
              </div>
            </div>

            {/* Testimonials - RESTORED */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-charcoal border border-gold/10 rounded-xl p-6"><div className="flex items-center gap-1 mb-3"><i className="fas fa-star text-gold"></i><i className="fas fa-star text-gold"></i><i className="fas fa-star text-gold"></i><i className="fas fa-star text-gold"></i><i className="fas fa-star text-gold"></i></div><p className="text-cream/80 text-sm mb-3">"Best SMM panel in India! Real followers, fast delivery. My meme page grew from 1K to 50K in 2 months!"</p><div className="text-cream font-bold text-sm">- @meme_hub_official</div><div className="text-cream/40 text-xs">Verified Buyer - 15K followers</div></div>
              <div className="bg-charcoal border border-gold/10 rounded-xl p-6"><div className="flex items-center gap-1 mb-3"><i className="fas fa-star text-gold"></i><i className="fas fa-star text-gold"></i><i className="fas fa-star text-gold"></i><i className="fas fa-star text-gold"></i><i className="fas fa-star text-gold"></i></div><p className="text-cream/80 text-sm mb-3">"Customer support is amazing! 24/7 reply, even at 2 AM. Refill guarantee really works."</p><div className="text-cream font-bold text-sm">- Priya Sharma</div><div className="text-cream/40 text-xs">Influencer - 100K+ followers</div></div>
              <div className="bg-charcoal border border-gold/10 rounded-xl p-6"><div className="flex items-center gap-1 mb-3"><i className="fas fa-star text-gold"></i><i className="fas fa-star text-gold"></i><i className="fas fa-star text-gold"></i><i className="fas fa-star text-gold"></i><i className="fas fa-star text-gold"></i></div><p className="text-cream/80 text-sm mb-3">"Cheapest and best quality! Started with ₹30, now earning from brand deals. Thank you InstaBoost!"</p><div className="text-cream font-bold text-sm">- Rahul Verma</div><div className="text-cream/40 text-xs">Small creator - 25K followers</div></div>
            </div>
          </div>
        </section>

        <section className="text-center py-12 px-4">
          <h2 className="text-4xl font-bold mb-6 text-gold">Ready to Boost Your Instagram?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-cream/70">Join 50K+ satisfied customers who grew with us</p>
          <div className="mb-8">
            <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold animate-pulse" onClick={() => { if (!isAuthenticated) setIsAuthModalOpen(true); else setLocation("/referrals"); }}><i className="fas fa-gift mr-2"></i>Get 50% Flat Discount<i className="fas fa-arrow-right ml-2"></i></Button>
            <div className="text-sm mt-2 text-green-400 font-semibold animate-bounce">🎁 Refer 5 Friends & Save Big! Limited Time!</div>
          </div>
          <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600" onClick={() => setIsAuthModalOpen(true)}>Get Started Today - From ₹11 Only</Button>
        </section>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => { setIsAuthModalOpen(false); setIsFromBonus(false); }} isFromBonus={isFromBonus} />
    </>
  );
}
