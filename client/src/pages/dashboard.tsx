import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth, useClaimBonus } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, copyToClipboard } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Order {
  id: number;
  orderId: string;
  serviceName: string;
  quantity: number;
  price: string;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const claimBonus = useClaimBonus();
  const { toast } = useToast();

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const handleClaimBonus = async () => {
    if (user?.bonusClaimed) {
      toast({
        title: "Bonus Already Claimed",
        description: "You have already claimed your welcome bonus.",
        variant: "destructive",
      });
      return;
    }

    try {
      await claimBonus.mutateAsync();
      toast({
        title: "Bonus Claimed!",
        description: "₹10 has been added to your wallet!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim bonus. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyUID = async () => {
    if (user?.uid) {
      try {
        await copyToClipboard(user.uid);
        toast({
          title: "Copied!",
          description: "Your UID has been copied to clipboard.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy UID to clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.price), 0);

  return (
    <div className="pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gold mb-2">Dashboard</h1>
          <p className="text-cream/70">Welcome back! Manage your SMM services here.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-charcoal border border-gold/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cream/70 text-sm">Wallet Balance</p>
                <p className="text-2xl font-bold text-gold">
                  {formatCurrency(user?.walletBalance || "0")}
                </p>
              </div>
              <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center">
                <i className="fas fa-wallet text-gold"></i>
              </div>
            </div>
          </div>

          <div className="bg-charcoal border border-gold/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cream/70 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-gold">{orders.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <i className="fas fa-shopping-cart text-blue-400"></i>
              </div>
            </div>
          </div>

          <div className="bg-charcoal border border-gold/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cream/70 text-sm">Your UID</p>
                <p className="text-sm font-mono text-gold">{user?.uid || "Loading..."}</p>
              </div>
              <button 
                onClick={handleCopyUID}
                className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center hover:bg-green-500/30 transition-all"
              >
                <i className="fas fa-copy text-green-400"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Welcome Bonus Section */}
        {!user?.bonusClaimed && (
          <div className="bg-gradient-to-r from-gold/20 to-tan/20 border border-gold/30 rounded-xl p-6 mb-8 bonus-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bonus-icon">
                    <i className="fas fa-gift text-gold text-2xl heartbeat"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gold">Welcome Bonus</h3>
                </div>
                <p className="text-cream/80">Claim your free followers now!</p>
              </div>
              <Button 
                onClick={handleClaimBonus}
                disabled={claimBonus.isPending}
                className="btn-primary pulse-glow heartbeat"
              >
                {claimBonus.isPending ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : (
                  <i className="fas fa-star mr-2"></i>
                )}
                Claim Now
              </Button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/services">
            <div className="bg-charcoal border border-gold/20 rounded-xl p-6 text-center hover:border-gold/40 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer">
              <i className="fas fa-shopping-bag text-2xl text-gold mb-3"></i>
              <h3 className="font-semibold text-cream mb-1">Browse Services</h3>
              <p className="text-sm text-cream/70">View all available services</p>
            </div>
          </Link>

          <Link href="/add-funds">
            <div className="bg-charcoal border border-gold/20 rounded-xl p-6 text-center hover:border-gold/40 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer">
              <i className="fas fa-plus-circle text-2xl text-green-400 mb-3"></i>
              <h3 className="font-semibold text-cream mb-1">Add Funds</h3>
              <p className="text-sm text-cream/70">Top up your wallet</p>
            </div>
          </Link>

          <Link href="/orders">
            <div className="bg-charcoal border border-gold/20 rounded-xl p-6 text-center hover:border-gold/40 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer">
              <i className="fas fa-history text-2xl text-blue-400 mb-3"></i>
              <h3 className="font-semibold text-cream mb-1">Order History</h3>
              <p className="text-sm text-cream/70">Track your orders</p>
            </div>
          </Link>

          <Link href="/wallet">
            <div className="bg-charcoal border border-gold/20 rounded-xl p-6 text-center hover:border-gold/40 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer">
              <i className="fas fa-wallet text-2xl text-purple-400 mb-3"></i>
              <h3 className="font-semibold text-cream mb-1">Wallet</h3>
              <p className="text-sm text-cream/70">Manage your balance</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
