import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useLocation();
  const [requestId, setRequestId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rid = params.get('requestId');
    if (rid) setRequestId(rid);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password, requestId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('admin_token', data.token);
        setLocation('/admin/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error - try again');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20" style={{ backgroundColor: 'var(--main-bg)' }}>
      <div className="w-full max-w-md p-8 rounded-xl border border-gold/20" style={{ backgroundColor: 'var(--card-bg)' }}>
        <h1 className="text-2xl font-bold text-gold mb-6 text-center">Admin Login</h1>
        {requestId && <p className="text-xs text-cream/60 mb-4 text-center">Request ID: {requestId.slice(0,8)}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-cream text-sm">Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} className="w-full mt-1 p-3 rounded-lg bg-main-bg border border-gold/20 text-cream" required />
          </div>
          <div>
            <label className="text-cream text-sm">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mt-1 p-3 rounded-lg bg-main-bg border border-gold/20 text-cream" required />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-gold text-main-bg font-bold rounded-lg hover:bg-gold/90 disabled:opacity-50">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
