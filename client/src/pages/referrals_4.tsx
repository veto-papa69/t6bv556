import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { data: referralData, isLoading, refetch } = useQuery<ReferralData>({
    queryKey: ["/api/referrals/my"],
    queryFn: async () => {
      const res = await fetch("/api/referrals/my", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
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
      toast({ title: "इनाम क्लेम हो गया! 🎉", description: "अब 50% लाइफटाइम छूट मिलेगी!" });
      queryClient.invalidateQueries({ queryKey: ["/api/referrals/my"] });
      refetch();
    },
    onError: (e:any) => { toast({ title: "Error", description: e.message, variant: "destructive" }); },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 pb-8 flex items-center justify-center px-4" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="bg-charcoal border border-gold/20 rounded-2xl p-8 max-w-md w-full text-center">
          <i className="fas fa-lock text-gold text-6xl mb-6 block"></i>
          <h2 className="text-2xl font-bold text-gold mb-4">Login Required</h2>
          <p className="text-cream/70 mb-6">Referral program access ke liye login karo</p>
          <Button onClick={() => setIsAuthModalOpen(true)} className="btn-primary">Login Now</Button>
        </div>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="text-center"><i className="fas fa-spinner fa-spin text-gold text-4xl mb-4 block"></i><p className="text-cream/70">लोड हो रहा है...</p></div>
      </div>
    );
  }

  const referralCode = referralData?.referralCode || "REF-XXXX";
  const referralLink = referralData?.referralLink || `${window.location.origin}?ref=${referralCode}`;
  
  // Beautiful inline share text for WhatsApp, Telegram, Insta etc
  const shareMessage = `🚀 *InstaBoost Pro - भारत का नंबर 1 SMM पैनल!* 🇮🇳\n\n💎 रियल फॉलोअर्स सिर्फ ₹11/1000 से शुरू!\n🎁 मेरे लिंक से ज्वाइन करो और पाओ ₹10 बोनस + 50% तक छूट!\n\n👉 मेरा रेफरल लिंक: ${referralLink}\n🔑 रेफरल कोड: ${referralCode}\n\n✨ 50K+ खुश ग्राहक | 99.9% डिलीवरी | 24/7 सपोर्ट\n\n#InstaBoostPro #InstagramGrowth #RealFollowers`;
  const shareMessageShort = `InstaBoost Pro ज्वाइन करो! रियल फॉलोअर्स ₹11/1000 से! मेरे लिंक से बोनस पाओ: ${referralLink} - कोड: ${referralCode}`;
  const shareMessageEnglish = `Join InstaBoost Pro - India's No.1 SMM Panel! Real followers from ₹11/1000! Use my link and get bonus: ${referralLink} - Code: ${referralCode}`;

  const copyCode = async () => {
    await navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    toast({ title: "कॉपी हो गया! ✅", description: `कोड ${referralCode} कॉपी हो गया` });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast({ title: "लिंक कॉपी! ✅", description: "रेफरल लिंक कॉपी हो गया" });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareMessageShort)}`;
  const instagramText = shareMessageShort;

  return (
    <>
      <div className="min-h-screen pt-28 pb-16 px-4" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gold mb-4">🎯 रेफरल प्रोग्राम - 50% छूट पाओ!</h1>
            <p className="text-xl text-cream/70 mb-4">5 दोस्तों को इनवाइट करो और पाओ 50% लाइफटाइम छूट!</p>
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-5 py-2">
              <i className="fas fa-fire text-gold"></i>
              <span className="text-gold font-semibold text-sm">5 रेफरल = 50% OFF हमेशा के लिए!</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-charcoal border border-gold/20 rounded-2xl p-5 text-center">
              <div className="text-3xl font-bold text-gold">{referralData?.referralCount || 0}/5</div>
              <div className="text-sm text-cream/70 mt-1">रेफरल पूरे</div>
              <div className="mt-3 h-2 bg-charcoal-dark rounded-full overflow-hidden"><div className="h-full bg-gold transition-all" style={{ width: `${Math.min(100, ((referralData?.referralCount||0)/5)*100)}%` }}></div></div>
            </div>
            <div className="bg-charcoal border border-gold/20 rounded-2xl p-5 text-center">
              <div className="text-3xl font-bold text-gold">50%</div>
              <div className="text-sm text-cream/70 mt-1">लाइफटाइम छूट</div>
              <div className="text-xs text-gold mt-2">इनाम</div>
            </div>
            <div className="bg-charcoal border border-gold/20 rounded-2xl p-5 text-center">
              <div className="text-lg font-bold text-gold">{referralData?.hasClaimedDiscount ? "क्लेम ✅" : referralData?.isEligibleForDiscount ? "तैयार! 🎉" : "बाकी"}</div>
              <div className="text-sm text-cream/70 mt-1">स्थिति</div>
            </div>
          </div>

          {/* BOTH - Referral Code + Referral Link - Dark Theme matching website */}
          <div className="bg-charcoal border border-gold/20 rounded-2xl p-6 md:p-8 mb-8">
            <h3 className="text-2xl font-bold text-gold mb-6 text-center"><i className="fas fa-share-alt mr-2"></i>शेयर करो और कमाओ!</h3>
            
            {/* Referral Code Section */}
            <div className="bg-charcoal-dark border border-gold/10 rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-cream/60 text-sm flex items-center gap-2"><i className="fas fa-key text-gold"></i>तुम्हारा रेफरल कोड (कोड कॉपी करने के लिए):</label>
                <Badge className="bg-gold/20 text-gold text-xs">कोड</Badge>
              </div>
              <div className="flex flex-col md:flex-row gap-3 items-center">
                <div className="flex-1 bg-main-bg border border-gold/20 rounded-xl p-4 text-center w-full" style={{ backgroundColor: 'var(--main-bg)' }}>
                  <p className="text-gold font-mono text-2xl font-black tracking-widest">{referralCode}</p>
                </div>
                <Button onClick={copyCode} className={`${copiedCode ? 'bg-green-600' : 'btn-primary'} w-full md:w-auto whitespace-nowrap px-8 py-6`}>
                  <i className={`fas ${copiedCode ? 'fa-check' : 'fa-copy'} mr-2`}></i>{copiedCode ? 'कॉपी हो गया!' : 'कोड कॉपी करो'}
                </Button>
              </div>
              <p className="text-xs text-cream/40 mt-2">दोस्त signup करते समय ये कोड डालेंगे</p>
            </div>

            {/* Referral Link Section */}
            <div className="bg-charcoal-dark border border-gold/10 rounded-xl p-5 mb-8">
              <div className="flex items-center justify-between mb-3">
                <label className="text-cream/60 text-sm flex items-center gap-2"><i className="fas fa-link text-gold"></i>तुम्हारा रेफरल लिंक (लिंक शेयर करने के लिए):</label>
                <Badge className="bg-blue-500/20 text-blue-400 text-xs">लिंक</Badge>
              </div>
              <div className="flex flex-col md:flex-row gap-3 items-center">
                <div className="flex-1 bg-main-bg border border-gold/20 rounded-xl p-4 w-full overflow-hidden" style={{ backgroundColor: 'var(--main-bg)' }}>
                  <p className="text-cream font-mono text-sm truncate">{referralLink}</p>
                </div>
                <Button onClick={copyLink} className={`${copiedLink ? 'bg-green-600' : 'bg-gold text-black hover:bg-yellow-600'} w-full md:w-auto whitespace-nowrap px-8 py-6 font-bold`}>
                  <i className={`fas ${copiedLink ? 'fa-check' : 'fa-link'} mr-2`}></i>{copiedLink ? 'लिंक कॉपी!' : 'लिंक कॉपी करो'}
                </Button>
              </div>
              <p className="text-xs text-cream/40 mt-2">इस लिंक से कोई भी signup करेगा तो तुम्हें काउंट मिलेगा</p>
            </div>

            {/* Share Buttons - WhatsApp, Telegram, Insta, Copy */}
            <div>
              <h4 className="text-cream font-bold mb-4 text-center"><i className="fas fa-share mr-2 text-gold"></i>Direct Share करो - एक क्लिक में!</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="group bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-xl text-center transition-all hover:scale-105 shadow-lg border border-white/10">
                  <i className="fab fa-whatsapp text-3xl mb-2 block group-hover:scale-110 transition-transform"></i>
                  <div className="text-sm font-bold">WhatsApp</div>
                  <div className="text-xs opacity-90">पर शेयर करो</div>
                  <div className="text-[10px] mt-1 bg-black/20 rounded-full px-2 py-0.5 inline-block">सबसे आसान</div>
                </a>
                <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="group bg-[#0088cc] hover:bg-[#006699] text-white p-4 rounded-xl text-center transition-all hover:scale-105 shadow-lg border border-white/10">
                  <i className="fab fa-telegram text-3xl mb-2 block group-hover:scale-110 transition-transform"></i>
                  <div className="text-sm font-bold">Telegram</div>
                  <div className="text-xs opacity-90">पर शेयर करो</div>
                  <div className="text-[10px] mt-1 bg-black/20 rounded-full px-2 py-0.5 inline-block">तेज़ शेयर</div>
                </a>
                <button onClick={() => { navigator.clipboard.writeText(instagramText); toast({ title: "Insta के लिए कॉपी! ✅", description: "अब Instagram Bio/Story में पेस्ट करो" }); }} className="group bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white p-4 rounded-xl text-center transition-all hover:scale-105 shadow-lg border border-white/10">
                  <i className="fab fa-instagram text-3xl mb-2 block group-hover:scale-110 transition-transform"></i>
                  <div className="text-sm font-bold">Instagram</div>
                  <div className="text-xs opacity-90">के लिए कॉपी</div>
                  <div className="text-[10px] mt-1 bg-black/20 rounded-full px-2 py-0.5 inline-block">Bio/Story</div>
                </button>
                <button onClick={copyLink} className="group bg-charcoal-dark hover:bg-gold/20 border border-gold/30 text-gold p-4 rounded-xl text-center transition-all hover:scale-105 shadow-lg">
                  <i className="fas fa-copy text-3xl mb-2 block group-hover:scale-110 transition-transform"></i>
                  <div className="text-sm font-bold">लिंक कॉपी</div>
                  <div className="text-xs opacity-80">कहीं भी शेयर</div>
                  <div className="text-[10px] mt-1 bg-gold/20 rounded-full px-2 py-0.5 inline-block">All Apps</div>
                </button>
              </div>
            </div>

            {/* Inline Share Text Preview */}
            <div className="mt-8 bg-main-bg border border-gold/10 rounded-xl p-4" style={{ backgroundColor: 'var(--main-bg)' }}>
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-gold font-bold text-sm"><i className="fas fa-eye mr-2"></i>Share करने पर ऐसा दिखेगा (Preview):</h5>
                <span className="text-xs text-cream/40">WhatsApp/Telegram पर</span>
              </div>
              <div className="bg-charcoal rounded-lg p-3 text-sm text-cream/80 whitespace-pre-wrap font-mono leading-relaxed border border-gold/5">
                {`🚀 *InstaBoost Pro - भारत का नंबर 1 SMM पैनल!* 🇮🇳

💎 रियल फॉलोअर्स सिर्फ ₹11/1000 से शुरू!
🎁 मेरे लिंक से ज्वाइन करो और पाओ ₹10 बोनस + 50% तक छूट!

👉 मेरा रेफरल लिंक: ${referralLink}
🔑 रेफरल कोड: ${referralCode}

✨ 50K+ खुश ग्राहक | 99.9% डिलीवरी | 24/7 सपोर्ट`}
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-400/20 rounded-xl">
              <h5 className="text-blue-400 font-bold mb-2 text-sm"><i className="fas fa-lightbulb mr-2"></i>कैसे काम करता है?</h5>
              <ol className="list-decimal list-inside text-cream/60 text-sm space-y-1">
                <li><b className="text-cream">कोड वाला तरीका:</b> दोस्त को कोड <b className="text-gold">{referralCode}</b> दो, वो signup पर डालेगा</li>
                <li><b className="text-cream">लिंक वाला तरीका:</b> लिंक शेयर करो, दोस्त लिंक से signup करेगा तो auto count मिलेगा (ज्यादा आसान!)</li>
                <li>5 दोस्त पूरे होते ही <b className="text-gold">50% लाइफटाइम छूट</b> अनलॉक!</li>
              </ol>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-charcoal border border-gold/10 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-gold mb-6 text-center">कैसे काम करता है?</h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div><div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center mx-auto mb-3 text-black font-bold">1</div><h4 className="text-cream font-bold">लिंक/कोड शेयर करो</h4><p className="text-cream/50 text-sm mt-1">WhatsApp, Insta, Telegram पर</p></div>
              <div><div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold">2</div><h4 className="text-cream font-bold">दोस्त ज्वाइन करें</h4><p className="text-cream/50 text-sm mt-1">5 दोस्त तुम्हारे लिंक/कोड से</p></div>
              <div><div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold">3</div><h4 className="text-cream font-bold">50% छूट पाओ</h4><p className="text-cream/50 text-sm mt-1">लाइफटाइम के लिए!</p></div>
            </div>
          </div>

          {referralData?.isEligibleForDiscount && !referralData?.hasClaimedDiscount && (
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-gold/20 to-orange-500/20 border-2 border-gold/50 rounded-2xl p-8">
                <h3 className="text-3xl font-bold text-gold mb-4">🏆 मिशन पूरा! 5 रेफरल हो गए! 🏆</h3>
                <Button onClick={() => claimRewardMutation.mutate()} disabled={claimRewardMutation.isPending} className="btn-primary text-xl px-12 py-6">
                  {claimRewardMutation.isPending ? "क्लेम हो रहा..." : "🎉 50% लाइफटाइम छूट क्लेम करो!"}
                </Button>
              </div>
            </div>
          )}

          {referralData?.hasClaimedDiscount && (
            <div className="text-center mb-8">
              <div className="bg-green-500/10 border-2 border-green-400/50 rounded-2xl p-8">
                <i className="fas fa-check-circle text-green-400 text-6xl mb-4 block"></i>
                <h3 className="text-2xl font-bold text-green-400 mb-4">इनाम क्लेम हो गया! 🎉</h3>
                <Link href="/services-discount"><Button className="bg-green-600 hover:bg-green-700 text-white px-10 py-5">50% छूट के साथ शॉपिंग करो</Button></Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
