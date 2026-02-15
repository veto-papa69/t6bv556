import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { useAuth } from "./use-auth";
import { useEffect } from "react";

interface Payment {
  id: number;
  userId: number;
  amount: string;
  utrNumber: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

// Track processed payments globally to avoid re-notifications
const processedPayments = new Set<string>();
const sessionProcessedPayments = new Set<string>();

export function usePaymentStatus() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
    enabled: isAuthenticated,
    refetchInterval: 2000, // Check every 2 seconds for faster updates
  });

  useEffect(() => {
    if (!payments.length) return;

    payments.forEach(payment => {
      const paymentKey = `${payment.id}-${payment.status}`;
      const sessionKey = `${payment.id}-session`;
      
      // Skip if already processed globally or in this session
      if (processedPayments.has(paymentKey) || sessionProcessedPayments.has(sessionKey)) return;
      
      if (payment.status === "Approved") {
        toast({
          title: "Payment Approved!",
          description: `₹${payment.amount} has been added to your wallet successfully.`,
        });
        // Refresh user data to update wallet balance
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        processedPayments.add(paymentKey);
        sessionProcessedPayments.add(sessionKey);
      } else if (payment.status === "Declined") {
        toast({
          title: "Payment Failed",
          description: "Your payment transaction has been declined. Please try again or contact support.",
          variant: "destructive",
        });
        processedPayments.add(paymentKey);
        sessionProcessedPayments.add(sessionKey);
      }
      
      // For pending payments, just mark them as seen to avoid future duplicate notifications
      if (payment.status === "Pending") {
        sessionProcessedPayments.add(sessionKey);
      }
    });
  }, [payments, toast, queryClient]);

  // Clear session processed payments when authentication state changes
  useEffect(() => {
    if (!isAuthenticated) {
      sessionProcessedPayments.clear();
    }
  }, [isAuthenticated]);

  return { payments };
}
