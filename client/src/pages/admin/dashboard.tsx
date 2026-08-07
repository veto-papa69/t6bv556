import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalPayments: number;
  pendingAccessRequests: number;
  settings: any;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminSession();
    fetchStats();
  }, []);

  const checkAdminSession = async () => {
    try {
      const res = await fetch('/api/admin/check-session', { credentials: 'include' });
      const data = await res.json();
      if (!data.isAdmin) {
        window.location.href = '/admin';
      }
    } catch (error) {
      window.location.href = '/admin';
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'x-admin-token': localStorage.getItem('adminToken') || '' },
        credentials: 'include'
      });
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Fetch stats error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
      localStorage.removeItem('adminToken');
      localStorage.removeItem('isAdmin');
      window.location.href = '/admin';
    } catch (error) {
      localStorage.clear();
      window.location.href = '/admin';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <i className="fas fa-spinner fa-spin text-gold text-3xl"></i>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Header */}
      <div className="bg-charcoal border-b border-gold/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
              <i className="fas fa-user-shield text-gold"></i>
            </div>
            <div>
              <h1 className="text-gold font-bold text-xl">Admin Panel</h1>
              <p className="text-cream/50 text-xs">Super Secure with Telegram Approval</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/"><Button variant="outline" size="sm" className="btn-outline">View Site</Button></Link>
            <Button onClick={handleLogout} variant="outline" size="sm" className="border-red-400/30 text-red-400 hover:bg-red-400/10">
              <i className="fas fa-sign-out-alt mr-2"></i>Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-charcoal border border-gold/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cream/50 text-sm">Total Users</p>
                <p className="text-gold text-3xl font-bold">{stats?.totalUsers || 0}</p>
              </div>
              <i className="fas fa-users text-gold/30 text-3xl"></i>
            </div>
          </div>
          <div className="bg-charcoal border border-gold/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cream/50 text-sm">Total Orders</p>
                <p className="text-gold text-3xl font-bold">{stats?.totalOrders || 0}</p>
              </div>
              <i className="fas fa-shopping-cart text-gold/30 text-3xl"></i>
            </div>
          </div>
          <div className="bg-charcoal border border-gold/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cream/50 text-sm">Payments</p>
                <p className="text-gold text-3xl font-bold">{stats?.totalPayments || 0}</p>
              </div>
              <i className="fas fa-credit-card text-gold/30 text-3xl"></i>
            </div>
          </div>
          <div className="bg-charcoal border border-gold/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cream/50 text-sm">Pending Requests</p>
                <p className="text-gold text-3xl font-bold">{stats?.pendingAccessRequests || 0}</p>
              </div>
              <i className="fas fa-clock text-gold/30 text-3xl"></i>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link href="/admin/qr">
            <div className="bg-charcoal border-2 border-gold/20 rounded-2xl p-8 hover:border-gold/50 hover:scale-[1.02] transition-all cursor-pointer group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-blue-400/20 group-hover:border-blue-400/50 transition-all">
                  <i className="fas fa-qrcode text-blue-400 text-3xl"></i>
                </div>
                <div>
                  <h3 className="text-cream font-bold text-xl">QR Code Management</h3>
                  <p className="text-cream/50 text-sm">Change UPI QR code image</p>
                </div>
              </div>
              <p className="text-cream/60 text-sm">Add funds page pe jo QR dikhta hai usko yahan se change kar sakte ho. Naya QR upload karo, turant live ho jayega.</p>
              <div className="mt-4 flex items-center gap-2 text-gold text-sm">
                <span>Manage QR</span>
                <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
              </div>
            </div>
          </Link>

          <Link href="/admin/banner">
            <div className="bg-charcoal border-2 border-gold/20 rounded-2xl p-8 hover:border-gold/50 hover:scale-[1.02] transition-all cursor-pointer group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-gold/20 to-orange-500/20 rounded-2xl flex items-center justify-center border border-gold/20 group-hover:border-gold/50 transition-all">
                  <i className="fas fa-flag text-gold text-3xl"></i>
                </div>
                <div>
                  <h3 className="text-cream font-bold text-xl">Banner Management</h3>
                  <p className="text-cream/50 text-sm">Homepage banner content</p>
                </div>
              </div>
              <p className="text-cream/60 text-sm">Homepage aur festival banner ka Hindi text yahan se change kar sakte ho. No code change needed.</p>
              <div className="mt-4 flex items-center gap-2 text-gold text-sm">
                <span>Manage Banner</span>
                <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
              </div>
            </div>
          </Link>
        </div>

        {/* Security Info */}
        <div className="bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 border border-green-400/20 rounded-2xl p-6">
          <h3 className="text-gold font-bold text-lg mb-3 flex items-center gap-2">
            <i className="fas fa-shield-alt text-green-400"></i>
            Super Secure Admin Panel - How it works
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-charcoal/50 rounded-xl p-4 border border-gold/10">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mb-2">
                <span className="text-blue-400 font-bold">1</span>
              </div>
              <p className="text-cream font-bold">Hidden URL</p>
              <p className="text-cream/60 text-xs mt-1">/admin koi normal user ko dikhega hi nahi. Navbar me link nahi hai. Sirf tu jaanta hai.</p>
            </div>
            <div className="bg-charcoal/50 rounded-xl p-4 border border-gold/10">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center mb-2">
                <span className="text-yellow-400 font-bold">2</span>
              </div>
              <p className="text-cream font-bold">Telegram Approval</p>
              <p className="text-cream/60 text-xs mt-1">Jab koi /admin kholega toh tere Telegram pe Accept/Decline jayega. Accept karega tabhi login page khulega.</p>
            </div>
            <div className="bg-charcoal/50 rounded-xl p-4 border border-gold/10">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                <span className="text-green-400 font-bold">3</span>
              </div>
              <p className="text-cream font-bold">Username + Password</p>
              <p className="text-cream/60 text-xs mt-1">Telegram approve ke baad bhi username/password dalna padega. Double security!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
