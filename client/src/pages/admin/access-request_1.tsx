import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminAccessRequest() {
  const [status, setStatus] = useState<'checking' | 'notfound' | 'pending' | 'approved' | 'declined' | 'error'>('checking');
  const [requestId, setRequestId] = useState<string>('');

  useEffect(() => {
    // Stealth: Immediately request access in background, but show 404 to user
    requestAccess();
  }, []);

  const requestAccess = async () => {
    try {
      // Silent request - user sees 404 but Telegram notification goes in background
      const res = await fetch('/api/admin/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ stealth: true })
      });
      
      const data = await res.json();
      
      if (data.requestId) {
        setRequestId(data.requestId);
        
        if (data.status === 'approved') {
          // Auto-approved (dev mode or Telegram disabled)
          setStatus('approved');
          setTimeout(() => {
            window.location.href = '/admin/login?requestId=' + data.requestId;
          }, 500);
        } else {
          // Show 404 to normal users, but start polling in background
          setStatus('notfound');
          startPolling(data.requestId);
        }
      } else {
        setStatus('notfound');
      }
    } catch (error) {
      console.error('Request access error:', error);
      // Even on error, show 404 to keep stealth
      setStatus('notfound');
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
          // Redirect to login with requestId
          setTimeout(() => {
            window.location.href = '/admin/login?requestId=' + reqId;
          }, 500);
        } else if (data.status === 'declined') {
          clearInterval(interval);
          setStatus('declined');
          // Keep showing 404 even after decline - stealth
          setTimeout(() => setStatus('notfound'), 3000);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);

    // Cleanup after 10 minutes
    setTimeout(() => clearInterval(interval), 600000);
  };

  // STEALTH MODE: Show 404 for normal users - they won't know admin exists
  if (status === 'checking' || status === 'notfound') {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-charcoal border border-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-search text-cream/20 text-3xl"></i>
            </div>
            <h1 className="text-6xl font-bold text-gold mb-4">404</h1>
            <h2 className="text-2xl font-bold text-cream mb-3">Page Not Found</h2>
            <p className="text-cream/50 mb-8">The page you are looking for doesn't exist or has been moved.</p>
            <Button onClick={() => window.location.href = '/'} className="btn-primary">
              <i className="fas fa-home mr-2"></i>Go to Homepage
            </Button>
            {/* Hidden - polling in background */}
            <div className="hidden">
              <span data-request-id={requestId}></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="bg-charcoal border-2 border-green-500/30 rounded-2xl p-8 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check text-green-400 text-3xl"></i>
          </div>
          <h2 className="text-green-400 font-bold text-xl mb-2">Access Approved! ✅</h2>
          <p className="text-cream/70 text-sm">Redirecting to admin login...</p>
          <div className="mt-4">
            <i className="fas fa-spinner fa-spin text-gold"></i>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'declined') {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-md">
            <h1 className="text-6xl font-bold text-gold mb-4">404</h1>
            <h2 className="text-2xl font-bold text-cream mb-3">Page Not Found</h2>
            <p className="text-cream/50">The page you are looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback 404
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--main-bg)' }}>
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gold mb-4">404</h1>
          <p className="text-cream/50">Page not found</p>
        </div>
      </div>
    </div>
  );
}
