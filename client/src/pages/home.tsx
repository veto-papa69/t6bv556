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
      toast({ title: "Referral Link Detected!", description: "Sign up now!" });
    }
  }, [toast]);

  const handleClaimBonus = async () => {
    if (!isAuthenticated) { setIsFromBonus(true); setIsAuthModalOpen(true); return; }
    if (user?.bonusClaimed) { toast({ title: "Already Claimed", variant: "destructive" }); return; }
    try { await claimBonus.mutateAsync(); toast({ title: "Bonus Claimed!", description: "₹10 added!" }); }
    catch { toast({ title: "Error", variant: "destructive" }); }
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
                <img src="https://files.catbox.moe/95hr3x.png" alt="Logo" className="w-32 h-32 mx-auto mb-6 object-contain" />
                <h1 className="text-4xl md:text-6xl font-bold text-gold mb-6 leading-tight">Boost Your Social Media<br /><span className="text-cream">Instantly</span></h1>
                <p className="text-xl md:text-2xl text-cream/80 mb-8 max-w-3xl mx-auto">Get premium followers, likes, views, and comments at competitive prices starting from ₹11/1000</p>
                <div className="inline-block bg-charcoal/90 backdrop-blur-sm border border-gold/30 rounded-2xl p-8 mb-8 shadow-2xl">
                  <div className="text-center">
                    <i className="fas fa-gift text-gold text-5xl mb-4 block"></i>
                    <h3 className="text-2xl font-bold text-gold mb-2">Welcome Bonus</h3>
                    <p className="text-cream/80 mb-4 text-lg">Claim your free followers now!</p>
                    <Button onClick={handleClaimBonus} disabled={claimBonus.isPending || (isAuthenticated && user?.bonusClaimed)} className="btn-primary">Claim Now</Button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                  <Button onClick={handleGetStarted} className="btn-primary text-lg px-8 py-4"><i className="fas fa-rocket mr-2"></i>Get Started Free</Button>
                  <Link href="/services"><Button variant="outline" className="btn-outline text-lg px-8 py-4"><i className="fas fa-eye mr-2"></i>View Services</Button></Link>
                </div>
                <div className="flex justify-center mb-12">
                  <Button onClick={() => { if (!isAuthenticated) setIsAuthModalOpen(true); else setLocation("/referrals"); }} className="text-2xl px-20 py-8 rounded-3xl" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minWidth: '400px' }}>Get 50% Flat Discount</Button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="bg-charcoal border border-gold/20 rounded-xl p-6 hover:border-gold/40 hover:scale-105 transition-all"><div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-4"><i className="fas fa-users text-gold text-2xl"></i></div><h3 className="text-xl font-bold text-gold mb-2">Real Followers</h3><p className="text-cream/80">High-quality followers from ₹24/1000</p><div className="mt-2 text-gold text-sm">⭐ 4.9/5 (12K reviews)</div></div>
              <div className="bg-charcoal border border-gold/20 rounded-xl p-6 hover:border-gold/40 hover:scale-105 transition-all"><div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-4"><i className="fas fa-heart text-gold text-2xl"></i></div><h3 className="text-xl font-bold text-gold mb-2">Instant Likes</h3><p className="text-cream/80">Likes from ₹12/1000</p><div className="mt-2 text-gold text-sm">⭐ 4.8/5 (8K reviews)</div></div>
              <div className="bg-charcoal border border-gold/20 rounded-xl p-6 hover:border-gold/40 hover:scale-105 transition-all"><div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-4"><i className="fas fa-eye text-gold text-2xl"></i></div><h3 className="text-xl font-bold text-gold mb-2">Video Views</h3><p className="text-cream/80">Views from ₹11/1000</p><div className="mt-2 text-gold text-sm">⭐ 5.0/5 (15K reviews)</div></div>
              <div className="bg-charcoal border border-gold/20 rounded-xl p-6 hover:border-gold/40 hover:scale-105 transition-all"><div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-4"><i className="fas fa-comments text-gold text-2xl"></i></div><h3 className="text-xl font-bold text-gold mb-2">Comments</h3><p className="text-cream/80">Comments from ₹18/1000</p><div className="mt-2 text-gold text-sm">⭐ 4.9/5 (6K reviews)</div></div>
            </div>

            <div className="bg-charcoal border border-gold/20 rounded-2xl p-8 text-center">
              <h2 className="text-3xl font-bold text-gold mb-8">Why Choose InstaBoost Pro? - Trusted by 50K+</h2>
              <div className="grid md:grid-cols-4 gap-8">
                <div><div className="text-4xl font-bold text-gold mb-2">50K+</div><div className="text-cream/70">Happy Customers</div></div>
                <div><div className="text-4xl font-bold text-gold mb-2">2M+</div><div className="text-cream/70">Orders Delivered</div></div>
                <div><div className="text-4xl font-bold text-gold mb-2">24/7</div><div className="text-cream/70">Support</div></div>
                <div><div className="text-4xl font-bold text-gold mb-2">99.9%</div><div className="text-cream/70">Delivery Rate</div></div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => { setIsAuthModalOpen(false); setIsFromBonus(false); }} isFromBonus={isFromBonus} />
    </>
  );
}
