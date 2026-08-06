import { useState, useEffect } from "react";

interface Festival {
  name: string;
  nameHindi: string;
  date: Date; // main date
  type: 'fixed' | 'variable';
  emoji: string;
  discount: number;
  color: string;
  startDaysBefore: number; // show banner X days before
  endDaysAfter: number; // keep showing X days after
  messageEn: string;
  messageHi: string;
}

// Indian festivals for 2026 (and approximate for future years)
// For variable festivals, we use 2026 dates, for next years it will auto-calc with fixed dates or fallback
function getFestivalsForYear(year: number): Festival[] {
  return [
    // Fixed date festivals
    {
      name: "Republic Day",
      nameHindi: "गणतंत्र दिवस",
      date: new Date(year, 0, 26), // Jan 26
      type: 'fixed',
      emoji: "🇮🇳",
      discount: 26,
      color: "from-orange-500/30 via-white/20 to-green-500/30",
      startDaysBefore: 3,
      endDaysAfter: 1,
      messageEn: "REPUBLIC DAY SALE - 26% OFF ON ALL SERVICES!",
      messageHi: "गणतंत्र दिवस धमाका - सभी सर्विस पर 26% छूट!"
    },
    {
      name: "Valentine's Day",
      nameHindi: "वैलेंटाइन डे",
      date: new Date(year, 1, 14), // Feb 14
      type: 'fixed',
      emoji: "💘",
      discount: 14,
      color: "from-pink-500/30 to-red-500/30",
      startDaysBefore: 2,
      endDaysAfter: 1,
      messageEn: "VALENTINE'S DAY SPECIAL - SPREAD LOVE WITH 30% OFF!",
      messageHi: "वैलेंटाइन स्पेशल - 30% छूट के साथ प्यार फैलाएं!"
    },
    {
      name: "Holi",
      nameHindi: "होली",
      date: new Date(year, 2, 3), // March 3, 2026 (actual 2026 date)
      type: 'variable',
      emoji: "🎨",
      discount: 35,
      color: "from-pink-500/30 via-yellow-500/20 to-green-500/30",
      startDaysBefore: 5,
      endDaysAfter: 2,
      messageEn: "HOLI DHAMAKA - COLOR YOUR FEED WITH 35% OFF!",
      messageHi: "होली धमाका - 35% छूट के साथ अपने फीड में रंग भरें!"
    },
    {
      name: "Eid ul-Fitr",
      nameHindi: "ईद उल-फितर",
      date: new Date(year, 2, 20), // March 20, 2026 approx
      type: 'variable',
      emoji: "🌙",
      discount: 30,
      color: "from-green-500/30 to-emerald-500/20",
      startDaysBefore: 4,
      endDaysAfter: 2,
      messageEn: "EID MUBARAK - CELEBRATE WITH 30% OFF!",
      messageHi: "ईद मुबारक - 30% छूट के साथ जश्न मनाएं!"
    },
    {
      name: "Baisakhi",
      nameHindi: "बैसाखी",
      date: new Date(year, 3, 13), // April 13
      type: 'fixed',
      emoji: "🌾",
      discount: 25,
      color: "from-yellow-500/30 to-orange-500/20",
      startDaysBefore: 2,
      endDaysAfter: 1,
      messageEn: "BAISAKHI DHAMAKA - HARVEST YOUR GROWTH WITH 25% OFF!",
      messageHi: "बैसाखी धमाका - 25% छूट के साथ ग्रोथ काटें!"
    },
    {
      name: "Independence Day",
      nameHindi: "स्वतंत्रता दिवस",
      date: new Date(year, 7, 15), // Aug 15
      type: 'fixed',
      emoji: "🇮🇳",
      discount: 50,
      color: "from-orange-500/30 via-white/20 to-green-600/30",
      startDaysBefore: 7,
      endDaysAfter: 2,
      messageEn: "INDEPENDENCE DAY MEGA SALE - 50% OFF - JAI HIND!",
      messageHi: "स्वतंत्रता दिवस मेगा सेल - 50% छूट - जय हिंद!"
    },
    {
      name: "Raksha Bandhan",
      nameHindi: "रक्षा बंधन",
      date: new Date(year, 7, 9), // Aug 9, 2026
      type: 'variable',
      emoji: "🎀",
      discount: 30,
      color: "from-pink-400/30 to-purple-500/20",
      startDaysBefore: 4,
      endDaysAfter: 1,
      messageEn: "RAKSHA BANDHAN SPECIAL - GIFT GROWTH WITH 30% OFF!",
      messageHi: "रक्षा बंधन स्पेशल - 30% छूट के साथ ग्रोथ गिफ्ट करें!"
    },
    {
      name: "Janmashtami",
      nameHindi: "जन्माष्टमी",
      date: new Date(year, 7, 14), // Aug 14, 2026
      type: 'variable',
      emoji: "🦚",
      discount: 25,
      color: "from-blue-500/30 to-purple-500/20",
      startDaysBefore: 3,
      endDaysAfter: 1,
      messageEn: "JANMASHTAMI DHAMAKA - DIVINE GROWTH WITH 25% OFF!",
      messageHi: "जन्माष्टमी धमाका - 25% छूट!"
    },
    {
      name: "Teej",
      nameHindi: "तीज",
      date: new Date(year, 7, 26), // Aug 26, 2026 (Hariyali Teej approx)
      type: 'variable',
      emoji: "🌿",
      discount: 20,
      color: "from-green-400/30 to-yellow-500/20",
      startDaysBefore: 3,
      endDaysAfter: 1,
      messageEn: "TEEJ FESTIVAL SPECIAL - 20% OFF FOR ALL QUEENS!",
      messageHi: "तीज स्पेशल - सभी रानियों के लिए 20% छूट!"
    },
    {
      name: "Ganesh Chaturthi",
      nameHindi: "गणेश चतुर्थी",
      date: new Date(year, 8, 6), // Sep 6, 2026
      type: 'variable',
      emoji: "🐘",
      discount: 30,
      color: "from-orange-400/30 to-red-500/20",
      startDaysBefore: 4,
      endDaysAfter: 2,
      messageEn: "GANESH CHATURTHI - BAPPA BLESSINGS WITH 30% OFF!",
      messageHi: "गणेश चतुर्थी - 30% छूट के साथ बप्पा का आशीर्वाद!"
    },
    {
      name: "Navratri",
      nameHindi: "नवरात्रि",
      date: new Date(year, 9, 2), // Oct 2, 2026 start
      type: 'variable',
      emoji: "💃",
      discount: 40,
      color: "from-red-500/30 via-yellow-500/20 to-orange-500/30",
      startDaysBefore: 5,
      endDaysAfter: 9, // 9 days festival
      messageEn: "NAVRATRI DHAMAKA - 9 DAYS 40% OFF - JAI MATA DI!",
      messageHi: "नवरात्रि धमाका - 9 दिन 40% छूट - जय माता दी!"
    },
    {
      name: "Dussehra",
      nameHindi: "दशहरा",
      date: new Date(year, 9, 12), // Oct 12, 2026
      type: 'variable',
      emoji: "🏹",
      discount: 35,
      color: "from-orange-500/30 to-red-600/20",
      startDaysBefore: 3,
      endDaysAfter: 2,
      messageEn: "DUSSEHRA VIJAY - TRIUMPH WITH 35% OFF!",
      messageHi: "दशहरा विजय - 35% छूट के साथ जीत!"
    },
    {
      name: "Diwali",
      nameHindi: "दीवाली",
      date: new Date(year, 9, 20), // Oct 20, 2026
      type: 'variable',
      emoji: "🪔",
      discount: 50,
      color: "from-yellow-400/30 via-orange-500/30 to-red-500/30",
      startDaysBefore: 10,
      endDaysAfter: 3,
      messageEn: "DIWALI DHAMAKA - BIGGEST SALE 50% OFF - SHUBH DEEPAVALI!",
      messageHi: "दीवाली धमाका - सबसे बड़ी सेल 50% छूट - शुभ दीपावली!"
    },
    {
      name: "Bhai Dooj",
      nameHindi: "भाई दूज",
      date: new Date(year, 9, 23), // Oct 23, 2026
      type: 'variable',
      emoji: "👫",
      discount: 25,
      color: "from-pink-300/30 to-blue-400/20",
      startDaysBefore: 2,
      endDaysAfter: 1,
      messageEn: "BHAI DOOJ SPECIAL - CELEBRATE SIBLING LOVE 25% OFF!",
      messageHi: "भाई दूज स्पेशल - 25% छूट!"
    },
    {
      name: "Children's Day",
      nameHindi: "बाल दिवस",
      date: new Date(year, 10, 14), // Nov 14
      type: 'fixed',
      emoji: "🧒",
      discount: 20,
      color: "from-blue-400/30 to-pink-400/20",
      startDaysBefore: 2,
      endDaysAfter: 1,
      messageEn: "CHILDREN'S DAY SPECIAL - 20% OFF - BACHPAN ROCKS!",
      messageHi: "बाल दिवस स्पेशल - 20% छूट!"
    },
    {
      name: "Christmas",
      nameHindi: "क्रिसमस",
      date: new Date(year, 11, 25), // Dec 25
      type: 'fixed',
      emoji: "🎄",
      discount: 40,
      color: "from-red-500/30 to-green-500/30",
      startDaysBefore: 7,
      endDaysAfter: 2,
      messageEn: "CHRISTMAS MEGA SALE - 40% OFF - MERRY CHRISTMAS!",
      messageHi: "क्रिसमस मेगा सेल - 40% छूट - मेरी क्रिसमस!"
    },
    {
      name: "New Year",
      nameHindi: "नया साल",
      date: new Date(year, 0, 1), // Jan 1
      type: 'fixed',
      emoji: "🎉",
      discount: 45,
      color: "from-purple-500/30 via-pink-500/20 to-yellow-500/30",
      startDaysBefore: 5,
      endDaysAfter: 3,
      messageEn: "NEW YEAR DHAMAKA - START 2027 WITH 45% OFF!",
      messageHi: "नया साल धमाका - 45% छूट के साथ नई शुरुआत!"
    },
    {
      name: "Eid al-Adha",
      nameHindi: "बकरीद",
      date: new Date(year, 5, 27), // May 27, 2026 approx
      type: 'variable',
      emoji: "🐐",
      discount: 30,
      color: "from-green-600/30 to-emerald-500/20",
      startDaysBefore: 3,
      endDaysAfter: 2,
      messageEn: "EID AL-ADHA MUBARAK - 30% OFF CELEBRATION!",
      messageHi: "बकरीद मुबारक - 30% छूट!"
    },
  ];
}

function getActiveFestival(): Festival | null {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Check current year and next year festivals (for Dec-Jan overlap)
  const festivals = [...getFestivalsForYear(currentYear), ...getFestivalsForYear(currentYear + 1)];
  
  for (const festival of festivals) {
    const startDate = new Date(festival.date);
    startDate.setDate(startDate.getDate() - festival.startDaysBefore);
    startDate.setHours(0,0,0,0);
    
    const endDate = new Date(festival.date);
    endDate.setDate(endDate.getDate() + festival.endDaysAfter);
    endDate.setHours(23,59,59,999);
    
    if (now >= startDate && now <= endDate) {
      return festival;
    }
  }
  
  return null;
}

function getUpcomingFestival(): Festival | null {
  const now = new Date();
  const currentYear = now.getFullYear();
  const festivals = [...getFestivalsForYear(currentYear), ...getFestivalsForYear(currentYear + 1)]
    .sort((a,b) => a.date.getTime() - b.date.getTime());
  
  for (const festival of festivals) {
    if (festival.date > now) {
      const daysUntil = Math.ceil((festival.date.getTime() - now.getTime()) / (1000*60*60*24));
      if (daysUntil <= 30) { // Show upcoming within 30 days
        return festival;
      }
      break;
    }
  }
  return null;
}

export function FestivalBanner() {
  const [activeFestival, setActiveFestival] = useState<Festival | null>(null);
  const [upcomingFestival, setUpcomingFestival] = useState<Festival | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setActiveFestival(getActiveFestival());
    setUpcomingFestival(getUpcomingFestival());
    
    // Check if banner dismissed today
    const dismissedDate = localStorage.getItem('festival_banner_dismissed');
    const today = new Date().toDateString();
    if (dismissedDate === today) {
      setDismissed(true);
    }

    // Update every hour
    const interval = setInterval(() => {
      setActiveFestival(getActiveFestival());
      setUpcomingFestival(getUpcomingFestival());
    }, 3600000);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('festival_banner_dismissed', new Date().toDateString());
  };

  if (dismissed) return null;

  const festival = activeFestival || upcomingFestival;
  
  if (!festival) {
    // Default banner when no festival
    return (
      <div className="fixed top-20 left-0 right-0 z-40 announcement-banner">
        <div className="relative overflow-hidden backdrop-blur-md bg-gradient-to-r from-gold/20 via-yellow-500/15 to-gold/20 border-b border-gold/30 shadow-lg">
          <div className="flex whitespace-nowrap animate-marquee py-3">
            <span className="text-sm font-bold text-gold flex items-center gap-2">
              <span>🚀</span> INSTABOOST PRO - INDIA'S #1 SMM PANEL - REAL FOLLOWERS FROM ₹11/1000 - 24/7 SUPPORT - INSTANT DELIVERY - 50K+ HAPPY CUSTOMERS - 99.9% SUCCESS RATE - 
              <span className="mx-2">💎</span> REFER 5 FRIENDS & GET 50% OFF FOR LIFETIME - 
              <span className="mx-2">🎁</span> WELCOME BONUS ₹10 FREE - 
            </span>
            <span className="text-sm font-bold text-gold flex items-center gap-2 ml-8">
              <span>🚀</span> INSTABOOST PRO - INDIA'S #1 SMM PANEL - REAL FOLLOWERS FROM ₹11/1000 - 24/7 SUPPORT - INSTANT DELIVERY - 50K+ HAPPY CUSTOMERS - 99.9% SUCCESS RATE - 
              <span className="mx-2">💎</span> REFER 5 FRIENDS & GET 50% OFF FOR LIFETIME - 
              <span className="mx-2">🎁</span> WELCOME BONUS ₹10 FREE - 
            </span>
          </div>
          <button onClick={handleDismiss} className="absolute right-2 top-1/2 -translate-y-1/2 text-gold/60 hover:text-gold bg-black/20 rounded-full w-6 h-6 flex items-center justify-center text-xs">✕</button>
        </div>
      </div>
    );
  }

  const isActive = !!activeFestival;
  const daysUntil = Math.ceil((festival.date.getTime() - new Date().getTime()) / (1000*60*60*24));

  return (
    <div className="fixed top-20 left-0 right-0 z-40 announcement-banner">
      <div className={`relative overflow-hidden backdrop-blur-md bg-gradient-to-r ${festival.color} border-b border-gold/30 shadow-lg ${isActive ? 'announcement-glow' : ''}`}>
        <div className="flex whitespace-nowrap animate-marquee py-3">
          <span className="text-sm font-bold text-white flex items-center gap-2 drop-shadow-lg">
            <span className="text-lg">{festival.emoji}</span>
            {isActive ? festival.messageEn : `UPCOMING: ${festival.name.toUpperCase()} IN ${daysUntil} DAYS - GET READY FOR ${festival.discount}% OFF!`}
            <span className="mx-2">•</span>
            <span className="text-yellow-200">{festival.messageHi}</span>
            <span className="mx-4 bg-black/30 px-3 py-1 rounded-full text-gold font-black">{festival.discount}% OFF</span>
            <span className="mx-2">{festival.emoji} {festival.name} {festival.nameHindi} - LIMITED TIME!</span>
          </span>
          <span className="text-sm font-bold text-white flex items-center gap-2 drop-shadow-lg ml-8">
            <span className="text-lg">{festival.emoji}</span>
            {isActive ? festival.messageEn : `UPCOMING: ${festival.name.toUpperCase()} IN ${daysUntil} DAYS - GET READY FOR ${festival.discount}% OFF!`}
            <span className="mx-2">•</span>
            <span className="text-yellow-200">{festival.messageHi}</span>
            <span className="mx-4 bg-black/30 px-3 py-1 rounded-full text-gold font-black">{festival.discount}% OFF</span>
            <span className="mx-2">{festival.emoji} {festival.name} {festival.nameHindi} - LIMITED TIME!</span>
          </span>
        </div>
        <button onClick={handleDismiss} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white bg-black/20 rounded-full w-6 h-6 flex items-center justify-center text-xs">✕</button>
      </div>
      {isActive && (
        <div className="bg-black/40 text-center py-1 text-xs text-gold/80">
          🎉 {festival.name} Special Active - Use code {festival.name.toUpperCase().slice(0,4)}{festival.discount} for {festival.discount}% OFF - Ends in {festival.endDaysAfter} days! 🎉
        </div>
      )}
    </div>
  );
}

// Helper to get current discount for pricing
export function getCurrentFestivalDiscount(): number {
  const active = getActiveFestival();
  return active ? active.discount : 0;
}

export function getActiveFestivalInfo(): Festival | null {
  return getActiveFestival();
}
