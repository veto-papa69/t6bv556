import { Link } from "wouter";
import { Instagram, Send, Twitter, Facebook } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://instagram.com/instaboostpro",
      color: "text-pink-500 hover:text-pink-400"
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: "https://facebook.com/instaboostpro",
      color: "text-blue-600 hover:text-blue-500"
    },
    {
      name: "Telegram",
      icon: Send,
      url: "https://t.me/instaboostpro",
      color: "text-blue-500 hover:text-blue-400"
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: "https://twitter.com/instaboostpro",
      color: "text-blue-400 hover:text-blue-300"
    }
  ];

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Wallet", href: "/wallet" },
    { name: "Orders", href: "/orders" },
    { name: "FAQ", href: "/faq" }
  ];

  const supportLinks = [
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Refund Policy", href: "/refund" },
    { name: "Contact Us", href: "/contact" }
  ];

  return (
    <footer className="bg-charcoal-dark border-t border-gold/20 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-gold to-tan rounded-xl flex items-center justify-center shadow-xl overflow-hidden">
                <img 
                  src="https://files.catbox.moe/95hr3x.png" 
                  alt="InstaBoost Pro Logo" 
                  className="w-16 h-16 object-contain"
                />
              </div>
              <span className="text-gold font-bold text-3xl">InstaBoost Pro</span>
            </div>
            <p className="text-cream/70 mb-6 max-w-md">
              Premium SMM panel providing high-quality Instagram services with 24/7 support, 
              instant delivery, and the best prices in the market.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-12 h-12 bg-charcoal border border-gold/20 rounded-xl flex items-center justify-center hover:border-gold transition-all duration-300 ${social.color} hover:scale-110 transform hover:shadow-lg`}
                    title={social.name}
                  >
                    <IconComponent size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gold font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-cream/70 hover:text-gold transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-gold font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-cream/70 hover:text-gold transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <p className="text-cream/70 text-sm mb-2">24/7 Support Available</p>
              <p className="text-gold font-semibold">support@instaboostpro.com</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gold/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-6 text-sm mb-4 md:mb-0">
              <div className="text-cream/60">
                <i className="fas fa-shield-alt text-gold mr-2"></i>
                SSL Secured
              </div>
              <div className="text-cream/60">
                <i className="fas fa-clock text-gold mr-2"></i>
                24/7 Service
              </div>
              <div className="text-cream/60">
                <i className="fas fa-award text-gold mr-2"></i>
                Premium Quality
              </div>
            </div>
            <div className="text-cream/60 text-sm">
              © {currentYear} InstaBoost Pro. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}