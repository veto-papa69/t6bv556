import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

interface Service { id?: string; name: string; category?: string; price?: string; rate?: string|number; minOrder?: number; maxOrder?: number; minQuantity?: number; maxQuantity?: number; }

export default function ServicesDiscount() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [instagramUsername, setInstagramUsername] = useState("");

  const { data: referralData } = useQuery({ queryKey: ["/api/referrals/my"], queryFn: async () => { const r = await fetch("/api/referrals/my", { credentials: "include" }); if (!r.ok) return { hasClaimedDiscount: false, referralCount: 0 }; return r.json(); }, enabled: isAuthenticated });
  const { data: discountAccess } = useQuery({ queryKey: ["/api/referrals/discount-access"], queryFn: async () => { const r = await fetch("/api/referrals/discount-access", { credentials: "include" }); if (!r.ok) return false; return r.json(); }, enabled: isAuthenticated });
  const { data: services = [], isLoading } = useQuery({ queryKey: ["/api/services"], enabled: isAuthenticated });

  const hasAccess = referralData?.hasClaimedDiscount || discountAccess === true;
  const referralCount = referralData?.referralCount || 0;

  const createOrderMutation = useMutation({
    mutationFn: async (d:any) => { const r = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(d) }); if (!r.ok) throw new Error(await r.text()); return r.json(); },
    onSuccess: () => { toast({ title: "Order Placed! 🎉" }); queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] }); setSelectedService(null); },
    onError: (e:any) => { toast({ title: "Failed", description: e.message, variant: "destructive" }); },
  });

  const getRate = (s: Service) => { const raw = s.rate ?? s.price ?? "0"; const n = typeof raw === 'string' ? parseFloat(raw.replace(/[^0-9.]/g, '')) : raw; return isNaN(n as number) ? 0 : (n as number); };
  const getMin = (s: Service) => s.minOrder ?? s.minQuantity ?? 10;
  const getMax = (s: Service) => s.maxOrder ?? s.maxQuantity ?? 1000000;
  const calcPrice = (s: Service, qty: number) => ((getRate(s)*qty/1000)*0.5).toFixed(2);

  if (!isAuthenticated) return <div className="min-h-screen pt-28 flex items-center justify-center" style={{ backgroundColor: 'var(--main-bg)' }}><div className="bg-charcoal border border-gold/20 rounded-2xl p-8 text-center"><p className="text-cream/70">Login required</p></div></div>;

  if (!hasAccess) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="bg-charcoal border-2 border-gold/30 rounded-2xl p-12 text-center">
            <i className="fas fa-lock text-gold text-6xl mb-6 block"></i>
            <h1 className="text-4xl font-bold text-gold mb-4">🔒 50% OFF Locked!</h1>
            <p className="text-cream/70 mb-6">5 referrals complete karo - har referral tabhi count hoga jab dost first top-up + first order kare</p>
            <div className="bg-charcoal-dark rounded-xl p-4 mb-6"><div className="text-3xl font-bold text-gold">{referralCount}/5</div><div className="w-full h-2 bg-charcoal rounded-full mt-2"><div className="h-full bg-gold" style={{ width: `${(referralCount/5)*100}%` }}></div></div></div>
            <Link href="/referrals"><Button className="btn-primary px-8 py-6">रेफरल पेज पर जाओ</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-4" style={{ backgroundColor: 'var(--main-bg)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8"><h1 className="text-4xl font-bold text-gold">Premium Services - 50% OFF!</h1><p className="text-cream/70 mt-2">50% OFF Active - Lifetime!</p></div>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {(services as Service[]).map((s: Service) => (
            <div key={s.name} className={`bg-charcoal border-2 ${selectedService?.name===s.name ? 'border-gold' : 'border-gold/20'} rounded-xl p-6 cursor-pointer hover:border-gold/40`} onClick={()=>{setSelectedService(s); setQuantity(getMin(s));}}>
              <h3 className="text-cream font-bold">{s.name}</h3>
              <div className="flex justify-between mt-3"><span className="text-cream/40 line-through text-sm">₹{getRate(s)}/1000</span><span className="text-gold font-bold">₹{(getRate(s)*0.5).toFixed(2)}/1000</span></div>
              <div className="text-center mt-2"><Badge className="bg-red-500/20 text-yellow-400">50% OFF</Badge></div>
            </div>
          ))}
        </div>
        {selectedService && (
          <div className="bg-charcoal border-2 border-gold/30 rounded-2xl p-6">
            <Input value={instagramUsername} onChange={e=>setInstagramUsername(e.target.value)} placeholder="@username" className="bg-charcoal-dark border-gold/20 text-cream mb-4" />
            <Input type="number" value={quantity} onChange={e=>setQuantity(Number(e.target.value))} className="bg-charcoal-dark border-gold/20 text-cream mb-4" />
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={()=>setSelectedService(null)} className="w-full sm:w-auto sm:flex-1">Cancel</Button>
              <Button onClick={()=>{ const price = (getRate(selectedService)*quantity/1000)*0.5; createOrderMutation.mutate({serviceName:selectedService.name, instagramUsername, quantity, price}); }} className="w-full sm:flex-[2] btn-primary py-6">Place Order - ₹{calcPrice(selectedService, quantity)} (50% OFF)</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
