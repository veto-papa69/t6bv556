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
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [instagramUsername, setInstagramUsername] = useState<string>("");

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["/api/services"],
    enabled: isAuthenticated,
  });

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
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
      if (!res.ok) throw new Error("Failed to create order");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been submitted and is being processed.",
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
    const discountedPrice = basePrice * 0.8; // 20% discount
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
    const discountedPrice = basePrice * 0.8; // 20% discount
    return (discountedPrice * qty).toFixed(2);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold">Premium Services</CardTitle>
            <CardDescription>
              Please log in to access discounted premium services
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Premium Services
            </h1>
            <Crown className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-xl text-gray-600 mb-4">
            Exclusive 20% discount for premium users
          </p>
          <Badge variant="secondary" className="px-4 py-2 text-lg">
            <Gift className="h-4 w-4 mr-2" />
            Special Discount Active
          </Badge>
        </div>

        {/* User Info */}
        <Card className="mb-8 border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Welcome, {user?.instagramUsername}!</h3>
                  <p className="text-sm text-gray-600">Premium Member</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Wallet Balance</p>
                <p className="text-2xl font-bold text-green-600">₹{user?.walletBalance}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            services.map((service: Service) => (
              <Card
                key={service.id}
                className={`cursor-pointer transition-all duration-300 border-2 hover:shadow-lg ${
                  selectedService?.id === service.id
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
                }`}
                onClick={() => setSelectedService(service)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {service.category}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 line-through">
                        ₹{service.price}
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        ₹{(parseFloat(service.price) * 0.8).toFixed(2)}
                      </span>
                    </div>
                    <Badge variant="secondary" className="w-full justify-center">
                      <Zap className="h-3 w-3 mr-1" />
                      20% OFF
                    </Badge>
                    <div className="text-xs text-gray-500">
                      Min: {service.minQuantity} | Max: {service.maxQuantity}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Order Form */}
        {selectedService && (
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Place Your Order
              </CardTitle>
              <CardDescription>
                Selected: {selectedService.name} (20% Discount Applied)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instagram">Instagram Username</Label>
                  <Input
                    id="instagram"
                    placeholder="@username"
                    value={instagramUsername}
                    onChange={(e) => setInstagramUsername(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={selectedService.minQuantity}
                    max={selectedService.maxQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </div>
              </div>

              <Separator />

              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Service:</span>
                    <span>{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>{quantity}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Original Price:</span>
                    <span className="line-through">₹{(parseFloat(selectedService.price) * quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Discounted Price:</span>
                    <span>₹{calculatePrice(selectedService, quantity)}</span>
                  </div>
                  <div className="flex justify-between text-orange-600">
                    <span>You Save:</span>
                    <span>₹{(parseFloat(selectedService.price) * quantity * 0.2).toFixed(2)}</span>
                  </div>
                </div>

                <Progress value={20} className="mt-4 h-2" />
                <p className="text-xs text-center mt-2 text-gray-600">
                  20% discount automatically applied
                </p>
              </div>

              <Button
                onClick={handleOrder}
                disabled={!instagramUsername || createOrderMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
              >
                {createOrderMutation.isPending ? (
                  "Processing..."
                ) : (
                  <>
                    <Crown className="h-4 w-4 mr-2" />
                    Place Premium Order - ₹{calculatePrice(selectedService, quantity)}
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
