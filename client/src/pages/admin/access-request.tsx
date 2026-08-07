import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AdminAccessRequest() {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'pending' | 'approved' | 'declined' | 'error'>('idle');
  const [requestId, setRequestId] = useState<string>('');
  const { toast } = useToast();

  const requestAccess = async () => {
    setStatus('requesting');
    try {
      const res = await fetch('/api/admin/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await res.json();
      
      if (data.requestId) {
        setRequestId(data.requestId);
        if (data.status === 'approved') {
          setStatus('approved');
          setTimeout(() => {
            window.location.href = '/admin/login?requestId=' + data.requestId;
          }, 1000);
        } else {
          setStatus('pending');
          // Start polling
          startPolling(data.requestId);
        }
      }
    } catch (error) {
      console.error('Request access error:', error);
      setStatus('error');
      toast({ title: "Error", description: "Failed to request access", variant: "destructive" });
    }
  };

  const startPolling = (reqId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/check-access/${reqId}`);
        const data = await res.json();
        
        if (data.status === 'approved') {
          clearInterval(interval);
          setStatus('approved');
          toast({ title: "Access Approved! ✅", description: "Redirecting to login..." });
          setTimeout(() => {
            window.location.href = '/admin/login?requestId=' + reqId;
          }, 1000);
        } else if (data.status === 'declined') {
          clearInterval(interval);
          setStatus('declined');
          toast({ title: "Access Declined ❌", description: "Admin declined your request", variant: "destructive" });
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);

    // Cleanup after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  };

  useEffect(() => {
    // Auto request access on page load
    requestAccess();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-md w-full">
        <div className="bg-charcoal border-2 border-gold/30 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-gold/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-gold/30">
            <i className="fas fa-shield-alt text-gold text-3xl"></i>
          </div>
          
          <h1 className="text-3xl font-bold text-gold mb-2">🔐 Admin Panel</h1>
          <p className="text-cream/60 text-sm mb-8">Secure Access with Telegram Approval</p>

          {status === 'idle' || status === 'requesting' && (
            <div>
              <i className="fas fa-spinner fa-spin text-gold text-2xl mb-4 block"></i>
              <p className="text-cream/80">Requesting access...</p>
            </div>
          )}

          {status === 'pending' && (
            <div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <i className="fas fa-clock text-yellow-400 text-2xl mb-2 block"></i>
                <h3 className="text-yellow-400 font-bold mb-2">Waiting for Approval</h3>
                <p className="text-cream/70 text-sm">Admin ko Telegram pe notification gaya hai. Accept karne par hi login page khulega.</p>
                <div className="mt-4 text-xs text-cream/40">
                  Request ID: {requestId.slice(0,8)}...
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-cream/50 text-sm">
                <i className="fab fa-telegram text-blue-400"></i>
                <span>Check Telegram for approval</span>
              </div>
              <div className="mt-6 flex justify-center">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gold rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          {status === 'approved' && (
            <div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                <i className="fas fa-check-circle text-green-400 text-3xl mb-2 block"></i>
                <h3 className="text-green-400 font-bold">Access Approved! ✅</h3>
                <p className="text-cream/70 text-sm mt-2">Redirecting to login...</p>
              </div>
            </div>
          )}

          {status === 'declined' && (
            <div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                <i className="fas fa-times-circle text-red-400 text-4xl mb-3 block"></i>
                <h3 className="text-red-400 font-bold text-xl mb-2">Access Declined ❌</h3>
                <p className="text-cream/60 text-sm">Admin ne aapki request decline kar di hai. Page open nahi hoga.</p>
              </div>
              <Button onClick={() => window.location.href = '/'} className="mt-6 w-full btn-outline">
                Go to Homepage
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                <i className="fas fa-exclamation-triangle text-red-400 text-2xl mb-2 block"></i>
                <p className="text-red-400 text-sm">Failed to request access. Please try again.</p>
              </div>
              <Button onClick={requestAccess} className="btn-primary w-full">
                Try Again
              </Button>
            </div>
          )}

          <div className="mt-8 p-3 bg-charcoal-dark rounded-lg border border-gold/10">
            <p className="text-cream/30 text-xs">
              🔒 Super Secure: Har /admin access pe Telegram pe Accept/Decline jayega. Sirf accept karne par hi login khulega.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
