import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import { Crown, Star, Zap, Gift } from "lucide-react";
import { Link, useLocation } from "wouter";

interface Service {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
  minQuantity: number;
  maxQuantity: number;
  features: string[];
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
  const [, setLocation] = useLocation();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [instagramUsername, setInstagramUsername] = useState<string>("");

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["/api/services"],
    queryFn: async () => {
      const res = await fetch("/api/services", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch services");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: referralData } = useQuery({
    queryKey: ["/api/referrals/my"],
    queryFn: async () => {
      const res = await fetch("/api/referrals/my", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const hasDiscountAccess = referralData?.isEligibleForDiscount || referralData?.hasClaimedDiscount || referralData?.hasClaimed || (referralData?.referralCount >= 5);

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: OrderData) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(orderData),
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({error:"Failed"}));
        throw new Error(err.error || "Failed to create order");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Placed Successfully!",
        description: "Your 50% discounted order has been submitted!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setSelectedService(null);
      setQuantity(1);
      setInstagramUsername("");
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    },
  });

  const handleOrder = () => {
    if (!selectedService || !instagramUsername) return;
    const basePrice = parseFloat(selectedService.price);
    const discountedPrice = basePrice * 0.5; // FIXED: 50% discount
    const totalPrice = discountedPrice * quantity;
    createOrderMutation.mutate({
      serviceName: selectedService.name,
      instagramUsername,
      quantity,
      price: totalPrice,
    });
  };

  const calculatePrice = (service: Service, qty: number) => {
    const basePrice = parseFloat(service.price);
    const discountedPrice = basePrice * 0.5; // FIXED: 50% discount
    return (discountedPrice * qty).toFixed(2);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pt-24" style={{ backgroundColor: 'var(--main-bg)' }}>
        <Card className="w-full max-w-md" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--gold)' }}>
          <CardHeader className="text-center">
            <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>Premium Services - 50% OFF</CardTitle>
            <CardDescription style={{ color: 'var(--secondary-text)' }}>
              Please log in to access discounted premium services
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={()=>setLocation('/')} className="btn-primary">Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If not eligible, redirect to referrals
  if (referralData && !hasDiscountAccess) {
    return (
      <div className="min-h-screen p-4 pt-28" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <Card style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--gold)' }}>
            <CardHeader>
              <CardTitle className="text-gold text-3xl">🔒 50% Discount Locked</CardTitle>
              <CardDescription className="text-cream/70 text-lg mt-4">
                You need 5 referrals to unlock 50% discount on all services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-6xl font-bold text-gold">{referralData?.referralCount || 0} / 5</div>
              <Progress value={((referralData?.referralCount || 0)/5)*100} className="h-3" />
              <Link href="/referrals">
                <Button className="btn-primary text-lg px-8 py-3">Go to Referrals - Earn Discount</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-24" style={{ backgroundColor: 'var(--main-bg)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Premium Services - 50% OFF
            </h1>
            <Crown className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-xl mb-4" style={{ color: 'var(--secondary-text)' }}>
            Exclusive 50% discount for our top referrers
          </p>
          <Badge variant="secondary" className="px-4 py-2 text-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
            <Gift className="h-4 w-4 mr-2" />
            50% Special Discount Active - Lifetime!
          </Badge>
        </div>

        <Card className="mb-8 border-2" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--gold)' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Crown className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--primary-text)' }}>Welcome, {user?.instagramUsername}!</h3>
                  <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>Premium Member - 50% OFF Unlocked</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>Wallet Balance</p>
                <p className="text-2xl font-bold text-green-400">₹{user?.walletBalance}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse" style={{ backgroundColor: 'var(--card-bg)' }}>
                <CardHeader>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-700 rounded mb-4"></div>
                  <div className="h-8 bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            services.map((service: Service) => (
              <Card
                key={service.id}
                className={`cursor-pointer transition-all duration-300 border-2 hover:shadow-lg hover:scale-105 ${selectedService?.id === service.id ? "border-yellow-400" : "border-gold/20 hover:border-yellow-400/50"}`}
                style={{ backgroundColor: selectedService?.id === service.id ? 'rgba(214,173,96,0.1)' : 'var(--card-bg)' }}
                onClick={() => setSelectedService(service)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg" style={{ color: 'var(--primary-text)' }}>{service.name}</CardTitle>
                    <Badge variant="outline" className="text-xs border-gold text-gold">
                      {service.category}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2" style={{ color: 'var(--secondary-text)' }}>
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm line-through" style={{ color: 'var(--secondary-text)' }}>
                        ₹{service.price}
                      </span>
                      <span className="text-lg font-bold text-green-400">
                        ₹{(parseFloat(service.price) * 0.5).toFixed(2)}
                      </span>
                    </div>
                    <Badge className="w-full justify-center bg-gradient-to-r from-red-500 to-pink-500 text-white">
                      <Zap className="h-3 w-3 mr-1" />
                      50% OFF
                    </Badge>
                    <div className="text-xs" style={{ color: 'var(--secondary-text)' }}>
                      Min: {service.minQuantity} | Max: {service.maxQuantity}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {selectedService && (
          <Card className="border-2" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--gold)' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: 'var(--gold)' }}>
                <Star className="h-5 w-5 text-yellow-500" />
                Place Your Order - 50% OFF Applied
              </CardTitle>
              <CardDescription style={{ color: 'var(--secondary-text)' }}>
                Selected: {selectedService.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instagram" style={{ color: 'var(--primary-text)' }}>Instagram Username</Label>
                  <Input
                    id="instagram"
                    placeholder="@username"
                    value={instagramUsername}
                    onChange={(e) => setInstagramUsername(e.target.value)}
                    style={{ backgroundColor: 'var(--main-bg)', borderColor: 'var(--gold)', color: 'var(--primary-text)' }}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity" style={{ color: 'var(--primary-text)' }}>Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={selectedService.minQuantity}
                    max={selectedService.maxQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    style={{ backgroundColor: 'var(--main-bg)', borderColor: 'var(--gold)', color: 'var(--primary-text)' }}
                    className="mt-2"
                  />
                </div>
              </div>

              <Separator style={{ backgroundColor: 'var(--gold)' }} />

              <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--main-bg)', borderColor: 'var(--gold)' }}>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--primary-text)' }}>Order Summary - 50% Discount</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between" style={{ color: 'var(--secondary-text)' }}>
                    <span>Service:</span>
                    <span style={{ color: 'var(--primary-text)' }}>{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between" style={{ color: 'var(--secondary-text)' }}>
                    <span>Quantity:</span>
                    <span style={{ color: 'var(--primary-text)' }}>{quantity}</span>
                  </div>
                  <div className="flex justify-between" style={{ color: 'var(--secondary-text)' }}>
                    <span>Original Price:</span>
                    <span className="line-through">₹{(parseFloat(selectedService.price) * quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-400 font-semibold text-lg">
                    <span>Discounted Price (50% OFF):</span>
                    <span>₹{calculatePrice(selectedService, quantity)}</span>
                  </div>
                  <div className="flex justify-between text-orange-400">
                    <span>You Save:</span>
                    <span>₹{(parseFloat(selectedService.price) * quantity * 0.5).toFixed(2)}</span>
                  </div>
                </div>
                <Progress value={50} className="mt-4 h-2" />
                <p className="text-xs text-center mt-2" style={{ color: 'var(--secondary-text)' }}>
                  50% discount automatically applied - Lifetime reward!
                </p>
              </div>

              <Button
                onClick={handleOrder}
                disabled={!instagramUsername || createOrderMutation.isPending}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold"
                size="lg"
              >
                {createOrderMutation.isPending ? "Processing..." : (
                  <>
                    <Crown className="h-4 w-4 mr-2" />
                    Place Premium Order - ₹{calculatePrice(selectedService, quantity)} (50% OFF)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
