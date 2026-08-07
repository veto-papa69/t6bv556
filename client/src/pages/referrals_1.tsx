import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";
import { Link } from "wouter";

interface ReferralData {
  referralCode: string;
  referralCount: number;
  isEligibleForDiscount: boolean;
  hasClaimedDiscount: boolean;
  referralLink?: string;
}

export default function Referrals() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { data: referralData, isLoading, error, refetch } = useQuery<ReferralData>({
    queryKey: ['/api/referrals/my'],
    queryFn: async () => {
      const response = await fetch('/api/referrals/my', {
        credentials: 'include'
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to fetch referral data');
      }
      const data = await response.json();
      console.log('📋 Referral data received:', data);
      return data;
    },
    enabled: !!user && isAuthenticated,
    retry: 1,
  });

  const claimRewardMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/referrals/claim-reward", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const err = await response.json().catch(()=>({error:'Failed'}));
        throw new Error(err.error || "Failed to claim reward");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reward Claimed!",
        description: "You can now enjoy 50% discount on all services!",
      });
      refetch();
    },
    onError: (e:any) => {
      toast({
        title: "Error",
        description: e.message || "Failed to claim reward. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Show auth modal if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 pb-8" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="mb-8">
              <i className="fas fa-lock text-gold text-6xl mb-6"></i>
              <h1 className="text-4xl font-bold text-gold mb-4">Login Required</h1>
              <p className="text-xl text-cream/70 mb-8">Please login with your Instagram account to access referral discounts</p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="btn-primary px-8 py-3 text-lg"
              >
                Login Now
              </button>
            </div>
          </div>
        </div>
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-28 pb-8 flex items-center justify-center" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-gold text-4xl mb-4"></i>
          <p className="text-cream/70">Loading referral data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-28 pb-8" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center py-20">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Failed to load referrals</h2>
          <p className="text-cream/70 mb-6">{(error as any).message}</p>
          <Button onClick={()=>refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  const handleClaimReward = () => {
    claimRewardMutation.mutate();
  };

  const copyLink = () => {
    const link = referralData?.referralLink || `${window.location.origin}/?ref=${referralData?.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
    setTimeout(()=>setCopiedLink(false), 2000);
  };

  return (
    <>
      <div className="min-h-screen pt-28 pb-16 px-4" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gold mb-6">🎯 Referral Program</h1>
            <p className="text-2xl text-cream/80 mb-4">
              Invite 5 friends and unlock 50% discount on all services!
            </p>
            <div className="bg-gradient-to-r from-gold/20 to-orange-500/20 border border-gold/30 rounded-xl p-4 max-w-md mx-auto">
              <p className="text-gold font-semibold">🚀 Limited Time Offer - Start Sharing Today!</p>
            </div>
          </div>

          {/* Achievement Level Badge */}
          <div className="text-center mb-12">
            {(referralData?.referralCount || 0) >= 5 ? (
              <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-full font-bold text-lg animate-pulse shadow-lg max-w-xs mx-auto">
                <i className="fas fa-crown mr-2 text-xl"></i>
                <span className="truncate">MASTER REFERRER</span>
                <i className="fas fa-star ml-2 text-xl"></i>
              </div>
            ) : (referralData?.referralCount || 0) >= 3 ? (
              <div className="inline-flex items-center bg-gradient-to-r from-purple-400 to-pink-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg max-w-xs mx-auto">
                <i className="fas fa-star mr-2"></i>
                <span className="truncate">EXPERT LEVEL</span>
              </div>
            ) : (referralData?.referralCount || 0) >= 1 ? (
              <div className="inline-flex items-center bg-gradient-to-r from-blue-400 to-green-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg max-w-xs mx-auto">
                <i className="fas fa-medal mr-2"></i>
                <span className="truncate">ROOKIE LEVEL</span>
              </div>
            ) : (
              <div className="inline-flex items-center bg-gray-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg max-w-xs mx-auto">
                <i className="fas fa-user mr-2"></i>
                <span className="truncate">BEGINNER</span>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-charcoal border-2 border-gold/30 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="flex items-center justify-center mb-4">
                <i className="fas fa-users text-3xl text-gold mr-3"></i>
                <span className="text-4xl font-bold text-gold">{referralData?.referralCount || 0}</span>
              </div>
              <div className="text-lg text-cream font-semibold mb-2">Successful Referrals</div>
              <div className="text-gold font-medium text-sm">
                {referralData?.referralCount || 0} / 5 completed
              </div>
            </div>

            <div className="bg-charcoal border-2 border-gold/30 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="flex items-center justify-center mb-4">
                <i className="fas fa-percentage text-3xl text-gold mr-3"></i>
                <span className="text-4xl font-bold text-gold">50%</span>
              </div>
              <div className="text-lg text-cream font-semibold mb-2">Discount Reward</div>
              <div className="text-gold font-medium text-sm">
                Lifetime discount unlocked at 5 refs
              </div>
            </div>

            <div className="bg-charcoal border-2 border-gold/30 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="flex items-center justify-center mb-4">
                <i className="fas fa-trophy text-3xl text-gold mr-3"></i>
                <span className="text-2xl font-bold text-gold">{referralData?.hasClaimedDiscount ? "Claimed" : referralData?.isEligibleForDiscount ? "Ready!" : "Pending"}</span>
              </div>
              <div className="text-lg text-cream font-semibold mb-2">Reward Status</div>
              <div className="text-gold font-medium text-sm">
                {referralData?.hasClaimedDiscount ? "Enjoy your discount!" : referralData?.isEligibleForDiscount ? "Claim now!" : "Keep sharing!"}
              </div>
            </div>
          </div>

          {/* Referral Link Section */}
          <div className="bg-charcoal border-2 border-gold/30 rounded-3xl p-8 mb-16">
            <h3 className="text-2xl font-bold text-gold mb-6 text-center">
              <i className="fas fa-link mr-3"></i>Your Referral Link
            </h3>
            
            <div className="bg-main-bg border border-gold/20 rounded-xl p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 bg-charcoal rounded-lg p-3 border border-gold/10 w-full overflow-hidden">
                  <p className="text-cream font-mono text-sm truncate">
                    {referralData?.referralLink || `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${referralData?.referralCode}`}
                  </p>
                </div>
                <Button onClick={copyLink} className="btn-primary whitespace-nowrap">
                  <i className={`fas ${copiedLink ? 'fa-check' : 'fa-copy'} mr-2`}></i>
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </Button>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-cream/60">Referral Code: <span className="font-bold text-gold font-mono">{referralData?.referralCode}</span></p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href={`https://wa.me/?text=${encodeURIComponent(`Join InstaBoost Pro and get amazing Instagram services! Use my referral: ${referralData?.referralLink || ''}`)}`} target="_blank" className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl text-center transition-colors">
                <i className="fab fa-whatsapp text-xl mb-1"></i><div className="text-sm font-semibold">WhatsApp</div>
              </a>
              <a href={`https://t.me/share/url?url=${encodeURIComponent(referralData?.referralLink || '')}&text=${encodeURIComponent('Join InstaBoost Pro!')}`} target="_blank" className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl text-center transition-colors">
                <i className="fab fa-telegram text-xl mb-1"></i><div className="text-sm font-semibold">Telegram</div>
              </a>
              <button onClick={copyLink} className="bg-gold hover:bg-yellow-600 text-black p-3 rounded-xl text-center transition-colors">
                <i className="fas fa-copy text-xl mb-1"></i><div className="text-sm font-semibold">Copy</div>
              </button>
              <Link href="/reward-services" className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl text-center transition-colors block">
                <i className="fas fa-gift text-xl mb-1"></i><div className="text-sm font-semibold">Rewards</div>
              </Link>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-charcoal border border-gold/20 rounded-3xl p-10 mb-16">
            <h3 className="text-3xl font-bold text-gold mb-10 text-center">
              <i className="fas fa-lightbulb mr-3"></i>
              How It Works
            </h3>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-r from-gold to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <span className="text-charcoal font-bold text-2xl">1</span>
                </div>
                <h4 className="text-2xl font-bold text-cream mb-4">Share Your Link</h4>
                <p className="text-cream/70 text-lg leading-relaxed">Copy your unique referral link and share it with friends on social media, WhatsApp, or anywhere!</p>
              </div>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <span className="text-white font-bold text-2xl">2</span>
                </div>
                <h4 className="text-2xl font-bold text-cream mb-4">Friends Join & Use</h4>
                <p className="text-cream/70 text-lg leading-relaxed">When 5 unique friends sign up using your link and create accounts, you get closer to your reward!</p>
              </div>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <span className="text-white font-bold text-2xl">3</span>
                </div>
                <h4 className="text-2xl font-bold text-cream mb-4">Claim Reward</h4>
                <p className="text-cream/70 text-lg leading-relaxed">Unlock permanent 50% discount on all our premium services. Forever!</p>
              </div>
            </div>
          </div>

          {/* Claim Reward Section */}
          {referralData?.isEligibleForDiscount && !referralData?.hasClaimedDiscount && (
            <div className="text-center mb-16">
              <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border-2 border-yellow-400/50 rounded-3xl p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  <div className="absolute top-10 left-10 text-6xl animate-bounce">🎉</div>
                  <div className="absolute top-16 right-20 text-5xl animate-pulse">🎊</div>
                  <div className="absolute bottom-16 left-20 text-5xl animate-bounce delay-300">🎁</div>
                  <div className="absolute bottom-10 right-10 text-6xl animate-pulse delay-500">🏆</div>
                </div>

                <h3 className="text-5xl font-bold text-yellow-400 mb-6 animate-pulse relative z-10">
                  🏆 MISSION ACCOMPLISHED! 🏆
                </h3>
                <p className="text-2xl text-cream mb-10 relative z-10 max-w-2xl mx-auto">
                  Incredible! You've successfully referred 5 friends. Time to claim your exclusive lifetime reward!
                </p>

                <Button 
                  onClick={handleClaimReward}
                  disabled={claimRewardMutation.isPending}
                  className="group relative overflow-hidden bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white font-black text-3xl px-20 py-10 rounded-3xl shadow-2xl hover:scale-110 transition-all duration-500 transform-gpu border-4 border-yellow-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                  <div className="relative z-10 flex items-center">
                    {claimRewardMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-4 text-3xl"></i>
                        Claiming Your Reward...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-trophy mr-4 text-3xl animate-bounce"></i>
                        CLAIM YOUR 50% DISCOUNT FOREVER
                        <i className="fas fa-star ml-4 text-3xl animate-pulse"></i>
                      </>
                    )}
                  </div>
                </Button>
              </div>
            </div>
          )}

          {/* Already Claimed Section */}
          {referralData?.hasClaimedDiscount && (
            <div className="text-center mb-16">
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/50 rounded-3xl p-12 relative overflow-hidden">
                <i className="fas fa-check-circle text-green-400 text-8xl mb-8 animate-pulse"></i>
                <h3 className="text-4xl font-bold text-green-400 mb-6">
                  🎉 REWARD SUCCESSFULLY CLAIMED! 🎉
                </h3>
                <p className="text-2xl text-cream/90 mb-10 max-w-2xl mx-auto">
                  Congratulations! You now have lifetime access to 50% discount on all our premium services!
                </p>
                <div className="bg-green-400/10 border border-green-400/30 rounded-2xl p-6 mb-10 max-w-lg mx-auto">
                  <p className="text-green-300 font-bold text-xl">
                    ✨ Your exclusive discount is automatically applied at checkout
                  </p>
                </div>

                <Link href="/reward-services">
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-2xl px-16 py-8 rounded-2xl hover:scale-105 transition-all duration-300 shadow-xl">
                    <i className="fas fa-shopping-bag mr-4 text-xl"></i>
                    Shop with 50% Discount Now
                    <i className="fas fa-arrow-right ml-4 text-xl"></i>
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
}
