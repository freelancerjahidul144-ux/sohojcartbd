import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Flame,
  TrendingUp,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  Grid,
  SlidersHorizontal,
  Compass,
  Layers,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Category } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { AdvertisementBanner } from '../components/common/AdvertisementBanner';
import { HotDealSection } from '../components/home/HotDealSection';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { products, categories, banners, setSelectedCategory, settings } = useStore();

  const heroBanners = banners.filter((b) => b.isActive && b.position === 'hero');
  const promoBanners = banners.filter((b) => b.isActive && b.position === 'promo');

  const [activeHeroIdx, setActiveHeroIdx] = useState(0);
  const [isHeroMuted, setIsHeroMuted] = useState(true);
  const [desktopCategoryView, setDesktopCategoryView] = useState<'grid' | 'carousel'>('grid');
  const mobileCategoryScrollRef = useRef<HTMLDivElement>(null);
  const desktopCategoryScrollRef = useRef<HTMLDivElement>(null);

  const isYouTubeUrl = (url?: string) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeEmbed = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1&controls=0&loop=1&playlist=${match[2]}&playsinline=1&rel=0`;
    }
    return null;
  };

  // Auto rotate hero banner
  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveHeroIdx((prev) => (prev + 1) % heroBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroBanners.length]);

  // Flash Sale Countdown Timer
  const [dealTime, setDealTime] = useState({ h: 8, m: 42, s: 19 });
  useEffect(() => {
    const timer = setInterval(() => {
      setDealTime((prev) => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return { h: 8, m: 30, s: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const publishedProducts = products.filter((p) => p.status === 'published');
  
  // Featured Products (fallback to first published products if none marked featured)
  const explicitFeatured = publishedProducts.filter((p) => p.isFeatured);
  const featuredProducts = (explicitFeatured.length > 0 ? explicitFeatured : publishedProducts).slice(0, 8);

  // Discount Products (fallback to products with discount or top products)
  const explicitDiscounts = publishedProducts.filter((p) => p.discountPrice && p.discountPrice < p.price);
  const discountProducts = (explicitDiscounts.length > 0 ? explicitDiscounts : publishedProducts.slice(0, 8)).slice(0, 8);

  const bestSellers = publishedProducts.filter((p) => p.isBestseller).slice(0, 8);
  const latestProducts = [...publishedProducts].reverse().slice(0, 8);

  // Active categories sorted by display order
  const activeCategories = useMemo(() => {
    return categories
      .filter((c) => c.isActive !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [categories]);

  const getCategoryProductCount = (cat: Category) => {
    return products.filter((p) => {
      if (p.status !== 'published') return false;
      const matchName = p.category?.trim().toLowerCase() === cat.name.trim().toLowerCase();
      const matchId = p.categoryId === cat.id || p.category === cat.id;
      const matchSlug = p.categoryId === cat.slug || p.category === cat.slug;
      return matchName || matchId || matchSlug;
    }).length;
  };

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    onNavigate('products');
  };

  const scrollCategoryCarousel = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const currentBanner = heroBanners[activeHeroIdx] || heroBanners[0];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Carousel Section */}
      <section className="max-w-[1780px] w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 pt-3 sm:pt-4">
        {currentBanner && (
          <div className="relative rounded-3xl overflow-hidden bg-gray-950 shadow-xl min-h-[380px] sm:min-h-[460px] md:min-h-[520px] lg:min-h-[560px] xl:min-h-[580px] flex items-center group">
            {/* Background Media (Image or Video) */}
            {currentBanner.mediaType === 'video' && currentBanner.videoUrl ? (
              isYouTubeUrl(currentBanner.videoUrl) ? (
                <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden opacity-75">
                  <iframe
                    src={getYouTubeEmbed(currentBanner.videoUrl) || ''}
                    className="w-[130%] h-[130%] -ml-[15%] -mt-[15%] object-cover"
                    title={currentBanner.title}
                    allow="autoplay; encrypted-media"
                  />
                </div>
              ) : (
                <video
                  src={currentBanner.videoUrl}
                  poster={currentBanner.image}
                  autoPlay
                  loop
                  muted={isHeroMuted}
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-75 group-hover:scale-105 transition-transform duration-1000"
                />
              )
            ) : (
              <img
                src={currentBanner.image}
                alt={currentBanner.title}
                className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ${
                  currentBanner.showOverlay === false
                    ? 'opacity-100'
                    : 'opacity-85'
                } group-hover:scale-105 transition-transform duration-1000`}
              />
            )}

            {/* Video Mute / Unmute Toggle Button */}
            {currentBanner.mediaType === 'video' && currentBanner.videoUrl && !isYouTubeUrl(currentBanner.videoUrl) && (
              <button
                type="button"
                onClick={() => setIsHeroMuted(!isHeroMuted)}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition border border-white/20 cursor-pointer"
                title={isHeroMuted ? 'সাউন্ড চালু করুন (Unmute)' : 'সাউন্ড বন্ধ করুন (Mute)'}
              >
                {isHeroMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              </button>
            )}

            {/* 🎭 Customizable Shadow Overlay (শ্যাডো অন/অফ ও কালার) */}
            {currentBanner.showOverlay !== false && (
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-500"
                style={{
                  background:
                    currentBanner.overlayDirection === 'full'
                      ? currentBanner.overlayColor || '#000000'
                      : currentBanner.overlayDirection === 'bottom'
                      ? `linear-gradient(to top, ${currentBanner.overlayColor || '#000000'}ee 0%, ${currentBanner.overlayColor || '#000000'}88 60%, transparent 100%)`
                      : `linear-gradient(to right, ${currentBanner.overlayColor || '#000000'}f2 0%, ${currentBanner.overlayColor || '#000000'}99 45%, transparent 100%)`,
                  opacity: (currentBanner.overlayOpacity ?? 75) / 100,
                }}
              />
            )}

            {/* Content Container */}
            <div className="relative z-10 max-w-2xl px-6 sm:px-12 md:px-16 py-10 space-y-4">
              <div className={currentBanner.showOverlay === false ? 'bg-slate-950/40 backdrop-blur-xs p-5 sm:p-7 rounded-3xl border border-white/15 shadow-2xl' : 'space-y-4'}>
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-full shadow-lg shadow-amber-400/25 border border-yellow-300">
                  <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
                  <span>Verified Bangladeshi Store • Fast 24h Delivery</span>
                </span>

                <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  {currentBanner.title}
                </h1>

                {currentBanner.subtitle && (
                  <p className="text-sm sm:text-base text-gray-300 line-clamp-3 max-w-lg leading-relaxed">
                    {currentBanner.subtitle}
                  </p>
                )}

                <div className="pt-2 flex flex-wrap gap-3 items-center">
                  <button
                    onClick={() => {
                      if (currentBanner.buttonLink) {
                        onNavigate(currentBanner.buttonLink);
                      } else {
                        onNavigate('products');
                      }
                    }}
                    className="bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 active:scale-95 text-slate-950 font-black text-xs sm:text-sm px-6 sm:px-8 py-3.5 rounded-full transition shadow-xl shadow-amber-400/30 flex items-center gap-2 cursor-pointer"
                  >
                    <span>{currentBanner.buttonText || 'Explore Fashion'}</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>

                  <button
                    onClick={() => onNavigate('products')}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-full border border-white/20 transition backdrop-blur-xs cursor-pointer"
                  >
                    Browse Catalog
                  </button>
                </div>
              </div>
            </div>

            {/* Prev / Next controls */}
            {heroBanners.length > 1 && (
              <>
                <button
                  onClick={() => setActiveHeroIdx((prev) => (prev - 1 + heroBanners.length) % heroBanners.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setActiveHeroIdx((prev) => (prev + 1) % heroBanners.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Dots indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  {heroBanners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveHeroIdx(idx)}
                      className={`h-2 rounded-full transition-all ${
                        activeHeroIdx === idx ? 'w-8 bg-yellow-400' : 'w-2 bg-white/50 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>
      
      {/* TODAY'S HOT DEALS SECTION (ব্যানারের ঠিক নিচে লাইভ কাউন্টডাউন ও মেগা ছাড়) */}
      <HotDealSection
        products={products}
        settings={settings}
        onNavigate={onNavigate}
      />

      {/* Trust Highlights Strip */}
      <section className="max-w-[1780px] w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-4 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">দ্রুত হোম ডেলিভারি</p>
              <p className="text-[11px] text-gray-500 font-medium">
                {settings.isFreeDeliveryEnabled && settings.freeDeliveryThreshold
                  ? `৳${settings.freeDeliveryThreshold.toLocaleString()} অর্ডারে ফ্রি ডেলিভারি`
                  : '৬৪ জেলায় হোম ডেলিভারি'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">ক্যাশ অন ডেলিভারি</p>
              <p className="text-[11px] text-gray-500 font-medium">পণ্য হাতে পেয়ে মূল্য পরিশোধ</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">১০০% আসল পণ্য</p>
              <p className="text-[11px] text-gray-500 font-medium">অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">সহজ রিটার্ন পলিসি</p>
              <p className="text-[11px] text-gray-500 font-medium">৭ দিনের নির্ভরযোগ্য সেবা</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-[1780px] w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Curated Collections</span>
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {activeCategories.length} Categories
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mt-1">
              Shop by Category
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
              Explore authentic departments from top gadgets & laptops to traditional fashion, groceries & daily essentials
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Desktop View Switcher: Grid vs Horizontal Carousel */}
            <div className="hidden sm:flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200/80">
              <button
                onClick={() => setDesktopCategoryView('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  desktopCategoryView === 'grid'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="View All in Responsive Grid"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grid View</span>
              </button>

              <button
                onClick={() => setDesktopCategoryView('carousel')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  desktopCategoryView === 'carousel'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Horizontal Navigation"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Horizontal Slider</span>
              </button>
            </div>

            {/* Desktop Carousel Navigation Controls */}
            {desktopCategoryView === 'carousel' && (
              <div className="hidden sm:flex items-center gap-1">
                <button
                  onClick={() => scrollCategoryCarousel(desktopCategoryScrollRef, 'left')}
                  className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 flex items-center justify-center transition shadow-2xs"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollCategoryCarousel(desktopCategoryScrollRef, 'right')}
                  className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 flex items-center justify-center transition shadow-2xs"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setSelectedCategory('');
                onNavigate('products');
              }}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/60 px-3.5 py-1.5 rounded-xl flex items-center gap-1 transition shadow-2xs"
            >
              <span>View All Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* MOBILE VIEW: Horizontally Scrollable Category Carousel */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2 px-1">
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50/90 border border-emerald-200/50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Swipe horizontally</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => scrollCategoryCarousel(mobileCategoryScrollRef, 'left')}
                className="w-6 h-6 rounded-lg bg-white border border-gray-200 text-gray-600 flex items-center justify-center shadow-2xs"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                onClick={() => scrollCategoryCarousel(mobileCategoryScrollRef, 'right')}
                className="w-6 h-6 rounded-lg bg-white border border-gray-200 text-gray-600 flex items-center justify-center shadow-2xs"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div
            ref={mobileCategoryScrollRef}
            className="flex gap-3 overflow-x-auto pb-4 pt-1 -mx-4 px-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
          >
            {activeCategories.map((cat) => {
              const count = getCategoryProductCount(cat);
              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className="snap-start shrink-0 w-28 bg-white rounded-2xl p-3 border border-gray-100 hover:border-emerald-400 shadow-2xs active:scale-95 transition-all flex flex-col items-center text-center cursor-pointer select-none group"
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 mb-2 border border-gray-100/80 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-bold text-[11px] text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-tight h-7 flex items-center justify-center">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50/90 font-bold px-2 py-0.5 rounded-full mt-1.5 inline-block">
                    {count} {count === 1 ? 'item' : 'items'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* DESKTOP / TABLET VIEW */}
        <div className="hidden sm:block">
          {desktopCategoryView === 'grid' ? (
            /* Clean Desktop Grid View */
            <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
              {activeCategories.map((cat) => {
                const count = getCategoryProductCount(cat);
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className="group bg-white rounded-2xl p-4 border border-gray-100 hover:border-emerald-500 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center cursor-pointer relative overflow-hidden"
                  >
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 mb-3 group-hover:scale-108 transition-transform duration-300 border border-gray-100 shadow-xs">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover object-center"
                        loading="lazy"
                      />
                    </div>
                    <h3
                      className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1 w-full"
                      title={cat.name}
                    >
                      {cat.name}
                    </h3>
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-gray-400 group-hover:text-emerald-700 bg-gray-50 group-hover:bg-emerald-50 px-2.5 py-0.5 rounded-full transition-colors">
                      <span>{count} {count === 1 ? 'Product' : 'Products'}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-emerald-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Horizontal Navigation Carousel View */
            <div
              ref={desktopCategoryScrollRef}
              className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none snap-x snap-mandatory scroll-smooth"
            >
              {activeCategories.map((cat) => {
                const count = getCategoryProductCount(cat);
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className="snap-start shrink-0 w-36 lg:w-40 bg-white rounded-2xl p-4 border border-gray-100 hover:border-emerald-500 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center cursor-pointer select-none group"
                  >
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 mb-3 group-hover:scale-108 transition-transform duration-300 border border-gray-100 shadow-xs">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover object-center"
                        loading="lazy"
                      />
                    </div>
                    <h3
                      className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1 w-full"
                      title={cat.name}
                    >
                      {cat.name}
                    </h3>
                    <span className="mt-1.5 text-[11px] font-bold text-gray-400 group-hover:text-emerald-700 bg-gray-50 group-hover:bg-emerald-50 px-2.5 py-0.5 rounded-full transition-colors">
                      {count} {count === 1 ? 'Product' : 'Products'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Flash Sale / Mega Discount Section (Hot Discount Specials) */}
      {discountProducts.length > 0 && (
        <section className="max-w-[1780px] w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-950 via-rose-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white mb-6 shadow-2xl relative overflow-hidden border border-rose-900/40">
            {/* Ambient Background Glow */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-rose-600/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <span className="inline-flex items-center gap-1.5 bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md shadow-rose-600/30">
                    <Flame className="w-3.5 h-3.5 text-amber-300 fill-current" />
                    <span>হট ডিসকাউন্ট অফার • LIMITED TIME MEGA DEALS</span>
                  </span>

                  {/* Countdown Timer */}
                  <div className="inline-flex items-center gap-1.5 bg-black/60 border border-rose-500/40 px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-300 shadow-inner">
                    <span className="text-[10px] text-rose-300 uppercase">বাকি:</span>
                    <span>
                      {String(dealTime.h).padStart(2, '0')}h : {String(dealTime.m).padStart(2, '0')}m :{' '}
                      {String(dealTime.s).padStart(2, '0')}s
                    </span>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>Hot Discount Specials</span>
                  <span className="text-amber-400 font-bold text-lg sm:text-2xl hidden sm:inline">
                    (হট ডিসকাউন্ট স্পেশাল)
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-rose-100/90 mt-1 max-w-xl font-medium">
                  সেরা মানের জনপ্রিয় গ্যাজেট, ফোন ও ফ্যাশন পোশাকে সর্বোচ্চ ছাড় (ঢাকার ভিতরে {settings.currencySymbol || '৳'}{settings.deliveryFeeInsideDhaka ?? 60} এবং ঢাকার বাহিরে {settings.currencySymbol || '৳'}{settings.deliveryFeeOutsideDhaka ?? 120} ডেলিভারি চার্জ{settings.isFreeDeliveryEnabled && settings.freeDeliveryThreshold ? ` • ৳${settings.freeDeliveryThreshold.toLocaleString()} টাকার অর্ডারে ফ্রি ডেলিভারি` : ''})!
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => onNavigate('products')}
                  className="bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-black text-xs sm:text-sm px-6 py-3 rounded-2xl transition shadow-xl shadow-amber-400/25 flex items-center gap-2 cursor-pointer"
                >
                  <span>সবগুলো অফার দেখুন</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5">
            {discountProducts.map((product) => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* Homepage Advertisement Placement (Admin Controlled) */}
      <section className="max-w-[1780px] w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <AdvertisementBanner position="homepage" onNavigate={onNavigate} />
      </section>

      {/* Featured Products (ফিচার্ড প্রোডাক্টস) */}
      <section className="max-w-[1780px] w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mb-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-3 py-1 rounded-full mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-current" />
                <span>বিশেষ নির্বাচিত পণ্য • HANDPICKED FOR YOU</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight flex items-center gap-2">
                <span>Featured Products</span>
                <span className="text-slate-500 text-lg sm:text-2xl font-bold hidden sm:inline">
                  (ফিচার্ড কালেকশন)
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                আমাদের স্টোরের সেরা কোয়ালিটির ভেরিফায়েড ও জনপ্রিয় পণ্যের সমাহার
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigate('products')}
                className="text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-500 px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <span>সব প্রোডাক্ট দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5 pt-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banner (if any) */}
      {promoBanners[0] && (
        <section className="max-w-[1780px] w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-emerald-950 p-8 sm:p-12 text-white shadow-xl flex items-center justify-between">
            {promoBanners[0].mediaType === 'video' && promoBanners[0].videoUrl ? (
              isYouTubeUrl(promoBanners[0].videoUrl) ? (
                <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden opacity-40">
                  <iframe
                    src={getYouTubeEmbed(promoBanners[0].videoUrl) || ''}
                    className="w-[130%] h-[130%] -ml-[15%] -mt-[15%] object-cover"
                    title={promoBanners[0].title}
                    allow="autoplay; encrypted-media"
                  />
                </div>
              ) : (
                <video
                  src={promoBanners[0].videoUrl}
                  poster={promoBanners[0].image}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-40"
                />
              )
            ) : (
              <img
                src={promoBanners[0].image}
                alt={promoBanners[0].title}
                className="absolute inset-0 w-full h-full object-cover object-center opacity-40"
              />
            )}
            <div className="relative z-10 max-w-xl space-y-3">
              <span className="bg-emerald-500 text-gray-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Special Highlight
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {promoBanners[0].title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-200">
                {promoBanners[0].subtitle}
              </p>
              <button
                onClick={() => onNavigate('products')}
                className="mt-3 bg-white text-emerald-950 font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-emerald-50 transition"
              >
                {promoBanners[0].buttonText || 'Discover Now'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      <section className="max-w-[1780px] w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block">
              Top Customer Choices
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              <span>Best Selling Products</span>
            </h2>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* Bottom Advertisement Banner (Admin Controlled) */}
      <section className="max-w-[1780px] w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <AdvertisementBanner position="bottom" onNavigate={onNavigate} />
      </section>

      {/* Latest Products */}
      <section className="max-w-[1780px] w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">
              Just In Store
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-500" />
              <span>Latest Arrivals</span>
            </h2>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5">
          {latestProducts.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </section>
    </div>
  );
};
