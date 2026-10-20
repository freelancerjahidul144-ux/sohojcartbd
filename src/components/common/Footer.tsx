import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  CheckCircle2,
  Clock,
  Globe,
  Award,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { categories, setSelectedCategory, settings } = useStore();

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(slug);
    onNavigate('products');
  };

  return (
    <footer className="bg-[#0B192C] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      {/* 4 Feature Columns */}
      <div className="max-w-[1780px] w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 pb-12 border-b border-slate-800/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Fast BD Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {settings.estimatedDeliveryDhaka || '24-48 hrs in Dhaka'}, {settings.estimatedDeliveryOutsideDhaka || '2-4 days across 64 districts'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">100% Authentic</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {settings.trustBadgeText || 'Direct official brand warranty and verified sellers'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Easy Returns</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {settings.returnPolicyText
                  ? `${settings.returnPolicyText.slice(0, 55)}...`
                  : 'Hassle-free replacement if damaged or incorrect'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Dedicated Support</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {settings.workingHours || 'Call or WhatsApp our team 7 days a week'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-[1780px] w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => onNavigate('home')}
              className="text-left hover:opacity-95 transition-opacity"
            >
              <BrandLogo variant="white" size="lg" />
            </button>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              {settings.storeTagline ||
                'Sohoj Cart BD is Bangladesh’s trusted premium e-commerce platform offering 100% genuine electronics, traditional fashion, gadgets and household essentials with Cash on Delivery and doorstep delivery.'}
            </p>

            <div className="space-y-2 text-xs text-slate-300 pt-2">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{settings.address || 'Level 5, Plot 22, Road 11, Banani, Dhaka-1213, Bangladesh'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{settings.contactPhone || '+880 1712-345678'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{settings.contactEmail || 'support@sohojcartbd.com'}</span>
              </div>
              {settings.workingHours && (
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{settings.workingHours}</span>
                </div>
              )}
            </div>

            {/* Business Registration & Trust Badges */}
            {(settings.tradeLicenseNo || settings.tinBinNo) && (
              <div className="pt-2 flex items-center gap-2 flex-wrap text-[11px] text-slate-400">
                {settings.tradeLicenseNo && (
                  <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1 text-slate-300">
                    <Award className="w-3 h-3 text-amber-400" />
                    <span>ট্রেড লাইসেন্স: {settings.tradeLicenseNo}</span>
                  </span>
                )}
                {settings.tinBinNo && (
                  <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md text-slate-300">
                    TIN/BIN: {settings.tinBinNo}
                  </span>
                )}
              </div>
            )}

            {/* Social Links */}
            {(settings.facebookPageUrl || settings.instagramPageUrl || settings.youtubeChannelUrl || settings.tiktokUrl) && (
              <div className="pt-2 flex items-center gap-2.5">
                <span className="text-xs text-slate-400 font-bold">সোশ্যাল মিডিয়া:</span>
                {settings.facebookPageUrl && (
                  <a
                    href={settings.facebookPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition"
                    title="Facebook"
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                )}
                {settings.instagramPageUrl && (
                  <a
                    href={settings.instagramPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white rounded-lg transition"
                    title="Instagram"
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                )}
                {settings.youtubeChannelUrl && (
                  <a
                    href={settings.youtubeChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition"
                    title="YouTube"
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Top Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => handleCategoryClick(cat.slug)}
                    className="hover:text-orange-400 transition"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <button onClick={() => onNavigate('track-order')} className="hover:text-orange-400 transition">
                  Track Your Order
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-orange-400 transition">
                  Shipping & Delivery
                </button>
              </li>
              <li>
                <span className="hover:text-orange-400 cursor-pointer">Return & Refund Policy</span>
              </li>
              <li>
                <span className="hover:text-orange-400 cursor-pointer">Warranty Claims</span>
              </li>
            </ul>
          </div>

          {/* Payment & Security */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Payment Methods
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              We accept all popular Bangladeshi payment channels:
            </p>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="bg-[#E2136E] text-white text-[11px] font-black px-2.5 py-1 rounded-md shadow-xs tracking-wide">
                bKash
              </span>
              <span className="bg-[#F7941D] text-white text-[11px] font-black px-2.5 py-1 rounded-md shadow-xs tracking-wide">
                Nagad
              </span>
              <span className="bg-[#8C3494] text-white text-[11px] font-black px-2.5 py-1 rounded-md shadow-xs tracking-wide">
                Rocket
              </span>
              <span className="bg-[#004F9E] text-[#FFC20E] text-[11px] font-black px-2.5 py-1 rounded-md shadow-xs tracking-wide flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFC20E]"></span>
                Upay
              </span>
              <span className="bg-blue-950/80 border border-blue-500/40 text-blue-300 text-[10px] font-bold px-2 py-1 rounded-md">
                Visa • Master • AMEX
              </span>
              <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold px-2 py-1 rounded-md">
                Cash On Delivery
              </span>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>TLS 256-bit encrypted checkout. Shop with full peace of mind.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1780px] w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
        <p>© 2026 Sohoj Cart BD. All rights reserved. Crafted for Bangladesh.</p>
        <div className="flex items-center gap-4">
          <span className="hover:text-white cursor-pointer">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-white cursor-pointer">Terms & Conditions</span>
          <span>•</span>
          <span className="hover:text-white cursor-pointer">Cookie Settings</span>
        </div>
      </div>
    </footer>
  );
};
