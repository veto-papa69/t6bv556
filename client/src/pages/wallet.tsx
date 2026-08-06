import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { usePaymentStatus } from "@/hooks/use-payment-status";
import { formatCurrency } from "@/lib/utils";
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

export default function Wallet() {
  const { user } = useAuth();
  
  // Monitor payment status for real-time notifications
  usePaymentStatus();

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.price), 0);
  const recentOrders = orders.slice(-3);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "processing":
        return "bg-yellow-500/20 text-yellow-400";
      case "cancelled":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-blue-500/20 text-blue-400";
    }
  };

  return (
    <div className="pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gold mb-4">Wallet</h1>
          <p className="text-xl text-cream/70">Manage your balance and view transaction history</p>
        </div>

        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-br from-charcoal to-charcoal-dark border border-gold/30 rounded-xl p-8 mb-8 text-center">
          <h2 className="text-2xl font-semibold text-cream mb-4">Available Balance</h2>
          <div className="text-5xl font-bold text-gold mb-6">
            {formatCurrency(user?.walletBalance || "0")}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/add-funds">
              <Button className="btn-primary hover:scale-105 transition-all duration-300">
                <i className="fas fa-plus mr-2"></i>Add Funds
              </Button>
            </Link>
            <Link href="/orders">
              <Button variant="outline" className="btn-outline">
                <i className="fas fa-history mr-2"></i>Transaction History
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-charcoal rounded-xl p-6 border border-gold/20 text-center">
            <i className="fas fa-shopping-cart text-gold text-2xl mb-3"></i>
            <h3 className="text-lg font-semibold text-cream mb-2">Total Orders</h3>
            <p className="text-2xl font-bold text-gold">{orders.length}</p>
          </div>
          <div className="bg-charcoal rounded-xl p-6 border border-gold/20 text-center">
            <i className="fas fa-credit-card text-gold text-2xl mb-3"></i>
            <h3 className="text-lg font-semibold text-cream mb-2">Total Spent</h3>
            <p className="text-2xl font-bold text-gold">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="bg-charcoal rounded-xl p-6 border border-gold/20 text-center">
            <i className="fas fa-gift text-gold text-2xl mb-3"></i>
            <h3 className="text-lg font-semibold text-cream mb-2">Bonus Status</h3>
            <p className="text-2xl font-bold text-gold">
              {user?.bonusClaimed ? "Claimed" : "Available"}
            </p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-charcoal rounded-2xl p-8 border border-gold/20">
          <h2 className="text-2xl font-bold text-gold mb-6">Recent Transactions</h2>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="p-4 border-b border-gold/10 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-cream">{order.serviceName}</div>
                      <div className="text-sm text-cream/70">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gold font-semibold">
                        -{formatCurrency(order.price)}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-cream/50">
                <i className="fas fa-receipt text-4xl mb-4"></i>
                <p className="text-lg">No transactions yet</p>
                <p className="text-sm">Your transaction history will appear here</p>
                <Link href="/services">
                  <Button className="mt-4 btn-primary">
                    Browse Services
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {recentOrders.length > 0 && (
            <div className="text-center mt-6">
              <Link href="/orders">
                <Button variant="outline" className="btn-outline">
                  View All Transactions
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
