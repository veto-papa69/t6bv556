import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function AdminQR() {
  const [qrData, setQrData] = useState({ qrImageUrl: '', upiId: '', instructions: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchQR();
  }, []);

  const fetchQR = async () => {
    try {
      const res = await fetch('/api/settings/qr');
      const data = await res.json();
      setQrData(data);
    } catch (error) {
      console.error('Fetch QR error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': localStorage.getItem('adminToken') || ''
        },
        credentials: 'include',
        body: JSON.stringify(qrData)
      });

      const data = await res.json();

      if (res.ok) {
        toast({ title: "QR Updated! ✅", description: "QR code successfully updated. Users will see new QR on add-funds page." });
      } else {
        toast({ title: "Failed", description: data.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update QR", variant: "destructive" });
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
          <h1 className="text-gold font-bold text-xl">QR Code Management</h1>
          <div></div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-charcoal border border-gold/20 rounded-2xl p-6">
            <h2 className="text-cream font-bold text-lg mb-6">Current QR Preview</h2>
            <div className="bg-charcoal-dark border border-gold/10 rounded-xl p-6 text-center">
              {qrData.qrImageUrl ? (
                <img src={qrData.qrImageUrl} alt="QR Code" className="w-64 h-64 mx-auto object-contain bg-white p-2 rounded-xl" />
              ) : (
                <div className="w-64 h-64 mx-auto bg-charcoal rounded-xl flex items-center justify-center border-2 border-dashed border-gold/20">
                  <div className="text-center">
                    <i className="fas fa-qrcode text-gold/30 text-5xl mb-2 block"></i>
                    <p className="text-cream/40 text-sm">No QR set</p>
                  </div>
                </div>
              )}
              <div className="mt-4">
                <p className="text-cream/60 text-sm">UPI ID: <span className="text-gold font-mono">{qrData.upiId || 'Not set'}</span></p>
                <p className="text-cream/40 text-xs mt-1">{qrData.instructions}</p>
              </div>
            </div>
          </div>

          <div className="bg-charcoal border border-gold/20 rounded-2xl p-6">
            <h2 className="text-cream font-bold text-lg mb-6">Update QR Code</h2>
            <div className="space-y-5">
              <div>
                <Label className="text-cream mb-2 block">QR Image URL *</Label>
                <Input
                  value={qrData.qrImageUrl}
                  onChange={(e) => setQrData({ ...qrData, qrImageUrl: e.target.value })}
                  placeholder="https://i.ibb.co/your-qr-image.png"
                  className="bg-charcoal-dark border-gold/20 text-cream"
                />
                <p className="text-cream/30 text-xs mt-1">Upload QR to imgbb.com or any image host and paste URL here</p>
              </div>

              <div>
                <Label className="text-cream mb-2 block">UPI ID</Label>
                <Input
                  value={qrData.upiId}
                  onChange={(e) => setQrData({ ...qrData, upiId: e.target.value })}
                  placeholder="your-upi@okicici"
                  className="bg-charcoal-dark border-gold/20 text-cream"
                />
              </div>

              <div>
                <Label className="text-cream mb-2 block">Instructions</Label>
                <Input
                  value={qrData.instructions}
                  onChange={(e) => setQrData({ ...qrData, instructions: e.target.value })}
                  placeholder="Scan QR and pay using any UPI app"
                  className="bg-charcoal-dark border-gold/20 text-cream"
                />
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="w-full btn-primary py-6 text-lg">
                {isSaving ? <><i className="fas fa-spinner fa-spin mr-2"></i>Saving...</> : <><i className="fas fa-save mr-2"></i>Update QR Code</>}
              </Button>

              <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-3">
                <p className="text-blue-300 text-xs">
                  <i className="fas fa-lightbulb mr-1"></i>
                  How to get QR image URL: Go to imgbb.com → Upload your QR → Copy direct link → Paste above
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-charcoal border border-gold/10 rounded-xl p-4">
          <h3 className="text-gold font-bold mb-2">How it works:</h3>
          <ol className="list-decimal list-inside text-cream/60 text-sm space-y-1">
            <li>Upload new QR to imgbb.com or any image hosting</li>
            <li>Paste URL above and click Update</li>
            <li>Users will immediately see new QR on Add Funds page - No deploy needed!</li>
            <li>Telegram pe notification jayega ki QR update hua hai</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
