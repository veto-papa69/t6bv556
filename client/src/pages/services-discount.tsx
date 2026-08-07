import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";

interface Service {
  id?: string;
  _id?: string;
  name: string;
  category?: string;
  price?: string;
  rate?: string | number;
  description?: string;
  minOrder?: number;
  maxOrder?: number;
  minQuantity?: number;
  maxQuantity?: number;
}

interface OrderData {
  serviceName: string;
  instagramUsername: string;
  quantity: number;
  price: number;
}

export default function ServicesDiscount() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [instagramUsername, setInstagramUsername] = useState<string>("");

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["/api/services"],
    enabled: isAuthenticated,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: OrderData) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(orderData),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to create order");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Order Placed! 🎉", description: "Your premium order is being processed with 50% OFF!" });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setSelectedService(null);
      setQuantity(100);
      setInstagramUsername("");
    },
    onError: (error: any) => {
      toast({ title: "Order Failed", description: error.message, variant: "destructive" });
    },
  });

  const getRate = (service: Service): number => {
    const raw = service.rate ?? service.price ?? "0";
    const num = typeof raw === 'string' ? parseFloat(raw.replace(/[^0-9.]/g, '')) : raw;
    return isNaN(num) ? 0 : num;
  };

  const getMin = (service: Service): number => {
    return service.minOrder ?? service.minQuantity ?? 10;
  };

  const getMax = (service: Service): number => {
    return service.maxOrder ?? service.maxQuantity ?? 100000;
  };

  const handleOrder = () => {
    if (!selectedService || !instagramUsername.trim()) {
      toast({ title: "Username डालो", description: "Instagram username जरूरी है", variant: "destructive" });
      return;
    }
    const rate = getRate(selectedService);
    const min = getMin(selectedService);
    const max = getMax(selectedService);
    
    if (quantity < min || quantity > max) {
      toast({ title: "गलत Quantity", description: `Quantity ${min} से ${max} के बीच होनी चाहिए`, variant: "destructive" });
      return;
    }

    const basePrice = (rate * quantity) / 1000;
    const discountedPrice = basePrice * 0.5; // 50% OFF

    createOrderMutation.mutate({
      serviceName: selectedService.name,
      instagramUsername: instagramUsername.trim(),
      quantity,
      price: discountedPrice,
    });
  };

  const calculatePrice = (service: Service, qty: number) => {
    const rate = getRate(service);
    const base = (rate * qty) / 1000;
    return (base * 0.5).toFixed(2); // 50% OFF
  };

  const calculateOriginal = (service: Service, qty: number) => {
    const rate = getRate(service);
    return ((rate * qty) / 1000).toFixed(2);
  };

  const calculateSavings = (service: Service, qty: number) => {
    const rate = getRate(service);
    const base = (rate * qty) / 1000;
    return (base * 0.5).toFixed(2);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 pb-8 flex items-center justify-center px-4" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="bg-charcoal border border-gold/20 rounded-2xl p-8 max-w-md w-full text-center">
          <i className="fas fa-crown text-gold text-6xl mb-6 block"></i>
          <h2 className="text-2xl font-bold text-gold mb-2">Premium Services</h2>
          <p className="text-cream/70">Please login to access 50% discounted premium services</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-4" style={{ backgroundColor: 'var(--main-bg)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header - Dark Theme matching website */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <i className="fas fa-crown text-gold text-3xl"></i>
            <h1 className="text-4xl md:text-5xl font-bold text-gold">Premium Services</h1>
            <i className="fas fa-crown text-gold text-3xl"></i>
          </div>
          <p className="text-xl text-cream/70 mb-6">Exclusive 50% discount for premium users - Lifetime Offer!</p>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gold/20 to-orange-500/20 border border-gold/30 rounded-full px-6 py-3">
            <i className="fas fa-gift text-gold"></i>
            <span className="text-gold font-bold">Special Discount Active - 50% OFF Lifetime!</span>
          </div>
        </div>

        {/* User Info - Dark Theme */}
        <div className="bg-charcoal border border-gold/20 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-gold to-yellow-600 rounded-full flex items-center justify-center">
                <i className="fas fa-crown text-black text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-cream">Welcome, {user?.instagramUsername || 'Premium User'}!</h3>
                <p className="text-sm text-gold">Premium Member - 50% OFF Active</p>
              </div>
            </div>
            <div className="text-center md:text-right bg-charcoal-dark border border-gold/10 rounded-xl px-6 py-3">
              <p className="text-sm text-cream/60">Wallet Balance</p>
              <p className="text-2xl font-bold text-gold">₹{user?.walletBalance || '0'}</p>
            </div>
          </div>
        </div>

        {/* Services Grid - Dark Theme like services page */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-charcoal border border-gold/10 rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-charcoal-dark rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-charcoal-dark rounded w-1/2"></div>
              </div>
            ))
          ) : (services as Service[]).length === 0 ? (
            <div className="col-span-3 text-center py-12 bg-charcoal border border-gold/10 rounded-xl">
              <i className="fas fa-box-open text-gold text-4xl mb-4 block"></i>
              <p className="text-cream/70">No premium services available at moment</p>
            </div>
          ) : (
            (services as Service[]).map((service: Service) => {
              const rate = getRate(service);
              const min = getMin(service);
              const max = getMax(service);
              const isSelected = selectedService && (selectedService.id === service.id || selectedService.name === service.name);
              return (
                <div
                  key={service.id || service._id || service.name}
                  className={`cursor-pointer transition-all duration-300 rounded-xl border-2 p-6 bg-charcoal hover:border-gold/40 hover:scale-[1.02] ${
                    isSelected ? "border-gold bg-charcoal-dark shadow-lg shadow-gold/10" : "border-gold/20"
                  }`}
                  onClick={() => { setSelectedService(service); setQuantity(min); }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-cream pr-2 line-clamp-2">{service.name}</h3>
                    <Badge className="bg-gold/20 text-gold border-gold/30 text-xs shrink-0">{service.category || 'premium'}</Badge>
                  </div>
                  {service.description && <p className="text-sm text-cream/60 mb-4 line-clamp-2">{service.description}</p>}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-cream/50 line-through">₹{rate.toFixed(2)}/1000</span>
                      <span className="text-xl font-bold text-gold">₹{(rate * 0.5).toFixed(2)}/1000</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/20 rounded-full py-1">
                      <i className="fas fa-bolt text-yellow-400 text-xs"></i>
                      <span className="text-xs font-bold text-yellow-400">50% OFF</span>
                    </div>
                    <div className="text-xs text-cream/40 text-center">Min: {min.toLocaleString()} | Max: {max.toLocaleString()}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Order Form - Dark Theme */}
        {selectedService && (
          <div className="bg-charcoal border-2 border-gold/30 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-2">
              <i className="fas fa-star text-gold"></i>
              <h3 className="text-2xl font-bold text-gold">Place Your Premium Order - 50% OFF</h3>
            </div>
            <p className="text-cream/60 mb-6">Selected: {selectedService.name} - 50% discount auto applied</p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label className="text-cream mb-2 block">Instagram Username / URL *</Label>
                <Input value={instagramUsername} onChange={(e) => setInstagramUsername(e.target.value)} placeholder="@username or post link" className="bg-charcoal-dark border-gold/20 text-cream focus:border-gold" />
                <p className="text-xs text-cream/40 mt-1">Public account hona chahiye</p>
              </div>
              <div>
                <Label className="text-cream mb-2 block">Quantity *</Label>
                <Input type="number" min={getMin(selectedService)} max={getMax(selectedService)} value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || getMin(selectedService))} className="bg-charcoal-dark border-gold/20 text-cream focus:border-gold" />
                <p className="text-xs text-cream/40 mt-1">{getMin(selectedService).toLocaleString()} - {getMax(selectedService).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-charcoal-dark border border-gold/20 rounded-xl p-4 mb-6">
              <h4 className="font-bold text-gold mb-3">Order Summary - 50% OFF</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-cream/70"><span>Service:</span><span className="text-cream">{selectedService.name}</span></div>
                <div className="flex justify-between text-cream/70"><span>Quantity:</span><span className="text-cream">{quantity.toLocaleString()}</span></div>
                <div className="flex justify-between text-cream/50"><span>Original:</span><span className="line-through">₹{calculateOriginal(selectedService, quantity)}</span></div>
                <div className="flex justify-between text-gold font-bold text-lg border-t border-gold/20 pt-2 mt-2"><span>Discounted (50% OFF):</span><span>₹{calculatePrice(selectedService, quantity)}</span></div>
                <div className="flex justify-between text-green-400"><span>You Save 50%:</span><span>₹{calculateSavings(selectedService, quantity)}</span></div>
              </div>
              <div className="mt-4 bg-gold/10 border border-gold/20 rounded-lg p-2 text-center">
                <p className="text-xs text-gold">🎉 50% discount automatically applied - Premium member benefit!</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSelectedService(null)} className="flex-1 btn-outline">Cancel</Button>
              <Button onClick={handleOrder} disabled={!instagramUsername.trim() || createOrderMutation.isPending} className="flex-1 btn-primary">
                {createOrderMutation.isPending ? <><i className="fas fa-spinner fa-spin mr-2"></i>Processing...</> : <><i className="fas fa-crown mr-2"></i>Place Order - ₹{calculatePrice(selectedService, quantity)} - 50% OFF</>}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
