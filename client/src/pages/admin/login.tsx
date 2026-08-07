import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [requestId, setRequestId] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reqId = urlParams.get('requestId') || '';
    setRequestId(reqId);
    
    // Check if already logged in as admin
    fetch('/api/admin/check-session', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.isAdmin) {
          window.location.href = '/admin/dashboard';
        }
      });
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      toast({ title: "Error", description: "Username and password required", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password, requestId })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('adminToken', data.token);
        toast({ title: "Admin Login Successful! 🔓", description: "Welcome to admin panel" });
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 500);
      } else {
        toast({ title: "Login Failed", description: data.error || "Invalid credentials", variant: "destructive" });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast({ title: "Error", description: "Login failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-md w-full">
        <div className="bg-charcoal border-2 border-gold/30 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-gold/20 to-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-gold/30">
              <i className="fas fa-user-shield text-gold text-3xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-gold">Admin Login</h1>
            <p className="text-cream/60 text-sm mt-2">Enter admin credentials to continue</p>
            {requestId && (
              <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 inline-block">
                <span className="text-green-400 text-xs">✅ Telegram Approved - {requestId.slice(0,8)}</span>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <Label className="text-cream mb-2 block">Admin Username</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="bg-charcoal-dark border-gold/20 text-cream focus:border-gold"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div>
              <Label className="text-cream mb-2 block">Admin Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="bg-charcoal-dark border-gold/20 text-cream focus:border-gold"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full btn-primary py-6 text-lg font-bold"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Logging in...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt mr-2"></i> Login to Admin Panel
                </>
              )}
            </Button>

            <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-3">
              <p className="text-blue-300 text-xs">
                <i className="fas fa-info-circle mr-1"></i>
                Default: admin / admin123 - Change in Render env variables ADMIN_USERNAME & ADMIN_PASSWORD
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a href="/" className="text-cream/40 hover:text-gold text-sm">
              ← Back to Website
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
