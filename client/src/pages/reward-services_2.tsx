import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ServiceModal } from "../components/service-modal";
import { Link, useLocation } from "wouter";

interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  description: string;
  minQuantity: number;
  maxQuantity: number;
}

export default function RewardServices() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [location, setLocation] = useLocation();

  // Check eligibility - FIXED endpoint to /api/referrals/my
  const { data: referralData, isLoading: referralLoading } = useQuery({
    queryKey: ["/api/referrals/my"],
    queryFn: async () => {
      const response = await fetch("/api/referrals/my", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch referral data");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Redirect if not eligible - fixed logic
  useEffect(() => {
    if (referralData) {
      const isEligible = referralData.isEligibleForDiscount || referralData.referralCount >= 5;
      const hasClaimed = referralData.hasClaimedDiscount || referralData.hasClaimed;
      if (!isEligible && !hasClaimed) {
        toast({
          title: "Access Denied",
          description: hasClaimed ? "You have already claimed your reward - check services discount" : "You need 5 referrals to access reward services",
          variant: "destructive",
        });
        setLocation("/referrals");
      }
    }
  }, [referralData, setLocation, toast]);

  // Fetch services with discount applied
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["reward-services"],
    queryFn: async () => {
      const response = await fetch("/api/services", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch services");
      const originalServices = await response.json();
      return originalServices.map((service: any) => ({
        ...service,
        originalPrice: parseFloat(service.price),
        price: Math.round(parseFloat(service.price) * 0.5), // 50% off
      }));
    },
    enabled: isAuthenticated,
  });

  const createOrderMutation = useMutation({
    mutationFn: async ({ serviceName, instagramUsername, quantity, price }: any) => {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ serviceName, instagramUsername, quantity, price }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create order");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Placed Successfully!",
        description: "Your discounted order has been placed and is being processed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setSelectedService(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Order Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleOrderSubmit = (orderData: any) => {
    createOrderMutation.mutate(orderData);
  };

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  if (referralLoading || servicesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-gold mb-4"></i>
          <div className="text-xl" style={{ color: 'var(--primary-text)' }}>Loading reward services...</div>
        </div>
      </div>
    );
  }

  // Fixed check - allow access if hasClaimedDiscount OR isEligible
  const hasAccess = referralData?.isEligibleForDiscount || referralData?.hasClaimedDiscount || referralData?.hasClaimed || (referralData?.referralCount >=5);
  if (!hasAccess) {
    return null;
  }

  const groupedServices = services?.reduce((acc: any, service: Service) => {
    if (!acc[service.category]) acc[service.category] = [];
    acc[service.category].push(service);
    return acc;
  }, {}) || {};

  return (
    <div className="min-h-screen pt-24" style={{ backgroundColor: 'var(--main-bg)' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <i className="fas fa-gift text-4xl text-yellow-400"></i>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              🎉 Reward Services - 50% OFF! 🎉
            </h1>
          </div>
          <p className="text-lg" style={{ color: 'var(--secondary-text)' }}>
            Congratulations! You've earned access to our premium services at 50% discount.
          </p>
          <div className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-400/30">
            <p className="text-green-400 font-semibold">
              ✅ Referral Goal Achieved: {referralData?.referralCount}/5 referrals completed
            </p>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-lg border-2" style={{ borderColor: 'var(--gold)', backgroundColor: 'var(--charcoal)' }}>
            <div className="text-sm" style={{ color: 'var(--secondary-text)' }}>Current Balance</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>
              ₹{user?.walletBalance || 0}
            </div>
          </div>
        </div>

        {Object.entries(groupedServices).map(([category, categoryServices]) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--primary-text)' }}>
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(categoryServices as Service[]).map((service) => (
                <Card
                  key={service.id}
                  className="relative overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer border-2"
                  style={{ backgroundColor: 'var(--charcoal)', borderColor: 'var(--gold)' }}
                  onClick={() => setSelectedService(service)}
                >
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 text-sm font-bold transform rotate-12 translate-x-2 -translate-y-1 z-10">
                    50% OFF
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg" style={{ color: 'var(--primary-text)' }}>
                      {service.name}
                    </CardTitle>
                    <CardDescription style={{ color: 'var(--secondary-text)' }}>
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-sm line-through" style={{ color: 'var(--secondary-text)' }}>
                          ₹{service.originalPrice}
                        </div>
                        <div className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>
                          ₹{service.price}
                        </div>
                        <div className="text-sm text-green-400">
                          You save ₹{service.originalPrice - service.price}
                        </div>
                      </div>
                      <div className="text-center text-sm" style={{ color: 'var(--secondary-text)' }}>
                        Quantity: {service.minQuantity.toLocaleString()} - {service.maxQuantity.toLocaleString()}
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedService(service);
                        }}
                      >
                        Order Now - 50% OFF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {selectedService && (
          <ServiceModal
            service={selectedService}
            onClose={() => setSelectedService(null)}
            onSubmit={handleOrderSubmit}
            isLoading={createOrderMutation.isPending}
            showDiscountBadge={true}
          />
        )}

        <div className="text-center mt-12 p-6 rounded-lg" style={{ backgroundColor: 'var(--charcoal)' }}>
          <p style={{ color: 'var(--secondary-text)' }}>
            🎁 This is a one-time reward for achieving 5 referrals. Your 50% discount is permanent!
          </p>
        </div>
      </div>
    </div>
  );
}
