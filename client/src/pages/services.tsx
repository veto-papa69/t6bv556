import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ServiceModal } from "@/components/service-modal";
import { AuthModal } from "@/components/auth-modal";

interface Service {
  id: number;
  name: string;
  category: string;
  rate: string;
  minOrder: number;
  maxOrder: number;
  deliveryTime: string;
  active: boolean;
}

export default function Services() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    enabled: isAuthenticated,
  });

  // Show auth modal immediately if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 pb-8" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="mb-8">
              <i className="fas fa-lock text-gold text-6xl mb-6"></i>
              <h1 className="text-4xl font-bold text-gold mb-4">Authentication Required</h1>
              <p className="text-xl text-cream/70 mb-8">Please login with your Instagram account to access our services</p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="btn-primary px-8 py-3 text-lg"
              >
                Login Now
              </button>
            </div>
          </div>
        </div>
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
      </div>
    );
  }

  const handleOrderService = (service: Service) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login with your Instagram account first to place an order.",
        variant: "destructive",
      });
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedService(service);
    setIsServiceModalOpen(true);
  };

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "followers":
        return "fas fa-users";
      case "likes":
        return "fas fa-heart";
      case "views":
        return "fas fa-eye";
      case "comments":
        return "fas fa-comments";
      default:
        return "fas fa-star";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "followers":
        return "from-pink-500/20 to-purple-500/20";
      case "likes":
        return "from-red-500/20 to-pink-500/20";
      case "views":
        return "from-blue-500/20 to-cyan-500/20";
      case "comments":
        return "from-green-500/20 to-emerald-500/20";
      default:
        return "from-gold/20 to-tan/20";
    }
  };

  return (
    <>
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gold mb-4">Our Services</h1>
            <p className="text-xl text-cream/70 max-w-2xl mx-auto">
              Premium social media growth services at unbeatable prices
            </p>
          </div>

          {/* Service Categories Overview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {Object.entries(groupedServices).map(([category, categoryServices]) => {
              const minRate = Math.min(...categoryServices.map(s => parseFloat(s.rate)));
              return (
                <div key={category} className="bg-charcoal border border-gold/20 rounded-xl p-6 text-center hover:border-gold/40 transition-all duration-300 hover:transform hover:scale-105">
                  <i className={`${getCategoryIcon(category)} text-gold text-3xl mb-4`}></i>
                  <h3 className="text-lg font-bold text-gold mb-2">{category}</h3>
                  <p className="text-cream/80 text-sm mb-4">
                    {categoryServices.length} service{categoryServices.length > 1 ? 's' : ''} available
                  </p>
                  <span className="text-gold font-bold">From {formatCurrency(minRate)}/1000</span>
                </div>
              );
            })}
          </div>

          {/* Services by Category */}
          <div className="space-y-8">
            {Object.entries(groupedServices).map(([category, categoryServices]) => (
              <div key={category} className="bg-charcoal border border-gold/20 rounded-xl overflow-hidden">
                <div className={`bg-gradient-to-r ${getCategoryColor(category)} p-4 border-b border-gold/20`}>
                  <h2 className="text-xl font-semibold text-gold flex items-center">
                    <i className={`${getCategoryIcon(category)} mr-3`}></i>
                    Instagram {category}
                  </h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-charcoal-dark">
                      <tr className="text-left">
                        <th className="p-4 text-cream/70">Service</th>
                        <th className="p-4 text-cream/70">Rate</th>
                        <th className="p-4 text-cream/70">Min/Max</th>
                        <th className="p-4 text-cream/70">Delivery</th>
                        <th className="p-4 text-cream/70">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryServices.map((service) => (
                        <tr key={service.id} className="border-t border-gold/10 hover:bg-charcoal-dark/50 transition-colors">
                          <td className="p-4">
                            <div>
                              <span className="font-medium text-cream">{service.name}</span>
                              <p className="text-sm text-cream/60">High quality {category.toLowerCase()}</p>
                            </div>
                          </td>
                          <td className="p-4 text-gold font-semibold">
                            {formatCurrency(parseFloat(service.rate))} per 1000
                          </td>
                          <td className="p-4 text-cream/70">
                            {service.minOrder.toLocaleString()} / {service.maxOrder.toLocaleString()}
                          </td>
                          <td className="p-4 text-cream/70">{service.deliveryTime}</td>
                          <td className="p-4">
                            <Button
                              onClick={() => handleOrderService(service)}
                              className="btn-primary hover:scale-105 transition-all duration-300"
                              size="sm"
                            >
                              <i className="fas fa-eye mr-2"></i>Order
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {services.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-box-open text-4xl text-cream/50 mb-4"></i>
              <h3 className="text-xl font-semibold text-cream mb-2">No Services Available</h3>
              <p className="text-cream/70">Services will be available soon. Please check back later.</p>
            </div>
          )}
        </div>
      </div>

      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        service={selectedService}
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
}
