import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Order {
  id: number;
  orderId: string;
  serviceName: string;
  instagramUsername: string;
  quantity: number;
  price: string;
  status: string;
  createdAt: string;
}

export default function Orders() {
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

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

  if (isLoading) {
    return (
      <div className="pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-gold text-4xl mb-4"></i>
            <p className="text-cream/70">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gold mb-4">Order History</h1>
          <p className="text-xl text-cream/70">Track all your service orders and their status</p>
        </div>

        <div className="bg-charcoal rounded-2xl border border-gold/20 overflow-hidden">
          <div className="p-6 border-b border-gold/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <h2 className="text-2xl font-bold text-gold">Your Orders</h2>
              <div className="flex items-center space-x-4">
                <Link href="/services">
                  <Button className="btn-primary">
                    <i className="fas fa-plus mr-2"></i>New Order
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-charcoal-dark">
                <tr>
                  <th className="px-6 py-4 text-left text-gold font-semibold">Order ID</th>
                  <th className="px-6 py-4 text-left text-gold font-semibold">Service</th>
                  <th className="px-6 py-4 text-left text-gold font-semibold">Username</th>
                  <th className="px-6 py-4 text-left text-gold font-semibold">Quantity</th>
                  <th className="px-6 py-4 text-left text-gold font-semibold">Price</th>
                  <th className="px-6 py-4 text-left text-gold font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-gold font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-charcoal-dark/50 transition-colors">
                      <td className="px-6 py-4 text-cream font-mono text-sm">
                        {order.orderId}
                      </td>
                      <td className="px-6 py-4 text-cream">
                        {order.serviceName}
                      </td>
                      <td className="px-6 py-4 text-cream">
                        @{order.instagramUsername}
                      </td>
                      <td className="px-6 py-4 text-cream">
                        {order.quantity.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gold font-semibold">
                        {formatCurrency(order.price)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-cream/70 text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-cream/60">
                      <i className="fas fa-shopping-bag text-4xl mb-4"></i>
                      <p className="text-lg mb-2">No orders yet</p>
                      <p className="text-sm mb-4">Start by placing your first order from our services</p>
                      <Link href="/services">
                        <Button className="btn-primary">
                          Browse Services
                        </Button>
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
