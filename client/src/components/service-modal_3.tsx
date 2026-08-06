import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";

interface ServiceModalProps {
  service: any;
  isOpen?: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
  isLoading?: boolean;
  showDiscountBadge?: boolean;
}

export function ServiceModal({ service, isOpen = true, onClose, onSubmit, isLoading = false, showDiscountBadge = false }: ServiceModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState<number>(100);
  const [instagramUsername, setInstagramUsername] = useState<string>("");

  // FIXED: Correct min/max logic - ensure min <= max always
  const serviceMin = service?.minOrder || service?.minQuantity || 10;
  const serviceMax = service?.maxOrder || service?.maxQuantity || 100000;
  const serviceRate = parseFloat(service?.rate || service?.price || 0);

  // FIXED: Don't enforce ₹20 minimum that causes min > max bug
  // Use actual service minOrder as effective min
  const effectiveMin = Math.min(serviceMin, serviceMax);
  const effectiveMax = Math.max(serviceMin, serviceMax);

  useEffect(() => {
    if (user?.instagramUsername) setInstagramUsername(user.instagramUsername);
    if (service) {
      // Start with min quantity
      setQuantity(effectiveMin);
    }
  }, [service, effectiveMin, user]);

  const calculatePrice = () => {
    if (!service) return 0;
    if (service.originalPrice !== undefined) {
      // Reward service: price is per 1000
      return (service.price * quantity) / 1000;
    }
    // Normal: rate per 1000 * quantity
    return (quantity * serviceRate) / 1000;
  };

  const handleOrder = async () => {
    if (!service) return;
    if (!instagramUsername.trim()) {
      toast({ title: "Instagram Username डालो", description: "Username जरूरी है", variant: "destructive" });
      return;
    }
    if (quantity < effectiveMin || quantity > effectiveMax) {
      toast({ title: "गलत Quantity", description: `Quantity ${effectiveMin} से ${effectiveMax} के बीच होनी चाहिए`, variant: "destructive" });
      return;
    }
    const price = calculatePrice();
    if (price <= 0) {
      toast({ title: "Invalid price", variant: "destructive" });
      return;
    }

    if (onSubmit) {
      onSubmit({ serviceName: service.name, instagramUsername: instagramUsername.trim(), quantity, price });
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/orders", {
        serviceName: service.name,
        instagramUsername: instagramUsername.trim(),
        quantity,
        price,
      });
      await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "ऑर्डर हो गया! ✅", description: "तुम्हारा ऑर्डर सफलतापूर्वक प्लेस हो गया" });
      onClose();
    } catch (error: any) {
      toast({ title: "ऑर्डर फेल", description: error.message, variant: "destructive" });
    }
  };

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-gold/50 shadow-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'rgba(28, 45, 36, 0.98)' }}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gold flex items-center justify-center gap-2">
            {showDiscountBadge && <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">50% OFF</Badge>}
            {service.name}
          </DialogTitle>
          <p className="text-center text-cream/60 text-sm">ऑर्डर प्लेस करो - {service.category || 'सर्विस'}</p>
        </DialogHeader>

        <div className="space-y-5">
          <div className="border border-gold/30 rounded-lg p-4 grid grid-cols-2 gap-3 text-sm" style={{ backgroundColor: 'rgba(214, 173, 96, 0.08)' }}>
            <div><span className="text-cream/50">Rate:</span><span className="text-gold font-bold ml-2">{formatCurrency(serviceRate)}/1000</span></div>
            <div><span className="text-cream/50">Delivery:</span><span className="text-cream ml-2">{service.deliveryTime || 'Instant'}</span></div>
            <div><span className="text-cream/50">Min:</span><span className="text-cream ml-2">{effectiveMin.toLocaleString()}</span></div>
            <div><span className="text-cream/50">Max:</span><span className="text-cream ml-2">{effectiveMax.toLocaleString()}</span></div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-cream text-sm font-medium mb-2 block">Instagram Username / URL <span className="text-red-400">*</span></label>
              <Input value={instagramUsername} onChange={(e)=>setInstagramUsername(e.target.value)} placeholder="@username या पोस्ट लिंक" className="bg-charcoal-dark border-gold/20 text-cream focus:border-gold" />
              <p className="text-xs text-cream/40 mt-1">पब्लिक अकाउंट होना चाहिए, प्राइवेट नहीं</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-cream text-sm font-medium mb-2 block">Price (₹)</label>
                <Input value={calculatePrice().toFixed(2)} readOnly className="bg-charcoal-dark border-gold/10 text-gold font-bold" />
              </div>
              <div>
                <label className="text-cream text-sm font-medium mb-2 block">Quantity <span className="text-red-400">*</span></label>
                <Input type="number" value={quantity} onChange={(e)=>setQuantity(parseInt(e.target.value)||effectiveMin)} min={effectiveMin} max={effectiveMax} className="bg-charcoal-dark border-gold/20 text-cream focus:border-gold" />
                <p className="text-xs text-cream/40 mt-1">{effectiveMin.toLocaleString()} - {effectiveMax.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-gold/10 border border-gold/30 rounded-lg p-4">
            <h4 className="text-gold font-bold mb-2">Order Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-cream/70"><span>Service:</span><span className="text-cream text-right ml-2 truncate">{service.name}</span></div>
              <div className="flex justify-between text-cream/70"><span>Quantity:</span><span className="text-cream">{quantity.toLocaleString()}</span></div>
              <div className="flex justify-between text-lg font-bold text-gold"><span>Total:</span><span>₹{calculatePrice().toFixed(2)}</span></div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 btn-outline">Cancel</Button>
            <Button onClick={handleOrder} disabled={isLoading || quantity < effectiveMin || quantity > effectiveMax || !instagramUsername.trim()} className="flex-1 btn-primary">
              {isLoading ? <><i className="fas fa-spinner fa-spin mr-2"></i>Processing...</> : <><i className="fas fa-check mr-2"></i>Confirm Order - ₹{calculatePrice().toFixed(2)}</>}
            </Button>
          </div>
          <p className="text-xs text-center text-cream/40">Order के बाद username change मत करो, नहीं तो delivery fail होगी</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
