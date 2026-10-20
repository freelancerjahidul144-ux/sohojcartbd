import React from 'react';
import { useStore } from '../../context/StoreContext';
import { AdPosition } from '../../types';
import { ArrowRight, Sparkles } from 'lucide-react';
import { AdCodeRenderer } from './AdCodeRenderer';

interface AdvertisementBannerProps {
  position: AdPosition;
  onNavigate?: (page: string) => void;
  className?: string;
}

export const AdvertisementBanner: React.FC<AdvertisementBannerProps> = ({
  position,
  onNavigate,
  className = '',
}) => {
  const { advertisements, settings } = useStore();

  const activeAd = advertisements.find(
    (ad) => ad.position === position && ad.isActive
  );

  // If there's an active custom ad with HTML/script code
  if (activeAd && activeAd.adType === 'code' && activeAd.adCode) {
    const format =
      position === 'homepage'
        ? '728x90'
        : position === 'bottom'
        ? 'native'
        : '300x250';
    return (
      <div className={`my-4 ${className}`}>
        <AdCodeRenderer code={activeAd.adCode} format={format} label={activeAd.title || 'Sponsored Advertisement'} />
      </div>
    );
  }

  // If there's no custom ad or it is not active, but global Adsterra is enabled:
  if (!activeAd && settings.isAdsterraEnabled) {
    let globalCode = '';
    let format: '728x90' | '300x250' | 'native' = '728x90';

    if (position === 'homepage' && settings.adsterraBanner728x90) {
      globalCode = settings.adsterraBanner728x90;
      format = '728x90';
    } else if (position === 'product_page' && (settings.adsterraBanner300x250 || settings.adsterraBanner728x90)) {
      globalCode = settings.adsterraBanner300x250 || settings.adsterraBanner728x90 || '';
      format = settings.adsterraBanner300x250 ? '300x250' : '728x90';
    } else if (position === 'bottom' && (settings.adsterraNativeBanner || settings.adsterraBanner728x90)) {
      globalCode = settings.adsterraNativeBanner || settings.adsterraBanner728x90 || '';
      format = settings.adsterraNativeBanner ? 'native' : '728x90';
    }

    if (globalCode) {
      return (
        <div className={`my-4 ${className}`}>
          <AdCodeRenderer code={globalCode} format={format} label="Sponsored by Adsterra" />
        </div>
      );
    }
  }

  if (!activeAd) return null;

  const handleClick = () => {
    if (activeAd.linkUrl) {
      if (activeAd.linkUrl.startsWith('/') && onNavigate) {
        // Internal route
        const page = activeAd.linkUrl.replace('/', '');
        onNavigate(page || 'products');
      } else if (activeAd.linkUrl.startsWith('http')) {
        window.open(activeAd.linkUrl, '_blank', 'noopener,noreferrer');
      } else if (onNavigate) {
        onNavigate('products');
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative overflow-hidden rounded-2xl cursor-pointer group shadow-md transition-all duration-300 hover:shadow-xl ${className}`}
    >
      <div className="relative h-32 sm:h-44 md:h-52 w-full overflow-hidden bg-gray-950">
        <img
          src={activeAd.image}
          alt={activeAd.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-90"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/40 to-transparent flex items-center p-6 sm:p-10">
          <div className="max-w-lg">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-2 backdrop-blur-xs">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Special Promotion</span>
            </span>

            <h3 className="text-white font-extrabold text-base sm:text-xl md:text-2xl leading-tight mb-2 drop-shadow-sm">
              {activeAd.title}
            </h3>

            <span className="inline-flex items-center gap-1 text-emerald-300 group-hover:text-emerald-200 text-xs sm:text-sm font-bold transition">
              <span>Claim Offer Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

