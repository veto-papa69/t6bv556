import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

interface Service { id?: string; _id?: string; name: string; category?: string; price?: string; rate?: string | number; description?: string; minOrder?: number; maxOrder?: number; minQuantity?: number; maxQuantity?: number; }
interface OrderData { serviceName: string; instagramUsername: string; quantity: number; price: number; }

export default function ServicesDiscount() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [instagramUsername, setInstagramUsername] = useState<string>("");

  const { data: referralData } = useQuery({
    queryKey: ["/api/referrals/my"],
    queryFn: async () => { const r = await fetch("/api/referrals/my", { credentials: "include" }); if (!r.ok) return { hasClaimedDiscount: false, isEligibleForDiscount: false, referralCount: 0 }; return r.json(); },
    enabled: isAuthenticated,
  });

  const { data: discountAccess } = useQuery({
    queryKey: ["/api/referrals/discount-access"],
    queryFn: async () => { const r = await fetch("/api/referrals/discount-access", { credentials: "include" }); if (!r.ok) return false; return r.json(); },
    enabled: isAuthenticated,
  });

  const { data: services = [], isLoading } = useQuery({ queryKey: ["/api/services"], enabled: isAuthenticated });

  const hasAccess = referralData?.hasClaimedDiscount || discountAccess === true;
  const referralCount = referralData?.referralCount || 0;

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: OrderData) => {
      const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(orderData) });
      if (!res.ok) { const err = await res.text(); throw new Error(err || "Order failed"); }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Order Placed! 🎉", description: "50% OFF Premium order placed!" });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setSelectedService(null);
      setQuantity(100);
      setInstagramUsername("");
    },
    onError: (e:any) => { toast({ title: "Failed", description: e.message, variant: "destructive" }); },
  });

  const getRate = (s: Service): number => { const raw = s.rate ?? s.price ?? "0"; const num = typeof raw === 'string' ? parseFloat(raw.replace(/[^0-9.]/g, '')) : raw; return isNaN(num as number) ? 0 : (num as number); };
  const getMin = (s: Service): number => s.minOrder ?? s.minQuantity ?? 10;
  const getMax = (s: Service): number => s.maxOrder ?? s.maxQuantity ?? 1000000;

  const handleOrder = () => {
    if (!selectedService || !instagramUsername.trim()) { toast({ title: "Username डालो", variant: "destructive" }); return; }
    const min = getMin(selectedService); const max = getMax(selectedService);
    if (quantity < min || quantity > max) { toast({ title: "Quantity गलत", description: `${min} से ${max} के बीच`, variant: "destructive" }); return; }
    const rate = getRate(selectedService);
    const discountedPrice = (rate * quantity / 1000) * 0.5;
    createOrderMutation.mutate({ serviceName: selectedService.name, instagramUsername: instagramUsername.trim(), quantity, price: discountedPrice });
  };

  const calcPrice = (s: Service, qty: number) => { const r = getRate(s); return ((r * qty / 1000) * 0.5).toFixed(2); };
  const calcOriginal = (s: Service, qty: number) => { const r = getRate(s); return ((r * qty / 1000)).toFixed(2); };
  const calcSave = (s: Service, qty: number) => { const r = getRate(s); return ((r * qty / 1000) * 0.5).toFixed(2); };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 pb-8 flex items-center justify-center px-4" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="bg-charcoal border border-gold/20 rounded-2xl p-8 max-w-md w-full text-center">
          <i className="fas fa-lock text-gold text-6xl mb-6 block"></i>
          <h2 className="text-2xl font-bold text-gold mb-2">Login Required</h2>
          <p className="text-cream/70">50% OFF access ke liye login karo</p>
        </div>
      </div>
    );
  }

  // Access control - if not unlocked, show locked screen
  if (!hasAccess) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="bg-charcoal border-2 border-gold/30 rounded-2xl p-8 md:p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-gold/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-gold/30">
              <i className="fas fa-lock text-gold text-4xl"></i>
            </div>
            <h1 className="text-4xl font-bold text-gold mb-4">🔒 50% OFF Locked!</h1>
            <p className="text-xl text-cream/80 mb-2">यह पेज अभी लॉक है - 5 रेफरल पूरे करो!</p>
            <p className="text-cream/60 mb-8">जब 5 दोस्त तुम्हारे लिंक/कोड से ज्वाइन करके पहला टॉप-अप + पहला ऑर्डर करेंगे, तब यह पेज अनलॉक होगा</p>
            
            <div className="bg-charcoal-dark border border-gold/10 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center"><div className="text-3xl font-bold text-gold">{referralCount}/5</div><div className="text-xs text-cream/60">रेफरल</div></div>
                <div className="text-cream/20 text-2xl">→</div>
                <div className="text-center"><div className="text-3xl font-bold text-cream/40">50%</div><div className="text-xs text-cream/60">OFF</div></div>
              </div>
              <div className="w-full h-3 bg-charcoal rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-gold to-orange-500 transition-all" style={{ width: `${(referralCount/5)*100}%` }}></div></div>
              <p className="text-sm text-cream/50 mt-3">{referralCount >=5 ? "5 पूरे! अब क्लेम करो" : `अभी ${5-referralCount} और चाहिए`}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/referrals"><Button className="btn-primary px-8 py-6 text-lg"><i className="fas fa-share-alt mr-2"></i>रेफरल पेज पर जाओ - लिंक शेयर करो</Button></Link>
              <Link href="/services"><Button variant="outline" className="btn-outline px-8 py-6">Normal Services देखो</Button></Link>
            </div>

            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-400/20 rounded-xl text-left">
              <h4 className="text-blue-400 font-bold mb-2 text-sm"><i className="fas fa-info-circle mr-2"></i>कैसे अनलॉक होगा?</h4>
              <ol className="list-decimal list-inside text-cream/60 text-sm space-y-1">
                <li>रेफरल पेज से अपना लिंक/कोड शेयर करो</li>
                <li>5 दोस्त ज्वाइन करें + Fund Add करें + पहला Order Place करें</li>
                <li>हर दोस्त के पहले ऑर्डर के बाद 1 Referral Count मिलेगा</li>
                <li>5 Count पूरे होने पर Claim Reward button आएगा</li>
                <li>Claim करने के बाद यह 50% OFF पेज अनलॉक होगा और hamburger menu में दिखेगा!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-4" style={{ backgroundColor: 'var(--main-bg)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <i className="fas fa-crown text-gold text-3xl"></i>
            <h1 className="text-4xl md:text-5xl font-bold text-gold">Premium Services - 50% OFF!</h1>
            <i className="fas fa-crown text-gold text-3xl"></i>
          </div>
          <p className="text-cream/70 mb-4">🎉 बधाई हो! तुम्हारा 50% OFF अनलॉक है - सभी सर्विस आधी कीमत पर!</p>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gold/20 to-green-500/20 border border-gold/30 rounded-full px-6 py-3">
            <i className="fas fa-check-circle text-green-400"></i>
            <span className="text-gold font-bold">50% OFF Active - Lifetime! - Premium Member</span>
          </div>
        </div>

        <div className="bg-charcoal border border-gold/20 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-gold to-yellow-600 rounded-full flex items-center justify-center"><i className="fas fa-crown text-black text-xl"></i></div>
              <div><h3 className="text-cream font-bold">Premium Member - 50% OFF</h3><p className="text-gold text-sm">Welcome, {user?.instagramUsername || 'User'}! - {referralCount}/5 Referrals Complete</p></div>
            </div>
            <div className="bg-charcoal-dark border border-gold/10 rounded-xl px-6 py-3 text-center"><p className="text-cream/60 text-xs">Wallet Balance</p><p className="text-gold font-bold text-xl">₹{user?.walletBalance || '0'}</p></div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-charcoal border border-gold/10 rounded-xl p-6 animate-pulse"><div className="h-4 bg-charcoal-dark rounded w-3/4 mb-3"></div><div className="h-3 bg-charcoal-dark rounded w-1/2"></div></div>)
          ) : (services as Service[]).length === 0 ? (
            <div className="col-span-3 text-center py-12 bg-charcoal border border-gold/10 rounded-xl"><p className="text-cream/70">No services</p></div>
          ) : (
            (services as Service[]).map((service: Service) => {
              const rate = getRate(service); const min = getMin(service); const max = getMax(service);
              const isSelected = selectedService && (selectedService.id === service.id || selectedService.name === service.name);
              return (
                <div key={service.id || service._id || service.name} className={`cursor-pointer transition-all duration-300 rounded-xl border-2 p-6 bg-charcoal hover:border-gold/40 hover:scale-[1.02] ${isSelected ? "border-gold bg-charcoal-dark shadow-lg shadow-gold/10" : "border-gold/20"}`} onClick={() => { setSelectedService(service); setQuantity(min); }}>
                  <div className="flex items-start justify-between mb-3"><h3 className="text-cream font-bold pr-2 line-clamp-2">{service.name}</h3><Badge className="bg-gold/20 text-gold border-gold/30 text-xs shrink-0">{service.category || 'premium'}</Badge></div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between"><span className="text-cream/40 line-through text-sm">₹{rate.toFixed(2)}/1000</span><span className="text-gold font-bold text-xl">₹{(rate*0.5).toFixed(2)}/1000</span></div>
                    <div className="flex items-center justify-center gap-2 bg-red-500/20 border border-red-400/20 rounded-full py-1"><i className="fas fa-bolt text-yellow-400 text-xs"></i><span className="text-yellow-400 font-bold text-xs">50% OFF</span></div>
                    <div className="text-cream/40 text-xs text-center">Min: {min.toLocaleString()} | Max: {max.toLocaleString()}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {selectedService && (
          <div className="bg-charcoal border-2 border-gold/30 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-2"><i className="fas fa-star text-gold"></i><h3 className="text-xl md:text-2xl font-bold text-gold">Place Premium Order - 50% OFF</h3></div>
            <p className="text-cream/60 mb-6 text-sm md:text-base">Selected: {selectedService.name} - 50% discount applied</p>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div><Label className="text-cream mb-2 block text-sm">Instagram Username / URL *</Label><Input value={instagramUsername} onChange={e=>setInstagramUsername(e.target.value)} placeholder="@username or post link" className="bg-charcoal-dark border-gold/20 text-cream focus:border-gold" /><p className="text-cream/40 text-xs mt-1">Public account होना चाहिए</p></div>
              <div><Label className="text-cream mb-2 block text-sm">Quantity *</Label><Input type="number" min={getMin(selectedService)} max={getMax(selectedService)} value={quantity} onChange={e=>setQuantity(Number(e.target.value)||getMin(selectedService))} className="bg-charcoal-dark border-gold/20 text-cream focus:border-gold" /><p className="text-cream/40 text-xs mt-1">{getMin(selectedService).toLocaleString()} - {getMax(selectedService).toLocaleString()}</p></div>
            </div>
            <div className="bg-charcoal-dark border border-gold/20 rounded-xl p-4 mb-6">
              <h4 className="font-bold text-gold mb-3">Order Summary - 50% OFF Lifetime!</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-cream/70"><span>Service:</span><span className="text-cream truncate ml-2">{selectedService.name}</span></div>
                <div className="flex justify-between text-cream/70"><span>Quantity:</span><span className="text-cream">{quantity.toLocaleString()}</span></div>
                <div className="flex justify-between text-cream/40"><span>Original:</span><span className="line-through">₹{calcOriginal(selectedService, quantity)}</span></div>
                <div className="flex justify-between text-gold font-bold text-lg border-t border-gold/20 pt-2 mt-2"><span>Discounted (50% OFF):</span><span>₹{calcPrice(selectedService, quantity)}</span></div>
                <div className="flex justify-between text-green-400"><span>You Save:</span><span>₹{calcSave(selectedService, quantity)}</span></div>
              </div>
              <div className="mt-3 bg-gold/10 border border-gold/20 rounded-lg p-2 text-center"><p className="text-gold text-xs">🎉 50% discount - Premium member benefit! Lifetime!</p></div>
            </div>
            {/* FIXED BUTTON - Professional, not overflowing */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={()=>setSelectedService(null)} className="w-full sm:w-auto sm:flex-1 btn-outline py-6">Cancel</Button>
              <Button onClick={handleOrder} disabled={!instagramUsername.trim() || createOrderMutation.isPending} className="w-full sm:w-auto sm:flex-[2] btn-primary py-6 text-base font-bold">
                {createOrderMutation.isPending ? <><i className="fas fa-spinner fa-spin mr-2"></i>Processing...</> : <><i className="fas fa-crown mr-2"></i>Place Order - ₹{calcPrice(selectedService, quantity)} (50% OFF)</>}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
