import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const paymentSchema = z.object({
  amount: z.number().min(30, "Minimum amount is ₹30"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  utrNumber: z.string().min(1, "UTR number is required"),
});

type PaymentForm = z.infer<typeof paymentSchema>;

export default function AddFunds() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const form = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: "",
      paymentMethod: "",
      utrNumber: "",
    },
  });

  const submitPayment = useMutation({
    mutationFn: async (data: PaymentForm) => {
      const response = await apiRequest("POST", "/api/payments", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Submitted",
        description: "Your payment request has been submitted for verification. Funds will be added after admin approval.",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit payment",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: PaymentForm) => {
    await submitPayment.mutateAsync(data);
  };

  return (
    <div className="pt-28 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gold mb-4">Add Funds</h1>
          <p className="text-xl text-cream/70">Top up your wallet using UPI payment</p>
        </div>

        <div className="bg-charcoal rounded-2xl p-8 border border-gold/20">
          {/* UPI QR Code Section */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gold mb-6">Scan QR Code to Pay</h2>
            <div className="inline-block p-4 bg-white rounded-xl">
              <img 
                src="https://files.catbox.moe/6vf8fb.jpg" 
                alt="UPI QR Code for payment" 
                className="w-48 h-48 object-contain"
              />
            </div>
            <p className="text-cream/60 mt-4">Pay using any UPI app (PhonePe, GPay, Paytm, etc.)</p>
          </div>

          {/* Payment Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cream font-semibold">Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="30"
                        step="0.01"
                        placeholder="Enter amount (minimum ₹30)"
                        className="bg-charcoal-dark border-gold/20 text-cream focus:border-gold"
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cream font-semibold">Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-charcoal-dark border-gold/20 text-cream focus:border-gold">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="paytm">Paytm</SelectItem>
                        <SelectItem value="gpay">Google Pay</SelectItem>
                        <SelectItem value="phonepe">PhonePe</SelectItem>
                        <SelectItem value="netbanking">Net Banking</SelectItem>
                        <SelectItem value="upi">Other UPI</SelectItem>
                        <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="utrNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cream font-semibold">UTR/Transaction ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter UTR number"
                        className="bg-charcoal-dark border-gold/20 text-cream focus:border-gold"
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-cream/50 text-sm">
                      Find UTR in your payment app after successful payment
                    </p>
                  </FormItem>
                )}
              />

              <div>
                <FormLabel className="text-cream font-semibold">Your UID</FormLabel>
                <Input
                  value={user?.uid || ""}
                  readOnly
                  className="bg-charcoal-dark border-gold/20 text-cream/70 cursor-not-allowed mt-2"
                />
              </div>

              <Button
                type="submit"
                disabled={submitPayment.isPending}
                className="w-full btn-primary"
              >
                {submitPayment.isPending ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : (
                  <i className="fas fa-paper-plane mr-2"></i>
                )}
                Submit Payment Request
              </Button>
            </form>
          </Form>

          <div className="mt-8 p-4 bg-gold/10 border border-gold/20 rounded-xl">
            <div className="flex items-start space-x-3">
              <i className="fas fa-info-circle text-gold text-lg mt-1"></i>
              <div className="text-cream/80 text-sm">
                <p className="font-semibold mb-2">Payment Instructions:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Scan the QR code and complete payment</li>
                  <li>Copy the UTR/Transaction ID from your payment app</li>
                  <li>Submit this form with the UTR number</li>
                  <li>Funds will be added after admin verification (usually within 5-15 minutes)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
