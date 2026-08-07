import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function Referrals() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { data: referralData } = useQuery({
    queryKey: ["/api/referrals/my"],
    queryFn: async () => {
      try {
        const r = await fetch("/api/referrals/my", { credentials: "include" });
        if (!r.ok) return { referralCode: user?.referralCode || "REFJG199D", referralCount: 0, isEligibleForDiscount: false, hasClaimedDiscount: false };
        return r.json();
      } catch { return { referralCode: "REFJG199D", referralCount: 0, isEligibleForDiscount: false, hasClaimedDiscount: false }; }
    },
    enabled: isAuthenticated,
  });

  const claimMutation = useMutation({
    mutationFn: async () => { const r = await fetch("/api/referrals/claim-reward", { method: "POST", credentials: "include" }); if (!r.ok) throw new Error("Failed"); return r.json(); },
    onSuccess: () => { toast({ title: "Claimed! 🎉" }); queryClient.invalidateQueries({ queryKey: ["/api/referrals/my"] }); },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center px-4" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="bg-charcoal border border-gold/20 rounded-2xl p-8 text-center"><h2 className="text-gold text-2xl font-bold mb-4">Login Required</h2><Button onClick={()=>setIsAuthModalOpen(true)} className="btn-primary">Login</Button></div>
        <AuthModal isOpen={isAuthModalOpen} onClose={()=>setIsAuthModalOpen(false)} />
      </div>
    );
  }

  const code = referralData?.referralCode || "REFJG199D";
  const count = referralData?.referralCount || 0;
  const link = `${window.location.origin}?ref=${code}`;
  const msg = `InstaBoost Pro - Real followers ₹11/1000! Join via my link: ${link} - Code: ${code}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(msg)}`;
  const tg = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(msg)}`;

  const copyCode = async () => { await navigator.clipboard.writeText(code); setCopiedCode(true); toast({ title: "Code Copied!" }); setTimeout(()=>setCopiedCode(false),2000); };
  const copyLink = async () => { await navigator.clipboard.writeText(link); setCopiedLink(true); toast({ title: "Link Copied!" }); setTimeout(()=>setCopiedLink(false),2000); };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4" style={{ backgroundColor: 'var(--main-bg)' }}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gold text-center mb-8">🎯 Referral Program - 50% OFF</h1>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-charcoal border border-gold/20 rounded-2xl p-5 text-center"><div className="text-3xl font-bold text-gold">{count}/5</div><div className="text-cream/70 text-sm">Referrals</div></div>
          <div className="bg-charcoal border border-gold/20 rounded-2xl p-5 text-center"><div className="text-3xl font-bold text-gold">50%</div><div className="text-cream/70 text-sm">OFF</div></div>
          <div className="bg-charcoal border border-gold/20 rounded-2xl p-5 text-center"><div className="text-gold font-bold">{referralData?.hasClaimedDiscount ? "Claimed ✅" : "Pending"}</div></div>
        </div>
        <div className="bg-charcoal border border-gold/20 rounded-2xl p-6 mb-8">
          <div className="bg-charcoal-dark border border-gold/10 rounded-xl p-5 mb-4">
            <div className="flex justify-between mb-2"><span className="text-cream/60 text-sm">रेफरल कोड</span><Badge className="bg-gold/20 text-gold">CODE</Badge></div>
            <div className="flex gap-3"><div className="flex-1 bg-main-bg border border-gold/20 rounded-xl p-4 text-center" style={{ backgroundColor: 'var(--main-bg)' }}><p className="text-gold font-mono text-2xl font-black">{code}</p></div><Button onClick={copyCode} className="btn-primary px-8 py-6">{copiedCode ? "Copied!" : "कोड कॉपी"}</Button></div>
          </div>
          <div className="bg-charcoal-dark border border-gold/10 rounded-xl p-5 mb-6">
            <div className="flex justify-between mb-2"><span className="text-cream/60 text-sm">रेफरल लिंक - डायरेक्ट शेयर</span><Badge className="bg-blue-500/20 text-blue-400">LINK</Badge></div>
            <div className="flex gap-3"><div className="flex-1 bg-main-bg border border-gold/20 rounded-xl p-4 overflow-hidden" style={{ backgroundColor: 'var(--main-bg)' }}><p className="text-cream text-sm truncate">{link}</p></div><Button onClick={copyLink} className="bg-gold text-black px-8 py-6 font-bold">{copiedLink ? "Copied!" : "लिंक कॉपी"}</Button></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href={wa} target="_blank" className="bg-[#25D366] text-white p-4 rounded-xl text-center hover:scale-105 transition-all"><i className="fab fa-whatsapp text-2xl mb-1 block"></i><div className="font-bold text-sm">WhatsApp</div><div className="text-xs">पर शेयर</div></a>
            <a href={tg} target="_blank" className="bg-[#0088cc] text-white p-4 rounded-xl text-center hover:scale-105 transition-all"><i className="fab fa-telegram text-2xl mb-1 block"></i><div className="font-bold text-sm">Telegram</div><div className="text-xs">पर शेयर</div></a>
            <button onClick={()=>{navigator.clipboard.writeText(msg); toast({title:"Copied for Insta!"})}} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl text-center"><i className="fab fa-instagram text-2xl mb-1 block"></i><div className="font-bold text-sm">Instagram</div></button>
            <button onClick={copyLink} className="bg-charcoal-dark border border-gold/30 text-gold p-4 rounded-xl text-center"><i className="fas fa-copy text-2xl mb-1 block"></i><div className="font-bold text-sm">लिंक कॉपी</div></button>
          </div>
        </div>
        {referralData?.isEligibleForDiscount && !referralData?.hasClaimedDiscount && <div className="text-center"><Button onClick={()=>claimMutation.mutate()} className="btn-primary px-12 py-6 text-xl">🎉 Claim 50% OFF</Button></div>}
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={()=>setIsAuthModalOpen(false)} />
    </div>
  );
}
