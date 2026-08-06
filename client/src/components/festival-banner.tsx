import { useState, useEffect } from "react";
interface Festival { name: string; nameHindi: string; date: Date; emoji: string; discount: number; color: string; startDaysBefore: number; endDaysAfter: number; messageHi: string; messageEn: string; }
function getFestivalsForYear(year: number): Festival[] {
  return [
    { name: "New Year", nameHindi: "नया साल", date: new Date(year, 0, 1), emoji: "🎉", discount: 45, color: "from-purple-600/40 via-pink-600/30 to-yellow-600/40", startDaysBefore: 5, endDaysAfter: 3, messageHi: "नया साल धमाका - 45% छूट!", messageEn: "NEW YEAR 45% OFF" },
    { name: "Republic Day", nameHindi: "गणतंत्र दिवस", date: new Date(year, 0, 26), emoji: "🇮🇳", discount: 26, color: "from-orange-600/40 via-white/10 to-green-600/40", startDaysBefore: 4, endDaysAfter: 1, messageHi: "गणतंत्र दिवस - 26% छूट - जय हिंद!", messageEn: "REPUBLIC DAY 26% OFF" },
    { name: "Holi", nameHindi: "होली", date: new Date(year, 2, 3), emoji: "🎨", discount: 35, color: "from-pink-600/40 via-yellow-500/30 to-green-600/40", startDaysBefore: 5, endDaysAfter: 2, messageHi: "होली धमाका - 35% छूट!", messageEn: "HOLI 35% OFF" },
    { name: "Eid", nameHindi: "ईद", date: new Date(year, 2, 20), emoji: "🌙", discount: 30, color: "from-green-600/40 to-emerald-600/30", startDaysBefore: 4, endDaysAfter: 2, messageHi: "ईद मुबारक - 30% छूट!", messageEn: "EID 30% OFF" },
    { name: "Independence Day", nameHindi: "स्वतंत्रता दिवस", date: new Date(year, 7, 15), emoji: "🇮🇳", discount: 50, color: "from-orange-600/40 via-white/15 to-green-700/40", startDaysBefore: 7, endDaysAfter: 2, messageHi: "स्वतंत्रता दिवस मेगा सेल - 50% छूट - जय हिंद! 15 अगस्त", messageEn: "INDEPENDENCE DAY 50% OFF" },
    { name: "Raksha Bandhan", nameHindi: "रक्षा बंधन", date: new Date(year, 7, 9), emoji: "🎀", discount: 30, color: "from-pink-500/40 to-purple-600/30", startDaysBefore: 4, endDaysAfter: 1, messageHi: "रक्षा बंधन - 30% छूट!", messageEn: "RAKSHA BANDHAN 30% OFF" },
    { name: "Teej", nameHindi: "तीज", date: new Date(year, 7, 26), emoji: "🌿", discount: 20, color: "from-green-500/40 to-yellow-600/30", startDaysBefore: 3, endDaysAfter: 1, messageHi: "तीज स्पेशल - 20% छूट!", messageEn: "TEEJ 20% OFF" },
    { name: "Diwali", nameHindi: "दीवाली", date: new Date(year, 9, 20), emoji: "🪔", discount: 50, color: "from-yellow-500/40 via-orange-600/40 to-red-600/40", startDaysBefore: 10, endDaysAfter: 3, messageHi: "दीवाली धमाका - 50% छूट - शुभ दीपावली!", messageEn: "DIWALI 50% OFF" },
    { name: "Navratri", nameHindi: "नवरात्रि", date: new Date(year, 9, 2), emoji: "💃", discount: 40, color: "from-red-600/40 via-yellow-600/30 to-orange-600/40", startDaysBefore: 5, endDaysAfter: 9, messageHi: "नवरात्रि - 40% छूट - जय माता दी!", messageEn: "NAVRATRI 40% OFF" },
  ];
}
function getActiveFestival(): Festival | null {
  const now = new Date();
  const festivals = [...getFestivalsForYear(now.getFullYear()), ...getFestivalsForYear(now.getFullYear()+1)];
  for (const f of festivals) {
    const start = new Date(f.date); start.setDate(start.getDate()-f.startDaysBefore); start.setHours(0,0,0,0);
    const end = new Date(f.date); end.setDate(end.getDate()+f.endDaysAfter); end.setHours(23,59,59,999);
    if (now>=start && now<=end) return f;
  }
  return null;
}
export function FestivalBanner() {
  const [festival, setFestival] = useState<Festival | null>(null);
  useEffect(() => { setFestival(getActiveFestival()); const i = setInterval(()=>setFestival(getActiveFestival()), 3600000); return ()=>clearInterval(i); }, []);
  if (festival) {
    return (
      <div className="fixed top-20 left-0 right-0 z-40">
        <div className={`relative overflow-hidden backdrop-blur-md bg-gradient-to-r ${festival.color} border-b border-gold/40 shadow-lg`}>
          <div className="flex whitespace-nowrap animate-marquee py-3">
            <span className="text-sm font-bold text-white flex items-center gap-3">
              <span>{festival.emoji}</span><span className="text-yellow-200">{festival.messageHi}</span>
              <span className="mx-3 bg-black/40 px-4 py-1 rounded-full text-gold font-black">{festival.discount}% OFF</span>
              <span>🎁 रेफर करो 5 दोस्तों को और पाओ 50% लाइफटाइम छूट!</span>
            </span>
            <span className="text-sm font-bold text-white flex items-center gap-3 ml-12">
              <span>{festival.emoji}</span><span className="text-yellow-200">{festival.messageHi}</span>
              <span className="mx-3 bg-black/40 px-4 py-1 rounded-full text-gold">{festival.discount}% OFF</span>
            </span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="fixed top-20 left-0 right-0 z-40">
      <div className="relative overflow-hidden backdrop-blur-md bg-gradient-to-r from-gold/25 via-yellow-500/20 to-gold/25 border-b border-gold/40 shadow-lg">
        <div className="flex whitespace-nowrap animate-marquee py-3">
          <span className="text-sm font-bold text-gold flex items-center gap-3">
            <span>🚀</span><span className="text-white">इंस्टाबूस्ट प्रो - भारत का नंबर 1 SMM पैनल - रियल फॉलोअर्स ₹11/1000 - 24/7 सपोर्ट - 5 दोस्तों को रेफर करो और पाओ 50% लाइफटाइम छूट</span>
            <span className="mx-3 bg-gold/20 px-3 py-1 rounded-full">₹10 बोनस फ्री</span>
          </span>
          <span className="text-sm font-bold text-gold flex items-center gap-3 ml-12">
            <span>🚀</span><span className="text-white">इंस्टाबूस्ट प्रो - भारत का नंबर 1 - 50K+ खुश ग्राहक - 99.9% सफलता - त्योहारों पर बम्पर ऑफर</span>
          </span>
        </div>
      </div>
    </div>
  );
}
