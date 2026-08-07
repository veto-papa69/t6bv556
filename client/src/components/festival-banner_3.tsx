import { useState, useEffect } from "react";
export function FestivalBanner() {
  return (
    <div className="fixed top-20 left-0 right-0 z-40">
      <div className="relative overflow-hidden backdrop-blur-md bg-gradient-to-r from-gold/25 via-yellow-500/20 to-gold/25 border-b border-gold/40 shadow-lg">
        <div className="flex whitespace-nowrap animate-marquee py-3">
          <span className="text-sm font-bold text-gold flex items-center gap-3"><span>🚀</span><span className="text-white">इंस्टाबूस्ट प्रो - भारत का नंबर 1 SMM पैनल - रियल फॉलोअर्स ₹11/1000 - 5 दोस्तों को रेफर करो और पाओ 50% लाइफटाइम छूट</span></span>
        </div>
      </div>
    </div>
  );
}
export function getCurrentFestivalDiscount(){return 0;}
