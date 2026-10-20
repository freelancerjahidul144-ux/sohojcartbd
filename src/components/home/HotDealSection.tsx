import React, { useState, useEffect } from 'react';
import {
  Flame,
  Clock,
  Sparkles,
  ShoppingBag,
  Zap,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Tag,
  Calendar,
} from 'lucide-react';
import { Product, StoreSettings } from '../../types';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import {
  isProductHotDealActive,
  formatFestivalDateRange,
  calculateTimeRemaining,
} from '../../utils/dealHelper';

interface HotDealSectionProps {
  products: Product[];
  settings: StoreSettings;
  onNavigate: (page: string) => void;
}

export const HotDealSection: React.FC<HotDealSectionProps> = ({
  products,
  settings,
  onNavigate,
}) => {
  const { addToCart, buyNow } = useCart();
  const { addToast } = useStore();

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter ONLY active, unexpired hot deal products! (Daraz-style auto expiry)
  const hotDealProducts = products.filter(
    (p) => p.status === 'published' && isProductHotDealActive(p, settings, now)
  );

  // Time remaining calculation
  const targetEnd = settings.hotDealEndTime || new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  const timeLeft = calculateTimeRemaining(targetEnd, now);

  // Don't render if deactivated
  if (settings.isHotDealActive === false || hotDealProducts.length === 0) {
    return null;
  }

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart(product, 1, false);
    addToast('success', `"${product.name.slice(0, 22)}..." কার্টে যুক্ত করা হয়েছে!`);
  };

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    buyNow(product, 1);
    onNavigate('checkout');
  };

  const bgImage = settings.hotDealBannerImage || settings.hotDealHeaderBgImage || '';
  const showOverlay = settings.hotDealShowOverlay !== false;
  const overlayColor = settings.hotDealOverlayColor || '#000000';
  const overlayOpacity = (settings.hotDealOverlayOpacity ?? 75) / 100;

  // Resolve section background from custom color or theme preset
  const getSectionBackground = () => {
    if (bgImage) return '#08080c';
    if (settings.hotDealHeaderBgColor) return settings.hotDealHeaderBgColor;
    switch (settings.hotDealThemePreset) {
      case 'royal_gold':
        return 'linear-gradient(135deg, #1c1402 0%, #2e2003 50%, #120d01 100%)';
      case 'midnight_obsidian':
        return 'linear-gradient(135deg, #150926 0%, #0c0617 50%, #04020a 100%)';
      case 'emerald_festive':
        return 'linear-gradient(135deg, #04291f 0%, #021712 50%, #010b08 100%)';
      case 'deep_slate':
        return 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #020617 100%)';
      case 'crimson_velvet':
      default:
        return 'linear-gradient(135deg, #170712 0%, #280a1e 50%, #12040e 100%)';
    }
  };

  return (
    <section className="relative overflow-hidden py-4 sm:py-6 my-2">
      <div className="max-w-[1780px] w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Unified Hot Deals Card Container */}
        <div
          className="relative rounded-3xl overflow-hidden border-2 border-amber-400/40 shadow-2xl p-5 sm:p-8 space-y-6 transition-all duration-300"
          style={{ background: getSectionBackground() }}
        >
          {/* Background Picture if uploaded by admin */}
          {bgImage && (
            <img
              src={bgImage}
              alt="Hot Deals Background"
              className={`absolute inset-0 w-full h-full object-cover object-center ${
                showOverlay ? 'opacity-90' : 'opacity-100'
              }`}
            />
          )}

          {/* 🎭 Shadow Overlay - Custom Color & On/Off Toggle (শ্যাডো অন/অফ ও কালার) */}
          {bgImage && showOverlay && (
            <div
              className="absolute inset-0 pointer-events-none transition-all duration-300"
              style={{
                backgroundColor: overlayColor,
                opacity: overlayOpacity,
              }}
            />
          )}

          {/* Subtle warm ambient glow if no background image */}
          {!bgImage && (
            <>
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
            </>
          )}

          {/* Top Header Banner */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="space-y-4 flex-1">
              {/* TOP ROW: Festival / Occasion Tag + BIG PROMINENT COUNTDOWN TIMER IN FRONT */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                {/* 🌙 আলাদা জায়গায় উৎসবের নাম (যেমন: ঈদ অফার / Eid Offer) */}
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-red-600/40 border-2 border-red-300/60 ring-2 ring-red-500/30">
                  <Flame className="w-4 h-4 fill-amber-300 text-amber-300 animate-pulse" />
                  <span>
                    {settings.hotDealFestivalName || settings.hotDealBadgeText || '🌙 ঈদ মেগা অফার (EID MEGA DEALS)'}
                  </span>
                </div>

                {/* ⏰ হট ডিলের সময় সামনে অনেক বড় করে থাকবে (EXTRA BIG PROMINENT COUNTDOWN TIMER) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 bg-gradient-to-r from-black/95 via-slate-950/95 to-black/95 backdrop-blur-md px-3.5 sm:px-6 py-2.5 sm:py-3.5 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-amber-400 shadow-2xl shadow-amber-500/25">
                  <div className="flex items-center gap-2 text-amber-300 font-black text-xs sm:text-sm tracking-wide">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                    <span className="uppercase text-white font-extrabold text-xs sm:text-sm">বাকি সময়:</span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2.5">
                    {timeLeft.days > 0 && (
                      <>
                        <div className="flex flex-col items-center justify-center bg-slate-900/95 border-2 border-amber-400/80 rounded-xl sm:rounded-2xl px-2.5 sm:px-4 py-2 sm:py-2.5 min-w-[56px] sm:min-w-[70px] md:min-w-[80px] shadow-lg shadow-black/50">
                          <span className="font-mono text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-amber-300 leading-none">
                            {String(timeLeft.days).padStart(2, '0')}
                          </span>
                          <span className="text-[10px] sm:text-xs font-black text-slate-300 uppercase mt-1">দিন</span>
                        </div>
                        <span className="text-amber-400 font-black text-xl sm:text-3xl">:</span>
                      </>
                    )}

                    <div className="flex flex-col items-center justify-center bg-slate-900/95 border-2 border-amber-400/80 rounded-xl sm:rounded-2xl px-2.5 sm:px-4 py-2 sm:py-2.5 min-w-[56px] sm:min-w-[70px] md:min-w-[80px] shadow-lg shadow-black/50">
                      <span className="font-mono text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-none">
                        {String(timeLeft.hours).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] sm:text-xs font-black text-slate-300 uppercase mt-1">ঘণ্টা</span>
                    </div>
                    <span className="text-amber-400 font-black text-xl sm:text-3xl">:</span>

                    <div className="flex flex-col items-center justify-center bg-slate-900/95 border-2 border-amber-400/80 rounded-xl sm:rounded-2xl px-2.5 sm:px-4 py-2 sm:py-2.5 min-w-[56px] sm:min-w-[70px] md:min-w-[80px] shadow-lg shadow-black/50">
                      <span className="font-mono text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-none">
                        {String(timeLeft.minutes).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] sm:text-xs font-black text-slate-300 uppercase mt-1">মিনিট</span>
                    </div>
                    <span className="text-amber-400 font-black text-xl sm:text-3xl">:</span>

                    <div className="flex flex-col items-center justify-center bg-rose-950/95 border-2 sm:border-3 border-rose-500 rounded-xl sm:rounded-2xl px-2.5 sm:px-4 py-2 sm:py-2.5 min-w-[56px] sm:min-w-[70px] md:min-w-[80px] shadow-xl shadow-rose-950/60 ring-2 ring-rose-500/40">
                      <span className="font-mono text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-rose-300 leading-none animate-pulse">
                        {String(timeLeft.seconds).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] sm:text-xs font-black text-rose-200 uppercase mt-1">সেকেন্ড</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title with two-tone styling like in the image */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex flex-wrap items-center gap-2 drop-shadow-md">
                <span>{settings.hotDealTitle || 'Hot Discount Specials'}</span>
                <span className="text-amber-400 font-black">
                  {settings.hotDealFestivalName ? `(${settings.hotDealFestivalName})` : '(হট ডিসকাউন্ট স্পেশাল)'}
                </span>
              </h2>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-2xl leading-relaxed">
                {settings.hotDealSubtitle ||
                  'সেরা মানের জনপ্রিয় গ্যাজেট, ফোন ও ফ্যাশন পোশাকে সর্বোচ্চ ছাড় (ঢাকার ভিতরে ৳৬০ এবং ঢাকার বাহিরে ৳১২০ ডেলিভারি চার্জ)!'}
              </p>
            </div>

            {/* Right Side: Yellow CTA Button exactly like image.png */}
            <div className="shrink-0 flex items-center">
              <button
                type="button"
                onClick={() => onNavigate('products')}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-400 via-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-full shadow-xl shadow-amber-400/25 transition flex items-center gap-2 cursor-pointer border border-amber-300"
              >
                <span>সবগুলো অফার দেখুন</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>

          <div className="relative z-10">
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {hotDealProducts.slice(0, 8).map((product) => {
                const dealPrice = product.hotDealPrice ?? product.discountPrice ?? product.price;
                const originalPrice = product.price;
                const discountPct =
                  product.hotDealDiscount ??
                  (originalPrice > dealPrice
                    ? Math.round(((originalPrice - dealPrice) / originalPrice) * 100)
                    : product.discountPercentage ?? 15);

                const sold = product.hotDealSold ?? product.salesCount ?? 28;
                const available = product.hotDealStock ?? product.stock ?? 12;
                const totalInitial = sold + available;
                const soldPercent = Math.min(
                  95,
                  Math.max(15, Math.round((sold / (totalInitial || 1)) * 100))
                );

                return (
                  <div
                    key={product.id}
                    onClick={() => onNavigate(`product-${product.id}`)}
                    className="group bg-slate-900/90 hover:bg-slate-900 border border-white/15 hover:border-amber-400/80 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/15 cursor-pointer"
                  >
                    <div>
                      {/* Image & Badge Container */}
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-950 mb-3 border border-white/10">
                        <img
                          src={product.frontImage || product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Flame Discount Badge */}
                        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
                          <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1 border border-red-400/40">
                            <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                            <span>-{discountPct}% ছাড়</span>
                          </span>
                          {product.hotDealBadge && (
                            <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md shadow-md">
                              {product.hotDealBadge}
                            </span>
                          )}
                        </div>

                        {/* Fast Shipping Tag */}
                        <div className="absolute bottom-2 right-2 z-10">
                          <span className="bg-black/80 text-white backdrop-blur-xs text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/10">
                            ⚡ ২৪ ঘণ্টায় ডেলিভারি
                          </span>
                        </div>
                      </div>

                      {/* Title & Category */}
                      <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1 line-clamp-1">
                        {product.category}
                      </p>
                      <h3 className="text-sm font-extrabold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug mb-2">
                        {product.name}
                      </h3>

                      {/* Price Block */}
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-lg sm:text-xl font-black text-amber-400">
                          ৳{dealPrice.toLocaleString()}
                        </span>
                        {originalPrice > dealPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            ৳{originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Stock Progress Bar */}
                      <div className="space-y-1 mb-4 bg-slate-950/70 p-2.5 rounded-xl border border-white/5">
                        <div className="flex items-center justify-between text-[11px] font-black">
                          <span className="text-rose-400 flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-red-500 fill-current animate-pulse" />
                            <span>বিক্রি হয়েছে {sold} টি</span>
                          </span>
                          <span className="text-amber-300">বাকি মাত্র {available} টি</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-red-600 rounded-full transition-all duration-1000"
                            style={{ width: `${soldPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={(e) => handleBuyNow(e, product)}
                        className="w-full py-2.5 px-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1 cursor-pointer transition"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>দ্রুত অর্ডার</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, product)}
                        className="w-full py-2.5 px-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs rounded-xl border border-white/20 flex items-center justify-center gap-1 cursor-pointer transition backdrop-blur-xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>কার্ট</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View all deals button */}
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => onNavigate('products')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-rose-500 to-red-600 hover:from-amber-500 hover:to-red-700 text-white font-black text-xs sm:text-sm px-8 py-3.5 rounded-full shadow-xl shadow-rose-600/30 transition active:scale-95 cursor-pointer border border-amber-300/40"
              >
                <span>সব হট ডিল ও স্পেশাল অফার দেখুন ({hotDealProducts.length}+ পণ্য)</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
