import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { useAuth } from "./use-auth";
import { useEffect } from "react";

interface Payment {
  id: number;
  _id?: string;
  userId: number | string;
  amount: string;
  utrNumber: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

// Persistent storage for processed payments using localStorage
function getProcessedPayments(): Set<string> {
  try {
    const stored = localStorage.getItem('processed_payments_v2');
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch {}
  return new Set();
}

function saveProcessedPayment(paymentKey: string) {
  try {
    const current = getProcessedPayments();
    current.add(paymentKey);
    // Keep only last 50 to avoid bloat
    const arr = Array.from(current).slice(-50);
    localStorage.setItem('processed_payments_v2', JSON.stringify(arr));
  } catch {}
}

function isRecentPayment(createdAt: string): boolean {
  try {
    const created = new Date(createdAt).getTime();
    const now = Date.now();
    const diffHours = (now - created) / (1000 * 60 * 60);
    // Only notify for payments created within last 24 hours
    // Old payments from days ago should not trigger popup on refresh
    return diffHours <= 24;
  } catch {
    return false;
  }
}

export function usePaymentStatus() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
    queryFn: async () => {
      const res = await fetch("/api/payments", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated,
    refetchInterval: 10000, // Reduced from 2s to 10s to reduce annoyance
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (!payments.length) return;

    const processed = getProcessedPayments();

    payments.forEach(payment => {
      const pid = (payment as any)._id || (payment as any).id;
      const paymentKey = `${pid}-${payment.status}`;
      
      // Skip if already notified
      if (processed.has(paymentKey)) return;

      // CRITICAL FIX: Only notify for recent payments (last 24h)
      // This prevents old approved payments from showing popup on every refresh
      if (!isRecentPayment(payment.createdAt)) {
        // Mark old payments as processed silently without toast
        saveProcessedPayment(paymentKey);
        return;
      }
      
      if (payment.status === "Approved") {
        toast({
          title: "Payment Approved! ✅",
          description: `₹${payment.amount} has been added to your wallet successfully.`,
          duration: 5000,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        saveProcessedPayment(paymentKey);
      } else if (payment.status === "Declined") {
        toast({
          title: "Payment Declined ❌",
          description: "Your payment was declined. Please try again or contact support.",
          variant: "destructive",
          duration: 6000,
        });
        saveProcessedPayment(paymentKey);
      }
      // Pending payments: don't toast, but mark as seen after 1 hour to avoid future spam
      else if (payment.status === "Pending") {
        const created = new Date(payment.createdAt).getTime();
        const hoursSince = (Date.now() - created) / (1000*60*60);
        if (hoursSince > 1) {
          saveProcessedPayment(paymentKey);
        }
      }
    });
  }, [payments, toast, queryClient]);

  return { payments };
}
