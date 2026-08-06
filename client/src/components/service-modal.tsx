import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { calculatePrice, calculateQuantity, formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const orderSchema = z.object({
  instagramUsername: z.string().min(1, "Instagram username is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

type OrderForm = z.infer<typeof orderSchema>;

interface Service {
  id: number;
  name: string;
  category: string;
  rate: string;
  minOrder: number;
  maxOrder: number;
  deliveryTime: string;
}

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  isDiscounted?: boolean;
}

export function ServiceModal({ isOpen, onClose, service, isDiscounted = false }: ServiceModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [priceInputValue, setPriceInputValue] = useState("");
  const [quantityInputValue, setQuantityInputValue] = useState("");

  const calculatePrice = (quantity: number) => {
    if (!service) return 0;
    const rate = parseFloat(service.rate);
    return (quantity * rate) / 1000;
  };

  const getMinimumQuantityForPrice = () => {
    if (!service) return 0;
    const rate = parseFloat(service.rate);
    return Math.ceil((20 * 1000) / rate); // Minimum ₹20 order
  };

  const minQuantityForPrice = getMinimumQuantityForPrice();
  const effectiveMinOrder = Math.max(service?.minOrder || 0, minQuantityForPrice);

  const form = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      instagramUsername: "",
      price: 0,
      quantity: effectiveMinOrder,
    },
  });

  const createOrder = useMutation({
    mutationFn: async (data: OrderForm & { serviceName: string }) => {
      const response = await apiRequest("POST", "/api/orders", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order Placed!",
        description: "Your order has been placed successfully.",
      });
      onClose();
    },
    onError: (error: any) => {
      const message = error.message || "Failed to place order";
      if (message.includes("Insufficient wallet balance")) {
        toast({
          title: "Insufficient Balance",
          description: "Please add funds to your wallet to continue.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    },
  });

  const rate = service ? parseFloat(service.rate) : 0;

  const handlePriceChange = (value: string) => {
    setPriceInputValue(value);
    const price = value === "" ? 0 : parseFloat(value) || 0;
    if (price > 0 && rate > 0) {
      const quantity = calculateQuantity(price, rate);
      setQuantityInputValue(quantity.toString());
      form.setValue("quantity", quantity);
    }
    form.setValue("price", price);
  };

  const handleQuantityChange = (value: string) => {
    setQuantityInputValue(value);
    const quantity = value === "" ? 0 : parseInt(value) || 0;
    if (quantity > 0 && rate > 0) {
      const price = calculatePrice(quantity, rate);
      setPriceInputValue(price.toFixed(2));
      form.setValue("price", price);
    }
    form.setValue("quantity", quantity);
  };

  const onSubmit = async (data: OrderForm) => {
    if (!service) return;

    if (data.quantity < effectiveMinOrder || data.quantity > service.maxOrder) {
      toast({
        title: "Invalid Quantity",
        description: `Quantity must be between ${effectiveMinOrder} and ${service.maxOrder.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    const userBalance = parseFloat(user?.walletBalance || "0");
    if (data.price > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: "Please add funds to your wallet to continue.",
        variant: "destructive",
      });
      return;
    }

    await createOrder.mutateAsync({
      ...data,
      serviceName: service.name,
    });
  };

  useEffect(() => {
    if (isOpen && user) {
      form.setValue("instagramUsername", user.instagramUsername);
    }
  }, [isOpen, user, form]);

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg backdrop-blur-md border-gold/50 shadow-2xl" style={{ backgroundColor: 'rgba(28, 45, 36, 0.95)' }}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gold mb-2">
            {service.name}
          </DialogTitle>
          <p className="text-center text-cream/70">
            Place your order for {service.category.toLowerCase()}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Details */}
          <div className="border border-gold/30 rounded-lg p-4 grid grid-cols-2 gap-4 text-sm" style={{ backgroundColor: 'rgba(214, 173, 96, 0.1)' }}>
            <div>
              <span className="text-cream/60">Rate:</span>
              <span className="text-gold font-semibold ml-2">
                {formatCurrency(parseFloat(service.rate))}/1000
              </span>
            </div>
            <div>
              <span className="text-cream/60">Delivery:</span>
              <span className="text-cream ml-2">{service.deliveryTime}</span>
            </div>
            <div>
              <span className="text-cream/60">Min:</span>
              <span className="text-cream ml-2">{effectiveMinOrder.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-cream/60">Max:</span>
              <span className="text-cream ml-2">{service.maxOrder.toLocaleString()}</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="instagramUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cream font-medium">
                      Instagram Username/URL
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="@username or profile URL"
                        className="bg-charcoal-dark border-gold/20 text-cream focus:border-gold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormItem>
                  <FormLabel className="text-cream font-medium">Price (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={priceInputValue}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      placeholder="0"
                      className="bg-charcoal-dark border-gold/20 text-cream focus:border-gold"
                    />
                  </FormControl>
                </FormItem>

                <FormItem>
                  <FormLabel className="text-cream font-medium">Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      value={quantityInputValue}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      placeholder="0"
                      className="bg-charcoal-dark border-gold/20 text-cream focus:border-gold"
                    />
                  </FormControl>
                </FormItem>
              </div>

              {(parseFloat(priceInputValue) || 0) < 20 && priceInputValue !== "" && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                  <p className="text-red-400 text-sm font-medium">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    Minimum order amount is ₹20. Please increase the quantity.
                  </p>
                </div>
              )}

              <div className="bg-gold/10 border border-gold/30 rounded-lg p-4">
                <h4 className="text-gold font-semibold mb-2">Order Summary</h4>
                <div className="flex justify-between text-cream/80 mb-1">
                  <span>Service:</span>
                  <span>{service.name}</span>
                </div>
                <div className="flex justify-between text-cream/80 mb-1">
                  <span>Quantity:</span>
                  <span>{quantityInputValue || "0"}</span>
                </div>
                <div className="flex justify-between text-cream/80 mb-1">
                  <span>Delivery:</span>
                  <span>{service.deliveryTime}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gold">
                  <span>Total:</span>
                  <span>{formatCurrency(parseFloat(priceInputValue) || 0)}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createOrder.isPending || (parseFloat(priceInputValue) || 0) < 20}
                  className="flex-1 btn-primary"
                >
                  {createOrder.isPending ? (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  ) : (
                    <i className="fas fa-check mr-2"></i>
                  )}
                  Confirm Order
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
