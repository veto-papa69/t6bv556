import { useState } from "react";
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
  const [copiedCode, setCopiedCode] = useState(false);

  const { data: referralData, isLoading, error, refetch } = useQuery<ReferralData>({
    queryKey: ['/api/referrals/my'],
    queryFn: async () => {
      const response = await fetch('/api/referrals/my', { credentials: "include" });
      if (!response.ok) throw new Error('Failed to fetch referral data');
      return response.json();
    },
    enabled: !!user && isAuthenticated,
    retry: 1,
  });

  const claimRewardMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/referrals/claim-reward", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const err = await response.json().catch(()=>({error:'Failed'}));
        throw new Error(err.error || "Failed to claim reward");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "इनाम क्लेम हो गया! 🎉", description: "अब आपको सभी सर्विस पर 50% लाइफटाइम छूट मिलेगी!" });
      refetch();
    },
    onError: (e:any) => {
      toast({ title: "Error", description: e.message || "Failed to claim reward", variant: "destructive" });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 pb-8" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 text-center py-20">
          <i className="fas fa-lock text-gold text-6xl mb-6"></i>
          <h1 className="text-4xl font-bold text-gold mb-4">लॉगिन जरूरी है</h1>
          <p className="text-xl text-cream/70 mb-8">रेफरल डिस्काउंट पाने के लिए लॉगिन करो</p>
          <button onClick={() => setIsAuthModalOpen(true)} className="btn-primary px-8 py-3 text-lg">अभी लॉगिन करो</button>
        </div>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-28 pb-8 flex items-center justify-center" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="text-center"><i className="fas fa-spinner fa-spin text-gold text-4xl mb-4"></i><p className="text-cream/70">लोड हो रहा है...</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-28 pb-8" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center py-20">
          <h2 className="text-2xl font-bold text-red-400 mb-4">लोड करने में समस्या</h2>
          <Button onClick={()=>refetch()}>दोबारा कोशिश करो</Button>
        </div>
      </div>
    );
  }

  const referralLink = referralData?.referralLink || `${window.location.origin}/?ref=${referralData?.referralCode}`;
  const referralCode = referralData?.referralCode || "";

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast({ title: "कॉपी हो गया! ✅", description: "रेफरल लिंक कॉपी हो गया" });
    setTimeout(()=>setCopiedLink(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    toast({ title: "कोड कॉपी! ✅", description: `रेफरल कोड ${referralCode} कॉपी हो गया` });
    setTimeout(()=>setCopiedCode(false), 2000);
  };

  const shareText = `🚀 InstaBoost Pro - भारत का नंबर 1 SMM पैनल! रियल फॉलोअर्स सिर्फ ₹11 से! मेरे लिंक से ज्वाइन करो और बोनस पाओ: ${referralLink}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('InstaBoost Pro ज्वाइन करो! रियल फॉलोअर्स!')}`;

  return (
    <>
      <div className="min-h-screen pt-32 pb-16 px-4" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gold mb-6">🎯 रेफरल प्रोग्राम - 50% छूट पाओ!</h1>
            <p className="text-2xl text-cream/80 mb-4">5 दोस्तों को इनवाइट करो और सभी सर्विस पर 50% लाइफटाइम छूट अनलॉक करो!</p>
            <div className="bg-gradient-to-r from-gold/20 to-orange-500/20 border border-gold/30 rounded-xl p-4 max-w-md mx-auto">
              <p className="text-gold font-semibold">🚀 लिमिटेड टाइम - अभी शेयर करो!</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-charcoal border-2 border-gold/30 rounded-2xl p-6 text-center">
              <i className="fas fa-users text-3xl text-gold mr-3"></i>
              <span className="text-4xl font-bold text-gold">{referralData?.referralCount || 0}</span>
              <div className="text-lg text-cream font-semibold mt-2">सफल रेफरल</div>
              <div className="text-gold text-sm">{referralData?.referralCount || 0} / 5 पूरे</div>
              <div className="mt-3 w-full bg-charcoal-dark rounded-full h-2"><div className="bg-gold h-2 rounded-full transition-all" style={{ width: `${Math.min(100, ((referralData?.referralCount||0)/5)*100)}%` }}></div></div>
            </div>
            <div className="bg-charcoal border-2 border-gold/30 rounded-2xl p-6 text-center">
              <i className="fas fa-percentage text-3xl text-gold mr-3"></i>
              <span className="text-4xl font-bold text-gold">50%</span>
              <div className="text-lg text-cream font-semibold mt-2">छूट का इनाम</div>
              <div className="text-gold text-sm">5 रेफरल पर लाइफटाइम छूट</div>
            </div>
            <div className="bg-charcoal border-2 border-gold/30 rounded-2xl p-6 text-center">
              <i className="fas fa-trophy text-3xl text-gold mr-3"></i>
              <div className="text-2xl font-bold text-gold">{referralData?.hasClaimedDiscount ? "क्लेम हो गया" : referralData?.isEligibleForDiscount ? "तैयार!" : "बाकी"}</div>
              <div className="text-lg text-cream font-semibold mt-2">इनाम की स्थिति</div>
            </div>
          </div>

          {/* RESTORED: Share Referral Link System - Hindi + Permanent */}
          <div className="bg-charcoal border-2 border-gold/30 rounded-3xl p-8 mb-12">
            <h3 className="text-2xl font-bold text-gold mb-6 text-center"><i className="fas fa-link mr-3"></i>तुम्हारा रेफरल लिंक - शेयर करो!</h3>
            
            <div className="bg-main-bg border border-gold/20 rounded-xl p-4 mb-6" style={{ backgroundColor: 'var(--main-bg)' }}>
              <label className="text-cream/60 text-sm">रेफरल लिंक (दोस्तों को भेजो):</label>
              <div className="flex flex-col md:flex-row gap-3 items-center mt-2">
                <div className="flex-1 bg-charcoal rounded-lg p-3 border border-gold/10 w-full overflow-hidden">
                  <p className="text-cream font-mono text-sm truncate">{referralLink}</p>
                </div>
                <Button onClick={copyLink} className="btn-primary whitespace-nowrap w-full md:w-auto">
                  <i className={`fas ${copiedLink ? 'fa-check' : 'fa-copy'} mr-2`}></i>{copiedLink ? 'कॉपी हो गया!' : 'लिंक कॉपी करो'}
                </Button>
              </div>
            </div>

            <div className="bg-main-bg border border-gold/20 rounded-xl p-4 mb-8" style={{ backgroundColor: 'var(--main-bg)' }}>
              <label className="text-cream/60 text-sm">रेफरल कोड (मैन्युअल एंटर के लिए):</label>
              <div className="flex flex-col md:flex-row gap-3 items-center mt-2">
                <div className="flex-1 bg-charcoal rounded-lg p-3 border border-gold/10 w-full text-center">
                  <p className="text-gold font-mono text-xl font-bold tracking-wider">{referralCode}</p>
                </div>
                <Button onClick={copyCode} variant="outline" className="btn-outline whitespace-nowrap w-full md:w-auto">
                  <i className={`fas ${copiedCode ? 'fa-check' : 'fa-copy'} mr-2`}></i>{copiedCode ? 'कॉपी!' : 'कोड कॉपी'}
                </Button>
              </div>
            </div>

            {/* Share Buttons - RESTORED from v1 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl text-center transition-all hover:scale-105 shadow-lg">
                <i className="fab fa-whatsapp text-2xl mb-1 block"></i>
                <div className="text-sm font-bold">WhatsApp पर शेयर</div>
                <div className="text-xs opacity-80">सबसे आसान</div>
              </a>
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-xl text-center transition-all hover:scale-105 shadow-lg">
                <i className="fab fa-telegram text-2xl mb-1 block"></i>
                <div className="text-sm font-bold">Telegram पर शेयर</div>
                <div className="text-xs opacity-80">तेज़ शेयर</div>
              </a>
              <button onClick={copyLink} className="bg-gold hover:bg-yellow-600 text-black p-4 rounded-xl text-center transition-all hover:scale-105 shadow-lg">
                <i className="fas fa-copy text-2xl mb-1 block"></i>
                <div className="text-sm font-bold">लिंक कॉपी</div>
                <div className="text-xs opacity-80">कहीं भी पेस्ट करो</div>
              </button>
              <Link href="/reward-services" className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl text-center transition-all hover:scale-105 shadow-lg block">
                <i className="fas fa-gift text-2xl mb-1 block"></i>
                <div className="text-sm font-bold">इनाम देखो</div>
                <div className="text-xs opacity-80">50% छूट</div>
              </Link>
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-400/20 rounded-xl">
              <h4 className="text-blue-400 font-bold mb-2"><i className="fas fa-lightbulb mr-2"></i>कैसे शेयर करें? (How to Share):</h4>
              <ol className="list-decimal list-inside text-cream/70 text-sm space-y-1">
                <li>WhatsApp बटन दबाओ - तुम्हारे दोस्तों को मैसेज जाएगा</li>
                <li>या लिंक कॉपी करके Instagram Bio, Story, Group में डालो</li>
                <li>दोस्त तुम्हारे लिंक से signup करेगा तो तुम्हें 1 काउंट मिलेगा</li>
                <li>5 काउंट पूरे होते ही 50% छूट अनलॉक!</li>
              </ol>
            </div>
          </div>

          <div className="bg-charcoal border border-gold/20 rounded-3xl p-8 mb-12">
            <h3 className="text-2xl font-bold text-gold mb-8 text-center">कैसे काम करता है?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center"><div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4 text-black font-bold text-xl">1</div><h4 className="text-cream font-bold mb-2">लिंक शेयर करो</h4><p className="text-cream/60 text-sm">अपना लिंक WhatsApp, Telegram, Instagram पर शेयर करो</p></div>
              <div className="text-center"><div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">2</div><h4 className="text-cream font-bold mb-2">दोस्त ज्वाइन करें</h4><p className="text-cream/60 text-sm">5 दोस्त तुम्हारे लिंक से अकाउंट बनाएंगे</p></div>
              <div className="text-center"><div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">3</div><h4 className="text-cream font-bold mb-2">इनाम पाओ</h4><p className="text-cream/60 text-sm">50% लाइफटाइम छूट पाओ!</p></div>
            </div>
          </div>

          {referralData?.isEligibleForDiscount && !referralData?.hasClaimedDiscount && (
            <div className="text-center mb-12">
              <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border-2 border-yellow-400/50 rounded-3xl p-8">
                <h3 className="text-4xl font-bold text-yellow-400 mb-4">🏆 मिशन पूरा! 🏆</h3>
                <p className="text-cream mb-6">बधाई हो! 5 दोस्तों को रेफर कर दिया। अब इनाम क्लेम करो!</p>
                <Button onClick={()=>claimRewardMutation.mutate()} disabled={claimRewardMutation.isPending} className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black text-xl px-12 py-6 rounded-2xl">
                  {claimRewardMutation.isPending ? "क्लेम हो रहा है..." : "🎉 50% छूट क्लेम करो - लाइफटाइम!"}
                </Button>
              </div>
            </div>
          )}

          {referralData?.hasClaimedDiscount && (
            <div className="text-center mb-12">
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/50 rounded-3xl p-8">
                <i className="fas fa-check-circle text-green-400 text-6xl mb-4"></i>
                <h3 className="text-3xl font-bold text-green-400 mb-4">इनाम क्लेम हो गया! 🎉</h3>
                <Link href="/reward-services"><Button className="bg-green-500 text-white font-bold text-lg px-10 py-6 rounded-2xl">50% छूट के साथ शॉपिंग करो</Button></Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
