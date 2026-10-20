import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  Truck,
  Store,
  Image as ImageIcon,
  Smartphone,
  Upload,
  RefreshCw,
  Sparkles,
  MapPin,
  Trash2,
  Plus,
  MessageCircle,
  Bell,
  Share2,
  FileText,
  Check,
  Phone,
  Globe,
  Copy,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sliders,
  DollarSign,
  ShieldCheck,
  Eye,
  CreditCard,
  Key,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Layers,
  Edit3,
  Search,
  X,
  Camera,
  Megaphone,
  ExternalLink,
  Tag,
  Code2,
  Link as LinkIcon,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { StoreSettings, Category, Banner, Advertisement } from '../types';
import { BrandLogo } from '../components/common/BrandLogo';
import { BANGLADESH_DISTRICTS } from '../data/districts';
import { processImageFile } from '../utils/imageHelper';

type SettingsTab =
  | 'payments'
  | 'ads_widgets'
  | 'categories'
  | 'merchant_gateway'
  | 'card'
  | 'delivery'
  | 'branding'
  | 'notice'
  | 'whatsapp'
  | 'policies'
  | 'social'
  | 'checkout';

export const AdminSettings: React.FC = () => {
  const {
    settings,
    updateSettingsAction,
    addToast,
    categories,
    saveCategoryAction,
    deleteCategoryAction,
    banners,
    saveBannerAction,
    deleteBannerAction,
    advertisements,
    saveAdAction,
    deleteAdAction,
  } = useStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('payments');

  // Tab horizontal scroll & drag slider navigation state
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const checkScroll = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
      const maxScroll = scrollWidth - clientWidth;
      setScrollProgress(maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = tabsContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
    }
    window.addEventListener('resize', checkScroll);
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const amount = 280;
      tabsContainerRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 320);
    }
  };

  const handleSliderChange = (percent: number) => {
    setScrollProgress(percent);
    if (tabsContainerRef.current) {
      const { scrollWidth, clientWidth } = tabsContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      tabsContainerRef.current.scrollLeft = (percent / 100) * maxScroll;
    }
  };

  const handleSelectTab = (tabId: SettingsTab) => {
    setActiveTab(tabId);
    setTimeout(() => {
      const btn = document.getElementById(`tab-btn-${tabId}`);
      if (btn && tabsContainerRef.current) {
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
      checkScroll();
    }, 60);
  };

  // Track if user has modified anything locally
  const isDirtyRef = useRef(false);

  // Category management inside settings
  const [newCatName, setNewCatName] = useState('');
  const [newCatDescription, setNewCatDescription] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [isProcessingNewCatImg, setIsProcessingNewCatImg] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [catSearch, setCatSearch] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);

  const handleUploadNewCatImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingNewCatImg(true);
    try {
      const dataUrl = await processImageFile(file, 800, 800, 0.85);
      setNewCatImage(dataUrl);
      addToast('success', 'ক্যাটাগরির ছবি নির্বাচন করা হয়েছে!');
    } catch (err: any) {
      addToast('error', err?.message || 'ছবি প্রসেস করতে ব্যর্থ হয়েছে');
    } finally {
      setIsProcessingNewCatImg(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleAddNewCategory = async (nameToAdd?: string) => {
    const catName = (nameToAdd || newCatName).trim();
    if (!catName) return;
    setIsAddingCat(true);
    const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCat: Category = {
      id: `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: catName,
      slug: slug || `cat-${Date.now()}`,
      description: newCatDescription.trim() || `${catName} products at Sohoj Cart BD`,
      image: newCatImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      icon: 'Tag',
      isActive: true,
      displayOrder: categories.length + 1,
    };
    try {
      await saveCategoryAction(newCat);
      setNewCatName('');
      setNewCatDescription('');
      setNewCatImage('');
      addToast('success', `নতুন ক্যাটাগরি "${catName}" সফলভাবে যুক্ত করা হয়েছে!`);
    } catch {
      addToast('error', 'ক্যাটাগরি যুক্ত করতে সমস্যা হয়েছে।');
    } finally {
      setIsAddingCat(false);
    }
  };

  // WordPress-style Ads & Custom Banners Builder state
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerSubtitle, setNewBannerSubtitle] = useState('');
  const [newBannerImage, setNewBannerImage] = useState('');
  const [newBannerButtonText, setNewBannerButtonText] = useState('এখনই অর্ডার করুন');
  const [newBannerButtonLink, setNewBannerButtonLink] = useState('/products');
  const [newBannerPosition, setNewBannerPosition] = useState<'hero' | 'promo' | 'deal'>('hero');
  const [newBannerBadge, setNewBannerBadge] = useState('স্পেশাল অফার');
  const [isProcessingBannerImg, setIsProcessingBannerImg] = useState(false);
  const [isAddingBanner, setIsAddingBanner] = useState(false);

  const handleUploadBannerImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingBannerImg(true);
    try {
      const dataUrl = await processImageFile(file, 1600, 900, 0.85);
      setNewBannerImage(dataUrl);
      addToast('success', 'ব্যানারের ছবি সফলভাবে আপলোড করা হয়েছে!');
    } catch (err: any) {
      addToast('error', err?.message || 'ছবি আপলোড করতে সমস্যা হয়েছে');
    } finally {
      setIsProcessingBannerImg(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleCreateNewBanner = async () => {
    if (!newBannerTitle.trim()) {
      addToast('error', 'অনুগ্রহ করে ব্যানারের টাইটেল বা শিরোনাম লিখুন।');
      return;
    }
    if (!newBannerImage.trim()) {
      addToast('error', 'কম্পিউটার বা মোবাইল থেকে একটি ব্যানার ছবি আপলোড করুন।');
      return;
    }
    setIsAddingBanner(true);
    try {
      const bannerItem: Banner = {
        id: `banner-${Date.now()}`,
        title: newBannerTitle.trim(),
        subtitle: newBannerSubtitle.trim() || newBannerBadge.trim(),
        image: newBannerImage,
        buttonText: newBannerButtonText.trim() || 'Shop Now',
        buttonLink: newBannerButtonLink.trim() || '/products',
        position: newBannerPosition,
        displayOrder: banners.length + 1,
        isActive: true,
      };
      await saveBannerAction(bannerItem);
      setNewBannerTitle('');
      setNewBannerSubtitle('');
      setNewBannerImage('');
      setNewBannerButtonText('এখনই অর্ডার করুন');
      setNewBannerButtonLink('/products');
      addToast('success', 'নতুন ব্যানার/বিজ্ঞাপন স্টোরে সফলভাবে লাইভ করা হয়েছে!');
    } catch {
      addToast('error', 'ব্যানার সংরক্ষণ করতে সমস্যা হয়েছে।');
    } finally {
      setIsAddingBanner(false);
    }
  };

  const handleUploadBannerQuickPhoto = async (banner: Banner, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processImageFile(file, 1600, 900, 0.85);
      await saveBannerAction({ ...banner, image: dataUrl });
      addToast('success', `ব্যানার "${banner.title}" এর ছবি সফলভাবে পরিবর্তন হয়েছে!`);
    } catch (err: any) {
      addToast('error', err?.message || 'ছবি আপলোড ব্যর্থ হয়েছে');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleToggleBannerActive = async (banner: Banner) => {
    try {
      const updated = !banner.isActive;
      await saveBannerAction({ ...banner, isActive: updated });
      addToast('info', `ব্যানার "${banner.title}" ${updated ? 'চালু' : 'বন্ধ'} করা হয়েছে।`);
    } catch {
      addToast('error', 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।');
    }
  };

  const handleDeleteBanner = async (bannerId: string, title: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত "${title}" ব্যানারটি মুছে ফেলতে চান?`)) return;
    try {
      await deleteBannerAction(bannerId);
      addToast('info', `ব্যানার "${title}" মুছে ফেলা হয়েছে।`);
    } catch {
      addToast('error', 'ব্যানার ডিলিট করতে সমস্যা হয়েছে।');
    }
  };

  const handleSaveCategoryRename = async (cat: Category) => {
    if (!editingCatName.trim()) return;
    try {
      await saveCategoryAction({ ...cat, name: editingCatName.trim() });
      setEditingCatId(null);
      setEditingCatName('');
      addToast('success', `ক্যাটাগরির নাম সফলভাবে পরিবর্তন করা হয়েছে!`);
    } catch {
      addToast('error', 'ক্যাটাগরি নাম পরিবর্তন করতে সমস্যা হয়েছে।');
    }
  };

  const handleToggleCatActive = async (cat: Category) => {
    try {
      const newStatus = !(cat.isActive !== false);
      await saveCategoryAction({ ...cat, isActive: newStatus });
      addToast('info', `ক্যাটাগরি "${cat.name}" ${newStatus ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে।`);
    } catch {
      addToast('error', 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।');
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত "${catName}" ক্যাটাগরি মুছে ফেলতে চান?`)) return;
    try {
      await deleteCategoryAction(catId);
      addToast('info', `ক্যাটাগরি "${catName}" সফলভাবে ডিলিট করা হয়েছে।`);
    } catch {
      addToast('error', 'ক্যাটাগরি ডিলিট করতে সমস্যা হয়েছে।');
    }
  };

  const handleUploadCategoryPhoto = async (cat: Category, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processImageFile(file, 800, 800, 0.85);
      await saveCategoryAction({ ...cat, image: dataUrl });
      addToast('success', `"${cat.name}" ক্যাটাগরির ছবি সফলভাবে আপডেট হয়েছে!`);
    } catch (err: any) {
      addToast('error', err?.message || 'ছবি আপলোড করতে সমস্যা হয়েছে');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // 1. General Store Info & Branding
  const [storeName, setStoreName] = useState(settings.storeName || 'Sohoj Cart BD');
  const [storeTagline, setStoreTagline] = useState(
    settings.storeTagline || 'বাংলাদেশের বিশ্বস্ত ও নির্ভরযোগ্য অনলাইন শপিং মল'
  );
  const [contactEmail, setContactEmail] = useState(settings.contactEmail || 'support@sohojcartbd.com');
  const [contactPhone, setContactPhone] = useState(settings.contactPhone || '+880 1712-345678');
  const [address, setAddress] = useState(
    settings.address || 'Level 5, Plot 22, Road 11, Banani, Dhaka-1213, Bangladesh'
  );
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol || '৳');
  const [isStoreLive, setIsStoreLive] = useState(settings.isStoreLive ?? true);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    settings.maintenanceMessage || 'আমাদের সাইট সাময়িকভাবে মেইনটেন্যান্সে রয়েছে। খুব শীঘ্রই আমরা ফিরছি!'
  );
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [iconUrl, setIconUrl] = useState(settings.iconUrl || '');

  // 2. Customer Payment Numbers (bKash / Nagad / Rocket / Upay) & TrxID Toggles
  const [bkashNumber, setBkashNumber] = useState(settings.bkashNumber || '01712-345678');
  const [bkashType, setBkashType] = useState<'Personal' | 'Merchant' | 'Agent'>(
    settings.bkashType || 'Personal'
  );
  const [isBkashEnabled, setIsBkashEnabled] = useState(settings.isBkashEnabled !== false);
  const [isBkashTrxIdRequired, setIsBkashTrxIdRequired] = useState(
    settings.isBkashTrxIdRequired !== false
  );

  const [nagadNumber, setNagadNumber] = useState(settings.nagadNumber || '01812-345678');
  const [nagadType, setNagadType] = useState<'Personal' | 'Merchant'>(
    settings.nagadType || 'Personal'
  );
  const [isNagadEnabled, setIsNagadEnabled] = useState(settings.isNagadEnabled !== false);
  const [isNagadTrxIdRequired, setIsNagadTrxIdRequired] = useState(
    settings.isNagadTrxIdRequired !== false
  );

  const [rocketNumber, setRocketNumber] = useState(settings.rocketNumber || '01912-345678');
  const [rocketType, setRocketType] = useState<'Personal' | 'Merchant'>(
    settings.rocketType || 'Personal'
  );
  const [isRocketEnabled, setIsRocketEnabled] = useState(settings.isRocketEnabled !== false);
  const [isRocketTrxIdRequired, setIsRocketTrxIdRequired] = useState(
    settings.isRocketTrxIdRequired !== false
  );

  const [upayNumber, setUpayNumber] = useState(settings.upayNumber || '01712-345678');
  const [upayType, setUpayType] = useState<'Personal' | 'Merchant' | 'Agent'>(
    settings.upayType || 'Personal'
  );
  const [isUpayEnabled, setIsUpayEnabled] = useState(settings.isUpayEnabled !== false);
  const [isUpayTrxIdRequired, setIsUpayTrxIdRequired] = useState(
    settings.isUpayTrxIdRequired !== false
  );

  // Credit / Debit Card Configuration
  const [isCardPaymentEnabled, setIsCardPaymentEnabled] = useState(
    settings.isCardPaymentEnabled !== false
  );
  const [merchantCardNumber, setMerchantCardNumber] = useState(
    settings.merchantCardNumber || '4532 8910 2345 6789'
  );
  const [cardBankName, setCardBankName] = useState(
    settings.cardBankName || 'City Bank (Visa & Mastercard Accepted)'
  );
  const [cardAccountName, setCardAccountName] = useState(
    settings.cardAccountName || 'Sohoj Cart BD Enterprise'
  );
  const [cardRoutingNo, setCardRoutingNo] = useState(settings.cardRoutingNo || '225272635');
  const [cardExpiry, setCardExpiry] = useState(settings.cardExpiry || '12/28');
  const [cardPaymentLink, setCardPaymentLink] = useState(settings.cardPaymentLink || '');
  const [cardPaymentInstructions, setCardPaymentInstructions] = useState(
    settings.cardPaymentInstructions ||
      'আপনার Visa, Mastercard, AMEX বা যেকোনো ব্যাংকের কার্ড দিয়ে নিরাপদ ৩ডি-সিকিউর ওটিপি ভেরিফিকেশনের মাধ্যমে সরাসরি পেমেন্ট সম্পন্ন করুন।'
  );
  const [cardGatewayType, setCardGatewayType] = useState<'direct_card' | 'bank_transfer' | 'pos_terminal'>(
    settings.cardGatewayType || 'direct_card'
  );

  // Cash on Delivery & Advance Fee Policy
  const [isCodEnabled, setIsCodEnabled] = useState(settings.isCodEnabled !== false);
  const [isAdvanceDeliveryFeeRequired, setIsAdvanceDeliveryFeeRequired] = useState(
    settings.isAdvanceDeliveryFeeRequired ?? false
  );
  const [advanceFeeAmount, setAdvanceFeeAmount] = useState(settings.advanceFeeAmount || 100);
  const [codNoticeText, setCodNoticeText] = useState(
    settings.codNoticeText || 'পণ্য হাতে পেয়ে চেক করে সম্পূর্ণ মূল্য পরিশোধ করুন।'
  );

  // Custom Payment Method
  const [customPaymentName, setCustomPaymentName] = useState(settings.customPaymentName || '');
  const [customPaymentNumber, setCustomPaymentNumber] = useState(settings.customPaymentNumber || '');
  const [customPaymentType, setCustomPaymentType] = useState(settings.customPaymentType || 'Personal');
  const [paymentInstructions, setPaymentInstructions] = useState(
    settings.paymentInstructions ||
      'অনুগ্রহ করে উপরের নাম্বারে সেন্ড মানি (Send Money) করে যে নাম্বার থেকে টাকা পাঠিয়েছেন এবং ট্রানজেকশন আইডি (TrxID) নিচে প্রদান করুন।'
  );

  // Merchant API Gateway & Payment Modes (Future Trade License & TIN Integration)
  const [paymentMode, setPaymentMode] = useState<'manual' | 'automated_gateway'>(
    settings.paymentMode || 'manual'
  );
  const [isMerchantGatewayEnabled, setIsMerchantGatewayEnabled] = useState(
    Boolean(settings.isMerchantGatewayEnabled)
  );
  const [merchantGatewayProvider, setMerchantGatewayProvider] = useState<'bkash' | 'sslcommerz' | 'nagad' | 'aamarpay'>(
    settings.merchantGatewayProvider || 'bkash'
  );
  const [bkashAppKey, setBkashAppKey] = useState(settings.bkashAppKey || '');
  const [bkashAppSecret, setBkashAppSecret] = useState(settings.bkashAppSecret || '');
  const [bkashUsername, setBkashUsername] = useState(settings.bkashUsername || '');
  const [bkashPassword, setBkashPassword] = useState(settings.bkashPassword || '');
  const [bkashApiMode, setBkashApiMode] = useState<'sandbox' | 'live'>(
    settings.bkashApiMode || 'sandbox'
  );
  const [sslcommerzStoreId, setSslcommerzStoreId] = useState(settings.sslcommerzStoreId || '');
  const [sslcommerzStorePassword, setSslcommerzStorePassword] = useState(settings.sslcommerzStorePassword || '');
  const [sslcommerzApiMode, setSslcommerzApiMode] = useState<'sandbox' | 'live'>(
    settings.sslcommerzApiMode || 'sandbox'
  );

  // 3. Logistics & Delivery Fees
  const [deliveryFeeInsideDhaka, setDeliveryFeeInsideDhaka] = useState(settings.deliveryFeeInsideDhaka || 60);
  const [deliveryFeeDhakaSuburbs, setDeliveryFeeDhakaSuburbs] = useState(settings.deliveryFeeDhakaSuburbs || 100);
  const [deliveryFeeChittagong, setDeliveryFeeChittagong] = useState(settings.deliveryFeeChittagong || 130);
  const [deliveryFeeRajshahi, setDeliveryFeeRajshahi] = useState(settings.deliveryFeeRajshahi || 120);
  const [deliveryFeeSylhet, setDeliveryFeeSylhet] = useState(settings.deliveryFeeSylhet || 120);
  const [deliveryFeeKhulna, setDeliveryFeeKhulna] = useState(settings.deliveryFeeKhulna || 130);
  const [deliveryFeeBarisal, setDeliveryFeeBarisal] = useState(settings.deliveryFeeBarisal || 130);
  const [deliveryFeeRangpur, setDeliveryFeeRangpur] = useState(settings.deliveryFeeRangpur || 140);
  const [deliveryFeeMymensingh, setDeliveryFeeMymensingh] = useState(settings.deliveryFeeMymensingh || 110);
  const [deliveryFeeOutsideDhaka, setDeliveryFeeOutsideDhaka] = useState(settings.deliveryFeeOutsideDhaka || 120);

  // Free delivery & Estimated Time
  const [isFreeDeliveryEnabled, setIsFreeDeliveryEnabled] = useState(Boolean(settings.isFreeDeliveryEnabled));
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(settings.freeDeliveryThreshold || 0);
  const [estimatedDeliveryDhaka, setEstimatedDeliveryDhaka] = useState(
    settings.estimatedDeliveryDhaka || '২৪ - ৪৮ ঘণ্টার মধ্যে নিশ্চিত ডেলিভারি'
  );
  const [estimatedDeliveryOutsideDhaka, setEstimatedDeliveryOutsideDhaka] = useState(
    settings.estimatedDeliveryOutsideDhaka || '৩ - ৫ কর্মদিবসের মধ্যে হোম ডেলিভারি'
  );
  const [districtFeeOverrides, setDistrictFeeOverrides] = useState<Record<string, number>>(
    settings.districtFeeOverrides || {}
  );
  const [overrideDistrictName, setOverrideDistrictName] = useState('Chittagong');
  const [overrideFeeAmount, setOverrideFeeAmount] = useState<number>(130);

  // 3.5 Courier Integration Settings (Steadfast, Pathao, RedX)
  const [defaultCourier, setDefaultCourier] = useState<'steadfast' | 'pathao' | 'redx' | 'manual'>(
    settings.defaultCourier || 'steadfast'
  );
  const [isSteadfastActive, setIsSteadfastActive] = useState(settings.isSteadfastActive ?? true);
  const [steadfastApiKey, setSteadfastApiKey] = useState(settings.steadfastApiKey || '');
  const [steadfastSecretKey, setSteadfastSecretKey] = useState(settings.steadfastSecretKey || '');

  const [isPathaoActive, setIsPathaoActive] = useState(settings.isPathaoActive ?? true);
  const [pathaoClientId, setPathaoClientId] = useState(settings.pathaoClientId || '');
  const [pathaoClientSecret, setPathaoClientSecret] = useState(settings.pathaoClientSecret || '');
  const [pathaoStoreId, setPathaoStoreId] = useState(settings.pathaoStoreId || '');

  const [isRedxActive, setIsRedxActive] = useState(settings.isRedxActive ?? true);
  const [redxApiToken, setRedxApiToken] = useState(settings.redxApiToken || '');

  // 4. Top Announcement / Notice Bar
  const [isNoticeBarActive, setIsNoticeBarActive] = useState(settings.isNoticeBarActive ?? true);
  const [noticeBarText, setNoticeBarText] = useState(
    settings.noticeBarText || '🚚 সারা বাংলাদেশে দ্রুত হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা! ঢাকার ভেতরে ৬০ টাকা, ঢাকার বাইরে ১২০ টাকা'
  );
  const [noticeBarLink, setNoticeBarLink] = useState(settings.noticeBarLink || '');
  const [noticeBarBgColor, setNoticeBarBgColor] = useState(settings.noticeBarBgColor || '#059669');
  const [announcementTextColor, setAnnouncementTextColor] = useState(settings.announcementTextColor || '#ffffff');

  // 5. WhatsApp Live Support
  const [isWhatsAppChatActive, setIsWhatsAppChatActive] = useState(settings.isWhatsAppChatActive ?? true);
  const [whatsAppNumber, setWhatsAppNumber] = useState(settings.whatsAppNumber || '+8801712345678');
  const [whatsAppDefaultMessage, setWhatsAppDefaultMessage] = useState(
    settings.whatsAppDefaultMessage || 'হ্যালো, আমি Sohoj Cart BD থেকে একটি পণ্য সম্পর্কে তথ্য জানতে চাই।'
  );
  const [workingHours, setWorkingHours] = useState(
    settings.workingHours || 'সকাল ৯:০০টা - রাত ১১:০০টা (সপ্তাহের ৭ দিন ২৪ ঘণ্টা সাপোর্ট)'
  );

  // 6. Store Policies & Trust
  const [returnPolicyText, setReturnPolicyText] = useState(
    settings.returnPolicyText || 'পণ্য পছন্দ না হলে বা ডিফেক্ট থাকলে ৭ দিনের মধ্যে সহজ রিটার্ন ও পরিবর্তন সুবিধা।'
  );
  const [orderConfirmationNote, setOrderConfirmationNote] = useState(
    settings.orderConfirmationNote || 'আমাদের কাস্টমার সাপোর্ট টিম খুব শীঘ্রই কল করে আপনার অর্ডারটি কনফার্ম করবে।'
  );
  const [tradeLicenseNo, setTradeLicenseNo] = useState(settings.tradeLicenseNo || 'TRAD/DSCC/012948/2024');
  const [tinBinNo, setTinBinNo] = useState(settings.tinBinNo || 'BIN-002941042-0101');
  const [trustBadgeText, setTrustBadgeText] = useState(
    settings.trustBadgeText || '১০০% অরিজিনাল পণ্য • ক্যাশ অন ডেলিভারি • ৭ দিনের সহজ রিটার্ন'
  );
  const [topBarCodText, setTopBarCodText] = useState(
    settings.topBarCodText || 'Cash on Delivery (COD)'
  );
  const [topBarReturnText, setTopBarReturnText] = useState(
    settings.topBarReturnText || '7 Days Return Policy'
  );

  // 7. Social Media Links
  const [facebookPageUrl, setFacebookPageUrl] = useState(settings.facebookPageUrl || 'https://facebook.com');
  const [instagramPageUrl, setInstagramPageUrl] = useState(settings.instagramPageUrl || 'https://instagram.com');
  const [youtubeChannelUrl, setYoutubeChannelUrl] = useState(settings.youtubeChannelUrl || 'https://youtube.com');
  const [tiktokUrl, setTiktokUrl] = useState(settings.tiktokUrl || 'https://tiktok.com');

  // 8. Order & Checkout Configuration
  const [minimumOrderAmount, setMinimumOrderAmount] = useState<number>(settings.minimumOrderAmount || 0);
  const [autoConfirmOrders, setAutoConfirmOrders] = useState(settings.autoConfirmOrders !== false);
  const [showStockCount, setShowStockCount] = useState(settings.showStockCount !== false);
  const [invoiceFooterNote, setInvoiceFooterNote] = useState(
    settings.invoiceFooterNote || 'Sohoj Cart BD সাথে কেনাকাটা করার জন্য ধন্যবাদ! আপনার দিনটি শুভ হোক।'
  );

  const [isSaving, setIsSaving] = useState(false);

  // Synchronize state when Firestore or context settings update ONLY if user has NOT modified inputs locally
  useEffect(() => {
    if (!isDirtyRef.current && settings) {
      if (settings.storeName) setStoreName(settings.storeName);
      if (settings.storeTagline) setStoreTagline(settings.storeTagline);
      if (settings.contactEmail) setContactEmail(settings.contactEmail);
      if (settings.contactPhone) setContactPhone(settings.contactPhone);
      if (settings.address) setAddress(settings.address);
      if (settings.currencySymbol) setCurrencySymbol(settings.currencySymbol);
      if (settings.isStoreLive !== undefined) setIsStoreLive(settings.isStoreLive);
      if (settings.maintenanceMessage) setMaintenanceMessage(settings.maintenanceMessage);
      if (settings.logoUrl !== undefined) setLogoUrl(settings.logoUrl);
      if (settings.iconUrl !== undefined) setIconUrl(settings.iconUrl);

      if (settings.bkashNumber !== undefined) setBkashNumber(settings.bkashNumber);
      if (settings.bkashType) setBkashType(settings.bkashType);
      if (settings.isBkashEnabled !== undefined) setIsBkashEnabled(settings.isBkashEnabled);
      if (settings.isBkashTrxIdRequired !== undefined) setIsBkashTrxIdRequired(settings.isBkashTrxIdRequired);

      if (settings.nagadNumber !== undefined) setNagadNumber(settings.nagadNumber);
      if (settings.nagadType) setNagadType(settings.nagadType);
      if (settings.isNagadEnabled !== undefined) setIsNagadEnabled(settings.isNagadEnabled);
      if (settings.isNagadTrxIdRequired !== undefined) setIsNagadTrxIdRequired(settings.isNagadTrxIdRequired);

      if (settings.rocketNumber !== undefined) setRocketNumber(settings.rocketNumber);
      if (settings.rocketType) setRocketType(settings.rocketType);
      if (settings.isRocketEnabled !== undefined) setIsRocketEnabled(settings.isRocketEnabled);
      if (settings.isRocketTrxIdRequired !== undefined) setIsRocketTrxIdRequired(settings.isRocketTrxIdRequired);

      if (settings.upayNumber !== undefined) setUpayNumber(settings.upayNumber);
      if (settings.upayType) setUpayType(settings.upayType);
      if (settings.isUpayEnabled !== undefined) setIsUpayEnabled(settings.isUpayEnabled);
      if (settings.isUpayTrxIdRequired !== undefined) setIsUpayTrxIdRequired(settings.isUpayTrxIdRequired);

      if (settings.isCardPaymentEnabled !== undefined)
        setIsCardPaymentEnabled(settings.isCardPaymentEnabled);
      if (settings.merchantCardNumber !== undefined)
        setMerchantCardNumber(settings.merchantCardNumber);
      if (settings.cardBankName !== undefined)
        setCardBankName(settings.cardBankName);
      if (settings.cardAccountName !== undefined)
        setCardAccountName(settings.cardAccountName);
      if (settings.cardRoutingNo !== undefined)
        setCardRoutingNo(settings.cardRoutingNo);
      if (settings.cardExpiry !== undefined)
        setCardExpiry(settings.cardExpiry);
      if (settings.cardPaymentLink !== undefined)
        setCardPaymentLink(settings.cardPaymentLink);
      if (settings.cardPaymentInstructions !== undefined)
        setCardPaymentInstructions(settings.cardPaymentInstructions);
      if (settings.cardGatewayType !== undefined)
        setCardGatewayType(settings.cardGatewayType);

      if (settings.isCodEnabled !== undefined) setIsCodEnabled(settings.isCodEnabled);
      if (settings.isAdvanceDeliveryFeeRequired !== undefined)
        setIsAdvanceDeliveryFeeRequired(settings.isAdvanceDeliveryFeeRequired);
      if (settings.advanceFeeAmount !== undefined) setAdvanceFeeAmount(settings.advanceFeeAmount);
      if (settings.codNoticeText) setCodNoticeText(settings.codNoticeText);

      if (settings.customPaymentName !== undefined) setCustomPaymentName(settings.customPaymentName);
      if (settings.customPaymentNumber !== undefined) setCustomPaymentNumber(settings.customPaymentNumber);
      if (settings.customPaymentType) setCustomPaymentType(settings.customPaymentType);
      if (settings.paymentInstructions) setPaymentInstructions(settings.paymentInstructions);

      if (settings.paymentMode) setPaymentMode(settings.paymentMode);
      if (settings.isMerchantGatewayEnabled !== undefined) setIsMerchantGatewayEnabled(settings.isMerchantGatewayEnabled);
      if (settings.merchantGatewayProvider) setMerchantGatewayProvider(settings.merchantGatewayProvider);
      if (settings.bkashAppKey !== undefined) setBkashAppKey(settings.bkashAppKey);
      if (settings.bkashAppSecret !== undefined) setBkashAppSecret(settings.bkashAppSecret);
      if (settings.bkashUsername !== undefined) setBkashUsername(settings.bkashUsername);
      if (settings.bkashPassword !== undefined) setBkashPassword(settings.bkashPassword);
      if (settings.bkashApiMode) setBkashApiMode(settings.bkashApiMode);
      if (settings.sslcommerzStoreId !== undefined) setSslcommerzStoreId(settings.sslcommerzStoreId);
      if (settings.sslcommerzStorePassword !== undefined) setSslcommerzStorePassword(settings.sslcommerzStorePassword);
      if (settings.sslcommerzApiMode) setSslcommerzApiMode(settings.sslcommerzApiMode);

      if (settings.deliveryFeeInsideDhaka !== undefined)
        setDeliveryFeeInsideDhaka(settings.deliveryFeeInsideDhaka);
      if (settings.deliveryFeeDhakaSuburbs !== undefined)
        setDeliveryFeeDhakaSuburbs(settings.deliveryFeeDhakaSuburbs);
      if (settings.deliveryFeeChittagong !== undefined)
        setDeliveryFeeChittagong(settings.deliveryFeeChittagong);
      if (settings.deliveryFeeRajshahi !== undefined)
        setDeliveryFeeRajshahi(settings.deliveryFeeRajshahi);
      if (settings.deliveryFeeSylhet !== undefined)
        setDeliveryFeeSylhet(settings.deliveryFeeSylhet);
      if (settings.deliveryFeeKhulna !== undefined)
        setDeliveryFeeKhulna(settings.deliveryFeeKhulna);
      if (settings.deliveryFeeBarisal !== undefined)
        setDeliveryFeeBarisal(settings.deliveryFeeBarisal);
      if (settings.deliveryFeeRangpur !== undefined)
        setDeliveryFeeRangpur(settings.deliveryFeeRangpur);
      if (settings.deliveryFeeMymensingh !== undefined)
        setDeliveryFeeMymensingh(settings.deliveryFeeMymensingh);
      if (settings.deliveryFeeOutsideDhaka !== undefined)
        setDeliveryFeeOutsideDhaka(settings.deliveryFeeOutsideDhaka);

      if (settings.isFreeDeliveryEnabled !== undefined)
        setIsFreeDeliveryEnabled(settings.isFreeDeliveryEnabled);
      if (settings.freeDeliveryThreshold !== undefined)
        setFreeDeliveryThreshold(settings.freeDeliveryThreshold);
      if (settings.estimatedDeliveryDhaka) setEstimatedDeliveryDhaka(settings.estimatedDeliveryDhaka);
      if (settings.estimatedDeliveryOutsideDhaka)
        setEstimatedDeliveryOutsideDhaka(settings.estimatedDeliveryOutsideDhaka);
      if (settings.districtFeeOverrides) setDistrictFeeOverrides(settings.districtFeeOverrides);

      if (settings.isNoticeBarActive !== undefined) setIsNoticeBarActive(settings.isNoticeBarActive);
      if (settings.noticeBarText) setNoticeBarText(settings.noticeBarText);
      if (settings.noticeBarLink !== undefined) setNoticeBarLink(settings.noticeBarLink);
      if (settings.noticeBarBgColor) setNoticeBarBgColor(settings.noticeBarBgColor);
      if (settings.announcementTextColor) setAnnouncementTextColor(settings.announcementTextColor);

      if (settings.isWhatsAppChatActive !== undefined)
        setIsWhatsAppChatActive(settings.isWhatsAppChatActive);
      if (settings.whatsAppNumber !== undefined) setWhatsAppNumber(settings.whatsAppNumber);
      if (settings.whatsAppDefaultMessage) setWhatsAppDefaultMessage(settings.whatsAppDefaultMessage);
      if (settings.workingHours) setWorkingHours(settings.workingHours);

      if (settings.returnPolicyText) setReturnPolicyText(settings.returnPolicyText);
      if (settings.orderConfirmationNote) setOrderConfirmationNote(settings.orderConfirmationNote);
      if (settings.tradeLicenseNo !== undefined) setTradeLicenseNo(settings.tradeLicenseNo);
      if (settings.tinBinNo !== undefined) setTinBinNo(settings.tinBinNo);
      if (settings.trustBadgeText) setTrustBadgeText(settings.trustBadgeText);

      if (settings.facebookPageUrl !== undefined) setFacebookPageUrl(settings.facebookPageUrl);
      if (settings.instagramPageUrl !== undefined) setInstagramPageUrl(settings.instagramPageUrl);
      if (settings.youtubeChannelUrl !== undefined) setYoutubeChannelUrl(settings.youtubeChannelUrl);
      if (settings.tiktokUrl !== undefined) setTiktokUrl(settings.tiktokUrl);

      if (settings.minimumOrderAmount !== undefined) setMinimumOrderAmount(settings.minimumOrderAmount);
      if (settings.autoConfirmOrders !== undefined) setAutoConfirmOrders(settings.autoConfirmOrders);
      if (settings.showStockCount !== undefined) setShowStockCount(settings.showStockCount);
      if (settings.invoiceFooterNote) setInvoiceFooterNote(settings.invoiceFooterNote);
    }
  }, [settings]);

  const markDirty = () => {
    isDirtyRef.current = true;
  };

  const handleAddDistrictOverride = () => {
    if (!overrideDistrictName) return;
    markDirty();
    setDistrictFeeOverrides((prev) => ({
      ...prev,
      [overrideDistrictName]: Number(overrideFeeAmount) || 0,
    }));
    addToast(
      'info',
      `${overrideDistrictName} জেলার ডেলিভারি চার্জ ৳${overrideFeeAmount} যুক্ত হয়েছে। সেভ করতে "সেটিংস সেভ করুন" চাপুন।`
    );
  };

  const handleRemoveDistrictOverride = (distName: string) => {
    markDirty();
    setDistrictFeeOverrides((prev) => {
      const copy = { ...prev };
      delete copy[distName];
      return copy;
    });
    addToast('info', `${distName} জেলার কাস্টম চার্জ সরানো হয়েছে।`);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast('error', 'লোগো ফাইলের আকার ২ MB এর কম হতে হবে।');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        markDirty();
        setLogoUrl(reader.result as string);
        addToast('info', 'লোগো প্রিভিউ লোড হয়েছে। সংরক্ষণ করতে "সেটিংস সেভ করুন" চাপুন।');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        addToast('error', 'আইকন ফাইলের আকার ১ MB এর কম হতে হবে।');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        markDirty();
        setIconUrl(reader.result as string);
        addToast('info', 'আইকন প্রিভিউ লোড হয়েছে। সংরক্ষণ করতে "সেটিংস সেভ করুন" চাপুন।');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetToDefaultBrand = () => {
    if (confirm('আপনি কি ডিফল্ট অফিসিয়াল Sohoj Cart BD লোগো ও আইকনে ফিরে যেতে চান?')) {
      markDirty();
      setLogoUrl('');
      setIconUrl('');
      addToast('info', 'ডিফল্ট লোগো নির্বাচিত হয়েছে। সংরক্ষণ করতে "সেটিংস সেভ করুন" চাপুন।');
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    const cleanBkash = bkashNumber.trim();
    const cleanNagad = nagadNumber.trim();
    const cleanRocket = rocketNumber.trim();
    const cleanUpay = upayNumber.trim();

    const payload: StoreSettings = {
      ...settings,
      id: 'store',
      storeName: storeName.trim(),
      storeTagline: storeTagline.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      address: address.trim(),
      currencySymbol: currencySymbol.trim(),
      isStoreLive,
      maintenanceMessage: maintenanceMessage.trim(),
      logoUrl: logoUrl.trim(),
      iconUrl: iconUrl.trim(),

      // Payment Numbers & Methods & TrxID Toggles
      bkashNumber: cleanBkash,
      bkashType,
      isBkashEnabled,
      isBkashTrxIdRequired,
      nagadNumber: cleanNagad,
      nagadType,
      isNagadEnabled,
      isNagadTrxIdRequired,
      rocketNumber: cleanRocket,
      rocketType,
      isRocketEnabled,
      isRocketTrxIdRequired,
      upayNumber: cleanUpay,
      upayType,
      isUpayEnabled,
      isUpayTrxIdRequired,

      // Credit / Debit Card Configuration
      isCardPaymentEnabled,
      merchantCardNumber: merchantCardNumber.trim(),
      cardBankName: cardBankName.trim(),
      cardAccountName: cardAccountName.trim(),
      cardRoutingNo: cardRoutingNo.trim(),
      cardExpiry: cardExpiry.trim(),
      cardPaymentLink: cardPaymentLink.trim(),
      cardPaymentInstructions: cardPaymentInstructions.trim(),
      cardGatewayType,

      isCodEnabled,
      isAdvanceDeliveryFeeRequired,
      advanceFeeAmount: Number(advanceFeeAmount) || 0,
      codNoticeText: codNoticeText.trim(),

      customPaymentName: customPaymentName.trim(),
      customPaymentNumber: customPaymentNumber.trim(),
      customPaymentType,
      paymentInstructions: paymentInstructions.trim(),

      // Payment Architecture & Future Automated Merchant Gateway
      paymentMode: isMerchantGatewayEnabled ? 'automated_gateway' : 'manual',
      isMerchantGatewayEnabled,
      merchantGatewayProvider,
      bkashAppKey: bkashAppKey.trim(),
      bkashAppSecret: bkashAppSecret.trim(),
      bkashUsername: bkashUsername.trim(),
      bkashPassword: bkashPassword.trim(),
      bkashApiMode,
      sslcommerzStoreId: sslcommerzStoreId.trim(),
      sslcommerzStorePassword: sslcommerzStorePassword.trim(),
      sslcommerzApiMode,

      // Delivery Charges
      deliveryFeeInsideDhaka: Number(deliveryFeeInsideDhaka) || 0,
      deliveryFeeDhakaSuburbs: Number(deliveryFeeDhakaSuburbs) || 0,
      deliveryFeeChittagong: Number(deliveryFeeChittagong) || 0,
      deliveryFeeRajshahi: Number(deliveryFeeRajshahi) || 0,
      deliveryFeeSylhet: Number(deliveryFeeSylhet) || 0,
      deliveryFeeKhulna: Number(deliveryFeeKhulna) || 0,
      deliveryFeeBarisal: Number(deliveryFeeBarisal) || 0,
      deliveryFeeRangpur: Number(deliveryFeeRangpur) || 0,
      deliveryFeeMymensingh: Number(deliveryFeeMymensingh) || 0,
      deliveryFeeOutsideDhaka: Number(deliveryFeeOutsideDhaka) || 0,

      isFreeDeliveryEnabled,
      freeDeliveryThreshold: Number(freeDeliveryThreshold) || 0,
      estimatedDeliveryDhaka: estimatedDeliveryDhaka.trim(),
      districtFeeOverrides,

      // Courier API Integrations (Steadfast, Pathao, RedX)
      defaultCourier,
      isSteadfastActive,
      steadfastApiKey: steadfastApiKey.trim(),
      steadfastSecretKey: steadfastSecretKey.trim(),
      isPathaoActive,
      pathaoClientId: pathaoClientId.trim(),
      pathaoClientSecret: pathaoClientSecret.trim(),
      pathaoStoreId: pathaoStoreId.trim(),
      isRedxActive,
      redxApiToken: redxApiToken.trim(),

      // Notice Bar
      isNoticeBarActive,
      noticeBarText: noticeBarText.trim(),
      noticeBarLink: noticeBarLink.trim(),
      noticeBarBgColor: noticeBarBgColor.trim(),
      announcementTextColor: announcementTextColor.trim(),

      // WhatsApp & Support
      isWhatsAppChatActive,
      whatsAppNumber: whatsAppNumber.trim(),
      whatsAppDefaultMessage: whatsAppDefaultMessage.trim(),
      workingHours: workingHours.trim(),

      // Policies & Legal
      returnPolicyText: returnPolicyText.trim(),
      orderConfirmationNote: orderConfirmationNote.trim(),
      tradeLicenseNo: tradeLicenseNo.trim(),
      tinBinNo: tinBinNo.trim(),
      trustBadgeText: trustBadgeText.trim(),
      topBarCodText: topBarCodText.trim(),
      topBarReturnText: topBarReturnText.trim(),

      // Social Links
      facebookPageUrl: facebookPageUrl.trim(),
      instagramPageUrl: instagramPageUrl.trim(),
      youtubeChannelUrl: youtubeChannelUrl.trim(),
      tiktokUrl: tiktokUrl.trim(),

      // Checkout & Order Automation
      minimumOrderAmount: Number(minimumOrderAmount) || 0,
      autoConfirmOrders,
      showStockCount,
      invoiceFooterNote: invoiceFooterNote.trim(),

      updatedAt: new Date().toISOString(),
    };

    try {
      await updateSettingsAction(payload);
      isDirtyRef.current = false;
      addToast(
        'success',
        `সকল সেটিংস ও পেমেন্ট নাম্বার সফলভাবে সংরক্ষিত হয়েছে! (বিকাশ: ${cleanBkash}, নগদ: ${cleanNagad})`
      );
    } catch {
      addToast('error', 'স্টোর সেটিংস সেভ করতে সমস্যা হয়েছে।');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs: { id: SettingsTab; label: string; icon: any; badge?: string }[] = [
    { id: 'payments', label: 'মোবাইল ব্যাংকিং ও TrxID (bKash/Nagad)', icon: Smartphone, badge: 'সক্রিয়' },
    { id: 'ads_widgets', label: 'বিজ্ঞাপন ও ব্যানার কাস্টমাইজার (WordPress Style)', icon: Megaphone, badge: 'অ্যাড & ব্যানার' },
    { id: 'categories', label: 'অল ক্যাটাগরি কনফিগারেশন (All Categories)', icon: Layers, badge: 'ক্যাটাগরি' },
    { id: 'merchant_gateway', label: 'মার্চেন্ট গেটওয়ে (ভবিষ্যতের API)', icon: Key, badge: 'ট্রেড লাইসেন্স' },
    { id: 'card', label: 'ক্রেডিট ও ডেবিট কার্ড', icon: CreditCard, badge: 'কার্ড অপশন' },
    { id: 'delivery', label: 'ডেলিভারি চার্জ ও এরিয়া', icon: Truck },
    { id: 'branding', label: 'ব্র্যান্ডিং ও লোগো', icon: Store },
    { id: 'notice', label: 'টপ নোটিশ বার', icon: Bell },
    { id: 'whatsapp', label: 'হোয়াটসঅ্যাপ ও চ্যাট', icon: MessageCircle },
    { id: 'policies', label: 'পলিসি ও ট্রাস্ট', icon: ShieldCheck },
    { id: 'social', label: 'সোশ্যাল মিডিয়া', icon: Globe },
    { id: 'checkout', label: 'অর্ডার ও চেকআউট', icon: Sliders },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 text-slate-900">
      {/* Header with Save Button */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">স্টোর সেটিংস ও কনফিগারেশন</h1>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
              Live Sync
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            বিকাশ/নগদ/রকেট/উপায় পেমেন্ট নাম্বার, ডেলিভারি চার্জ, লোগো, নোটিশ বার ও সকল কাস্টমাইজেশন অপশন
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition shadow-md shadow-amber-400/25 disabled:opacity-50 cursor-pointer shrink-0 self-start sm:self-auto active:scale-98"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'সংরক্ষণ করা হচ্ছে...' : 'সেটিংস সেভ করুন (Save All)'}</span>
        </button>
      </div>

      {/* Modern Navigation Tabs with Interactive Left/Right Buttons and Long Horizontal Slider */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs space-y-3">
        {/* Top bar with active section title and quick dropdown jump */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-xs font-black text-slate-900">
              সেটিংস সেকশন ({tabs.findIndex((t) => t.id === activeTab) + 1}/{tabs.length}):
            </span>
            <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
              {tabs.find((t) => t.id === activeTab)?.label}
            </span>
          </div>

          {/* Quick Dropdown Selector for instant jump to any of the 10 tabs */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <label className="text-[11px] font-bold text-slate-500 whitespace-nowrap">ধাপ বাছাই করুন:</label>
            <select
              value={activeTab}
              onChange={(e) => handleSelectTab(e.target.value as SettingsTab)}
              className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 outline-hidden focus:border-amber-500 cursor-pointer shadow-2xs"
            >
              {tabs.map((tab, idx) => (
                <option key={tab.id} value={tab.id}>
                  {idx + 1}. {tab.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Row with Left & Right Arrow Buttons */}
        <div className="relative flex items-center gap-2">
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => scrollTabs('left')}
            disabled={!canScrollLeft}
            className={`p-2.5 rounded-xl border transition shadow-xs flex items-center justify-center shrink-0 cursor-pointer ${
              canScrollLeft
                ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 border-amber-500 active:scale-95'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
            }`}
            title="পূর্বের সেটিংস ধাপে যান (Scroll Left)"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Scrollable Tabs Track with smooth scrolling */}
          <div
            ref={tabsContainerRef}
            className="flex items-center gap-2 overflow-x-auto py-1 scroll-smooth flex-1 select-none"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#f59e0b #f1f5f9',
            }}
          >
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  type="button"
                  onClick={() => handleSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer shrink-0 border ${
                    isActive
                      ? 'bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-amber-400/50'
                      : 'bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-slate-950 border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-amber-400 text-slate-950' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => scrollTabs('right')}
            disabled={!canScrollRight}
            className={`p-2.5 rounded-xl border transition shadow-xs flex items-center justify-center shrink-0 cursor-pointer ${
              canScrollRight
                ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 border-amber-500 active:scale-95'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
            }`}
            title="পরবর্তী সেটিংস ধাপে যান (Scroll Right)"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Dedicated Long Drag / Slider Bar (সুন্দর লম্বা করে আইকন/স্লাইডার) */}
        <div className="pt-1 px-1 flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => scrollTabs('left')}
            className="text-[11px] font-black text-slate-700 hover:text-amber-800 flex items-center gap-1 shrink-0 cursor-pointer transition"
            title="বামে টানুন"
          >
            <ChevronLeft className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">বামে টানুন</span>
          </button>

          {/* Long Drag Track Slider */}
          <div className="flex-1 flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(scrollProgress)}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-ew-resize accent-amber-500 focus:outline-hidden shadow-inner"
              title="মাউস দিয়ে ডানে-বামে টেনে সকল ধাপ দেখুন"
            />
          </div>

          <button
            type="button"
            onClick={() => scrollTabs('right')}
            className="text-[11px] font-black text-slate-700 hover:text-amber-800 flex items-center gap-1 shrink-0 cursor-pointer transition"
            title="ডানে টানুন"
          >
            <span className="hidden sm:inline">ডানে টানুন</span>
            <ChevronRight className="w-4 h-4 text-amber-600" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: CUSTOMER PAYMENT NUMBERS (BKASH, NAGAD, ROCKET, UPAY, COD, CUSTOM) */}
        {/* ========================================================================= */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            {/* Real-world Easy Payment Assurance Banner */}
            <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-950 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-black text-xs sm:text-sm text-emerald-950">
                    বর্তমান সক্রিয় মোড: ম্যানুয়াল সেন্ড মানি ও ক্যাশ অন ডেলিভারি (ট্রেড লাইসেন্স বা টিন ছাড়াই সম্পূর্ণ প্রস্তুত)
                  </span>
                </div>
                <p className="text-xs text-emerald-800 font-medium">
                  গ্রাহক চেকআউটে আপনার ব্যক্তিগত/এজেন্ট বিকাশ বা নগদ নাম্বারে টাকা পাঠিয়ে <strong>TrxID</strong> দিবে। আপনার ফোনে সরাসরি এসএমএস ও আসল টাকা জমা হবে। কোনো ব্যাংক মার্চেন্ট অ্যাকাউন্ট বা ট্রেড লাইসেন্স ছাড়াই ব্যবসা শুরু করার সর্বোত্তম উপায়!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('merchant_gateway')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition cursor-pointer shadow-xs whitespace-nowrap self-start sm:self-center shrink-0"
              >
                ভবিষ্যতে মার্চেন্ট API চালু করবেন? ➔
              </button>
            </div>

            {/* Payment Numbers Grid */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-xs">
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-black text-slate-950 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>কাস্টমার পেমেন্ট নাম্বার কনফিগারেশন (Payment Numbers)</span>
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    গ্রাহক চেকআউটে বিকাশ, নগদ, রকেট বা উপায় নির্বাচন করলে এই নাম্বারগুলো কাস্টমারের স্ক্রিনে প্রদর্শিত হবে।
                  </p>
                </div>
                <div className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg font-bold shrink-0">
                  ⚡ সেভ করার সাথে সাথে চেকআউটে লাইভ হবে
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. bKash Card */}
                <div
                  className={`p-5 rounded-2xl border-2 transition space-y-3.5 ${
                    isBkashEnabled
                      ? 'bg-[#E2136E]/5 border-[#E2136E]/40'
                      : 'bg-slate-50 border-slate-200 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#E2136E] text-white text-[11px] font-black px-2.5 py-0.5 rounded shadow-2xs">
                        bKash
                      </span>
                      <span className="font-black text-xs text-[#E2136E]">বিকাশ পেমেন্ট</span>
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={isBkashEnabled}
                        onChange={(e) => {
                          markDirty();
                          setIsBkashEnabled(e.target.checked);
                        }}
                        className="rounded text-[#E2136E] focus:ring-[#E2136E] w-4 h-4"
                      />
                      <span>চালু</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        একাউন্টের ধরণ:
                      </label>
                      <select
                        value={bkashType}
                        onChange={(e) => {
                          markDirty();
                          setBkashType(e.target.value as any);
                        }}
                        className="w-full text-xs p-2 bg-white text-slate-900 border border-slate-300 rounded-xl outline-hidden font-bold"
                      >
                        <option value="Personal">Personal (সেন্ড মানি)</option>
                        <option value="Merchant">Merchant (পেমেন্ট)</option>
                        <option value="Agent">Agent (ক্যাশ আউট)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        আপনার বিকাশ নাম্বার:
                      </label>
                      <input
                        type="text"
                        required={isBkashEnabled}
                        placeholder="01712-345678"
                        value={bkashNumber}
                        onChange={(e) => {
                          markDirty();
                          setBkashNumber(e.target.value);
                        }}
                        className="w-full text-xs p-2 bg-white border border-[#E2136E]/40 text-slate-950 rounded-xl focus:border-[#E2136E] outline-hidden font-mono font-black"
                      />
                    </div>
                  </div>

                  {/* Active Preview Badge */}
                  <div className="bg-white p-2.5 rounded-xl border border-[#E2136E]/30 text-xs flex items-center justify-between">
                    <span className="text-[11px] text-slate-600">কাস্টমার যা দেখবে:</span>
                    <span className="font-mono font-black text-[#E2136E]">
                      বিকাশ ({bkashType}): <strong>{bkashNumber.trim() || 'নাম্বার লিখুন'}</strong>
                    </span>
                  </div>

                  {/* bKash TrxID Requirement Toggle */}
                  <div className="pt-2 border-t border-[#E2136E]/20 flex items-center justify-between gap-3 bg-white/80 p-2.5 rounded-xl">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-slate-900">
                          বিকাশ TrxID (ট্রানজেকশন আইডি):
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          isBkashTrxIdRequired ? 'bg-[#E2136E]/15 text-[#E2136E]' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {isBkashTrxIdRequired ? 'অন (আবশ্যক)' : 'অফ (ঐচ্ছিক / বন্ধ)'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600 block mt-0.5">
                        {isBkashTrxIdRequired
                          ? 'অন: চেকআউটে কাস্টমারকে TrxID দিতেই হবে।'
                          : 'অফ: কাস্টমার TrxID না দিয়েও সরাসরি অর্ডার সাবমিট করতে পারবে।'}
                      </span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={isBkashTrxIdRequired}
                        onChange={(e) => {
                          markDirty();
                          setIsBkashTrxIdRequired(e.target.checked);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E2136E]"></div>
                      <span className={`ml-2 text-xs font-black ${isBkashTrxIdRequired ? 'text-[#E2136E]' : 'text-slate-500'}`}>
                        {isBkashTrxIdRequired ? 'ON' : 'OFF'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* 2. Nagad Card */}
                <div
                  className={`p-5 rounded-2xl border-2 transition space-y-3.5 ${
                    isNagadEnabled
                      ? 'bg-orange-50/40 border-orange-300'
                      : 'bg-slate-50 border-slate-200 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#F7941D] text-white text-[11px] font-black px-2 py-0.5 rounded shadow-2xs">
                        Nagad
                      </span>
                      <span className="font-black text-xs text-orange-950">নগদ পেমেন্ট</span>
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={isNagadEnabled}
                        onChange={(e) => {
                          markDirty();
                          setIsNagadEnabled(e.target.checked);
                        }}
                        className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                      />
                      <span>চালু</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        একাউন্টের ধরণ:
                      </label>
                      <select
                        value={nagadType}
                        onChange={(e) => {
                          markDirty();
                          setNagadType(e.target.value as any);
                        }}
                        className="w-full text-xs p-2 bg-white text-slate-900 border border-slate-300 rounded-xl outline-hidden font-bold"
                      >
                        <option value="Personal">Personal (সেন্ড মানি)</option>
                        <option value="Merchant">Merchant (পেমেন্ট)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        আপনার নগদ নাম্বার:
                      </label>
                      <input
                        type="text"
                        required={isNagadEnabled}
                        placeholder="01812-345678"
                        value={nagadNumber}
                        onChange={(e) => {
                          markDirty();
                          setNagadNumber(e.target.value);
                        }}
                        className="w-full text-xs p-2 bg-white border border-orange-300 text-slate-950 rounded-xl focus:border-orange-600 outline-hidden font-mono font-black"
                      />
                    </div>
                  </div>

                  {/* Active Preview Badge */}
                  <div className="bg-white p-2.5 rounded-xl border border-orange-200 text-xs flex items-center justify-between">
                    <span className="text-[11px] text-slate-600">কাস্টমার যা দেখবে:</span>
                    <span className="font-mono font-black text-orange-950">
                      নগদ ({nagadType}): <strong>{nagadNumber.trim() || 'নাম্বার লিখুন'}</strong>
                    </span>
                  </div>

                  {/* Nagad TrxID Requirement Toggle */}
                  <div className="pt-2 border-t border-orange-200 flex items-center justify-between gap-3 bg-white/80 p-2.5 rounded-xl">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-slate-900">
                          নগদ TrxID (ট্রানজেকশন আইডি):
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          isNagadTrxIdRequired ? 'bg-orange-100 text-orange-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {isNagadTrxIdRequired ? 'অন (আবশ্যক)' : 'অফ (ঐচ্ছিক / বন্ধ)'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600 block mt-0.5">
                        {isNagadTrxIdRequired
                          ? 'অন: চেকআউটে কাস্টমারকে TrxID দিতে হবে।'
                          : 'অফ: কাস্টমার TrxID না দিয়েও সরাসরি অর্ডার সাবমিট করতে পারবে।'}
                      </span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={isNagadTrxIdRequired}
                        onChange={(e) => {
                          markDirty();
                          setIsNagadTrxIdRequired(e.target.checked);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F7941D]"></div>
                      <span className={`ml-2 text-xs font-black ${isNagadTrxIdRequired ? 'text-[#F7941D]' : 'text-slate-500'}`}>
                        {isNagadTrxIdRequired ? 'ON' : 'OFF'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* 3. Rocket Card */}
                <div
                  className={`p-5 rounded-2xl border-2 transition space-y-3.5 ${
                    isRocketEnabled
                      ? 'bg-purple-50/40 border-purple-300'
                      : 'bg-slate-50 border-slate-200 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#8C3494] text-white text-[11px] font-black px-2 py-0.5 rounded shadow-2xs">
                        Rocket
                      </span>
                      <span className="font-black text-xs text-purple-950">রকেট পেমেন্ট</span>
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={isRocketEnabled}
                        onChange={(e) => {
                          markDirty();
                          setIsRocketEnabled(e.target.checked);
                        }}
                        className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                      />
                      <span>চালু</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        একাউন্টের ধরণ:
                      </label>
                      <select
                        value={rocketType}
                        onChange={(e) => {
                          markDirty();
                          setRocketType(e.target.value as any);
                        }}
                        className="w-full text-xs p-2 bg-white text-slate-900 border border-slate-300 rounded-xl outline-hidden font-bold"
                      >
                        <option value="Personal">Personal (সেন্ড মানি)</option>
                        <option value="Merchant">Merchant (পেমেন্ট)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        আপনার রকেট নাম্বার:
                      </label>
                      <input
                        type="text"
                        required={isRocketEnabled}
                        placeholder="01912-345678"
                        value={rocketNumber}
                        onChange={(e) => {
                          markDirty();
                          setRocketNumber(e.target.value);
                        }}
                        className="w-full text-xs p-2 bg-white border border-purple-300 text-slate-950 rounded-xl focus:border-purple-600 outline-hidden font-mono font-black"
                      />
                    </div>
                  </div>

                  {/* Active Preview Badge */}
                  <div className="bg-white p-2.5 rounded-xl border border-purple-200 text-xs flex items-center justify-between">
                    <span className="text-[11px] text-slate-600">কাস্টমার যা দেখবে:</span>
                    <span className="font-mono font-black text-purple-950">
                      রকেট ({rocketType}): <strong>{rocketNumber.trim() || 'নাম্বার লিখুন'}</strong>
                    </span>
                  </div>

                  {/* Rocket TrxID Requirement Toggle */}
                  <div className="pt-2 border-t border-purple-200 flex items-center justify-between gap-3 bg-white/80 p-2.5 rounded-xl">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-slate-900">
                          রকেট TrxID (ট্রানজেকশন আইডি):
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          isRocketTrxIdRequired ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {isRocketTrxIdRequired ? 'অন (আবশ্যক)' : 'অফ (ঐচ্ছিক / বন্ধ)'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600 block mt-0.5">
                        {isRocketTrxIdRequired
                          ? 'অন: চেকআউটে কাস্টমারকে TrxID দিতে হবে।'
                          : 'অফ: কাস্টমার TrxID না দিয়েও সরাসরি অর্ডার সাবমিট করতে পারবে।'}
                      </span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={isRocketTrxIdRequired}
                        onChange={(e) => {
                          markDirty();
                          setIsRocketTrxIdRequired(e.target.checked);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8C3494]"></div>
                      <span className={`ml-2 text-xs font-black ${isRocketTrxIdRequired ? 'text-[#8C3494]' : 'text-slate-500'}`}>
                        {isRocketTrxIdRequired ? 'ON' : 'OFF'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* 4. Upay Card */}
                <div
                  className={`p-5 rounded-2xl border-2 transition space-y-3.5 ${
                    isUpayEnabled
                      ? 'bg-[#004F9E]/5 border-[#004F9E]/40'
                      : 'bg-slate-50 border-slate-200 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#004F9E] text-[#FFC20E] text-[11px] font-black px-2.5 py-0.5 rounded shadow-2xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFC20E]"></span>
                        Upay
                      </span>
                      <span className="font-black text-xs text-[#004F9E]">উপায় পেমেন্ট</span>
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={isUpayEnabled}
                        onChange={(e) => {
                          markDirty();
                          setIsUpayEnabled(e.target.checked);
                        }}
                        className="rounded text-[#004F9E] focus:ring-[#004F9E] w-4 h-4"
                      />
                      <span>চালু</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        একাউন্টের ধরণ:
                      </label>
                      <select
                        value={upayType}
                        onChange={(e) => {
                          markDirty();
                          setUpayType(e.target.value as any);
                        }}
                        className="w-full text-xs p-2 bg-white text-slate-900 border border-slate-300 rounded-xl outline-hidden font-bold"
                      >
                        <option value="Personal">Personal (সেন্ড মানি)</option>
                        <option value="Merchant">Merchant (পেমেন্ট)</option>
                        <option value="Agent">Agent (ক্যাশ আউট)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        আপনার উপায় নাম্বার:
                      </label>
                      <input
                        type="text"
                        required={isUpayEnabled}
                        placeholder="01712-345678"
                        value={upayNumber}
                        onChange={(e) => {
                          markDirty();
                          setUpayNumber(e.target.value);
                        }}
                        className="w-full text-xs p-2 bg-white border border-[#004F9E]/40 text-slate-950 rounded-xl focus:border-[#004F9E] outline-hidden font-mono font-black"
                      />
                    </div>
                  </div>

                  {/* Active Preview Badge */}
                  <div className="bg-white p-2.5 rounded-xl border border-[#004F9E]/30 text-xs flex items-center justify-between">
                    <span className="text-[11px] text-slate-600">কাস্টমার যা দেখবে:</span>
                    <span className="font-mono font-black text-[#004F9E]">
                      উপায় ({upayType}): <strong>{upayNumber.trim() || 'নাম্বার লিখুন'}</strong>
                    </span>
                  </div>

                  {/* Upay TrxID Requirement Toggle */}
                  <div className="pt-2 border-t border-[#004F9E]/20 flex items-center justify-between gap-3 bg-white/80 p-2.5 rounded-xl">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-slate-900">
                          উপায় TrxID (ট্রানজেকশন আইডি):
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          isUpayTrxIdRequired ? 'bg-blue-100 text-blue-900' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {isUpayTrxIdRequired ? 'অন (আবশ্যক)' : 'অফ (ঐচ্ছিক / বন্ধ)'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600 block mt-0.5">
                        {isUpayTrxIdRequired
                          ? 'অন: চেকআউটে কাস্টমারকে TrxID দিতে হবে।'
                          : 'অফ: কাস্টমার TrxID না দিয়েও সরাসরি অর্ডার সাবমিট করতে পারবে।'}
                      </span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={isUpayTrxIdRequired}
                        onChange={(e) => {
                          markDirty();
                          setIsUpayTrxIdRequired(e.target.checked);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004F9E]"></div>
                      <span className={`ml-2 text-xs font-black ${isUpayTrxIdRequired ? 'text-[#004F9E]' : 'text-slate-500'}`}>
                        {isUpayTrxIdRequired ? 'ON' : 'OFF'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 5. Credit & Debit Card Configuration (ক্রেডিট / ডেবিট কার্ড সেটিংস) */}
              <div
                className={`p-5 rounded-3xl border-2 transition space-y-4 shadow-sm ${
                  isCardPaymentEnabled
                    ? 'bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white border-blue-400/40'
                    : 'bg-slate-50 border-slate-200 text-slate-800 opacity-70'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm">
                          ক্রেডিট / ডেবিট কার্ড পেমেন্ট সেটিংস (Credit & Debit Card)
                        </span>
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 font-extrabold px-2 py-0.5 rounded-full border border-blue-400/30">
                          Visa • Mastercard • AMEX
                        </span>
                      </div>
                      <p className={`text-xs mt-0.5 ${isCardPaymentEnabled ? 'text-slate-300' : 'text-slate-500'}`}>
                        আপনার মার্চেন্ট কার্ড বা ব্যাংক একাউন্ট নম্বর দিন, যাতে গ্রাহক কার্ডের মাধ্যমে সরাসরি পেমেন্ট করতে পারে।
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold shrink-0 self-start sm:self-auto bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                    <input
                      type="checkbox"
                      checked={isCardPaymentEnabled}
                      onChange={(e) => {
                        markDirty();
                        setIsCardPaymentEnabled(e.target.checked);
                      }}
                      className="rounded text-blue-500 w-4 h-4 focus:ring-blue-400"
                    />
                    <span className={isCardPaymentEnabled ? 'text-white' : 'text-slate-700'}>
                      কার্ড পেমেন্ট চালু
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column: Form Inputs */}
                  <div className="lg:col-span-7 space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isCardPaymentEnabled ? 'text-slate-200' : 'text-slate-700'}`}>
                          মার্চেন্ট কার্ড / একাউন্ট নম্বর:
                        </label>
                        <input
                          type="text"
                          required={isCardPaymentEnabled}
                          placeholder="4532 8910 2345 6789"
                          value={merchantCardNumber}
                          onChange={(e) => {
                            markDirty();
                            setMerchantCardNumber(e.target.value);
                          }}
                          className="w-full text-xs p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl outline-hidden focus:border-blue-500 font-mono font-black"
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isCardPaymentEnabled ? 'text-slate-200' : 'text-slate-700'}`}>
                          ব্যাংকের নাম (Bank Name):
                        </label>
                        <input
                          type="text"
                          required={isCardPaymentEnabled}
                          placeholder="e.g. City Bank / BRAC Bank / EBL"
                          value={cardBankName}
                          onChange={(e) => {
                            markDirty();
                            setCardBankName(e.target.value);
                          }}
                          className="w-full text-xs p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl outline-hidden focus:border-blue-500 font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isCardPaymentEnabled ? 'text-slate-200' : 'text-slate-700'}`}>
                          কার্ডধারী / মার্চেন্টের নাম (Cardholder / Company):
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Sohoj Cart BD Enterprise"
                          value={cardAccountName}
                          onChange={(e) => {
                            markDirty();
                            setCardAccountName(e.target.value);
                          }}
                          className="w-full text-xs p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl outline-hidden focus:border-blue-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isCardPaymentEnabled ? 'text-slate-200' : 'text-slate-700'}`}>
                          পেমেন্ট মোড / গেটওয়ে টাইপ:
                        </label>
                        <select
                          value={cardGatewayType}
                          onChange={(e) => {
                            markDirty();
                            setCardGatewayType(e.target.value as any);
                          }}
                          className="w-full text-xs p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl outline-hidden font-bold"
                        >
                          <option value="direct_card">অনলাইন ৩ডি-সিকিউর কার্ড গেটওয়ে (Direct 3D-Secure Card)</option>
                          <option value="bank_transfer">ব্যাংক / কার্ড ট্রান্সফার (Bank / Card Transfer)</option>
                          <option value="pos_terminal">কার্ড অন ডেলিভারি (POS Machine on Delivery)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isCardPaymentEnabled ? 'text-slate-200' : 'text-slate-700'}`}>
                          রাউটিং নম্বর / ব্রাঞ্চ কোড (ঐচ্ছিক):
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 225272635 (Banani Branch)"
                          value={cardRoutingNo}
                          onChange={(e) => {
                            markDirty();
                            setCardRoutingNo(e.target.value);
                          }}
                          className="w-full text-xs p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl outline-hidden font-mono"
                        />
                      </div>

                      <div className="sm:col-span-1 flex items-end">
                        <div className="text-[11px] bg-blue-500/10 border border-blue-400/20 p-2.5 rounded-xl text-blue-200 w-full">
                          🔒 কার্ড লেনদেন SSL 256-bit এনক্রিপশনে সুরক্ষিত থাকবে।
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isCardPaymentEnabled ? 'text-slate-200' : 'text-slate-700'}`}>
                        কাস্টমারদের জন্য কার্ড পেমেন্ট নির্দেশিকা (Card Payment Instructions):
                      </label>
                      <textarea
                        rows={2}
                        value={cardPaymentInstructions}
                        onChange={(e) => {
                          markDirty();
                          setCardPaymentInstructions(e.target.value);
                        }}
                        className="w-full text-xs p-2 bg-white text-slate-900 border border-slate-300 rounded-xl outline-hidden focus:border-blue-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Right Column: Realistic Credit Card Preview */}
                  <div className="lg:col-span-5 flex flex-col justify-center">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${isCardPaymentEnabled ? 'text-slate-300' : 'text-slate-500'}`}>
                      কার্ডের লাইভ প্রিভিউ (কাস্টমার যা দেখবে):
                    </span>

                    <div className="relative rounded-2xl p-5 bg-gradient-to-r from-blue-700 via-indigo-800 to-purple-900 text-white shadow-xl border border-white/20 overflow-hidden space-y-4">
                      {/* Decorative Circles */}
                      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
                      <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />

                      <div className="flex items-center justify-between relative z-10">
                        <span className="text-xs font-extrabold tracking-wider truncate max-w-[180px]">
                          {cardBankName || 'City Bank'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-rose-500 inline-block opacity-90 shadow-xs" />
                          <span className="w-5 h-5 rounded-full bg-amber-400 inline-block -ml-3 opacity-90 shadow-xs" />
                        </div>
                      </div>

                      {/* Chip & Wireless Icon */}
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="w-9 h-7 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 border border-amber-500 shadow-xs flex items-center justify-center">
                          <div className="w-6 h-4 border border-amber-700/40 rounded-xs" />
                        </div>
                        <span className="text-xs font-mono tracking-widest text-slate-300">
                          ))))
                        </span>
                      </div>

                      {/* Card Number */}
                      <div className="relative z-10 pt-1">
                        <span className="font-mono text-base sm:text-lg font-black tracking-widest block text-white drop-shadow-sm">
                          {merchantCardNumber || '4532 8910 2345 6789'}
                        </span>
                      </div>

                      {/* Cardholder & Expiry */}
                      <div className="flex items-center justify-between text-[11px] relative z-10 pt-1 border-t border-white/15">
                        <div>
                          <span className="text-[9px] uppercase text-slate-300 block font-semibold">
                            CARDHOLDER
                          </span>
                          <span className="font-black tracking-wider uppercase truncate block max-w-[160px]">
                            {cardAccountName || 'SOHOJ CART BD'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] uppercase text-slate-300 block font-semibold">
                            EXPIRES
                          </span>
                          <span className="font-mono font-bold">12/29</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cash On Delivery & Advance Fee Policy */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-950 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>ক্যাশ অন ডেলিভারি (COD) ও অগ্রিম চার্জ পলিসি</span>
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={isCodEnabled}
                      onChange={(e) => {
                        markDirty();
                        setIsCodEnabled(e.target.checked);
                      }}
                      className="rounded text-amber-500 w-4 h-4"
                    />
                    <span>ক্যাশ অন ডেলিভারি অপশন চালু রাখুন</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 mb-2">
                      <input
                        type="checkbox"
                        checked={isAdvanceDeliveryFeeRequired}
                        onChange={(e) => {
                          markDirty();
                          setIsAdvanceDeliveryFeeRequired(e.target.checked);
                        }}
                        className="rounded text-amber-500 w-4 h-4"
                      />
                      <span>অর্ডারে অগ্রিম ডেলিভারি চার্জ বাধ্যতামূলক করুন</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      জাল বা ফেক অর্ডার ঠেকাতে গ্রাহককে অর্ডার কনফার্মের আগে ডেলিভারি চার্জ অগ্রিম দিতে হবে।
                    </p>
                  </div>

                  {isAdvanceDeliveryFeeRequired && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        অগ্রিম ফি এর পরিমাণ (টাকা):
                      </label>
                      <input
                        type="number"
                        value={advanceFeeAmount}
                        onChange={(e) => {
                          markDirty();
                          setAdvanceFeeAmount(Number(e.target.value) || 0);
                        }}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-black text-sm"
                      />
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ক্যাশ অন ডেলিভারি নোটিশ / বার্তা:
                    </label>
                    <input
                      type="text"
                      value={codNoticeText}
                      onChange={(e) => {
                        markDirty();
                        setCodNoticeText(e.target.value);
                      }}
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Payment Method & Instructions */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <h3 className="text-xs font-black text-slate-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>অতিরিক্ত কাস্টম পেমেন্ট অপশন (ঐচ্ছিক - ব্যাংক / সেলফিন / ইত্যাদি)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      পদ্ধতির নাম (যেমন: Cellfin, Islami Bank, City Bank):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cellfin / Bank Transfer"
                      value={customPaymentName}
                      onChange={(e) => {
                        markDirty();
                        setCustomPaymentName(e.target.value);
                      }}
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 text-slate-900 rounded-xl outline-hidden font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      একাউন্ট / ফোন নাম্বার:
                    </label>
                    <input
                      type="text"
                      placeholder="01XXXXXXXXX বা একাউন্ট নাম্বার"
                      value={customPaymentNumber}
                      onChange={(e) => {
                        markDirty();
                        setCustomPaymentNumber(e.target.value);
                      }}
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 text-slate-900 rounded-xl outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      একাউন্ট ধরণ:
                    </label>
                    <select
                      value={customPaymentType}
                      onChange={(e) => {
                        markDirty();
                        setCustomPaymentType(e.target.value);
                      }}
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 text-slate-900 rounded-xl outline-hidden font-bold"
                    >
                      <option value="Personal">Personal (ব্যক্তিগত)</option>
                      <option value="Merchant">Merchant (মার্চেন্ট)</option>
                      <option value="Agent">Agent (এজেন্ট)</option>
                      <option value="Bank">Bank Account (ব্যাংক হিসাব)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পেমেন্ট করার সাধারণ নির্দেশাবলী (কাস্টমারকে প্রদর্শিত বার্তা):
                  </label>
                  <textarea
                    rows={2}
                    value={paymentInstructions}
                    onChange={(e) => {
                      markDirty();
                      setPaymentInstructions(e.target.value);
                    }}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: FUTURE AUTOMATED MERCHANT GATEWAY (BKASH CHECKOUT PGW & TRADE LICENSE) */}
        {/* ========================================================================= */}
        {activeTab === 'merchant_gateway' && (
          <div className="space-y-6">
            {/* Informative Guidance & Roadmap Card */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white p-6 sm:p-7 rounded-3xl border border-indigo-400/30 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center shrink-0 shadow-xs">
                    <Key className="w-6 h-6 text-indigo-300" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white flex items-center gap-2">
                      <span>মার্চেন্ট পেমেন্ট গেটওয়ে (অটোমেটেড OTP ও গোপন PIN সিস্টেম)</span>
                    </h2>
                    <p className="text-xs text-indigo-200/90 mt-0.5">
                      ট্রেড লাইসেন্স ও টিন সার্টিফিকেট দিয়ে বিকাশ / SSLCommerz মার্চেন্ট একাউন্ট পাওয়ার পর এটি চালু করবেন।
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-black border ${
                      isMerchantGatewayEnabled
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                    }`}
                  >
                    {isMerchantGatewayEnabled ? '✅ অটো গেটওয়ে সক্রিয়' : '⏸️ নিষ্ক্রিয় (ম্যানুয়াল মোড চালু)'}
                  </span>
                </div>
              </div>

              {/* Explanatory Roadmap */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1 text-xs">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-indigo-300 font-extrabold">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/30 flex items-center justify-center text-[11px] font-bold">১</span>
                    <span>এখন কেন দরকার নেই?</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    স্বয়ংক্রিয়ভাবে কাস্টমারের বিকাশ থেকে পিন দিয়ে টাকা কাটতে বিকাশ কর্তৃপক্ষের অফিসিয়াল মার্চেন্ট চুক্তি দরকার হয়। তাই নতুন বিজনেসে পার্সোনাল বিকাশ সেন্ড মানি ও ক্যাশ অন ডেলিভারিই সবচেয়ে সহজ, নিরাপদ ও দ্রুততম উপায়!
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-indigo-300 font-extrabold">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/30 flex items-center justify-center text-[11px] font-bold">২</span>
                    <span>মার্চেন্ট খুলতে কী লাগবে?</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    ভবিষ্যতে যখন আপনার ব্যবসার <strong>ট্রেড লাইসেন্স (Trade License)</strong>, এনবিআর <strong>ই-টিন (e-TIN)</strong> এবং একটি ব্যাংক কারেন্ট অ্যাকাউন্ট থাকবে, তখন বিকাশ বিজনেসে বা SSLCommerz-এ ফ্রি মার্চেন্ট আবেদন করবেন।
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-indigo-300 font-extrabold">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/30 flex items-center justify-center text-[11px] font-bold">৩</span>
                    <span>এপিআই কি পেলে কী করবেন?</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    বিকাশ আপনাকে যে App Key ও Secret দিবে তা নিচের ফর্মে বসিয়ে এই সুইচে ক্লিক করে সেভ করবেন। সাথে সাথে আপনার ওয়েবসাইটে অটোমেটেড OTP ও PIN গেটওয়ে লাইভ হয়ে যাবে!
                  </p>
                </div>
              </div>
            </div>

            {/* Master Toggle Card */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 space-y-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    <span>অটোমেটেড মার্চেন্ট গেটওয়ে সক্রিয়করণ সুইচ</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    ট্রেড লাইসেন্স ও এপিআই থাকলে এটি অন করুন। বন্ধ থাকলে কাস্টমার সহজ সেন্ড মানি ও TrxID ইনপুট দেখতে পাবে।
                  </p>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-2xl border border-slate-200 transition">
                  <input
                    type="checkbox"
                    checked={isMerchantGatewayEnabled}
                    onChange={(e) => {
                      markDirty();
                      setIsMerchantGatewayEnabled(e.target.checked);
                      setPaymentMode(e.target.checked ? 'automated_gateway' : 'manual');
                    }}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-black text-slate-900">
                    {isMerchantGatewayEnabled ? 'গেটোয়ে চালু (Active)' : 'গেটোয়ে বন্ধ (Inactive)'}
                  </span>
                </label>
              </div>

              {/* Provider Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    পেমেন্ট গেটওয়ে প্রোভাইডার নির্বাচন করুন (Gateway Provider):
                  </label>
                  <select
                    value={merchantGatewayProvider}
                    onChange={(e) => {
                      markDirty();
                      setMerchantGatewayProvider(e.target.value as any);
                    }}
                    className="w-full sm:w-80 text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-hidden focus:border-indigo-500"
                  >
                    <option value="bkash">bKash Checkout PGW (বিকাশ ডাইরেক্ট মার্চেন্ট এপিআই)</option>
                    <option value="sslcommerz">SSLCommerz (কার্ড, বিকাশ, নগদ, রকেট সব একসাথে)</option>
                    <option value="nagad">Nagad Direct PGW (নগদ মার্চেন্ট এপিআই)</option>
                    <option value="aamarpay">Aamarpay Payment Gateway (অমরপে)</option>
                  </select>
                </div>

                {/* bKash Direct Merchant PGW Form */}
                {merchantGatewayProvider === 'bkash' && (
                  <div className="p-5 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-rose-200 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#E2136E] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-2xs">
                          bKash PGW API
                        </span>
                        <span className="font-black text-xs text-rose-950">বিকাশ মার্চেন্ট এপিআই ক্রেডেনশিয়ালস</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-700">এনভায়রনমেন্ট:</span>
                        <select
                          value={bkashApiMode}
                          onChange={(e) => {
                            markDirty();
                            setBkashApiMode(e.target.value as any);
                          }}
                          className="text-[11px] p-1 bg-white border border-rose-300 rounded-lg font-bold text-slate-900"
                        >
                          <option value="sandbox">Sandbox (টেস্টিং মোড)</option>
                          <option value="live">Live (প্রোডাকশন - আসল লেনদেন)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          বিকাশ মার্চেন্ট ইউজারনেম (Username):
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. sandboxTestUser"
                          value={bkashUsername}
                          onChange={(e) => {
                            markDirty();
                            setBkashUsername(e.target.value);
                          }}
                          className="w-full text-xs p-2.5 bg-white border border-rose-300 rounded-xl font-mono text-slate-950 outline-hidden focus:border-rose-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          বিকাশ মার্চেন্ট পাসওয়ার্ড (Password):
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••••••"
                          value={bkashPassword}
                          onChange={(e) => {
                            markDirty();
                            setBkashPassword(e.target.value);
                          }}
                          className="w-full text-xs p-2.5 bg-white border border-rose-300 rounded-xl font-mono text-slate-950 outline-hidden focus:border-rose-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          বিকাশ অ্যাপ কি (App Key):
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 4f644266-79cf-4fd3-a6fe-4d7a7ff2129a"
                          value={bkashAppKey}
                          onChange={(e) => {
                            markDirty();
                            setBkashAppKey(e.target.value);
                          }}
                          className="w-full text-xs p-2.5 bg-white border border-rose-300 rounded-xl font-mono text-slate-950 outline-hidden focus:border-rose-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          বিকাশ অ্যাপ সিক্রেট (App Secret):
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••••••••••••••••••••••••••"
                          value={bkashAppSecret}
                          onChange={(e) => {
                            markDirty();
                            setBkashAppSecret(e.target.value);
                          }}
                          className="w-full text-xs p-2.5 bg-white border border-rose-300 rounded-xl font-mono text-slate-950 outline-hidden focus:border-rose-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SSLCommerz PGW Form */}
                {merchantGatewayProvider === 'sslcommerz' && (
                  <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-blue-200 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-2xs">
                          SSLCommerz
                        </span>
                        <span className="font-black text-xs text-blue-950">SSLCommerz স্টোর ক্রেডেনশিয়ালস</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-700">এনভায়রনমেন্ট:</span>
                        <select
                          value={sslcommerzApiMode}
                          onChange={(e) => {
                            markDirty();
                            setSslcommerzApiMode(e.target.value as any);
                          }}
                          className="text-[11px] p-1 bg-white border border-blue-300 rounded-lg font-bold text-slate-900"
                        >
                          <option value="sandbox">Sandbox (টেস্টিং মোড)</option>
                          <option value="live">Live (প্রোডাকশন)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          স্টোর আইডি (Store ID):
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. sohojcartbd_live"
                          value={sslcommerzStoreId}
                          onChange={(e) => {
                            markDirty();
                            setSslcommerzStoreId(e.target.value);
                          }}
                          className="w-full text-xs p-2.5 bg-white border border-blue-300 rounded-xl font-mono text-slate-950 outline-hidden focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          স্টোর পাসওয়ার্ড / সিক্রেট কি (Store Password):
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••••••••••"
                          value={sslcommerzStorePassword}
                          onChange={(e) => {
                            markDirty();
                            setSslcommerzStorePassword(e.target.value);
                          }}
                          className="w-full text-xs p-2.5 bg-white border border-blue-300 rounded-xl font-mono text-slate-950 outline-hidden focus:border-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Nagad or Aamarpay generic info */}
                {(merchantGatewayProvider === 'nagad' || merchantGatewayProvider === 'aamarpay') && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 space-y-2">
                    <p className="font-bold text-slate-900">
                      ℹ️ {merchantGatewayProvider === 'nagad' ? 'নগদ ডাইরেক্ট মার্চেন্ট গেটওয়ে' : 'অমরপে পেমেন্ট গেটওয়ে'}:
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      এই গেটওয়ের মার্চেন্ট চুক্তি সম্পন্ন হলে প্রাপ্ত Merchant ID ও Secret Key বসিয়ে সরাসরি পেমেন্ট নিতে পারবেন।
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Trade License & TIN Quick Registry Box */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-black text-slate-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>আপনার ব্যবসার লাইসেন্স ও ট্যাক্স রেকর্ড (Trade License & e-TIN)</span>
              </h3>
              <p className="text-xs text-slate-600">
                ভবিষ্যতে যখন পৌরসভা বা সিটি কর্পোরেশন থেকে ট্রেড লাইসেন্স এবং এনবিআর থেকে ই-টিন গ্রহণ করবেন, তখন এখানে নম্বরগুলো লিখে রাখবেন। এগুলো আপনার ইনভয়েস ও মার্চেন্ট অ্যাপ্লিকেশনে ব্যবহৃত হবে।
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ট্রেড লাইসেন্স নম্বর (Trade License No):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TRAD/DSCC/012948/2026"
                    value={tradeLicenseNo}
                    onChange={(e) => {
                      markDirty();
                      setTradeLicenseNo(e.target.value);
                    }}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ই-টিন বা বিন নম্বর (e-TIN / BIN No):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TIN-492019482910"
                    value={tinBinNo}
                    onChange={(e) => {
                      markDirty();
                      setTinBinNo(e.target.value);
                    }}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-slate-900 font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: CREDIT & DEBIT CARD CONFIGURATION (ভিসা, মাস্টারকার্ড, এমেক্স) */}
        {/* ========================================================================= */}
        {activeTab === 'card' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6 shadow-xs">
            {/* Header & Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0 shadow-xs">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-black text-slate-950">
                      ক্রেডিট ও ডেবিট কার্ড পেমেন্ট সেটিংস (Credit & Debit Card Setup)
                    </h2>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200">
                      Visa • Mastercard • AMEX
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    গ্রাহকদের কাছ থেকে ক্রেডিট ও ডেবিট কার্ডে সরাসরি পেমেন্ট গ্রহণ করতে আপনার কার্ড বা ব্যাংক তথ্য ও পেমেন্ট লিংক দিন।
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold shrink-0 self-start sm:self-auto bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl border border-slate-300 transition">
                <input
                  type="checkbox"
                  checked={isCardPaymentEnabled}
                  onChange={(e) => {
                    markDirty();
                    setIsCardPaymentEnabled(e.target.checked);
                  }}
                  className="rounded text-blue-600 w-4 h-4 focus:ring-blue-500"
                />
                <span className={isCardPaymentEnabled ? 'text-blue-900 font-black' : 'text-slate-600'}>
                  {isCardPaymentEnabled ? '✓ কার্ড পেমেন্ট চালু আছে' : 'কার্ড পেমেন্ট বন্ধ'}
                </span>
              </label>
            </div>

            {/* Quick Test Presets */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-blue-950 font-bold">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>টেস্ট কার্ড ও ব্যাংক কুইক সেটআপ:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    markDirty();
                    setMerchantCardNumber('4532 8910 2345 6789');
                    setCardBankName('City Bank (Visa & Mastercard)');
                    setCardAccountName('Sohoj Cart BD Enterprise');
                    setCardExpiry('12/28');
                    setCardRoutingNo('225272635');
                    addToast('info', 'সিটি ব্যাংক টেস্ট কার্ড ডাটা লোড হয়েছে।');
                  }}
                  className="text-[11px] bg-white text-blue-700 hover:bg-blue-100 font-bold px-2.5 py-1 rounded-lg border border-blue-200 transition cursor-pointer shadow-2xs"
                >
                  City Bank Visa
                </button>
                <button
                  type="button"
                  onClick={() => {
                    markDirty();
                    setMerchantCardNumber('5200 4812 7654 3210');
                    setCardBankName('BRAC Bank Limited');
                    setCardAccountName('Sohoj Cart BD Enterprise');
                    setCardExpiry('08/29');
                    setCardRoutingNo('060271542');
                    addToast('info', 'ব্র্যাক ব্যাংক টেস্ট কার্ড ডাটা লোড হয়েছে।');
                  }}
                  className="text-[11px] bg-white text-blue-700 hover:bg-blue-100 font-bold px-2.5 py-1 rounded-lg border border-blue-200 transition cursor-pointer shadow-2xs"
                >
                  BRAC Bank Mastercard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    markDirty();
                    setMerchantCardNumber('3782 8224 5678 9102');
                    setCardBankName('Eastern Bank PLC (EBL)');
                    setCardAccountName('Sohoj Cart BD Enterprise');
                    setCardExpiry('10/30');
                    setCardRoutingNo('095271890');
                    addToast('info', 'ইস্টার্ন ব্যাংক টেস্ট কার্ড ডাটা লোড হয়েছে।');
                  }}
                  className="text-[11px] bg-white text-blue-700 hover:bg-blue-100 font-bold px-2.5 py-1 rounded-lg border border-blue-200 transition cursor-pointer shadow-2xs"
                >
                  EBL Platinum
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Card Number */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black text-slate-900 mb-1.5 flex items-center justify-between">
                      <span>মার্চেন্ট ক্রেডিট / ডেবিট কার্ড নম্বর (Card Number):</span>
                      <span className="text-[11px] font-mono text-blue-700 font-bold">১৬ ডিজিট কার্ড নম্বর</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required={isCardPaymentEnabled}
                        placeholder="4532 8910 2345 6789"
                        value={merchantCardNumber}
                        onChange={(e) => {
                          markDirty();
                          setMerchantCardNumber(e.target.value);
                        }}
                        className="w-full text-sm p-3 bg-slate-50 text-slate-950 border border-slate-300 rounded-xl outline-hidden focus:border-blue-600 focus:bg-white font-mono font-black tracking-widest pl-10"
                      />
                      <CreditCard className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      গ্রাহকরা চেকআউটে এই কার্ড নম্বর দেখতে পাবেন এবং সরাসরি কার্ড বা ব্যাংক ট্রান্সফারের মাধ্যমে পেমেন্ট পাঠাতে পারবেন।
                    </p>
                  </div>

                  {/* Bank Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      ব্যাংকের নাম (Bank Name):
                    </label>
                    <input
                      type="text"
                      required={isCardPaymentEnabled}
                      placeholder="e.g. City Bank / BRAC Bank / Eastern Bank"
                      value={cardBankName}
                      onChange={(e) => {
                        markDirty();
                        setCardBankName(e.target.value);
                      }}
                      className="w-full text-xs p-2.5 bg-slate-50 text-slate-950 border border-slate-300 rounded-xl outline-hidden focus:border-blue-600 focus:bg-white font-bold"
                    />
                    {/* Bank Quick Suggestion Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-2">
                      <span className="text-[10px] text-slate-500 font-bold">দ্রুত নির্বাচন:</span>
                      {['City Bank', 'BRAC Bank', 'Eastern Bank (EBL)', 'Dutch-Bangla Bank', 'Islami Bank', 'Standard Chartered', 'UCB'].map(
                        (bName) => (
                          <button
                            key={bName}
                            type="button"
                            onClick={() => {
                              markDirty();
                              setCardBankName(bName);
                            }}
                            className="text-[10px] bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-900 font-semibold px-2 py-0.5 rounded-md border border-slate-200 transition cursor-pointer"
                          >
                            {bName}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      কার্ডধারী / প্রতিষ্ঠানের নাম (Cardholder / Company):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sohoj Cart BD Enterprise"
                      value={cardAccountName}
                      onChange={(e) => {
                        markDirty();
                        setCardAccountName(e.target.value);
                      }}
                      className="w-full text-xs p-2.5 bg-slate-50 text-slate-950 border border-slate-300 rounded-xl outline-hidden focus:border-blue-600 focus:bg-white font-medium"
                    />
                  </div>

                  {/* Card Expiry */}
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      কার্ডের মেয়াদ (Expiry Date MM/YY):
                    </label>
                    <input
                      type="text"
                      placeholder="12/28"
                      value={cardExpiry}
                      onChange={(e) => {
                        markDirty();
                        setCardExpiry(e.target.value);
                      }}
                      className="w-full text-xs p-2.5 bg-slate-50 text-slate-950 border border-slate-300 rounded-xl outline-hidden focus:border-blue-600 focus:bg-white font-mono font-bold"
                    />
                  </div>

                  {/* Payment Mode / Gateway Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      পেমেন্ট মোড / গেটওয়ে টাইপ:
                    </label>
                    <select
                      value={cardGatewayType}
                      onChange={(e) => {
                        markDirty();
                        setCardGatewayType(e.target.value as any);
                      }}
                      className="w-full text-xs p-2.5 bg-slate-50 text-slate-950 border border-slate-300 rounded-xl outline-hidden font-bold"
                    >
                      <option value="direct_card">অনলাইন ৩ডি-সিকিউর কার্ড গেটওয়ে (Direct 3D-Secure Card)</option>
                      <option value="bank_transfer">ব্যাংক / কার্ড ট্রান্সফার (Bank / Card Transfer)</option>
                      <option value="pos_terminal">কার্ড অন ডেলিভারি (POS Machine on Delivery)</option>
                    </select>
                  </div>

                  {/* Routing Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      রাউটিং নম্বর / ব্রাঞ্চ কোড (ঐচ্ছিক):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 225272635 (Banani Branch)"
                      value={cardRoutingNo}
                      onChange={(e) => {
                        markDirty();
                        setCardRoutingNo(e.target.value);
                      }}
                      className="w-full text-xs p-2.5 bg-slate-50 text-slate-950 border border-slate-300 rounded-xl outline-hidden focus:border-blue-600 focus:bg-white font-mono"
                    />
                  </div>

                  {/* Online Payment Link (Optional) */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center justify-between">
                      <span>অনলাইন কার্ড পেমেন্ট লিংক / গেটওয়ে URL (ঐচ্ছিক):</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                        SSLCommerz / ShurjoPay / Bank Link
                      </span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://securepay.sslcommerz.com/gwprocess/v4/..."
                      value={cardPaymentLink}
                      onChange={(e) => {
                        markDirty();
                        setCardPaymentLink(e.target.value);
                      }}
                      className="w-full text-xs p-2.5 bg-slate-50 text-slate-950 border border-slate-300 rounded-xl outline-hidden focus:border-blue-600 focus:bg-white font-mono"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      আপনার যদি কোনো অনলাইন কার্ড পেমেন্ট গেটওয়ে লিংক বা মার্চেন্ট পে-লিংক থাকে, তবে এখানে লিংকটি পেস্ট করুন। কাস্টমার সরাসরি লিংকে গিয়েও কার্ডে পে করতে পারবে।
                    </p>
                  </div>

                  {/* Card Payment Instructions */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      কাস্টমারদের জন্য কার্ড পেমেন্ট নির্দেশিকা (Instructions):
                    </label>
                    <textarea
                      rows={3}
                      value={cardPaymentInstructions}
                      onChange={(e) => {
                        markDirty();
                        setCardPaymentInstructions(e.target.value);
                      }}
                      className="w-full text-xs p-2.5 bg-slate-50 text-slate-950 border border-slate-300 rounded-xl outline-hidden focus:border-blue-600 focus:bg-white font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Realistic Credit Card Visual Preview & Customer Checkout Preview */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider block mb-2">
                    মার্চেন্ট কার্ড লাইভ প্রিভিউ (Visual Card Preview):
                  </span>

                  {/* High Fidelity Credit Card Preview */}
                  <div className="relative rounded-2xl p-6 bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-900 text-white shadow-2xl border border-white/20 overflow-hidden space-y-5">
                    {/* Decorative Shapes */}
                    <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-blue-500/20 blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-indigo-500/25 blur-2xl pointer-events-none" />

                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <span className="text-xs font-black tracking-widest uppercase block text-blue-200">
                          {cardBankName || 'City Bank'}
                        </span>
                        <span className="text-[10px] text-slate-300 font-semibold">
                          PREMIUM MERCHANT DEBIT / CREDIT
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-full bg-rose-500 inline-block opacity-90 shadow-sm" />
                        <span className="w-6 h-6 rounded-full bg-amber-400 inline-block -ml-3.5 opacity-90 shadow-sm" />
                      </div>
                    </div>

                    {/* Chip & Contactless */}
                    <div className="flex items-center gap-3 relative z-10 pt-1">
                      <div className="w-10 h-8 rounded-lg bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 border border-amber-600/70 shadow-sm flex items-center justify-center">
                        <div className="w-7 h-5 border border-amber-900/30 rounded-xs grid grid-cols-2 gap-0.5 p-0.5">
                          <div className="bg-amber-800/20" />
                          <div className="bg-amber-800/20" />
                        </div>
                      </div>
                      <span className="text-sm font-mono tracking-widest text-slate-300">
                        ))))
                      </span>
                    </div>

                    {/* Card Number */}
                    <div className="relative z-10 pt-1">
                      <span className="font-mono text-lg sm:text-xl font-black tracking-widest block text-white drop-shadow-md">
                        {merchantCardNumber || '4532 8910 2345 6789'}
                      </span>
                    </div>

                    {/* Cardholder & Expiry */}
                    <div className="flex items-center justify-between text-[11px] relative z-10 pt-2 border-t border-white/15">
                      <div>
                        <span className="text-[9px] uppercase text-slate-400 block font-semibold tracking-wider">
                          CARDHOLDER / MERCHANT
                        </span>
                        <span className="font-black tracking-wider uppercase truncate block max-w-[190px]">
                          {cardAccountName || 'SOHOJ CART BD ENTERPRISE'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase text-slate-400 block font-semibold tracking-wider">
                          VALID THRU
                        </span>
                        <span className="font-mono font-black text-xs text-amber-300">
                          {cardExpiry || '12/28'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Checkout Preview Box */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                  <span className="text-xs font-black text-slate-900 block flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>কাস্টমার চেকআউটে যা দেখতে পাবে:</span>
                  </span>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                        <span>Credit / Debit Card (ভিসা, মাস্টারকার্ড)</span>
                      </span>
                      <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-black">
                        {cardGatewayType === 'direct_card'
                          ? 'অনলাইন ৩ডি-সিকিউর'
                          : cardGatewayType === 'bank_transfer'
                          ? 'ব্যাংক ট্রান্সফার'
                          : 'POS মেশিন'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      ব্যাংক: <strong>{cardBankName || 'City Bank'}</strong> | কার্ড: <strong>{merchantCardNumber || '4532 8910 2345 6789'}</strong>
                    </p>
                    {cardPaymentLink && (
                      <p className="text-[11px] text-emerald-700 font-bold">
                        ✓ অনলাইন কার্ড পেমেন্ট গেটওয়ে লিংক সংযুক্ত আছে
                      </p>
                    )}
                  </div>
                </div>

                {/* Security Trust Badge */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-medium text-[11px]">
                    কার্ড লেনদেন আন্তর্জাতিক পিসিআই-ডিএসএস এবং এসএসএল ২৫৬-বিট স্ট্যান্ডার্ড মেনে পরিচালিত হবে।
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DELIVERY LOGISTICS & ESTIMATED TIME */}
        {/* ========================================================================= */}
        {activeTab === 'delivery' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-950 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>ডেলিভারি চার্জ ও সময়সীমা (Delivery Configuration)</span>
              </h2>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                ঢাকার ভেতরে কম চার্জ এবং প্রতিটি বিভাগ ও জেলার জন্য নির্দিষ্ট ডেলিভারি চার্জ নির্ধারণ করুন।
              </p>
            </div>

            {/* Free Delivery & COD Feature Announcement Controls */}
            <div className="bg-gradient-to-r from-amber-50/80 via-emerald-50/50 to-amber-50/80 p-5 rounded-3xl border-2 border-amber-300 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-950">
                      সারা বাংলাদেশে ফ্রি ডেলিভারি ও ক্যাশ অন ডেলিভারি কন্ট্রোল
                    </h3>
                    <p className="text-[11px] text-slate-600 font-medium">
                      এখানে পরিবর্তন করলে পুরো ওয়েবসাইটে ও চেকআউটে তাৎক্ষণিক আপডেট হবে
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      markDirty();
                      const msg = '🚚 সারা বাংলাদেশে দ্রুত হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা! ঢাকার ভেতরে ৬০ টাকা, ঢাকার বাইরে ১২০ টাকা';
                      setNoticeBarText(msg);
                      setIsNoticeBarActive(true);
                      addToast('info', 'টপ নোটিশ বারে ডেলিভারি চার্জ (৬০/১২০ টাকা) টেক্সট সেট করা হয়েছে!');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition shadow-xs cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>নোটিশ বারে ৬০/১২০ টাকা সেট করুন</span>
                  </button>
                  {isFreeDeliveryEnabled && (
                    <button
                      type="button"
                      onClick={() => {
                        markDirty();
                        const msg = `🚚 সারা বাংলাদেশে দ্রুত হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা! ${freeDeliveryThreshold.toLocaleString()} টাকার অর্ডারে ফ্রি ডেলিভারি!`;
                        setNoticeBarText(msg);
                        setIsNoticeBarActive(true);
                        addToast('info', 'টপ নোটিশ বারে ফ্রি ডেলিভারি অফার টেক্সট সেট করা হয়েছে!');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>ফ্রি ডেলিভারি অফার বসান</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Free Delivery & Estimated Delivery Times */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-amber-300 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900">
                    <input
                      type="checkbox"
                      checked={isFreeDeliveryEnabled}
                      onChange={(e) => {
                        markDirty();
                        setIsFreeDeliveryEnabled(e.target.checked);
                      }}
                      className="rounded text-amber-500 w-4 h-4"
                    />
                    <span>ফ্রি ডেলিভারি অফার চালু</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">৳</span>
                    <input
                      type="number"
                      value={freeDeliveryThreshold}
                      onChange={(e) => {
                        markDirty();
                        setFreeDeliveryThreshold(Number(e.target.value) || 0);
                      }}
                      className="w-full text-xs pl-7 pr-3 py-2 bg-slate-50 border border-amber-300 rounded-xl font-black text-sm"
                    />
                  </div>
                  <span className="text-[10px] text-amber-900 block font-semibold">
                    এত টাকার বেশি অর্ডারে ফ্রি ডেলিভারি হবে
                  </span>
                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {[1000, 1500, 2000, 2500, 3000, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          markDirty();
                          setFreeDeliveryThreshold(amt);
                          setIsFreeDeliveryEnabled(true);
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border transition ${
                          freeDeliveryThreshold === amt && isFreeDeliveryEnabled
                            ? 'bg-amber-500 text-white border-amber-600'
                            : 'bg-slate-100 hover:bg-amber-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        ৳{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    ঢাকার ভেতরে ডেলিভারি সময়সীমা:
                  </label>
                  <input
                    type="text"
                    value={estimatedDeliveryDhaka}
                    onChange={(e) => {
                      markDirty();
                      setEstimatedDeliveryDhaka(e.target.value);
                    }}
                    placeholder="২৪ - ৪৮ ঘণ্টার মধ্যে নিশ্চিত ডেলিভারি"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    চেকআউট ও প্রোডাক্ট পেজে গ্রাহকদের প্রদর্শিত হবে
                  </span>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {['২৪ - ৪৮ ঘণ্টার মধ্যে', '১২ - ২৪ ঘণ্টার দ্রুত ডেলিভারি', '১-২ কার্যদিবস'].map((txt) => (
                      <button
                        key={txt}
                        type="button"
                        onClick={() => {
                          markDirty();
                          setEstimatedDeliveryDhaka(txt);
                        }}
                        className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium"
                      >
                        {txt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    ঢাকার বাইরে ডেলিভারি সময়সীমা:
                  </label>
                  <input
                    type="text"
                    value={estimatedDeliveryOutsideDhaka}
                    onChange={(e) => {
                      markDirty();
                      setEstimatedDeliveryOutsideDhaka(e.target.value);
                    }}
                    placeholder="৩ - ৫ কর্মদিবসের মধ্যে হোম ডেলিভারি"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    ঢাকার বাইরের সব জেলার ক্ষেত্রে প্রযোজ্য
                  </span>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {['৩ - ৫ কর্মদিবসের মধ্যে', '২ - ৪ কর্মদিবস', '৪৮ - ৭২ ঘণ্টার মধ্যে'].map((txt) => (
                      <button
                        key={txt}
                        type="button"
                        onClick={() => {
                          markDirty();
                          setEstimatedDeliveryOutsideDhaka(txt);
                        }}
                        className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium"
                      >
                        {txt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cash on Delivery (COD) Quick Facility In Delivery Tab */}
              <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900">
                    <input
                      type="checkbox"
                      checked={isCodEnabled}
                      onChange={(e) => {
                        markDirty();
                        setIsCodEnabled(e.target.checked);
                      }}
                      className="rounded text-amber-500 w-4 h-4"
                    />
                    <span>ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা চালু রাখুন</span>
                  </label>
                  <span className="text-[11px] text-emerald-800 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    পণ্য হাতে পেয়ে মূল্য পরিশোধ
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ক্যাশ অন ডেলিভারি ও হোম ডেলিভারি বার্তা (গ্রাহক চেকআউট ও পণ্যের পাতায় দেখবে):
                  </label>
                  <input
                    type="text"
                    value={codNoticeText}
                    onChange={(e) => {
                      markDirty();
                      setCodNoticeText(e.target.value);
                    }}
                    placeholder="পণ্য হাতে পেয়ে চেক করে ডেলিভারি ম্যানের কাছে মূল্য পরিশোধ করুন।"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                  {/* COD Message Quick Presets */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[
                      'পণ্য হাতে পেয়ে চেক করে ডেলিভারি ম্যানের কাছে মূল্য পরিশোধ করুন।',
                      'সারা বাংলাদেশে দ্রুত হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা।',
                      'কোনো অগ্রিম চার্জ ছাড়াই সারাদেশে সম্পূর্ণ ক্যাশ অন ডেলিভারি।',
                      'কুরিয়ার প্রতিনিধির উপস্থিতিতে পার্সেল চেক করে টাকা পরিশোধের সুযোগ।',
                    ].map((template) => (
                      <button
                        key={template}
                        type="button"
                        onClick={() => {
                          markDirty();
                          setCodNoticeText(template);
                        }}
                        className="text-[10px] px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-950 rounded-lg border border-amber-200 font-medium transition cursor-pointer"
                      >
                        + {template}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 3 TOP BANGLADESHI COURIERS (STEADFAST, PATHAO & REDX) */}
            {/* ========================================================= */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-5 sm:p-6 rounded-3xl border-2 border-emerald-500/40 shadow-lg space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
                    <Truck className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <span>৩টি কুরিয়ার সার্ভিস ইন্টিগ্রেশন (Steadfast, Pathao & RedX)</span>
                      <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                        Active & Ready
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      অর্ডার পাওয়ার পর আপনার পছন্দের যেকোনো কুরিয়ারে ১-ক্লিকে সরাসরি পার্সেল পাঠান ও ট্র্যাকিং কোড জেনারেট করুন
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-xl font-black">
                    ডিফল্ট: {defaultCourier === 'pathao' ? 'পাঠাও' : defaultCourier === 'redx' ? 'রেডএক্স' : 'স্টেডফাস্ট'}
                  </span>
                </div>
              </div>

              {/* 3 Courier Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. SteadFast Courier */}
                <div className={`p-4 rounded-2xl border-2 transition space-y-3 ${
                  defaultCourier === 'steadfast'
                    ? 'border-emerald-500 bg-slate-900 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📦</span>
                      <div>
                        <h4 className="text-sm font-black text-white">স্টেডফাস্ট কুরিয়ার</h4>
                        <span className="text-[10px] text-emerald-400 font-bold">Steadfast Courier Ltd.</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        markDirty();
                        setDefaultCourier('steadfast');
                        addToast('success', 'ডিফল্ট কুরিয়ার হিসেবে স্টেডফাস্ট নির্বাচন করা হয়েছে!');
                      }}
                      className={`text-[10px] font-black px-2.5 py-1 rounded-lg transition cursor-pointer ${
                        defaultCourier === 'steadfast'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {defaultCourier === 'steadfast' ? '✓ সিলেক্টেড' : 'ডিফল্ট করুন'}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    বাংলাদেশের সবচেয়ে জনপ্রিয় ই-কমার্স কুরিয়ার। দ্রুততম ২৪ ঘণ্টার মধ্যে ক্যাশ অন ডেলিভারির টাকা মার্চেন্ট অ্যাকাউন্টে প্রদান করে।
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href="https://portal.steadfast.com.bd/login"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-black flex items-center justify-center gap-1 transition"
                    >
                      <LogIn className="w-3 h-3 text-amber-400" />
                      <span>মার্চেন্ট লগইন</span>
                    </a>
                    <a
                      href="https://portal.steadfast.com.bd/register"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-black flex items-center justify-center gap-1 transition"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>একাউন্ট খুলুন</span>
                    </a>
                  </div>

                  <a
                    href="tel:09678045045"
                    className="block text-center py-1.5 bg-slate-950 border border-slate-800 hover:border-emerald-500 rounded-lg text-[11px] text-emerald-400 font-mono font-bold transition"
                  >
                    📞 হটলাইন: 09678-045045
                  </a>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">
                        API Key (ঐচ্ছিক):
                      </label>
                      <input
                        type="text"
                        placeholder="Steadfast API Key..."
                        value={steadfastApiKey}
                        onChange={(e) => {
                          markDirty();
                          setSteadfastApiKey(e.target.value);
                        }}
                        className="w-full text-xs p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono placeholder:text-slate-600 focus:border-emerald-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">
                        Secret Key (ঐচ্ছিক):
                      </label>
                      <input
                        type="password"
                        placeholder="Steadfast Secret Key..."
                        value={steadfastSecretKey}
                        onChange={(e) => {
                          markDirty();
                          setSteadfastSecretKey(e.target.value);
                        }}
                        className="w-full text-xs p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono placeholder:text-slate-600 focus:border-emerald-500 outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Pathao Courier */}
                <div className={`p-4 rounded-2xl border-2 transition space-y-3 ${
                  defaultCourier === 'pathao'
                    ? 'border-rose-500 bg-slate-900 shadow-md ring-2 ring-rose-500/20'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🚴</span>
                      <div>
                        <h4 className="text-sm font-black text-white">পাঠাও কুরিয়ার</h4>
                        <span className="text-[10px] text-rose-400 font-bold">Pathao Courier</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        markDirty();
                        setDefaultCourier('pathao');
                        addToast('success', 'ডিফল্ট কুরিয়ার হিসেবে পাঠাও নির্বাচন করা হয়েছে!');
                      }}
                      className={`text-[10px] font-black px-2.5 py-1 rounded-lg transition cursor-pointer ${
                        defaultCourier === 'pathao'
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {defaultCourier === 'pathao' ? '✓ সিলেক্টেড' : 'ডিফল্ট করুন'}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    সারা বাংলাদেশে দ্রুততম ডেলিভারি ও রিয়েল-টাইম রাইডার লাইভ ট্র্যাকিং। যেকোনো সাইজের পার্সেল সহজে ডেলিভারি করা যায়।
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href="https://merchant.pathao.com/login"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-black flex items-center justify-center gap-1 transition"
                    >
                      <LogIn className="w-3 h-3 text-amber-400" />
                      <span>মার্চেন্ট লগইন</span>
                    </a>
                    <a
                      href="https://merchant.pathao.com/signup"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-black flex items-center justify-center gap-1 transition"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>একাউন্ট খুলুন</span>
                    </a>
                  </div>

                  <a
                    href="tel:09678100800"
                    className="block text-center py-1.5 bg-slate-950 border border-slate-800 hover:border-rose-500 rounded-lg text-[11px] text-rose-400 font-mono font-bold transition"
                  >
                    📞 হটলাইন: 09678-100800
                  </a>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">
                        Client ID (ঐচ্ছিক):
                      </label>
                      <input
                        type="text"
                        placeholder="Pathao Client ID..."
                        value={pathaoClientId}
                        onChange={(e) => {
                          markDirty();
                          setPathaoClientId(e.target.value);
                        }}
                        className="w-full text-xs p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono placeholder:text-slate-600 focus:border-rose-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">
                        Client Secret / Bearer (ঐচ্ছিক):
                      </label>
                      <input
                        type="password"
                        placeholder="Pathao Secret..."
                        value={pathaoClientSecret}
                        onChange={(e) => {
                          markDirty();
                          setPathaoClientSecret(e.target.value);
                        }}
                        className="w-full text-xs p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono placeholder:text-slate-600 focus:border-rose-500 outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. RedX Logistics */}
                <div className={`p-4 rounded-2xl border-2 transition space-y-3 ${
                  defaultCourier === 'redx'
                    ? 'border-red-500 bg-slate-900 shadow-md ring-2 ring-red-500/20'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🚚</span>
                      <div>
                        <h4 className="text-sm font-black text-white">রেডএক্স লজিস্টিকস</h4>
                        <span className="text-[10px] text-red-400 font-bold">RedX (ShopUp)</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        markDirty();
                        setDefaultCourier('redx');
                        addToast('success', 'ডিফল্ট কুরিয়ার হিসেবে রেডএক্স নির্বাচন করা হয়েছে!');
                      }}
                      className={`text-[10px] font-black px-2.5 py-1 rounded-lg transition cursor-pointer ${
                        defaultCourier === 'redx'
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {defaultCourier === 'redx' ? '✓ সিলেক্টেড' : 'ডিফল্ট করুন'}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    বাংলাদেশের ৬৪টি জেলা ও ৪৯৫টি উপজেলায় বিস্তৃত বিশাল লজিস্টিকস নেটওয়ার্ক। নির্ভরযোগ্য ডোর-টু-ডোর সার্ভিস।
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href="https://redx.com.bd/login"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-black flex items-center justify-center gap-1 transition"
                    >
                      <LogIn className="w-3 h-3 text-amber-400" />
                      <span>মার্চেন্ট লগইন</span>
                    </a>
                    <a
                      href="https://redx.com.bd/merchant-signup"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-black flex items-center justify-center gap-1 transition"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>একাউন্ট খুলুন</span>
                    </a>
                  </div>

                  <a
                    href="tel:09610007339"
                    className="block text-center py-1.5 bg-slate-950 border border-slate-800 hover:border-red-500 rounded-lg text-[11px] text-red-400 font-mono font-bold transition"
                  >
                    📞 হটলাইন: 09610-007339
                  </a>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">
                        API Access Token (ঐচ্ছিক):
                      </label>
                      <input
                        type="password"
                        placeholder="RedX API Token..."
                        value={redxApiToken}
                        onChange={(e) => {
                          markDirty();
                          setRedxApiToken(e.target.value);
                        }}
                        className="w-full text-xs p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono placeholder:text-slate-600 focus:border-red-500 outline-hidden"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">
                      💡 API কী না থাকলেও স্বয়ংক্রিয় ট্র্যাকিং ও স্লিপ প্রিন্ট কাজ করবে।
                    </p>
                  </div>
                </div>
              </div>

              {/* Informative Note */}
              <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    অর্ডার পাওয়ার পর <strong>Orders</strong> অপশনে গিয়ে যেকোনো অর্ডারের পাশে <strong>"📦 কুরিয়ারে পাঠান"</strong> বাটনে ক্লিক করলে এই ৩টি কুরিয়ারের যেকোনোটিতে সঙ্গে সঙ্গে বুকিং পাঠানো যাবে।
                  </span>
                </span>
              </div>
            </div>

            {/* Division-wise Delivery Fees Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Dhaka Metro */}
              <div className="bg-emerald-50/60 p-4 rounded-2xl border-2 border-emerald-300 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-950">ঢাকার ভেতরে (Metro - কম চার্জ)</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    কম ডেলিভারি
                  </span>
                </div>
                <p className="text-[10px] text-emerald-800 font-medium">ঢাকা সিটি কর্পোরেশন এলাকা</p>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">৳</span>
                  <input
                    type="number"
                    value={deliveryFeeInsideDhaka}
                    onChange={(e) => {
                      markDirty();
                      setDeliveryFeeInsideDhaka(Number(e.target.value) || 0);
                    }}
                    className="w-full text-xs pl-7 pr-3 py-2 bg-white border border-emerald-300 text-slate-900 rounded-xl focus:border-emerald-600 outline-hidden font-black text-sm"
                  />
                </div>
              </div>

              {/* Dhaka Suburbs */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-xs font-black text-slate-950">ঢাকা বিভাগ / উপশহর</span>
                <p className="text-[10px] text-slate-500 font-medium">গাজীপুর, নারায়ণগঞ্জ, সাভার, মানিকগঞ্জ ইত্যাদি</p>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">৳</span>
                  <input
                    type="number"
                    value={deliveryFeeDhakaSuburbs}
                    onChange={(e) => {
                      markDirty();
                      setDeliveryFeeDhakaSuburbs(Number(e.target.value) || 0);
                    }}
                    className="w-full text-xs pl-7 pr-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-bold"
                  />
                </div>
              </div>

              {/* Chittagong */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-xs font-black text-slate-950">চট্টগ্রাম বিভাগ (Chittagong)</span>
                <p className="text-[10px] text-slate-500 font-medium">চট্টগ্রাম, কক্সবাজার, কুমিল্লা, নোয়াখালী ইত্যাদি</p>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">৳</span>
                  <input
                    type="number"
                    value={deliveryFeeChittagong}
                    onChange={(e) => {
                      markDirty();
                      setDeliveryFeeChittagong(Number(e.target.value) || 0);
                    }}
                    className="w-full text-xs pl-7 pr-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-bold"
                  />
                </div>
              </div>

              {/* Rajshahi */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-xs font-black text-slate-950">রাজশাহী বিভাগ (Rajshahi)</span>
                <p className="text-[10px] text-slate-500 font-medium">রাজশাহী, বগুড়া, পাবনা, সিরাজগঞ্জ ইত্যাদি</p>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">৳</span>
                  <input
                    type="number"
                    value={deliveryFeeRajshahi}
                    onChange={(e) => {
                      markDirty();
                      setDeliveryFeeRajshahi(Number(e.target.value) || 0);
                    }}
                    className="w-full text-xs pl-7 pr-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-bold"
                  />
                </div>
              </div>

              {/* Sylhet */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-xs font-black text-slate-950">সিলেট বিভাগ (Sylhet)</span>
                <p className="text-[10px] text-slate-500 font-medium">সিলেট, মৌলভীবাজার, হবিগঞ্জ, সুনামগঞ্জ</p>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">৳</span>
                  <input
                    type="number"
                    value={deliveryFeeSylhet}
                    onChange={(e) => {
                      markDirty();
                      setDeliveryFeeSylhet(Number(e.target.value) || 0);
                    }}
                    className="w-full text-xs pl-7 pr-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-bold"
                  />
                </div>
              </div>

              {/* Khulna */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-xs font-black text-slate-950">খুলনা বিভাগ (Khulna)</span>
                <p className="text-[10px] text-slate-500 font-medium">খুলনা, যশোর, কুষ্টিয়া, সাতক্ষীরা ইত্যাদি</p>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">৳</span>
                  <input
                    type="number"
                    value={deliveryFeeKhulna}
                    onChange={(e) => {
                      markDirty();
                      setDeliveryFeeKhulna(Number(e.target.value) || 0);
                    }}
                    className="w-full text-xs pl-7 pr-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-bold"
                  />
                </div>
              </div>

              {/* Barisal */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-xs font-black text-slate-950">বরিশাল বিভাগ (Barisal)</span>
                <p className="text-[10px] text-slate-500 font-medium">বরিশাল, পটুয়াখালী, ভোলা, পিরোজপুর</p>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">৳</span>
                  <input
                    type="number"
                    value={deliveryFeeBarisal}
                    onChange={(e) => {
                      markDirty();
                      setDeliveryFeeBarisal(Number(e.target.value) || 0);
                    }}
                    className="w-full text-xs pl-7 pr-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-bold"
                  />
                </div>
              </div>

              {/* Rangpur */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-xs font-black text-slate-950">রংপুর বিভাগ (Rangpur)</span>
                <p className="text-[10px] text-slate-500 font-medium">রংপুর, দিনাজপুর, কুড়িগ্রাম, গাইবান্ধা ইত্যাদি</p>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">৳</span>
                  <input
                    type="number"
                    value={deliveryFeeRangpur}
                    onChange={(e) => {
                      markDirty();
                      setDeliveryFeeRangpur(Number(e.target.value) || 0);
                    }}
                    className="w-full text-xs pl-7 pr-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-bold"
                  />
                </div>
              </div>

              {/* Mymensingh */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-xs font-black text-slate-950">ময়মনসিংহ বিভাগ (Mymensingh)</span>
                <p className="text-[10px] text-slate-500 font-medium">ময়মনসিংহ, জামালপুর, শেরপুর, নেত্রকোণা</p>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">৳</span>
                  <input
                    type="number"
                    value={deliveryFeeMymensingh}
                    onChange={(e) => {
                      markDirty();
                      setDeliveryFeeMymensingh(Number(e.target.value) || 0);
                    }}
                    className="w-full text-xs pl-7 pr-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-bold"
                  />
                </div>
              </div>
            </div>

            {/* District specific override section */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>নির্দিষ্ট জেলার জন্য কাস্টম ডেলিভারি চার্জ (Optional District Override):</span>
              </h3>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <select
                  value={overrideDistrictName}
                  onChange={(e) => setOverrideDistrictName(e.target.value)}
                  className="w-full sm:w-60 text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 outline-hidden"
                >
                  {BANGLADESH_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.bnName} - {d.division})
                    </option>
                  ))}
                </select>

                <div className="relative w-full sm:w-36">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">৳</span>
                  <input
                    type="number"
                    placeholder="130"
                    value={overrideFeeAmount}
                    onChange={(e) => setOverrideFeeAmount(Number(e.target.value) || 0)}
                    className="w-full text-xs pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl font-bold outline-hidden"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddDistrictOverride}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>চার্জ যুক্ত করুন</span>
                </button>
              </div>

              {Object.keys(districtFeeOverrides).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {Object.entries(districtFeeOverrides).map(([dName, fee]) => (
                    <span
                      key={dName}
                      className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200"
                    >
                      <span>
                        {dName}: <strong>৳{fee}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDistrictOverride(dName)}
                        className="text-rose-500 hover:text-rose-700 cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: WORDPRESS-STYLE ADS & BANNERS BUILDER (বিজ্ঞাপন ও ব্যানার কাস্টমাইজার) */}
        {/* ========================================================================= */}
        {activeTab === 'ads_widgets' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-xs">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-950 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-amber-500" />
                  <span>ওয়ার্ডপ্রেস স্টাইল কাস্টম ব্যানার ও বিজ্ঞাপন বিল্ডার (WordPress Style Customizer)</span>
                </h2>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  ওয়ার্ডপ্রেসের মতো নিজের ইচ্ছেমতো যেকোনো ছবি আপলোড করে ব্যানার ও অ্যাড তৈরি করুন, লেখা ও বাটন সাজান এবং স্টোরে যেকোনো স্থানে ডিসপ্লে করুন।
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-black bg-amber-100 text-amber-950 border border-amber-300 px-3 py-1 rounded-xl">
                  মোট {banners.length} টি ব্যানার
                </span>
                <span className="text-xs font-black bg-blue-100 text-blue-950 border border-blue-300 px-3 py-1 rounded-xl">
                  {advertisements.length} টি অ্যাড
                </span>
              </div>
            </div>

            {/* Builder Card: Create New Custom Banner / Promo */}
            <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-50 via-yellow-50/70 to-orange-50/60 rounded-3xl border-2 border-amber-300 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
                <div className="flex items-center gap-2 font-black text-slate-950 text-sm">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>+ নতুন ব্যানার বা অফার কার্ড যুক্ত করুন (Add New Block / Banner)</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full font-black">
                  লাইভ ওয়েবসাইট প্রিভিউ
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Side: Form inputs */}
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">
                      ব্যানারের শিরোনাম / টাইটেল (Title): <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: বিশেষ অফার! সকল পণ্যে ৫০% পর্যন্ত ছাড়"
                      value={newBannerTitle}
                      onChange={(e) => setNewBannerTitle(e.target.value)}
                      className="w-full text-xs p-3 bg-white border border-amber-300 rounded-xl font-bold text-slate-950 outline-hidden focus:border-amber-600 shadow-2xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        সাবটাইটেল / বিবরণ (Subtitle):
                      </label>
                      <input
                        type="text"
                        placeholder="যেমন: দ্রুত অর্ডার করুন, স্টক সীমিত!"
                        value={newBannerSubtitle}
                        onChange={(e) => setNewBannerSubtitle(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 outline-hidden focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        অফার ব্যাজ ট্যাগ (Badge Tag):
                      </label>
                      <input
                        type="text"
                        placeholder="যেমন: হট ডিল / ঈদ অফার"
                        value={newBannerBadge}
                        onChange={(e) => setNewBannerBadge(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-amber-800 outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        বাটন টেক্সট (Button Label):
                      </label>
                      <input
                        type="text"
                        placeholder="যেমন: এখনই কিনুন"
                        value={newBannerButtonText}
                        onChange={(e) => setNewBannerButtonText(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-hidden focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        বাটন লিংক (Button Link):
                      </label>
                      <input
                        type="text"
                        placeholder="যেমন: /products অথবা /category/..."
                        value={newBannerButtonLink}
                        onChange={(e) => setNewBannerButtonLink(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-slate-900 outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      স্টোরে ব্যানার প্রদর্শনের স্থান (Display Location):
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'hero', label: 'হোমপেজ টপ স্লাইডার', desc: 'মেইন ব্যানার' },
                        { id: 'promo', label: 'হোমপেজ মিডল সেকশন', desc: 'প্রোমো ব্যানার' },
                        { id: 'deal', label: 'ডিল ও ডিসকাউন্ট সেকশন', desc: 'স্পেশাল অফার' },
                      ].map((pos) => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => setNewBannerPosition(pos.id as any)}
                          className={`p-2 rounded-xl border text-left cursor-pointer transition ${
                            newBannerPosition === pos.id
                              ? 'bg-amber-400 border-amber-600 text-slate-950 font-black shadow-xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="block text-[11px] font-black">{pos.label}</span>
                          <span className="block text-[9px] opacity-80">{pos.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: Photo Upload & Realtime Preview */}
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">
                      কম্পিউটার বা মোবাইল থেকে ছবি আপলোড: <span className="text-rose-500">*</span>
                    </label>

                    <div className="flex flex-col gap-2">
                      <label className="p-4 border-2 border-dashed border-amber-400 bg-white rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-amber-50/50 transition group">
                        <Upload className="w-8 h-8 text-amber-500 group-hover:scale-110 transition" />
                        <span className="text-xs font-black text-slate-900 mt-2">
                          {isProcessingBannerImg ? 'ছবি লোড হচ্ছে...' : 'ছবি নির্বাচন করুন (কম্পিউটার ফাইল বা মোবাইল গ্যালারি)'}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5">
                          JPG, PNG, WebP ফরম্যাট সাপোর্টেড
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadBannerImage}
                          className="hidden"
                        />
                      </label>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="অথবা সরাসরি ছবির ওয়েব URL দিন..."
                          value={newBannerImage}
                          onChange={(e) => setNewBannerImage(e.target.value)}
                          className="flex-1 text-xs p-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-800 outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setNewBannerImage(
                              'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=85'
                            )
                          }
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-xl shrink-0 cursor-pointer"
                        >
                          নমুনা ছবি
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Live Visual Card Preview */}
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block mb-1">
                      ওয়েবসাইট ব্যানার প্রিভিউ (Live Card Preview):
                    </span>
                    <div className="relative h-44 rounded-2xl overflow-hidden border-2 border-amber-300 bg-slate-900 shadow-md">
                      {newBannerImage ? (
                        <img
                          src={newBannerImage}
                          alt="Banner Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-800">
                          <ImageIcon className="w-8 h-8 mb-1 text-slate-500" />
                          <span className="text-xs">ছবি আপলোড করলে এখানে প্রিভিউ দেখা যাবে</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end text-white">
                        {newBannerBadge && (
                          <span className="self-start text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded mb-1">
                            {newBannerBadge}
                          </span>
                        )}
                        <h4 className="font-black text-sm text-white line-clamp-1">
                          {newBannerTitle || 'আপনার ব্যানারের শিরোনাম এখানে থাকবে'}
                        </h4>
                        <p className="text-[11px] text-slate-200 line-clamp-1">
                          {newBannerSubtitle || 'সাবটাইটেল ও আকর্ষণীয় অফারের বিবরণ'}
                        </p>
                        <span className="mt-2 self-start inline-flex items-center gap-1 bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-lg">
                          <span>{newBannerButtonText || 'Shop Now'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-600 font-medium">
                  ⚡ ব্যানার যুক্ত করার সাথে সাথে স্টোরের সিলেক্টেড লোকেশনে স্বয়ংক্রিয়ভাবে ডিসপ্লে হবে।
                </span>
                <button
                  type="button"
                  onClick={handleCreateNewBanner}
                  disabled={isAddingBanner || !newBannerTitle.trim()}
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs sm:text-sm font-black rounded-xl transition shadow-md shadow-amber-400/30 cursor-pointer disabled:opacity-50 flex items-center gap-2 active:scale-98 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddingBanner ? 'যোগ হচ্ছে...' : '+ ব্যানার স্টোরে যোগ করুন (Publish)'}</span>
                </button>
              </div>
            </div>

            {/* Existing Banners List with Direct Device Photo Replacement & Delete */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
                  <span>বিদ্যমান সকল ব্যানার ও প্রচারণামূলক বিজ্ঞাপন ({banners.length} টি):</span>
                  <span className="text-[10px] text-slate-500 font-normal hidden sm:inline">
                    (ক্যামেরা আইকনে ক্লিক করে সরাসরি মোবাইল/কম্পিউটার থেকে ছবি বদলাতে পারবেন)
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map((b, idx) => (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-2xl border transition flex gap-3 ${
                      b.isActive !== false
                        ? 'bg-white border-slate-200 hover:border-amber-300 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="relative group/bimg w-28 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-900">
                      <img
                        src={b.image}
                        alt={b.title}
                        className="w-full h-full object-cover"
                      />
                      <label
                        title="কম্পিউটার বা মোবাইল থেকে এই ব্যানারের ছবি বদলান"
                        className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover/bimg:opacity-100 transition flex flex-col items-center justify-center cursor-pointer text-white text-[9px] font-bold"
                      >
                        <Camera className="w-5 h-5 text-amber-300 mb-0.5" />
                        <span>ছবি বদলান</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleUploadBannerQuickPhoto(b, e)}
                        />
                      </label>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            #{idx + 1} • {b.position || 'hero'}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                            b.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {b.isActive !== false ? 'লাইভ' : 'বন্ধ'}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-slate-950 truncate mt-1">
                          {b.title}
                        </h4>
                        {b.subtitle && (
                          <p className="text-[10px] text-slate-500 truncate">{b.subtitle}</p>
                        )}
                        <p className="text-[10px] text-amber-700 font-mono truncate mt-0.5">
                          🔗 {b.buttonLink || '/products'}
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100 mt-2">
                        <button
                          type="button"
                          onClick={() => handleToggleBannerActive(b)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg transition cursor-pointer ${
                            b.isActive !== false
                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          }`}
                        >
                          {b.isActive !== false ? 'হাইড করুন' : 'চালু করুন'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBanner(b.id, b.title)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: ALL CATEGORIES CONFIGURATION & MANAGEMENT (অল ক্যাটাগরি কনফিগারেশন) */}
        {/* ========================================================================= */}
        {activeTab === 'categories' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-xs">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-950 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-500" />
                  <span>অল ক্যাটাগরি কনফিগারেশন ও নাম সেটিংস (All Categories)</span>
                </h2>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  এখানে যেকোনো নতুন ক্যাটাগরি তৈরি করতে পারবেন, নাম ও ছবি পরিবর্তন করতে পারবেন বা অন/অফ করতে পারবেন।
                </p>
              </div>
              <span className="text-xs font-black bg-amber-100 text-amber-950 border border-amber-300 px-3 py-1 rounded-xl shrink-0 self-start sm:self-auto">
                মোট {categories.length} টি ক্যাটাগরি লাইভ
              </span>
            </div>

            {/* Quick Add New Category Form with Picture Upload */}
            <div className="p-5 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 rounded-2xl border-2 border-amber-300 space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-amber-600" />
                  <span>নতুন ক্যাটাগরি তৈরি ও কাস্টমাইজেশন (Add Category with Name & Picture):</span>
                </label>
                <span className="text-[11px] text-amber-900 font-bold hidden sm:inline">
                  ওয়ার্ডপ্রেস স্টাইল কাস্টমাইজার
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Names & Details */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      ক্যাটাগরির নাম: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: Books & Stationery, Baby & Kids, Men's Shoes..."
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewCategory();
                        }
                      }}
                      className="w-full text-xs p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-slate-950 outline-hidden focus:border-amber-600 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      ক্যাটাগরি বিবরণ / স্লোগান (ঐচ্ছিক):
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: প্রিমিয়াম ও আকর্ষণীয় পণ্যের কালেকশন"
                      value={newCatDescription}
                      onChange={(e) => setNewCatDescription(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-amber-300 rounded-xl font-medium text-slate-950 outline-hidden focus:border-amber-600"
                    />
                  </div>
                </div>

                {/* Right: Picture Upload from Computer or Mobile */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-800">
                    ক্যাটাগরির ছবি (কম্পিউটার বা মোবাইল থেকে আপলোড):
                  </label>

                  <div className="flex items-center gap-3">
                    {/* Thumbnail preview */}
                    <div className="w-16 h-16 rounded-xl border-2 border-amber-300 bg-white overflow-hidden shrink-0 flex items-center justify-center relative">
                      {newCatImage ? (
                        <img
                          src={newCatImage}
                          alt="Category preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-amber-400" />
                      )}
                      {newCatImage && (
                        <button
                          type="button"
                          onClick={() => setNewCatImage('')}
                          className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 hover:bg-rose-600"
                          title="ছবি মুছুন"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black rounded-xl cursor-pointer transition shadow-2xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isProcessingNewCatImg ? 'ছবি লোড হচ্ছে...' : 'ছবি নির্বাচন করুন (PC / Mobile)'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadNewCatImage}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="অথবা ছবির ওয়েব লিংক দিন..."
                        value={newCatImage}
                        onChange={(e) => setNewCatImage(e.target.value)}
                        className="w-full text-[11px] p-1.5 bg-white border border-slate-300 rounded-lg font-mono text-slate-800 outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleAddNewCategory()}
                  disabled={isAddingCat || !newCatName.trim()}
                  className="px-6 py-2.5 bg-slate-950 hover:bg-slate-850 text-white text-xs font-black rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2 active:scale-98"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>{isAddingCat ? 'যুক্ত হচ্ছে...' : '+ নতুন ক্যাটাগরি তৈরি করুন'}</span>
                </button>
              </div>

              {/* Quick One-Click Presets for Requested Categories */}
              <div className="pt-2 border-t border-amber-200/70 space-y-1.5">
                <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>জনপ্রিয় ক্যাটাগরি (১-ক্লিকে যোগ বা চেক করুন):</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Books & Stationery',
                    'Fashion Accessories',
                    'Baby & Kids',
                    'Furniture & Home Decor',
                    'Man Fashion',
                    'Mother & Baby',
                    'Home & Lifestyle',
                    'Electronic Accessories',
                    "Men's Shoes",
                    "Women's Shoes",
                  ].map((presetName) => {
                    const isAlreadyAdded = categories.some(
                      (c) => c.name.toLowerCase().trim() === presetName.toLowerCase().trim()
                    );
                    return (
                      <button
                        key={presetName}
                        type="button"
                        onClick={() => {
                          if (!isAlreadyAdded) {
                            handleAddNewCategory(presetName);
                          } else {
                            addToast('info', `"${presetName}" ক্যাটাগরি ইতিমধ্যে আপনার স্টোরে যুক্ত আছে!`);
                          }
                        }}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                          isAlreadyAdded
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-white hover:bg-amber-100 text-slate-800 border-amber-300'
                        }`}
                        title={isAlreadyAdded ? 'ইতিমধ্যে যুক্ত আছে' : 'ক্লিক করে সরাসরি যুক্ত করুন'}
                      >
                        {isAlreadyAdded ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>{presetName} (যুক্ত আছে)</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3 text-amber-600" />
                            <span>{presetName}</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Existing Categories List & Inline Rename */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black text-slate-900">
                    বিদ্যমান সকল ক্যাটাগরির তালিকা (Total: {categories.length} টি):
                  </h3>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ক্যাটাগরি খুঁজুন..."
                    value={catSearch}
                    onChange={(e) => setCatSearch(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto p-1 scrollbar-thin">
                {categories
                  .filter((cat) =>
                    catSearch.trim()
                      ? cat.name.toLowerCase().includes(catSearch.toLowerCase().trim())
                      : true
                  )
                  .map((cat, idx) => {
                    const isEditingThis = editingCatId === cat.id;
                    return (
                      <div
                        key={cat.id}
                        className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                          cat.isActive !== false
                            ? 'bg-white border-slate-200 hover:border-amber-300 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-black shrink-0">
                            {idx + 1}
                          </span>
                          <div className="relative group/catimg shrink-0">
                            <img
                              src={cat.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
                              alt={cat.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                            />
                            <label
                              title="কম্পিউটার বা মোবাইল থেকে ক্যাটাগরির ছবি বদলান"
                              className="absolute inset-0 bg-black/45 rounded-xl opacity-0 group-hover/catimg:opacity-100 transition flex items-center justify-center cursor-pointer text-white shadow-sm"
                            >
                              <Camera className="w-4 h-4 text-amber-300" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleUploadCategoryPhoto(cat, e)}
                              />
                            </label>
                          </div>
                          <div className="min-w-0 flex-1">
                            {isEditingThis ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={editingCatName}
                                  onChange={(e) => setEditingCatName(e.target.value)}
                                  className="text-xs font-bold p-1 bg-amber-50 border border-amber-400 rounded-lg outline-hidden w-full text-slate-900"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveCategoryRename(cat);
                                    if (e.key === 'Escape') setEditingCatId(null);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveCategoryRename(cat)}
                                  className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
                                  title="সেভ করুন"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingCatId(null)}
                                  className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg cursor-pointer"
                                  title="বাতিল"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <p className="text-xs font-black text-slate-950 truncate flex items-center gap-1.5">
                                  <span>{cat.name}</span>
                                  {cat.isActive === false && (
                                    <span className="text-[9px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded">
                                      নিষ্ক্রিয়
                                    </span>
                                  )}
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono truncate">
                                  slug: {cat.slug || cat.id}
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          {!isEditingThis && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCatId(cat.id);
                                setEditingCatName(cat.name);
                              }}
                              className="p-1.5 text-slate-500 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition cursor-pointer"
                              title="নাম পরিবর্তন করুন (Rename)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleToggleCatActive(cat)}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              cat.isActive !== false
                                ? 'text-emerald-700 hover:bg-emerald-100'
                                : 'text-slate-400 hover:bg-slate-200'
                            }`}
                            title={cat.isActive !== false ? 'স্টোরে সক্রিয় আছে (ক্লিক করে হাইড করুন)' : 'হাইড করা আছে (ক্লিক করে অন করুন)'}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="মুছে ফেলুন (Delete)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: BRANDING & GENERAL PROFILE */}
        {/* ========================================================================= */}
        {activeTab === 'branding' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-xs">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-950 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                  <span>ব্র্যান্ডিং, লোগো ও সাধারণ স্টোর প্রোফাইল</span>
                </h2>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  স্টোরের নাম, স্লোগান, লোগো, ফেভিকন ও অফিস ঠিকানা পরিবর্তন করুন।
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetToDefaultBrand}
                className="text-[11px] text-slate-500 hover:text-amber-600 flex items-center gap-1 font-bold transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>ডিফল্ট লোগোতে ফিরুন</span>
              </button>
            </div>

            {/* Logo & Icon Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Main Store Logo */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  মেইন স্টোর লোগো (Store Logo)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://example.com/logo.png অথবা ফাইল আপলোড"
                    value={logoUrl}
                    onChange={(e) => {
                      markDirty();
                      setLogoUrl(e.target.value);
                    }}
                    className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-mono"
                  />
                  <label
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer flex items-center justify-center shrink-0 border border-slate-300 transition"
                    title="ফাইল আপলোড করুন"
                  >
                    <Upload className="w-4 h-4 text-amber-600" />
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
                {/* Logo Preview */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block mb-1.5">
                    লোগো প্রিভিউ:
                  </span>
                  <div className="h-16 flex items-center justify-center bg-white rounded-xl p-2 border border-slate-200">
                    {logoUrl.trim() ? (
                      <img
                        src={logoUrl}
                        alt="Logo Preview"
                        className="max-h-12 max-w-full object-contain"
                        onError={() => addToast('error', 'লোগো ইমেজ লোড করা যাচ্ছে না।')}
                      />
                    ) : (
                      <BrandLogo variant="color" size="md" />
                    )}
                  </div>
                </div>
              </div>

              {/* Favicon / Icon */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  স্টোর আইকন / ফেভিকন (App Icon / Favicon)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://example.com/icon.png অথবা আপলোড"
                    value={iconUrl}
                    onChange={(e) => {
                      markDirty();
                      setIconUrl(e.target.value);
                    }}
                    className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-mono"
                  />
                  <label
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer flex items-center justify-center shrink-0 border border-slate-300 transition"
                    title="আইকন আপলোড করুন"
                  >
                    <Upload className="w-4 h-4 text-amber-600" />
                    <input type="file" accept="image/*" onChange={handleIconUpload} className="hidden" />
                  </label>
                </div>
                {/* Icon Preview */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block mb-1.5">
                    আইকন প্রিভিউ:
                  </span>
                  <div className="h-16 flex items-center justify-center bg-white rounded-xl p-2 border border-slate-200 gap-4">
                    {iconUrl.trim() ? (
                      <img
                        src={iconUrl}
                        alt="Icon Preview"
                        className="w-10 h-10 object-contain rounded-lg"
                        onError={() => addToast('error', 'আইকন ইমেজ লোড করা যাচ্ছে না।')}
                      />
                    ) : (
                      <img src="/logo-icon.svg" alt="Default Icon" className="w-10 h-10 object-contain" />
                    )}
                    <span className="text-xs text-slate-600 font-medium">ব্রাউজার ট্যাবে এই আইকনটি থাকবে</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Information Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">স্টোরের নাম</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => {
                    markDirty();
                    setStoreName(e.target.value);
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">স্টোরের স্লোগান / ট্যাগলাইন</label>
                <input
                  type="text"
                  value={storeTagline}
                  onChange={(e) => {
                    markDirty();
                    setStoreTagline(e.target.value);
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">কাস্টমার কেয়ার ফোন / হেল্পলাইন</label>
                <input
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => {
                    markDirty();
                    setContactPhone(e.target.value);
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সাপোর্ট ইমেইল</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => {
                    markDirty();
                    setContactEmail(e.target.value);
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">মুদ্রা প্রতীক (Currency Symbol)</label>
                <input
                  type="text"
                  required
                  value={currencySymbol}
                  onChange={(e) => {
                    markDirty();
                    setCurrencySymbol(e.target.value);
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">স্টোর লাইভ স্ট্যাটাস</label>
                <select
                  value={isStoreLive ? 'live' : 'maintenance'}
                  onChange={(e) => {
                    markDirty();
                    setIsStoreLive(e.target.value === 'live');
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-bold"
                >
                  <option value="live">অনলাইন ও গ্রাহকের জন্য উন্মুক্ত (Live)</option>
                  <option value="maintenance">মেইনটেন্যান্স মোড (Maintenance Mode)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">অফিস / ডেলিভারি ঠিকানা</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => {
                    markDirty();
                    setAddress(e.target.value);
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: TOP NOTICE / ANNOUNCEMENT BAR */}
        {/* ========================================================================= */}
        {activeTab === 'notice' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-xs">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-950 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-600" />
                  <span>হেডার টপ নোটিশ ও এনাউন্সমেন্ট বার (Notice Bar)</span>
                </h2>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  সাইটের একদম উপরে বিশেষ অফার, ডিসকাউন্ট বা জরুরি নোটিশ দেখান।
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={isNoticeBarActive}
                  onChange={(e) => {
                    markDirty();
                    setIsNoticeBarActive(e.target.checked);
                  }}
                  className="rounded text-emerald-600 w-4 h-4"
                />
                <span>নোটিশ বার চালু</span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black text-slate-900">
                    নোটিশের লেখা (Announcement Text):
                  </label>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    ওয়েবসাইটের সবার উপরে প্রদর্শিত হবে
                  </span>
                </div>
                <input
                  type="text"
                  value={noticeBarText}
                  onChange={(e) => {
                    markDirty();
                    setNoticeBarText(e.target.value);
                  }}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold shadow-2xs"
                  placeholder="যেমন: 🚚 সারা বাংলাদেশে দ্রুত হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা! ২,০০০ টাকার অর্ডারে ফ্রি ডেলিভারি!"
                />

                {/* Ready-to-use Delivery & Promo Templates */}
                <div className="mt-2.5 p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                  <span className="text-[11px] font-black text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>রেডিমেড ডেলিভারি ও ক্যাশ অন ডেলিভারি বার্তা (এক ক্লিকে সেট করুন):</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      '🚚 সারা বাংলাদেশে দ্রুত হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা! ২,০০০ টাকার অর্ডারে ফ্রি ডেলিভারি!',
                      '🚚 সারা বাংলাদেশে ক্যাশ অন ডেলিভারি ও দ্রুত হোম ডেলিভারি সুবিধা!',
                      '🔥 ২,০০০ টাকার অর্ডারে সারা বাংলাদেশে সম্পূর্ণ ফ্রি ডেলিভারি!',
                      '⚡ ঢাকার ভেতরে ২৪ ঘণ্টা এবং সারাদেশে ৪৮ ঘণ্টার মধ্যে দ্রুত হোম ডেলিভারি!',
                      '🛡️ পণ্য হাতে পেয়ে চেক করে টাকা দিন - ১০০% ক্যাশ অন ডেলিভারি!',
                      '🎉 সহজকার্ট বিডি: সেরা অফার চলছে! সারা বাংলাদেশে ক্যাশ অন ডেলিভারি!',
                    ].map((template) => (
                      <button
                        key={template}
                        type="button"
                        onClick={() => {
                          markDirty();
                          setNoticeBarText(template);
                          setIsNoticeBarActive(true);
                          addToast('info', 'নোটিশ টেক্সট আপডেট হয়েছে! সেভ করতে উপরে "সেটিংস সেভ করুন" চাপুন।');
                        }}
                        className={`text-left text-xs p-2 rounded-lg border transition font-medium cursor-pointer ${
                          noticeBarText === template
                            ? 'bg-amber-500 text-white border-amber-600 font-bold shadow-xs'
                            : 'bg-white hover:bg-amber-100/70 text-slate-800 border-slate-200'
                        }`}
                      >
                        {template}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ক্লিক লিংক (ঐচ্ছিক):
                  </label>
                  <input
                    type="text"
                    value={noticeBarLink}
                    onChange={(e) => {
                      markDirty();
                      setNoticeBarLink(e.target.value);
                    }}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    placeholder="/products"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ব্যাকগ্রাউন্ড কালার:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={noticeBarBgColor}
                      onChange={(e) => {
                        markDirty();
                        setNoticeBarBgColor(e.target.value);
                      }}
                      className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={noticeBarBgColor}
                      onChange={(e) => {
                        markDirty();
                        setNoticeBarBgColor(e.target.value);
                      }}
                      className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    টেক্সট কালার:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={announcementTextColor}
                      onChange={(e) => {
                        markDirty();
                        setAnnouncementTextColor(e.target.value);
                      }}
                      className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={announcementTextColor}
                      onChange={(e) => {
                        markDirty();
                        setAnnouncementTextColor(e.target.value);
                      }}
                      className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Notice Bar Live Preview */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  লাইভ প্রিভিউ (Preview):
                </span>
                <div
                  className="p-2.5 rounded-xl text-xs font-bold text-center shadow-xs"
                  style={{ backgroundColor: noticeBarBgColor, color: announcementTextColor }}
                >
                  {noticeBarText || 'নোটিশের লেখা লিখুন'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: WHATSAPP & LIVE CHAT SUPPORT */}
        {/* ========================================================================= */}
        {activeTab === 'whatsapp' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-xs">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-950 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>হোয়াটসঅ্যাপ ও সরাসরি সাপোর্ট (WhatsApp Support)</span>
                </h2>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  গ্রাহক যাতে সরাসরি ১-ক্লিকে হোয়াটসঅ্যাপে আপনার সাথে চ্যাট বা অর্ডার করতে পারে।
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={isWhatsAppChatActive}
                  onChange={(e) => {
                    markDirty();
                    setIsWhatsAppChatActive(e.target.checked);
                  }}
                  className="rounded text-emerald-600 w-4 h-4"
                />
                <span>হোয়াটসঅ্যাপ ফ্লোটিং বাটন চালু</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  হোয়াটসঅ্যাপ নাম্বার (দেশীয় কোডসহ):
                </label>
                <input
                  type="text"
                  value={whatsAppNumber}
                  onChange={(e) => {
                    markDirty();
                    setWhatsAppNumber(e.target.value);
                  }}
                  placeholder="+8801712345678"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">যেমন: +8801712345678 বা 01712345678</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সাপোর্ট কাজের সময় (Working Hours):
                </label>
                <input
                  type="text"
                  value={workingHours}
                  onChange={(e) => {
                    markDirty();
                    setWorkingHours(e.target.value);
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ডিফল্ট অভিবাদন বার্তা (Default Chat Greeting):
                </label>
                <input
                  type="text"
                  value={whatsAppDefaultMessage}
                  onChange={(e) => {
                    markDirty();
                    setWhatsAppDefaultMessage(e.target.value);
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  গ্রাহক হোয়াটসঅ্যাপ বাটনে ক্লিক করলে স্বয়ংক্রিয়ভাবে এই মেসেজটি প্রস্তুত থাকবে।
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: POLICIES, TRUST & LEGAL */}
        {/* ========================================================================= */}
        {activeTab === 'policies' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>রিটার্ন পলিসি, লিগ্যাল ও ট্রাস্ট ব্যাজ (Trust & Policies)</span>
              </h2>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                গ্রাহকের আস্থা অর্জনের জন্য ট্রেড লাইসেন্স, রিটার্ন শর্ত ও কনফার্মেশন বার্তা।
              </p>
            </div>

            <div className="space-y-4">
              {/* Top Bar Badges Configuration */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>টপ বার বাটন ও পলিসি লেখা কাস্টমাইজার (Top Bar Display Text)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ক্যাশ অন ডেলিভারি (COD) বাটন লেখা:
                    </label>
                    <input
                      type="text"
                      value={topBarCodText}
                      onChange={(e) => {
                        markDirty();
                        setTopBarCodText(e.target.value);
                      }}
                      placeholder="Cash on Delivery (COD)"
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      রিটার্ন পলিসি বাটন লেখা:
                    </label>
                    <input
                      type="text"
                      value={topBarReturnText}
                      onChange={(e) => {
                        markDirty();
                        setTopBarReturnText(e.target.value);
                      }}
                      placeholder="7 Days Return Policy"
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  রিটার্ন ও রিফান্ড পলিসি (Return Policy):
                </label>
                <textarea
                  rows={3}
                  value={returnPolicyText}
                  onChange={(e) => {
                    markDirty();
                    setReturnPolicyText(e.target.value);
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  অর্ডার কনফার্মেশন নোট (গ্রাহককে অর্ডার শেষে দেখানোর বার্তা):
                </label>
                <input
                  type="text"
                  value={orderConfirmationNote}
                  onChange={(e) => {
                    markDirty();
                    setOrderConfirmationNote(e.target.value);
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ট্রেড লাইসেন্স নম্বর (Trade License No):
                  </label>
                  <input
                    type="text"
                    value={tradeLicenseNo}
                    onChange={(e) => {
                      markDirty();
                      setTradeLicenseNo(e.target.value);
                    }}
                    placeholder="TRAD/DSCC/012948/2024"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    TIN / BIN নম্বর (VAT Registration):
                  </label>
                  <input
                    type="text"
                    value={tinBinNo}
                    onChange={(e) => {
                      markDirty();
                      setTinBinNo(e.target.value);
                    }}
                    placeholder="BIN-002941042-0101"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ট্রাস্ট ব্যাজ হেডলাইন (Trust Badges):
                </label>
                <input
                  type="text"
                  value={trustBadgeText}
                  onChange={(e) => {
                    markDirty();
                    setTrustBadgeText(e.target.value);
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: SOCIAL MEDIA LINKS */}
        {/* ========================================================================= */}
        {activeTab === 'social' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-950 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>সোশ্যাল মিডিয়া প্রোফাইল লিংক (Social Media Profiles)</span>
              </h2>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                ফুটার ও বিভিন্ন পেজে সোশ্যাল পেজসমূহের ডিরেক্ট লিংক প্রদর্শন করুন।
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Facebook Page URL:
                </label>
                <input
                  type="url"
                  value={facebookPageUrl}
                  onChange={(e) => {
                    markDirty();
                    setFacebookPageUrl(e.target.value);
                  }}
                  placeholder="https://facebook.com/yourbrand"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instagram Profile URL:
                </label>
                <input
                  type="url"
                  value={instagramPageUrl}
                  onChange={(e) => {
                    markDirty();
                    setInstagramPageUrl(e.target.value);
                  }}
                  placeholder="https://instagram.com/yourbrand"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  YouTube Channel URL:
                </label>
                <input
                  type="url"
                  value={youtubeChannelUrl}
                  onChange={(e) => {
                    markDirty();
                    setYoutubeChannelUrl(e.target.value);
                  }}
                  placeholder="https://youtube.com/@yourchannel"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  TikTok Profile URL:
                </label>
                <input
                  type="url"
                  value={tiktokUrl}
                  onChange={(e) => {
                    markDirty();
                    setTiktokUrl(e.target.value);
                  }}
                  placeholder="https://tiktok.com/@yourbrand"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: CHECKOUT & ORDER AUTOMATION */}
        {/* ========================================================================= */}
        {activeTab === 'checkout' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-950 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>অর্ডার ও চেকআউট অটোমেশন (Order Configuration)</span>
              </h2>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                ন্যূনতম অর্ডারের পরিমাণ, স্টক কাউন্ট ও ইনভয়েস সেটিংস।
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ন্যূনতম অর্ডার মূল্য (Minimum Order Amount - ৳):
                </label>
                <input
                  type="number"
                  value={minimumOrderAmount}
                  onChange={(e) => {
                    markDirty();
                    setMinimumOrderAmount(Number(e.target.value) || 0);
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">০ দিলে কোনো বাধ্যবাধকতা থাকবে না।</span>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={autoConfirmOrders}
                    onChange={(e) => {
                      markDirty();
                      setAutoConfirmOrders(e.target.checked);
                    }}
                    className="rounded text-amber-500 w-4 h-4"
                  />
                  <span>স্বয়ংক্রিয়ভাবে অর্ডার কনফার্ম মোডে রাখুন</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={showStockCount}
                    onChange={(e) => {
                      markDirty();
                      setShowStockCount(e.target.checked);
                    }}
                    className="rounded text-amber-500 w-4 h-4"
                  />
                  <span>পণ্যের পাতায় স্টকের সংখ্যা প্রদর্শন করুন</span>
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ইনভয়েস / মেমোর ফুটারে ধন্যবাদ বার্তা:
                </label>
                <input
                  type="text"
                  value={invoiceFooterNote}
                  onChange={(e) => {
                    markDirty();
                    setInvoiceFooterNote(e.target.value);
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button at the Bottom */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-500 font-medium">
            সক্রিয় পেমেন্ট নাম্বার: <strong>বিকাশ ({bkashNumber})</strong> | <strong>নগদ ({nagadNumber})</strong>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm rounded-xl transition shadow-lg shadow-amber-400/25 disabled:opacity-50 cursor-pointer active:scale-98"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'সংরক্ষণ করা হচ্ছে...' : 'সেটিংস সেভ করুন (Save All Settings)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
