export type ProductStatus = 'published' | 'draft' | 'archived';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  category: string;
  categoryId?: string;
  sku: string;
  status: ProductStatus;
  isFeatured: boolean;
  isBestseller: boolean;
  images: string[];
  frontImage?: string;
  backImage?: string;
  sideImage?: string;
  videoUrl?: string;
  videoTitle?: string;
  videoFileName?: string;
  salesCount?: number;
  // Hot Deal / Flash Sale Specific Fields
  isHotDeal?: boolean;
  hotDealPrice?: number;
  hotDealDiscount?: number;
  hotDealStock?: number;
  hotDealSold?: number;
  hotDealStartTime?: string; // Festival Campaign start date-time
  hotDealEndTime?: string; // Festival Campaign end date-time
  hotDealBadge?: string;
  festivalName?: string; // Festival or Occasion Name e.g. "ঈদ মেগা অফার"
  // Banner / Advertisement Link & Placement
  linkedBannerId?: string;
  linkedBannerName?: string;
  linkedBannerLink?: string;
  linkedBannerPosition?: string;
  colors?: ProductColor[];
  specifications?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image: string;
  icon?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  mediaType?: 'image' | 'video';
  videoUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  displayOrder: number;
  isActive: boolean;
  position: 'hero' | 'promo' | 'deal';
  targetProductId?: string;
  // Picture Shadow & Overlay Customization (শ্যাডো অন/অফ ও কালার কাস্টমাইজেশন)
  showOverlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  overlayDirection?: 'left' | 'radial' | 'full' | 'bottom';
  createdAt?: string;
  updatedAt?: string;
}

export type AdPosition = 'homepage' | 'product_page' | 'bottom' | 'promotional';

export interface Advertisement {
  id: string;
  title: string;
  image: string;
  linkUrl: string;
  position: AdPosition;
  isActive: boolean;
  adType?: 'image' | 'code';
  adCode?: string;
  targetProductId?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentMethod = 'Cash on Delivery (COD)' | 'bKash' | 'Nagad' | 'Rocket' | 'Upay' | 'Credit/Debit Card';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  sku?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  deliveryCharge: number;
  subtotal: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  customerPaymentNumber?: string;
  transactionId?: string;
  items: OrderItem[];
  notes?: string;
  estimatedDeliveryTime?: string;
  cancellationReason?: string;
  adminNotes?: string;
  // Courier Integration (Steadfast, Pathao, RedX, Manual)
  courierProvider?: 'steadfast' | 'pathao' | 'redx' | 'sundarban' | 'manual' | string;
  courierTrackingCode?: string;
  courierConsignmentId?: string;
  courierStatus?: string;
  courierBookedAt?: string;
  courierCodAmount?: number;
  courierNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  customerEmail?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  role: 'customer' | 'admin';
  createdAt: string;
  ordersCount?: number;
  totalSpent?: number;
}

export interface StoreSettings {
  id: string;
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  phone?: string;
  address: string;
  currencySymbol: string;
  deliveryFeeInsideDhaka: number;
  deliveryFeeDhakaSuburbs?: number;
  deliveryFeeChittagong?: number;
  deliveryFeeRajshahi?: number;
  deliveryFeeSylhet?: number;
  deliveryFeeKhulna?: number;
  deliveryFeeBarisal?: number;
  deliveryFeeRangpur?: number;
  deliveryFeeMymensingh?: number;
  deliveryFeeOutsideDhaka: number;
  freeDeliveryThreshold: number;
  districtFeeOverrides?: Record<string, number>;
  isStoreLive: boolean;
  logoUrl?: string;
  iconUrl?: string;
  bkashNumber?: string;
  bkashType?: 'Personal' | 'Merchant' | 'Agent';
  nagadNumber?: string;
  nagadType?: 'Personal' | 'Merchant';
  rocketNumber?: string;
  rocketType?: 'Personal' | 'Merchant';
  upayNumber?: string;
  upayType?: 'Personal' | 'Merchant' | 'Agent';
  isBkashEnabled?: boolean;
  isNagadEnabled?: boolean;
  isRocketEnabled?: boolean;
  isUpayEnabled?: boolean;
  isCodEnabled?: boolean;
  // TrxID Requirement Toggles (Admin can toggle ON or OFF)
  isBkashTrxIdRequired?: boolean;
  isNagadTrxIdRequired?: boolean;
  isRocketTrxIdRequired?: boolean;
  isUpayTrxIdRequired?: boolean;
  // Credit / Debit Card Configuration
  isCardPaymentEnabled?: boolean;
  merchantCardNumber?: string;
  cardBankName?: string;
  cardAccountName?: string;
  cardRoutingNo?: string;
  cardExpiry?: string;
  cardPaymentLink?: string;
  cardPaymentInstructions?: string;
  cardGatewayType?: 'direct_card' | 'bank_transfer' | 'pos_terminal';
  customPaymentName?: string;
  customPaymentNumber?: string;
  customPaymentType?: string;
  paymentInstructions?: string;
  // Notice & Announcement Bar
  isNoticeBarActive?: boolean;
  noticeBarText?: string;
  noticeBarLink?: string;
  noticeBarBgColor?: string;
  // WhatsApp Live Chat Support
  isWhatsAppChatActive?: boolean;
  whatsAppNumber?: string;
  whatsAppDefaultMessage?: string;
  // Social Media & Channels
  facebookPageUrl?: string;
  instagramPageUrl?: string;
  youtubeChannelUrl?: string;
  tiktokUrl?: string;
  // Cash on Delivery & Advance Policy
  isAdvanceDeliveryFeeRequired?: boolean;
  advanceFeeAmount?: number;
  codNoticeText?: string;
  // Payment Architecture & Future Automated Merchant Gateway
  paymentMode?: 'manual' | 'automated_gateway';
  isMerchantGatewayEnabled?: boolean;
  merchantGatewayProvider?: 'bkash' | 'sslcommerz' | 'nagad' | 'aamarpay';
  bkashAppKey?: string;
  bkashAppSecret?: string;
  bkashUsername?: string;
  bkashPassword?: string;
  bkashApiMode?: 'sandbox' | 'live';
  sslcommerzStoreId?: string;
  sslcommerzStorePassword?: string;
  sslcommerzApiMode?: 'sandbox' | 'live';
  // Business Info & Brand Trust
  storeTagline?: string;
  tradeLicenseNo?: string;
  tinBinNo?: string;
  workingHours?: string;
  returnPolicyText?: string;
  orderConfirmationNote?: string;
  // Delivery Estimation & Thresholds
  isFreeDeliveryEnabled?: boolean;
  estimatedDeliveryDhaka?: string;
  estimatedDeliveryOutsideDhaka?: string;
  minimumOrderAmount?: number;
  // Storefront & Checkout Features
  autoConfirmOrders?: boolean;
  showStockCount?: boolean;
  announcementTextColor?: string;
  maintenanceMessage?: string;
  invoiceFooterNote?: string;
  trustBadgeText?: string;
  // Monetization & Adsterra Network Settings
  isAdsterraEnabled?: boolean;
  adsterraHeaderScript?: string;
  adsterraBanner728x90?: string;
  adsterraBanner300x250?: string;
  adsterraNativeBanner?: string;
  // Adsterra Earnings & Analytics Tracking
  adsterraTotalEarnedUsd?: number;
  adsterraTodayEarnedUsd?: number;
  adsterraImpressionsCount?: number;
  adsterraClicksCount?: number;
  adsterraCpmRate?: number;
  adsterraApiToken?: string;
  adsterraPaymentMethod?: string;
  // Courier API Integrations (Steadfast, Pathao, RedX, Manual)
  defaultCourier?: 'steadfast' | 'pathao' | 'redx' | 'manual';
  isSteadfastActive?: boolean;
  steadfastApiKey?: string;
  steadfastSecretKey?: string;
  isPathaoActive?: boolean;
  pathaoClientId?: string;
  pathaoClientSecret?: string;
  pathaoUsername?: string;
  pathaoPassword?: string;
  pathaoStoreId?: string;
  isRedxActive?: boolean;
  redxApiToken?: string;
  // Hot Deal / Flash Sale Settings
  isHotDealActive?: boolean;
  hotDealTitle?: string;
  hotDealSubtitle?: string;
  hotDealFestivalName?: string; // e.g. "🌙 ঈদ-উল-ফিতর মেগা উৎসব" or "🎉 বৈশাখী মেগা ধামাকা"
  hotDealStartDate?: string; // ISO date-time string e.g. "2026-10-13T00:00:00"
  hotDealEndTime?: string; // ISO date-time string e.g. "2026-10-16T23:59:00"
  hotDealAutoExpire?: boolean; // Daraz style auto-expiration
  hotDealBadgeText?: string;
  hotDealBannerImage?: string;
  // Hot Deal Dual Zone Colors & Mobile/PC Background Pictures
  hotDealHeaderBgColor?: string; // Top Header & Timer Background Color / Gradient
  hotDealHeaderBgImage?: string; // Top Header & Timer Background Picture (Uploaded from Mobile/PC)
  hotDealBodyBgColor?: string; // Bottom Products Section Background Color / Gradient
  hotDealBodyBgImage?: string; // Bottom Products Section Background Picture (Uploaded from Mobile/PC)
  hotDealThemePreset?: string; // e.g. 'royal_gold', 'crimson_velvet', 'midnight_obsidian', 'custom'
  // Picture Shadow & Overlay Customization (ছবির ওপর ডার্ক শ্যাডো অন/অফ ও কালার কাস্টমাইজেশন)
  hotDealShowOverlay?: boolean; // Turn shadow ON or OFF
  hotDealOverlayColor?: string; // Custom shadow color (e.g. #000000, #1e1b4b, etc.)
  hotDealOverlayOpacity?: number; // Shadow opacity (0 to 100)
  // Top Bar & Trust Policy Customization (টপ বার ও পলিসি লেখা কাস্টমাইজেশন)
  topBarCodText?: string; // e.g. "Cash on Delivery (COD)"
  topBarReturnText?: string; // e.g. "7 Days Return Policy"
  topBarDeliveryNotice?: string; // e.g. "ডেলিভারি চার্জ: ঢাকার ভিতরে ৳৬০ | ঢাকার বাহিরে ৳১২০"
  updatedAt?: string;
}
