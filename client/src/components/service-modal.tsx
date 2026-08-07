import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
interface Props { service: any; isOpen?: boolean; onClose: () => void; onSubmit?: (d:any)=>void; isLoading?: boolean; showDiscountBadge?: boolean; }
export function ServiceModal({ service, isOpen=true, onClose, onSubmit, isLoading=false, showDiscountBadge=false }: Props) {
  const { user } = useAuth(); const { toast } = useToast(); const qc = useQueryClient();
  const [quantity, setQuantity] = useState(100);
  const [username, setUsername] = useState("");
  const min = service?.minOrder || service?.minQuantity || 10;
  const max = service?.maxOrder || service?.maxQuantity || 1000000;
  const rate = parseFloat(service?.rate || service?.price || 0);
  const effMin = Math.min(min, max);
  const effMax = Math.max(min, max);
  useEffect(()=>{ if(user?.instagramUsername) setUsername(user.instagramUsername); if(service) setQuantity(effMin); }, [service, effMin, user]);
  const calcPrice = () => { if(!service) return 0; if(service.originalPrice!==undefined) return (service.price*quantity)/1000; return (quantity*rate)/1000; };
  const handleOrder = async () => {
    if(!username.trim()){ toast({title:"Username डालो", variant:"destructive"}); return; }
    if(quantity<effMin||quantity>effMax){ toast({title:"गलत Quantity", description:`${effMin} से ${effMax} के बीच`, variant:"destructive"}); return; }
    const price = calcPrice();
    if(onSubmit){ onSubmit({serviceName:service.name, instagramUsername:username.trim(), quantity, price}); return; }
    try{ const r=await apiRequest("POST","/api/orders",{serviceName:service.name, instagramUsername:username.trim(), quantity, price}); await r.json(); qc.invalidateQueries({queryKey:["/api/auth/user"]}); qc.invalidateQueries({queryKey:["/api/orders"]}); toast({title:"Order हो गया!"}); onClose(); }
    catch(e:any){ toast({title:"Failed", description:e.message, variant:"destructive"}); }
  };
  if(!service) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-gold/50 max-h-[90vh] overflow-y-auto" style={{backgroundColor:'rgba(28,45,36,0.98)'}}>
        <DialogHeader><DialogTitle className="text-gold text-2xl text-center">{service.name}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="border border-gold/30 rounded-lg p-3 grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-cream/50">Rate:</span><span className="text-gold ml-2">{formatCurrency(rate)}/1000</span></div>
            <div><span className="text-cream/50">Min/Max:</span><span className="text-cream ml-2">{effMin}/{effMax}</span></div>
          </div>
          <Input value={username} onChange={e=>setUsername(e.target.value)} placeholder="@username" className="bg-charcoal-dark border-gold/20 text-cream" />
          <Input type="number" value={quantity} onChange={e=>setQuantity(parseInt(e.target.value)||effMin)} min={effMin} max={effMax} className="bg-charcoal-dark border-gold/20 text-cream" />
          <div className="bg-gold/10 border border-gold/30 rounded-lg p-3"><div className="flex justify-between text-gold font-bold"><span>Total:</span><span>₹{calcPrice().toFixed(2)}</span></div></div>
          <div className="flex gap-3"><Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button><Button onClick={handleOrder} disabled={isLoading} className="flex-1 btn-primary">Confirm - ₹{calcPrice().toFixed(2)}</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
