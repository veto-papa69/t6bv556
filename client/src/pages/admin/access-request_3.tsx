import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";

export default function AdminAccessRequest() {
  const [status, setStatus] = useState<'checking' | 'notfound' | 'approved'>('checking');
  
  useEffect(() => {
    const sendRequest = async () => {
      try {
        console.log("Sending admin access request...");
        const res = await fetch('/api/admin/request-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ stealth: true })
        });
        const data = await res.json();
        console.log("Admin request response:", data);
        if (data.requestId) {
          // Poll for approval every 3 seconds
          const interval = setInterval(async () => {
            try {
              const checkRes = await fetch(`/api/admin/check-access/${data.requestId}`);
              const checkData = await checkRes.json();
              console.log("Check access:", checkData);
              if (checkData.status === 'approved') {
                clearInterval(interval);
                setStatus('approved');
                setTimeout(() => {
                  window.location.href = '/admin/login?requestId=' + data.requestId;
                }, 500);
              }
            } catch (e) {
              console.error("Check access error:", e);
            }
          }, 3000);
          // Stop polling after 10 minutes
          setTimeout(() => clearInterval(interval), 600000);
        }
      } catch (e) {
        console.error("Admin request failed:", e);
      }
      // Always show 404 for stealth
      setStatus('notfound');
    };
    sendRequest();
  }, []);

  if (status === 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-gold text-3xl mb-3"></i>
          <p className="text-cream">Access approved, redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Stealth - show same 404 as any other page
  return <NotFound />;
}
