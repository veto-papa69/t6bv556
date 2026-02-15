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
}

export default function Referrals() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { data: referralData, isLoading, error, refetch } = useQuery({
    queryKey: ['referrals'],
    queryFn: async () => {
      const response = await fetch('/api/referrals/my', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch referral data');
      }
      const data = await response.json();
      console.log('📋 Referral data received:', data);
      return data;
    },
    enabled: !!user,
    retry: 3,
    retryDelay: 1000
  });

  const claimRewardMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/referrals/claim-reward", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to claim reward");
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to claim reward. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Show auth modal immediately if not authenticated
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

  const handleClaimReward = () => {
    claimRewardMutation.mutate();
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
                {(referralData?.referralCount || 0) * 20}% Progress to Reward
              </div>
            </div>

            <div className="bg-charcoal border-2 border-green-400/30 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="flex items-center justify-center mb-4">
                <i className="fas fa-target text-3xl text-green-400 mr-3"></i>
                <span className="text-4xl font-bold text-green-400">
                  {5 - (referralData?.referralCount || 0) > 0 ? 5 - (referralData?.referralCount || 0) : 0}
                </span>
              </div>
              <div className="text-lg text-cream font-semibold mb-2">Referrals Needed</div>
              <div className="text-green-400 font-medium text-sm">
                {(referralData?.referralCount || 0) >= 5 ? "🎯 Goal Achieved!" : "Keep Going!"}
              </div>
            </div>

            <div className="bg-charcoal border-2 border-purple-400/30 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="flex items-center justify-center mb-4">
                <i className="fas fa-percentage text-3xl text-purple-400 mr-3"></i>
                <span className="text-4xl font-bold text-purple-400">50</span>
              </div>
              <div className="text-lg text-cream font-semibold mb-2">Discount Reward</div>
              <div className="text-purple-400 font-medium text-sm">
                {(referralData?.referralCount || 0) >= 5 ? "🎁 Unlocked!" : "So Close!"}
              </div>
            </div>
          </div>

          {/* Progress Bar Section */}
          <div className="bg-charcoal border border-gold/20 rounded-2xl p-10 mb-16 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-gold flex items-center">
                <i className="fas fa-chart-line mr-3"></i>
                Your Referral Journey
              </h3>
              <span className="text-cream text-2xl font-bold bg-charcoal-dark px-6 py-3 rounded-full border border-gold/20">
                {referralData?.referralCount || 0}/5
              </span>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="relative mb-20">
              <div className="w-full bg-charcoal-dark rounded-full h-6 shadow-inner border border-gray-600">
                <div 
                  className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 h-6 rounded-full transition-all duration-1000 ease-out relative overflow-hidden shadow-lg"
                  style={{ width: `${((referralData?.referralCount || 0) / 5) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent animate-pulse"></div>
                </div>
              </div>

              {/* Milestone Markers */}
              <div className="relative mt-4">
                <div className="flex justify-between items-start">
                  {[1, 2, 3, 4, 5].map((milestone) => (
                    <div 
                      key={milestone}
                      className="flex flex-col items-center text-center"
                      style={{ width: '20%' }}
                    >
                      {/* Circle */}
                      <div 
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-3 transition-all duration-500 mb-3 ${
                          (referralData?.referralCount || 0) >= milestone
                            ? 'bg-green-500 border-green-300 text-white shadow-lg scale-110'
                            : 'bg-charcoal-dark border-gray-500 text-gray-400'
                        }`}
                      >
                        {(referralData?.referralCount || 0) >= milestone ? (
                          <i className="fas fa-check text-sm"></i>
                        ) : (
                          <span className="text-xs font-bold">{milestone}</span>
                        )}
                      </div>

                      {/* Milestone Labels */}
                      <div className={`text-xs font-semibold px-2 leading-tight ${(referralData?.referralCount || 0) >= milestone ? 'text-green-400' : 'text-gray-500'}`}>
                        {milestone === 1 && (
                          <div className="flex flex-col items-center">
                            <span>🎯</span>
                            <span>First Friend</span>
                          </div>
                        )}
                        {milestone === 2 && (
                          <div className="flex flex-col items-center">
                            <span>⚡</span>
                            <span>Building</span>
                            <span>Momentum</span>
                          </div>
                        )}
                        {milestone === 3 && (
                          <div className="flex flex-col items-center">
                            <span>🔥</span>
                            <span>Halfway</span>
                            <span>Champion</span>
                          </div>
                        )}
                        {milestone === 4 && (
                          <div className="flex flex-col items-center">
                            <span>💎</span>
                            <span>Almost</span>
                            <span>There</span>
                          </div>
                        )}
                        {milestone === 5 && (
                          <div className="flex flex-col items-center">
                            <span>🏆</span>
                            <span>Reward</span>
                            <span>Master</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Motivational Messages */}
            <div className="text-center mt-16">
              {(referralData?.referralCount || 0) === 0 && (
                <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-6">
                  <p className="text-blue-300 text-xl font-medium">🚀 Ready to start? Share your link below and watch the magic happen!</p>
                </div>
              )}
              {(referralData?.referralCount || 0) === 1 && (
                <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-6">
                  <p className="text-green-300 text-xl font-medium">🎉 Excellent! You've got your first referral. Momentum is building!</p>
                </div>
              )}
              {(referralData?.referralCount || 0) === 2 && (
                <div className="bg-purple-500/10 border border-purple-400/30 rounded-xl p-6">
                  <p className="text-purple-300 text-xl font-medium">⭐ You're on fire! Two down, three to go. Keep sharing!</p>
                </div>
              )}
              {(referralData?.referralCount || 0) === 3 && (
                <div className="bg-orange-500/10 border border-orange-400/30 rounded-xl p-6">
                  <p className="text-orange-300 text-xl font-medium">🔥 Incredible progress! You're more than halfway to your reward!</p>
                </div>
              )}
              {(referralData?.referralCount || 0) === 4 && (
                <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-6">
                  <p className="text-yellow-300 text-xl font-medium">💎 SO CLOSE! Just one more friend and you'll unlock 50% off forever!</p>
                </div>
              )}
              {(referralData?.referralCount || 0) >= 5 && (
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/50 rounded-xl p-6">
                  <p className="text-green-300 text-xl font-bold">🏆 CONGRATULATIONS! You're now a Referral Master! 🏆</p>
                </div>
              )}
            </div>
          </div>

          {/* Referral Code Section */}
          <div className="bg-charcoal border border-gold/20 rounded-2xl p-10 mb-16 shadow-xl">
            <h3 className="text-3xl font-bold text-gold mb-8 flex items-center">
              <i className="fas fa-code mr-3"></i>
              Your Referral Code
            </h3>

            {/* Show error state */}
            {error && (
              <div className="text-center mb-8">
                <div className="p-6 rounded-lg border-2 border-red-500/50 bg-red-500/10">
                  <p className="text-red-400 font-semibold">
                    {error.message}
                  </p>
                  <Button 
                    onClick={() => refetch()} 
                    className="mt-4 bg-gold text-charcoal hover:bg-gold/90"
                  >
                    <i className="fas fa-redo mr-2"></i>
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {/* Show loading state */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
                <p className="text-cream/70 mt-4">Loading your referral code...</p>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 bg-charcoal-dark border border-gold/20 rounded-xl p-6">
                  <div className="text-cream/70 text-lg mb-3 font-medium">
                    Share this referral code:
                  </div>
                  <div className="text-cream font-mono text-2xl break-all bg-black/30 p-6 rounded-lg border text-center">
                    <span className="select-all text-gold font-bold">
                      {referralData?.referralCode || "REF-LOADING-CODE"}
                    </span>
                  </div>
                  <div className="text-cream/50 text-sm mt-3 text-center">
                    Friends can use this code during registration
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    if (referralData?.referralCode) {
                      navigator.clipboard.writeText(referralData.referralCode);
                      setCopiedLink(true);
                      toast({
                        title: "Code Copied!",
                        description: "Referral code copied to clipboard",
                      });
                      setTimeout(() => setCopiedLink(false), 3000);
                    }
                  }}
                  className={`btn-primary text-xl px-10 py-6 self-start lg:self-center whitespace-nowrap transform hover:scale-105 transition-all duration-300 ${copiedLink ? 'bg-green-500 hover:bg-green-600' : ''}`}
                  disabled={!referralData?.referralCode}
                >
                  <i className={`fas ${copiedLink ? 'fa-check' : 'fa-copy'} mr-3 text-xl`}></i>
                  {copiedLink ? 'Copied!' : 'Copy Code'}
                </Button>
              </div>
            )}
          </div>

          {/* How it Works */}
          <div className="bg-charcoal border border-gold/20 rounded-2xl p-10 mb-16 shadow-xl">
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
                {/* Celebration Effects */}
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
