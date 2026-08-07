import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function AdminBanner() {
  const [bannerData, setBannerData] = useState({ text: '', enabled: true });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    try {
      const res = await fetch('/api/settings/banner');
      const data = await res.json();
      setBannerData(data);
    } catch (error) {
      console.error('Fetch banner error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings/banner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': localStorage.getItem('adminToken') || ''
        },
        credentials: 'include',
        body: JSON.stringify(bannerData)
      });

      const data = await res.json();

      if (res.ok) {
        toast({ title: "Banner Updated! ✅", description: "Homepage banner updated successfully" });
      } else {
        toast({ title: "Failed", description: data.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update banner", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}><i className="fas fa-spinner fa-spin text-gold text-3xl"></i></div>;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="bg-charcoal border-b border-gold/20 p-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/admin/dashboard"><Button variant="outline" size="sm"><i className="fas fa-arrow-left mr-2"></i>Dashboard</Button></Link>
          <h1 className="text-gold font-bold text-xl">Banner Management</h1>
          <div></div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-charcoal border border-gold/20 rounded-2xl p-6 mb-6">
          <h2 className="text-cream font-bold text-lg mb-4">Live Preview</h2>
          <div className="relative overflow-hidden backdrop-blur-md bg-gradient-to-r from-gold/25 via-yellow-500/20 to-gold/25 border border-gold/40 rounded-xl">
            <div className="flex whitespace-nowrap animate-marquee py-3">
              <span className="text-sm font-bold text-gold flex items-center gap-3">
                <span>🚀</span>
                <span className="text-white">{bannerData.text || "Banner text will appear here..."}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="bg-charcoal border border-gold/20 rounded-2xl p-6">
          <h2 className="text-cream font-bold text-lg mb-6">Edit Banner Content</h2>
          <div className="space-y-5">
            <div>
              <Label className="text-cream mb-2 block">Banner Text (Hindi) *</Label>
              <textarea
                value={bannerData.text}
                onChange={(e) => setBannerData({ ...bannerData, text: e.target.value })}
                placeholder="इंस्टाबूस्ट प्रो - भारत का नंबर 1 SMM पैनल..."
                className="w-full bg-charcoal-dark border border-gold/20 text-cream rounded-xl p-4 min-h-[100px] focus:border-gold focus:outline-none"
                rows={3}
              />
              <p className="text-cream/30 text-xs mt-1">Ye text homepage pe marquee me chalega - Hindi me likho</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={bannerData.enabled}
                onChange={(e) => setBannerData({ ...bannerData, enabled: e.target.checked })}
                className="w-5 h-5 rounded border-gold/20 bg-charcoal-dark"
              />
              <Label className="text-cream">Banner Enabled (Show on homepage)</Label>
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full btn-primary py-6 text-lg">
              {isSaving ? <><i className="fas fa-spinner fa-spin mr-2"></i>Saving...</> : <><i className="fas fa-save mr-2"></i>Update Banner</>}
            </Button>

            <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-3">
              <p className="text-green-300 text-xs">
                <i className="fas fa-check-circle mr-1"></i>
                Save karte hi homepage pe banner turant update ho jayega - No deploy needed!
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="bg-charcoal border border-gold/10 rounded-xl p-4">
            <h4 className="text-gold font-bold text-sm mb-2">Example Banner Texts:</h4>
            <ul className="text-cream/50 text-xs space-y-1 list-disc list-inside">
              <li>इंस्टाबूस्ट प्रो - रियल फॉलोअर्स ₹11/1000 - 5 दोस्तों को रेफर करो और पाओ 50% छूट!</li>
              <li>🎉 दिवाली धमाका - सभी सर्विस पर 50% छूट - सीमित समय!</li>
              <li>स्वतंत्रता दिवस सेल - जय हिंद! 50% OFF - 15 अगस्त तक!</li>
            </ul>
          </div>
          <div className="bg-charcoal border border-gold/10 rounded-xl p-4">
            <h4 className="text-gold font-bold text-sm mb-2">Tips:</h4>
            <ul className="text-cream/50 text-xs space-y-1 list-disc list-inside">
              <li>Hindi me likho toh zyada connect karega</li>
              <li>Emoji use karo 🚀 🎉 🇮🇳 - attractive lagega</li>
              <li>Offer ka % aur price clear likho</li>
              <li>Short aur catchy rakho - marquee me acha lagega</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
