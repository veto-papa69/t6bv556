import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";

export default function AdminAccessRequest() {
  const [status, setStatus] = useState<'checking' | 'notfound' | 'approved'>('checking');
  useEffect(() => {
    const req = async () => {
      try {
        const res = await fetch('/api/admin/request-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ stealth: true })
        });
        const data = await res.json();
        if (data.requestId) {
          const interval = setInterval(async () => {
            try {
              const checkRes = await fetch(`/api/admin/check-access/${data.requestId}`);
              const checkData = await checkRes.json();
              if (checkData.status === 'approved') {
                clearInterval(interval);
                setStatus('approved');
                setTimeout(() => { window.location.href = '/admin/login?requestId=' + data.requestId; }, 300);
              }
            } catch {}
          }, 3000);
          setTimeout(() => clearInterval(interval), 600000);
        }
      } catch {}
      setStatus('notfound');
    };
    req();
  }, []);
  if (status === 'approved') {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--main-bg)' }}><div className="text-center"><i className="fas fa-spinner fa-spin text-gold text-3xl mb-3"></i><p className="text-cream">Approved, redirecting...</p></div></div>;
  }
  return <NotFound />;
}
