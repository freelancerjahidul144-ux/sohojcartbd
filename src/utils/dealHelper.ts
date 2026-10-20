import { Product, StoreSettings } from '../types';

/**
 * Checks whether a product has an active, unexpired Hot Deal / Flash Sale campaign.
 */
export const isProductHotDealActive = (
  product: Product,
  settings?: StoreSettings,
  now = Date.now()
): boolean => {
  if (settings && settings.isHotDealActive === false) {
    return false;
  }

  if (!product.isHotDeal) {
    return false;
  }

  // Check end time
  const endTimeStr = product.hotDealEndTime || settings?.hotDealEndTime;
  if (endTimeStr) {
    const end = new Date(endTimeStr).getTime();
    if (!isNaN(end) && now >= end) {
      return false; // Deal has expired! Revert to normal product.
    }
  }

  // Check start time
  const startTimeStr = product.hotDealStartTime || settings?.hotDealStartDate;
  if (startTimeStr) {
    const start = new Date(startTimeStr).getTime();
    if (!isNaN(start) && now < start) {
      return false; // Deal hasn't started yet.
    }
  }

  return true;
};

export interface ProductPriceInfo {
  effectivePrice: number;
  originalPrice: number;
  hasDiscount: boolean;
  discountPercentage: number;
  isHotDealActive: boolean;
  isExpiredDeal: boolean;
  endTime?: string;
  startTime?: string;
  festivalName?: string;
}

/**
 * Calculates effective price and discount status according to Daraz Flash Sale logic:
 * - Active Hot Deal: shows hotDealPrice and original price crossed out.
 * - Expired Hot Deal: discount disappears, price returns to original regular price!
 */
export const getProductPriceInfo = (
  product: Product,
  settings?: StoreSettings,
  now = Date.now()
): ProductPriceInfo => {
  const endTime = product.hotDealEndTime || settings?.hotDealEndTime;
  const startTime = product.hotDealStartTime || settings?.hotDealStartDate;
  const festivalName = product.festivalName || settings?.hotDealFestivalName || 'উৎসব মেগা অফার';

  if (product.isHotDeal) {
    const isActive = isProductHotDealActive(product, settings, now);

    if (isActive) {
      const dealPrice = product.hotDealPrice ?? product.discountPrice ?? product.price;
      const originalPrice = product.price;
      const hasDiscount = originalPrice > dealPrice;
      const discountPct =
        product.hotDealDiscount ??
        (hasDiscount ? Math.round(((originalPrice - dealPrice) / originalPrice) * 100) : 0);

      return {
        effectivePrice: dealPrice,
        originalPrice,
        hasDiscount,
        discountPercentage: discountPct,
        isHotDealActive: true,
        isExpiredDeal: false,
        endTime,
        startTime,
        festivalName,
      };
    } else {
      // ⌛ EXPIRED DEAL: Discount removed! Reverts to normal regular price, exactly like Daraz.
      return {
        effectivePrice: product.price,
        originalPrice: product.price,
        hasDiscount: false,
        discountPercentage: 0,
        isHotDealActive: false,
        isExpiredDeal: true,
        endTime,
        startTime,
        festivalName,
      };
    }
  }

  // Standard Catalog Product
  const hasRegularDiscount =
    product.discountPrice !== undefined && product.discountPrice < product.price;
  const effectivePrice = hasRegularDiscount ? product.discountPrice! : product.price;
  const discountPct = hasRegularDiscount
    ? product.discountPercentage ??
      Math.round(((product.price - effectivePrice) / product.price) * 100)
    : 0;

  return {
    effectivePrice,
    originalPrice: product.price,
    hasDiscount: !!hasRegularDiscount,
    discountPercentage: discountPct,
    isHotDealActive: false,
    isExpiredDeal: false,
  };
};

/**
 * Formats a date string or range into a friendly Bengali representation.
 */
export const formatFestivalDateRange = (
  startIso?: string,
  endIso?: string
): string => {
  if (!startIso && !endIso) return 'সীমিত সময়ের উৎসব অফার';

  const monthNames = [
    'জানুয়ারি',
    'ফেব্রুয়ারি',
    'মার্চ',
    'এপ্রিল',
    'মে',
    'জুন',
    'জুলাই',
    'আগস্ট',
    'সেপ্টেম্বর',
    'অক্টোবর',
    'নভেম্বর',
    'ডিসেম্বর',
  ];

  const formatSingle = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return `${d.getDate()} ${monthNames[d.getMonth()]}`;
  };

  const startText = startIso ? formatSingle(startIso) : '';
  const endText = endIso ? formatSingle(endIso) : '';

  if (startText && endText) {
    return `${startText} - ${endText}`;
  }
  if (endText) {
    return `শেষ: ${endText}`;
  }
  return `শুরু: ${startText}`;
};

/**
 * Calculate countdown breakdown from an ISO target date-time string.
 */
export const calculateTimeRemaining = (
  targetIso?: string,
  now = Date.now()
) => {
  if (!targetIso) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const target = new Date(targetIso).getTime();
  if (isNaN(target)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const diff = target - now;
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isExpired: false };
};
