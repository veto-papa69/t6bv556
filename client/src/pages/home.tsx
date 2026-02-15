import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useAuth, useClaimBonus } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const claimBonus = useClaimBonus();
  const { toast } = useToast();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFromBonus, setIsFromBonus] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Check for referral code in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      // Store in sessionStorage for login process
      sessionStorage.setItem('referralCode', refCode);
      // Show message about referral
      toast({
        title: "Referral Link Detected!",
        description: "Sign up now to help your friend get their discount reward!",
      });
    }
  }, [toast]);

  const handleDiscountReferral = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      // Check if user has discount access first
      fetch("/api/referrals/discount-access")
        .then(res => res.json())
        .then(hasAccess => {
          if (hasAccess) {
            // If user has discount access, go to discount services
            window.location.href = "/services-discount";
          } else {
            // If not, go to referrals page to earn discount
            window.location.href = "/referrals";
          }
        })
        .catch(() => {
          // On error, go to referrals page
          window.location.href = "/referrals";
        });
    }
  };

  const handleClaimBonus = async () => {
    if (!isAuthenticated) {
      setIsFromBonus(true);
      setIsAuthModalOpen(true);
      return;
    }

    if (user?.bonusClaimed) {
      toast({
        title: "Bonus Already Claimed",
        description: "You have already claimed your welcome bonus.",
        variant: "destructive",
      });
      return;
    }

    try {
      await claimBonus.mutateAsync();
      toast({
        title: "Bonus Claimed!",
        description: "₹10 has been added to your wallet!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim bonus. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      setLocation("/services");
    }
  };


  return (
    <>
      {/* Sticky Announcement Banner */}
      <div className="fixed top-20 left-0 right-0 z-40 announcement-banner">
        <div className="relative overflow-hidden backdrop-blur-md bg-gradient-to-r from-red-600/20 via-red-500/20 to-red-700/20 border-b border-red-400/30 shadow-lg announcement-glow">
          <div className="flex whitespace-nowrap animate-marquee py-3">
            <span className="text-sm font-bold text-red-100">
              🎉 EID FESTIVAL समाप्त - अब सभी सर्विस की कीमतें बढ़ गई हैं! 🎉 EID FESTIVAL ENDED - ALL SERVICE PRICES HAVE BEEN INCREASED! 🎉 EID FESTIVAL समाप्त - अब सभी सर्विस की कीमतें बढ़ गई हैं! 🎉 EID FESTIVAL ENDED - ALL SERVICE PRICES HAVE BEEN INCREASED! 🎉 EID FESTIVAL समाप्त - अब सभी सर्विस की कीमतें बढ़ गई हैं! 🎉 EID FESTIVAL ENDED - ALL SERVICE PRICES HAVE BEEN INCREASED! 🎉 EID FESTIVAL समाप्त - अब सभी सर्विस की कीमतें बढ़ गई हैं! 🎉 EID FESTIVAL ENDED - ALL SERVICE PRICES HAVE BEEN INCREASED! 🎉
            </span>
            <span className="text-sm font-bold text-red-100 ml-4">
              🎉 EID FESTIVAL समाप्त - अब सभी सर्विस की कीमतें बढ़ गई हैं! 🎉 EID FESTIVAL ENDED - ALL SERVICE PRICES HAVE BEEN INCREASED! 🎉 EID FESTIVAL समाप्त - अब सभी सर्विस की कीमतें बढ़ गई हैं! 🎉 EID FESTIVAL ENDED - ALL SERVICE PRICES HAVE BEEN INCREASED! 🎉 EID FESTIVAL समाप्त - अब सभी सर्विस की कीमतें बढ़ गई हैं! 🎉 EID FESTIVAL ENDED - ALL SERVICE PRICES HAVE BEEN INCREASED! 🎉 EID FESTIVAL समाप्त - अब सभी सर्विस की कीमतें बढ़ गई हैं! 🎉 EID FESTIVAL ENDED - ALL SERVICE PRICES HAVE BEEN INCREASED! 🎉
            </span>
          </div>
        </div>
      </div>

      <div className="pt-32 pb-16">
        {/* Hero Section */}
        <section className="px-4 mb-16">
          <div className="max-w-7xl mx-auto">

            <div 
              className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-charcoal to-charcoal-dark border border-gold/20 mb-16"
              style={{
                background: `linear-gradient(135deg, rgba(18, 38, 32, 0.95), rgba(28, 45, 36, 0.95)), linear-gradient(45deg, rgba(214, 173, 96, 0.1), rgba(214, 173, 96, 0.05))`,
              }}
            >
              <div className="px-8 py-16 md:px-16 md:py-24 text-center">
                <div className="flex items-center justify-center mb-6">
                  <img 
                    src="https://files.catbox.moe/95hr3x.png" 
                    alt="InstaBoost Pro Logo" 
                    className="w-32 h-32 object-contain"
                  />
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-gold mb-6 leading-tight">
                  Boost Your Social Media<br />
                  <span className="text-cream">Instantly</span>
                </h1>

                <p className="text-xl md:text-2xl text-cream/80 mb-8 max-w-3xl mx-auto">
                  Get premium followers, likes, views, and comments at competitive prices starting from ₹11/1000
                </p>

                {/* Welcome Bonus Card */}
                <div className="inline-block bg-charcoal/90 backdrop-blur-sm border border-gold/30 rounded-2xl p-8 mb-8 shadow-2xl bonus-card">
                  <div className="text-center">
                    <div className="bonus-icon mb-4">
                      <i className="fas fa-gift text-gold text-5xl heartbeat"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gold mb-2">Welcome Bonus</h3>
                    <p className="text-cream/80 mb-4 text-lg">Claim your free followers now!</p>
                    <Button 
                      onClick={handleClaimBonus}
                      disabled={claimBonus.isPending || (isAuthenticated && user?.bonusClaimed)}
                      className="btn-primary pulse-glow heartbeat"
                    >
                      {claimBonus.isPending ? (
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                      ) : (
                        <i className="fas fa-star mr-2"></i>
                      )}
                      {isAuthenticated && user?.bonusClaimed ? "Bonus Claimed" : "Claim Now"}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                  <Button 
                    onClick={handleGetStarted}
                    className="btn-primary text-lg px-8 py-4 hover:scale-105 transition-all duration-300"
                  >
                    <i className="fas fa-rocket mr-2"></i>Get Started Free
                  </Button>
                  <Link href="/services">
                    <Button 
                      variant="outline" 
                      className="btn-outline text-lg px-8 py-4 hover:scale-105 transition-all duration-300"
                    >
                      <i className="fas fa-eye mr-2"></i>View Services
                    </Button>
                  </Link>
                </div>

                {/* Premium Discount Referral Button */}
                <div className="flex justify-center mb-12">
                  <Button 
                    onClick={() => window.location.href = "/referrals"}
                    className="premium-discount-button group relative overflow-hidden text-2xl px-20 py-8 rounded-3xl hover:scale-110 transition-all duration-500 transform-gpu"
                    style={{ 
                      width: 'fit-content', 
                      minWidth: '450px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
                      backgroundSize: '400% 400%',
                      border: '4px solid transparent',
                      borderImage: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57) 1',
                      boxShadow: '0 15px 35px rgba(102, 126, 234, 0.6), 0 5px 15px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                      animation: 'gradientShift 3s ease infinite, pulseGlow 2s ease-in-out infinite alternate'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    <div className="relative z-10 flex items-center justify-center">
                      <i className="fas fa-star mr-4 text-3xl animate-spin-slow text-yellow-300"></i>
                      <span className="font-black text-white drop-shadow-lg">
                        Get 50% Flat Discount
                      </span>
                      <i className="fas fa-gift ml-4 text-3xl animate-bounce text-pink-300"></i>
                    </div>
                    <div className="absolute -top-1 -left-1 -right-1 -bottom-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-3xl opacity-75 group-hover:opacity-100 transition-opacity duration-300 -z-10 animate-pulse"></div>
                  </Button>
                </div>

                <style jsx>{`
                  @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                  }

                  @keyframes pulseGlow {
                    0% { box-shadow: 0 15px 35px rgba(102, 126, 234, 0.6), 0 5px 15px rgba(0, 0, 0, 0.12); }
                    100% { box-shadow: 0 20px 40px rgba(102, 126, 234, 0.8), 0 8px 20px rgba(0, 0, 0, 0.15); }
                  }

                  @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }

                  .animate-spin-slow {
                    animation: spin-slow 3s linear infinite;
                  }
                `}</style>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="bg-charcoal border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-gold/20 to-tan/20 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-users text-gold text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gold mb-2">Real Followers</h3>
                <p className="text-cream/80">High-quality Indian and international followers starting from ₹24/1000</p>
              </div>

              <div className="bg-charcoal border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-gold/20 to-tan/20 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-heart text-gold text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gold mb-2">Instant Likes</h3>
                <p className="text-cream/80">Boost engagement with authentic likes starting from ₹12/1000</p>
              </div>

              <div className="bg-charcoal border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-gold/20 to-tan/20 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-eye text-gold text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gold mb-2">Video Views</h3>
                <p className="text-cream/80">Increase video reach with premium views starting from ₹11/1000</p>
              </div>

              <div className="bg-charcoal border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-gold/20 to-tan/20 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-comments text-gold text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gold mb-2">Comments</h3>
                <p className="text-cream/80">Drive conversations with comments starting from ₹18/1000</p>
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-charcoal border border-gold/20 rounded-2xl p-8 text-center">
              <h2 className="text-3xl font-bold text-gold mb-8">Why Choose InstaBoost Pro?</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-4xl font-bold text-gold mb-2">50K+</div>
                  <div className="text-cream/70">Happy Customers</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gold mb-2">24/7</div>
                  <div className="text-cream/70">Customer Support</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gold mb-2">99.9%</div>
                  <div className="text-cream/70">Delivery Rate</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* CTA Section */}
        <section className="text-center py-20">
          <h2 className="text-4xl font-bold mb-6" style={{ color: 'var(--primary-text)' }}>
            Ready to Boost Your Instagram?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--secondary-text)' }}>
            Join thousands of satisfied customers who have grown their Instagram presence with our premium services.
          </p>

          {/* Special Discount CTA */}
          <div className="mb-8">
            <Button 
              size="lg" 
              className="text-lg px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold animate-pulse hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={() => {
                setLocation("/login?ref=campaign");
              }}
            >
              <i className="fas fa-gift mr-2"></i>
              Get 50% Flat Discount
              <i className="fas fa-arrow-right ml-2"></i>
            </Button>
            <div className="text-sm mt-2 text-green-400 font-semibold animate-bounce">
              🎁 Limited Time Offer - Refer 5 Friends & Save Big!
            </div>
          </div>

          <div className="text-sm mb-6" style={{ color: 'var(--secondary-text)' }}>
            Or start with regular pricing:
          </div>

          <Button 
            size="lg" 
            className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={() => setIsAuthModalOpen(true)}
          >
            Get Started Today
          </Button>
        </section>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => {
          setIsAuthModalOpen(false);
          setIsFromBonus(false);
        }}
        isFromBonus={isFromBonus}
      />
    </>
  );
}
