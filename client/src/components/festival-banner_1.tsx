import { useState, useEffect } from "react";

interface Festival {
  name: string;
  nameHindi: string;
  date: Date;
  emoji: string;
  discount: number;
  color: string;
  startDaysBefore: number;
  endDaysAfter: number;
  messageHi: string;
  messageEn: string;
}

function getFestivalsForYear(year: number): Festival[] {
  return [
    { name: "New Year", nameHindi: "नया साल", date: new Date(year, 0, 1), emoji: "🎉", discount: 45, color: "from-purple-600/40 via-pink-600/30 to-yellow-600/40", startDaysBefore: 5, endDaysAfter: 3, messageHi: "नया साल धमाका - 45% छूट के साथ नई शुरुआत करो!", messageEn: "NEW YEAR DHAMAKA - 45% OFF!" },
    { name: "Republic Day", nameHindi: "गणतंत्र दिवस", date: new Date(year, 0, 26), emoji: "🇮🇳", discount: 26, color: "from-orange-600/40 via-white/10 to-green-600/40", startDaysBefore: 4, endDaysAfter: 1, messageHi: "गणतंत्र दिवस - सभी सर्विस पर 26% छूट - जय हिंद!", messageEn: "REPUBLIC DAY - 26% OFF - JAI HIND!" },
    { name: "Maha Shivratri", nameHindi: "महाशिवरात्रि", date: new Date(year, 1, 15), emoji: "🔱", discount: 25, color: "from-blue-600/30 to-purple-600/30", startDaysBefore: 2, endDaysAfter: 1, messageHi: "महाशिवरात्रि स्पेशल - 25% छूट - हर हर महादेव!", messageEn: "MAHA SHIVRATRI - 25% OFF!" },
    { name: "Holi", nameHindi: "होली", date: new Date(year, 2, 3), emoji: "🎨", discount: 35, color: "from-pink-600/40 via-yellow-500/30 to-green-600/40", startDaysBefore: 5, endDaysAfter: 2, messageHi: "होली धमाका - अपने फीड में रंग भरो - 35% छूट!", messageEn: "HOLI DHAMAKA - 35% OFF!" },
    { name: "Eid ul-Fitr", nameHindi: "ईद", date: new Date(year, 2, 20), emoji: "🌙", discount: 30, color: "from-green-600/40 to-emerald-600/30", startDaysBefore: 4, endDaysAfter: 2, messageHi: "ईद मुबारक - जश्न मनाओ 30% छूट के साथ!", messageEn: "EID MUBARAK - 30% OFF!" },
    { name: "Baisakhi", nameHindi: "बैसाखी", date: new Date(year, 3, 13), emoji: "🌾", discount: 25, color: "from-yellow-600/40 to-orange-600/30", startDaysBefore: 2, endDaysAfter: 1, messageHi: "बैसाखी धमाका - ग्रोथ काटो 25% छूट के साथ!", messageEn: "BAISAKHI - 25% OFF!" },
    { name: "Eid al-Adha", nameHindi: "बकरीद", date: new Date(year, 5, 27), emoji: "🕌", discount: 30, color: "from-green-700/40 to-emerald-600/30", startDaysBefore: 3, endDaysAfter: 2, messageHi: "बकरीद मुबारक - 30% छूट!", messageEn: "BAKRID MUBARAK - 30% OFF!" },
    { name: "Raksha Bandhan", nameHindi: "रक्षा बंधन", date: new Date(year, 7, 9), emoji: "🎀", discount: 30, color: "from-pink-500/40 to-purple-600/30", startDaysBefore: 4, endDaysAfter: 1, messageHi: "रक्षा बंधन स्पेशल - ग्रोथ गिफ्ट करो 30% छूट!", messageEn: "RAKSHA BANDHAN - 30% OFF!" },
    { name: "Independence Day", nameHindi: "स्वतंत्रता दिवस", date: new Date(year, 7, 15), emoji: "🇮🇳", discount: 50, color: "from-orange-600/40 via-white/15 to-green-700/40", startDaysBefore: 7, endDaysAfter: 2, messageHi: "स्वतंत्रता दिवस मेगा सेल - 50% छूट - जय हिंद! - 15 अगस्त", messageEn: "INDEPENDENCE DAY MEGA SALE - 50% OFF!" },
    { name: "Janmashtami", nameHindi: "जन्माष्टमी", date: new Date(year, 7, 14), emoji: "🦚", discount: 25, color: "from-blue-600/40 to-purple-700/30", startDaysBefore: 3, endDaysAfter: 1, messageHi: "जन्माष्टमी धमाका - 25% छूट!", messageEn: "JANMASHTAMI - 25% OFF!" },
    { name: "Teej", nameHindi: "तीज", date: new Date(year, 7, 26), emoji: "🌿", discount: 20, color: "from-green-500/40 to-yellow-600/30", startDaysBefore: 3, endDaysAfter: 1, messageHi: "तीज स्पेशल - सभी रानियों के लिए 20% छूट!", messageEn: "TEEJ SPECIAL - 20% OFF!" },
    { name: "Ganesh Chaturthi", nameHindi: "गणेश चतुर्थी", date: new Date(year, 8, 6), emoji: "🙏", discount: 30, color: "from-orange-500/40 to-red-600/30", startDaysBefore: 4, endDaysAfter: 2, messageHi: "गणेश चतुर्थी - बप्पा का आशीर्वाद 30% छूट!", messageEn: "GANESH CHATURTHI - 30% OFF!" },
    { name: "Navratri", nameHindi: "नवरात्रि", date: new Date(year, 9, 2), emoji: "💃", discount: 40, color: "from-red-600/40 via-yellow-600/30 to-orange-600/40", startDaysBefore: 5, endDaysAfter: 9, messageHi: "नवरात्रि धमाका - 9 दिन 40% छूट - जय माता दी!", messageEn: "NAVRATRI - 40% OFF FOR 9 DAYS!" },
    { name: "Dussehra", nameHindi: "दशहरा", date: new Date(year, 9, 12), emoji: "🏹", discount: 35, color: "from-orange-600/40 to-red-700/30", startDaysBefore: 3, endDaysAfter: 2, messageHi: "दशहरा विजय - 35% छूट के साथ जीत मनाओ!", messageEn: "DUSSEHRA VIJAY - 35% OFF!" },
    { name: "Diwali", nameHindi: "दीवाली", date: new Date(year, 9, 20), emoji: "🪔", discount: 50, color: "from-yellow-500/40 via-orange-600/40 to-red-600/40", startDaysBefore: 10, endDaysAfter: 3, messageHi: "दीवाली धमाका - सबसे बड़ी सेल 50% छूट - शुभ दीपावली!", messageEn: "DIWALI DHAMAKA - BIGGEST SALE 50% OFF!" },
    { name: "Bhai Dooj", nameHindi: "भाई दूज", date: new Date(year, 9, 23), emoji: "👫", discount: 25, color: "from-pink-400/40 to-blue-500/30", startDaysBefore: 2, endDaysAfter: 1, messageHi: "भाई दूज स्पेशल - 25% छूट!", messageEn: "BHAI DOOJ - 25% OFF!" },
    { name: "Children's Day", nameHindi: "बाल दिवस", date: new Date(year, 10, 14), emoji: "🧒", discount: 20, color: "from-blue-500/40 to-pink-500/30", startDaysBefore: 2, endDaysAfter: 1, messageHi: "बाल दिवस स्पेशल - 20% छूट!", messageEn: "CHILDREN'S DAY - 20% OFF!" },
    { name: "Christmas", nameHindi: "क्रिसमस", date: new Date(year, 11, 25), emoji: "🎄", discount: 40, color: "from-red-600/40 to-green-600/40", startDaysBefore: 7, endDaysAfter: 2, messageHi: "क्रिसमस मेगा सेल - 40% छूट - मेरी क्रिसमस!", messageEn: "CHRISTMAS - 40% OFF!" },
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
  useEffect(() => {
    setFestival(getActiveFestival());
    const interval = setInterval(()=>setFestival(getActiveFestival()), 3600000);
    return ()=>clearInterval(interval);
  }, []);

  // PERMANENT banner - no dismiss, Hindi primary
  if (festival) {
    return (
      <div className="fixed top-20 left-0 right-0 z-40 announcement-banner">
        <div className={`relative overflow-hidden backdrop-blur-md bg-gradient-to-r ${festival.color} border-b border-gold/40 shadow-lg announcement-glow`}>
          <div className="flex whitespace-nowrap animate-marquee py-3">
            <span className="text-sm font-bold text-white flex items-center gap-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              <span className="text-lg">{festival.emoji}</span>
              <span className="text-yellow-200">{festival.messageHi}</span>
              <span className="mx-3 bg-black/40 px-4 py-1 rounded-full text-gold font-black border border-gold/50">{festival.discount}% OFF</span>
              <span>{festival.messageEn}</span>
              <span className="mx-3">{festival.emoji} {festival.nameHindi} ({festival.name}) - सीमित समय!</span>
              <span className="mx-3">🎁 रेफर करो 5 दोस्तों को और पाओ 50% लाइफटाइम छूट!</span>
            </span>
            <span className="text-sm font-bold text-white flex items-center gap-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ml-12">
              <span className="text-lg">{festival.emoji}</span>
              <span className="text-yellow-200">{festival.messageHi}</span>
              <span className="mx-3 bg-black/40 px-4 py-1 rounded-full text-gold font-black border border-gold/50">{festival.discount}% OFF</span>
              <span>{festival.messageEn}</span>
              <span className="mx-3">{festival.emoji} {festival.nameHindi} ({festival.name}) - सीमित समय!</span>
              <span className="mx-3">🎁 रेफर करो 5 दोस्तों को और पाओ 50% लाइफटाइम छूट!</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Default permanent banner when no festival - Hindi primary
  return (
    <div className="fixed top-20 left-0 right-0 z-40 announcement-banner">
      <div className="relative overflow-hidden backdrop-blur-md bg-gradient-to-r from-gold/25 via-yellow-500/20 to-gold/25 border-b border-gold/40 shadow-lg">
        <div className="flex whitespace-nowrap animate-marquee py-3">
          <span className="text-sm font-bold text-gold flex items-center gap-3">
            <span>🚀</span>
            <span className="text-white">इंस्टाबूस्ट प्रो - भारत का नंबर 1 SMM पैनल - रियल फॉलोअर्स सिर्फ ₹11/1000 से शुरू - 24/7 सपोर्ट</span>
            <span className="mx-3 bg-gold/20 px-3 py-1 rounded-full text-gold border border-gold/30">₹10 बोनस फ्री</span>
            <span>💎 5 दोस्तों को रेफर करो और पाओ 50% लाइफटाइम छूट</span>
            <span className="mx-3">•</span>
            <span>50K+ खुश ग्राहक • 99.9% सफलता दर • इंस्टेंट डिलीवरी</span>
            <span className="mx-3">•</span>
            <span>🎉 त्योहारों पर बम्पर ऑफर - ऑटो अपडेट होता है!</span>
          </span>
          <span className="text-sm font-bold text-gold flex items-center gap-3 ml-12">
            <span>🚀</span>
            <span className="text-white">इंस्टाबूस्ट प्रो - भारत का नंबर 1 SMM पैनल - रियल फॉलोअर्स सिर्फ ₹11/1000 से शुरू - 24/7 सपोर्ट</span>
            <span className="mx-3 bg-gold/20 px-3 py-1 rounded-full text-gold border border-gold/30">₹10 बोनस फ्री</span>
            <span>💎 5 दोस्तों को रेफर करो और पाओ 50% लाइफटाइम छूट</span>
            <span className="mx-3">•</span>
            <span>50K+ खुश ग्राहक • 99.9% सफलता दर • इंस्टेंट डिलीवरी</span>
            <span className="mx-3">•</span>
            <span>🎉 त्योहारों पर बम्पर ऑफर - ऑटो अपडेट होता है!</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function getCurrentFestivalDiscount(): number {
  const active = getActiveFestival();
  return active ? active.discount : 0;
}
