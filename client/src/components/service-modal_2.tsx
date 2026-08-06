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
  isDiscounted?: boolean;
}

export function ServiceModal({ service, isOpen = true, onClose, onSubmit, isLoading = false, showDiscountBadge = false }: ServiceModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState<number>(service?.minQuantity || service?.minOrder || 1000);
  const [instagramUsername, setInstagramUsername] = useState<string>(user?.instagramUsername || "");
  const isRewardService = service?.originalPrice !== undefined;
  const rate = service ? parseFloat(service.rate || service.price || 0) : 0;
  const originalPrice = isRewardService ? service.originalPrice : null;

  useEffect(() => {
    if (user?.instagramUsername) setInstagramUsername(user.instagramUsername);
    if (service) setQuantity(service.minQuantity || service.minOrder || 1000);
  }, [service, user]);

  const calculatePrice = () => {
    if (!service) return 0;
    if (isRewardService) {
      return (service.price * quantity) / 1000;
    }
    return (quantity * rate) / 1000;
  };

  const handleOrder = async () => {
    if (!service) return;
    if (!instagramUsername.trim()) {
      toast({ title: "Enter Instagram username", variant: "destructive" });
      return;
    }
    const price = calculatePrice();
    if (onSubmit) {
      onSubmit({ serviceName: service.name, instagramUsername, quantity, price });
      return;
    }
    try {
      const response = await apiRequest("POST", "/api/orders", { serviceName: service.name, instagramUsername, quantity, price });
      await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Order Placed!", description: "Order placed successfully." });
      onClose();
    } catch (error: any) {
      toast({ title: "Order Failed", description: error.message, variant: "destructive" });
    }
  };

  if (!service) return null;
  const open = isOpen !== undefined ? isOpen : !!service;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-gold/50 shadow-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'rgba(28, 45, 36, 0.98)' }}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gold mb-2 flex items-center justify-center gap-2">
            {showDiscountBadge && <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">50% OFF</Badge>}
            {service.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="border border-gold/30 rounded-lg p-4 grid grid-cols-2 gap-4 text-sm" style={{ backgroundColor: 'rgba(214, 173, 96, 0.1)' }}>
            {isRewardService ? (
              <>
                <div><span className="text-cream/60">Original:</span><span className="text-cream/70 line-through ml-2">₹{originalPrice}</span></div>
                <div><span className="text-cream/60">Discounted:</span><span className="text-green-400 font-semibold ml-2">₹{service.price}</span></div>
              </>
            ) : (
              <>
                <div><span className="text-cream/60">Rate:</span><span className="text-gold font-semibold ml-2">{formatCurrency(rate)}/1000</span></div>
                <div><span className="text-cream/60">Min/Max:</span><span className="text-cream ml-2">{service.minOrder || service.minQuantity}</span></div>
              </>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-cream text-sm mb-2 block">Instagram Username</label>
              <Input value={instagramUsername} onChange={(e) => setInstagramUsername(e.target.value)} placeholder="@username" className="bg-charcoal-dark border-gold/20 text-cream" />
            </div>
            <div>
              <label className="text-cream text-sm mb-2 block">Quantity</label>
              <Input type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 0)} className="bg-charcoal-dark border-gold/20 text-cream" />
            </div>
          </div>
          <div className="bg-gold/10 border border-gold/30 rounded-lg p-4">
            <div className="flex justify-between text-lg font-bold text-gold"><span>Total:</span><span>₹{calculatePrice().toFixed(2)}</span></div>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={onClose} className="flex-1 btn-outline">Cancel</Button>
            <Button onClick={handleOrder} disabled={isLoading} className="flex-1 btn-primary">{isLoading ? "Processing..." : "Confirm Order"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
