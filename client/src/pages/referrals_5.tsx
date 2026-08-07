import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";
import { Badge } from "@/components/ui/badge";
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
  const queryClient = useQueryClient();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { data: referralData, isLoading, isError } = useQuery<ReferralData>({
    queryKey: ["/api/referrals/my"],
    queryFn: async () => {
      const res = await fetch("/api/referrals/my", { credentials: "include" });
      if (!res.ok) {
        // Fallback data if API fails - prevent blank page
        return { referralCode: user?.referralCode || "REF-DEMO123", referralCount: 0, isEligibleForDiscount: false, hasClaimedDiscount: false, referralLink: `${window.location.origin}?ref=${user?.referralCode || "REF-DEMO123"}` };
      }
      return res.json();
    },
    enabled: isAuthenticated && !!user,
    retry: 1,
  });

  const claimRewardMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/referrals/claim-reward", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" } });
      if (!res.ok) { const e = await res.json().catch(()=>({error:"Failed"})); throw new Error(e.error||"Failed"); }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "इनाम क्लेम हो गया! 🎉", description: "50% छूट अनलॉक हो गई! अब hamburger menu में 50% OFF दिखेगा" });
      queryClient.invalidateQueries({ queryKey: ["/api/referrals/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/referrals/discount-access"] });
    },
    onError: (e:any) => { toast({ title: "Error", description: e.message, variant: "destructive" }); },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 pb-8 flex items-center justify-center px-4" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="bg-charcoal border border-gold/20 rounded-2xl p-8 max-w-md w-full text-center">
          <i className="fas fa-lock text-gold text-6xl mb-6 block"></i>
          <h2 className="text-2xl font-bold text-gold mb-4">Login Required</h2>
          <p className="text-cream/70 mb-6">Referral program ke liye login karo</p>
          <Button onClick={() => setIsAuthModalOpen(true)} className="btn-primary">Login Now</Button>
        </div>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  // Fallback if loading or error - still show UI, not blank
  const referralCode = referralData?.referralCode || user?.referralCode || "REF-DEMO123";
  const referralCount = referralData?.referralCount ?? 0;
  const isEligible = referralData?.isEligibleForDiscount ?? referralCount >= 5;
  const hasClaimed = referralData?.hasClaimedDiscount ?? false;
  const referralLink = referralData?.referralLink || `${window.location.origin}?ref=${referralCode}`;
  
  const shareMessage = `🚀 *InstaBoost Pro - भारत का नंबर 1 SMM पैनल!* 🇮🇳\n\n💎 रियल फॉलोअर्स सिर्फ ₹11/1000 से शुरू!\n🎁 मेरे लिंक से ज्वाइन करो और पाओ ₹10 बोनस + 50% तक छूट!\n\n👉 मेरा रेफरल लिंक: ${referralLink}\n🔑 रेफरल कोड: ${referralCode}\n\n✨ 50K+ खुश ग्राहक | 99.9% डिलीवरी | 24/7 सपोर्ट\n\n#InstaBoostPro`;
  const shareShort = `InstaBoost Pro ज्वाइन करो! रियल फॉलोअर्स ₹11/1000 से! बोनस पाओ: ${referralLink} - कोड: ${referralCode}`;

  const copyCode = async () => {
    await navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    toast({ title: "कोड कॉपी! ✅", description: `${referralCode} कॉपी हो गया` });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast({ title: "लिंक कॉपी! ✅", description: "लिंक कॉपी हो गया, अब WhatsApp/Insta पर शेयर करो" });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareShort)}`;

  if (isLoading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="text-center"><i className="fas fa-spinner fa-spin text-gold text-4xl mb-4 block"></i><p className="text-cream/70">लोड हो रहा है...</p></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen pt-28 pb-16 px-4" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gold mb-4">🎯 रेफरल प्रोग्राम - 50% छूट पाओ!</h1>
            <p className="text-cream/70 mb-2">5 दोस्तों को इनवाइट करो - जब 5 लोग तुम्हारे लिंक/कोड से ज्वाइन करके पहला टॉप-अप (fund add + पहला order) कर लेंगे तो 50% OFF अनलॉक होगा!</p>
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-5 py-2 text-sm"><i className="fas fa-info-circle text-gold"></i><span className="text-gold">Referral तभी पूरा होगा जब दोस्त पहला order place करे</span></div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-charcoal border border-gold/20 rounded-2xl p-5 text-center">
              <div className="text-3xl font-bold text-gold">{referralCount}/5</div>
              <div className="text-sm text-cream/70 mt-1">रेफरल पूरे</div>
              <div className="mt-3 h-2 bg-charcoal-dark rounded-full overflow-hidden"><div className="h-full bg-gold transition-all" style={{ width: `${Math.min(100, (referralCount/5)*100)}%` }}></div></div>
              <div className="text-xs text-cream/40 mt-2">{referralCount >=5 ? "✅ पूरे!" : `${5-referralCount} बाकी`}</div>
            </div>
            <div className="bg-charcoal border border-gold/20 rounded-2xl p-5 text-center">
              <div className="text-3xl font-bold text-gold">50%</div>
              <div className="text-sm text-cream/70 mt-1">लाइफटाइम छूट</div>
              <div className="text-xs text-gold mt-2">हर सर्विस पर</div>
            </div>
            <div className="bg-charcoal border border-gold/20 rounded-2xl p-5 text-center">
              <div className={`text-lg font-bold ${hasClaimed ? 'text-green-400' : isEligible ? 'text-yellow-400' : 'text-cream'}`}>{hasClaimed ? "क्लेम ✅" : isEligible ? "तैयार! 🎉" : "बाकी"}</div>
              <div className="text-sm text-cream/70 mt-1">स्थिति</div>
              <div className="text-xs text-cream/40 mt-2">{hasClaimed ? "Menu में दिखेगा" : "5 पूरे करो"}</div>
            </div>
          </div>

          <div className="bg-charcoal border border-gold/20 rounded-2xl p-6 md:p-8 mb-8">
            <h3 className="text-2xl font-bold text-gold mb-6 text-center"><i className="fas fa-share-alt mr-2"></i>शेयर करो - कोड और लिंक दोनों!</h3>
            
            <div className="bg-charcoal-dark border border-gold/10 rounded-xl p-5 mb-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-cream/60 text-sm flex items-center gap-2"><i className="fas fa-key text-gold"></i>रेफरल कोड - कॉपी करने के लिए:</label>
                <Badge className="bg-gold/20 text-gold text-xs">CODE</Badge>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 bg-main-bg border border-gold/20 rounded-xl p-4 text-center" style={{ backgroundColor: 'var(--main-bg)' }}>
                  <p className="text-gold font-mono text-2xl font-black tracking-widest">{referralCode}</p>
                </div>
                <Button onClick={copyCode} className={`${copiedCode ? 'bg-green-600' : 'btn-primary'} w-full md:w-auto px-8 py-6`}>
                  <i className={`fas ${copiedCode ? 'fa-check' : 'fa-copy'} mr-2`}></i>{copiedCode ? 'कॉपी हो गया!' : 'कोड कॉपी'}
                </Button>
              </div>
            </div>

            <div className="bg-charcoal-dark border border-gold/10 rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-cream/60 text-sm flex items-center gap-2"><i className="fas fa-link text-gold"></i>रेफरल लिंक - डायरेक्ट शेयर के लिए:</label>
                <Badge className="bg-blue-500/20 text-blue-400 text-xs">LINK</Badge>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 bg-main-bg border border-gold/20 rounded-xl p-4 overflow-hidden" style={{ backgroundColor: 'var(--main-bg)' }}>
                  <p className="text-cream font-mono text-sm truncate">{referralLink}</p>
                </div>
                <Button onClick={copyLink} className={`${copiedLink ? 'bg-green-600' : 'bg-gold text-black hover:bg-yellow-600'} w-full md:w-auto px-8 py-6 font-bold`}>
                  <i className={`fas ${copiedLink ? 'fa-check' : 'fa-link'} mr-2`}></i>{copiedLink ? 'लिंक कॉपी!' : 'लिंक कॉपी'}
                </Button>
              </div>
            </div>

            <h4 className="text-cream font-bold mb-4 text-center">Direct Share करो - WhatsApp, Telegram, Insta!</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-xl text-center transition-all hover:scale-105 shadow-lg">
                <i className="fab fa-whatsapp text-3xl mb-2 block"></i>
                <div className="text-sm font-bold">WhatsApp</div>
                <div className="text-xs opacity-90">पर शेयर</div>
                <div className="text-[10px] mt-1 bg-black/20 rounded-full px-2 py-0.5 inline-block">सबसे आसान</div>
              </a>
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="bg-[#0088cc] hover:bg-[#006699] text-white p-4 rounded-xl text-center transition-all hover:scale-105 shadow-lg">
                <i className="fab fa-telegram text-3xl mb-2 block"></i>
                <div className="text-sm font-bold">Telegram</div>
                <div className="text-xs opacity-90">पर शेयर</div>
                <div className="text-[10px] mt-1 bg-black/20 rounded-full px-2 py-0.5 inline-block">तेज़</div>
              </a>
              <button onClick={() => { navigator.clipboard.writeText(shareShort); toast({ title: "Insta के लिए कॉपी!", description: "Bio/Story में पेस्ट करो" }); }} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl text-center hover:scale-105 transition-all shadow-lg">
                <i className="fab fa-instagram text-3xl mb-2 block"></i>
                <div className="text-sm font-bold">Instagram</div>
                <div className="text-xs opacity-90">के लिए कॉपी</div>
                <div className="text-[10px] mt-1 bg-black/20 rounded-full px-2 py-0.5 inline-block">Bio/Story</div>
              </button>
              <button onClick={copyLink} className="bg-charcoal-dark border border-gold/30 text-gold p-4 rounded-xl text-center hover:scale-105 transition-all">
                <i className="fas fa-copy text-3xl mb-2 block"></i>
                <div className="text-sm font-bold">लिंक कॉपी</div>
                <div className="text-xs opacity-80">सभी Apps</div>
              </button>
            </div>

            <div className="bg-main-bg border border-gold/10 rounded-xl p-4" style={{ backgroundColor: 'var(--main-bg)' }}>
              <h5 className="text-gold font-bold text-sm mb-2"><i className="fas fa-eye mr-2"></i>Share पर ऐसा दिखेगा:</h5>
              <div className="bg-charcoal rounded-lg p-3 text-sm text-cream/80 whitespace-pre-wrap font-mono border border-gold/5">{`🚀 *InstaBoost Pro - भारत का नंबर 1 SMM पैनल!* 🇮🇳

💎 रियल फॉलोअर्स ₹11/1000 से!
🎁 मेरे लिंक से ज्वाइन करो ₹10 बोनस + 50% छूट!

👉 लिंक: ${referralLink}
🔑 कोड: ${referralCode}

50K+ ग्राहक | 99.9% डिलीवरी`}</div>
            </div>
          </div>

          <div className="bg-charcoal border border-gold/10 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-gold mb-4 text-center">कैसे काम करता है? - पूरा Logic</h3>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="bg-charcoal-dark rounded-xl p-4"><div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center mx-auto mb-2 text-black font-bold">1</div><h4 className="text-cream font-bold text-sm">शेयर करो</h4><p className="text-cream/50 text-xs mt-1">लिंक या कोड WhatsApp/Insta पर भेजो</p></div>
              <div className="bg-charcoal-dark rounded-xl p-4"><div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold">2</div><h4 className="text-cream font-bold text-sm">दोस्त टॉप-अप करे</h4><p className="text-cream/50 text-xs mt-1">5 दोस्त ज्वाइन + Fund Add + पहला Order = 1 Referral Complete</p></div>
              <div className="bg-charcoal-dark rounded-xl p-4"><div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold">3</div><h4 className="text-cream font-bold text-sm">50% OFF अनलॉक</h4><p className="text-cream/50 text-xs mt-1">5 पूरे होते ही hamburger menu में 50% OFF button आएगा!</p></div>
            </div>
          </div>

          {isEligible && !hasClaimed && (
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-gold/20 to-orange-500/20 border-2 border-gold/50 rounded-2xl p-8">
                <h3 className="text-3xl font-bold text-gold mb-4">🏆 5 रेफरल पूरे! मिशन पूरा! 🏆</h3>
                <p className="text-cream/70 mb-6">अब 50% लाइफटाइम छूट क्लेम करो - इसके बाद ही 50% OFF page खुलेगा!</p>
                <Button onClick={() => claimRewardMutation.mutate()} disabled={claimRewardMutation.isPending} className="btn-primary text-xl px-12 py-6">
                  {claimRewardMutation.isPending ? "क्लेम हो रहा..." : "🎉 50% छूट क्लेम करो - अभी!"}
                </Button>
              </div>
            </div>
          )}

          {hasClaimed && (
            <div className="text-center mb-8">
              <div className="bg-green-500/10 border-2 border-green-400/50 rounded-2xl p-8">
                <i className="fas fa-check-circle text-green-400 text-6xl mb-4 block"></i>
                <h3 className="text-2xl font-bold text-green-400 mb-2">50% OFF अनलॉक हो गया! 🎉</h3>
                <p className="text-cream/70 mb-6">अब hamburger menu (☰) में 50% OFF वाला button दिख रहा है! वहाँ जाके 50% छूट पर ऑर्डर करो</p>
                <Link href="/services-discount"><Button className="bg-green-600 hover:bg-green-700 text-white px-10 py-5 text-lg">50% OFF पेज खोलो - शॉपिंग करो</Button></Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
