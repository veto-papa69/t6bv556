import { useState, useEffect } from "react";
export function FestivalBanner() {
  const [bannerText, setBannerText] = useState<string>("");
  const [enabled, setEnabled] = useState(true);
  useEffect(() => {
    fetch('/api/settings/banner').then(res => res.json()).then(data => {
      if (data.text) { setBannerText(data.text); setEnabled(data.enabled !== false); }
      else { setBannerText("इंस्टाबूस्ट प्रो - भारत का नंबर 1 SMM पैनल"); }
    }).catch(() => { setBannerText("इंस्टाबूस्ट प्रो - भारत का नंबर 1 SMM पैनल"); });
  }, []);
  if (!enabled || !bannerText) return null;
  return (
    <div className="fixed top-20 left-0 right-0 z-40">
      <div className="relative overflow-hidden backdrop-blur-md bg-gradient-to-r from-gold/25 via-yellow-500/20 to-gold/25 border-b border-gold/40 shadow-lg">
        <div className="flex whitespace-nowrap animate-marquee py-3">
          <span className="text-sm font-bold text-gold flex items-center gap-3"><span>🚀</span><span className="text-white">{bannerText}</span></span>
        </div>
      </div>
    </div>
  );
}
export function getCurrentFestivalDiscount(){return 0;}
