import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Clock,
  Calendar,
  Plus,
  Trash2,
  Edit3,
  Save,
  Check,
  RefreshCw,
  Upload,
  Camera,
  Image as ImageIcon,
  Eye,
  AlertCircle,
  Sparkles,
  X,
  ShoppingBag,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  Sliders,
  DollarSign,
  Package,
  Palette,
  Layers,
  Target,
  MessageCircle,
  PhoneCall,
  Truck,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, StoreSettings } from '../types';

// Helper for mobile/pc image compression
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('দয়া করে কোনো ইমেজ ফাইল (JPG, PNG, WebP) নির্বাচন করুন।'));
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error('ইমেজ প্রসেস করা সম্ভব হয়নি।'));
    };
    reader.onerror = () => reject(new Error('ফাইল পড়তে ব্যর্থ হয়েছে।'));
  });
};

export const AdminHotDeals: React.FC = () => {
  const {
    products,
    categories,
    banners,
    advertisements,
    settings,
    updateSettingsAction,
    saveProductAction,
    saveBannerAction,
    saveAdAction,
    addToast,
  } = useStore();

  // Settings State
  const [isHotDealActive, setIsHotDealActive] = useState(settings.isHotDealActive ?? true);
  const [hotDealTitle, setHotDealTitle] = useState(
    settings.hotDealTitle || '🔥 আজকের ধামাকা হট ডিল (Flash Deals)'
  );
  const [hotDealSubtitle, setHotDealSubtitle] = useState(
    settings.hotDealSubtitle || 'সীমিত সময়ের মেগা অফার! দ্রুত অর্ডার করুন সময় ও স্টক শেষ হওয়ার আগেই'
  );
  const [hotDealBadgeText, setHotDealBadgeText] = useState(
    settings.hotDealBadgeText || 'স্পেশাল ডিসকাউন্ট • স্টক সীমিত!'
  );
  const [hotDealFestivalName, setHotDealFestivalName] = useState(
    settings.hotDealFestivalName || '🌙 ঈদ মেগা অফার'
  );

  // 🖼️ Background Picture & 🎭 Black Shadow Overlay State (শ্যাডো অন/অফ ও কালার কাস্টমাইজেশন)
  const [hotDealBannerImage, setHotDealBannerImage] = useState(
    settings.hotDealBannerImage || settings.hotDealHeaderBgImage || ''
  );
  const [hotDealShowOverlay, setHotDealShowOverlay] = useState(
    settings.hotDealShowOverlay !== false
  );
  const [hotDealOverlayColor, setHotDealOverlayColor] = useState(
    settings.hotDealOverlayColor || '#000000'
  );
  const [hotDealOverlayOpacity, setHotDealOverlayOpacity] = useState(
    settings.hotDealOverlayOpacity ?? 75
  );

  // 🎨 Hot Deal Theme & Color Customization (কালার কাস্টমাইজেশন)
  const [hotDealHeaderBgColor, setHotDealHeaderBgColor] = useState(
    settings.hotDealHeaderBgColor || ''
  );
  const [hotDealThemePreset, setHotDealThemePreset] = useState(
    settings.hotDealThemePreset || 'crimson_velvet'
  );

  // 📱 Top Bar & Trust Policy Customization (উপরে কাস্টমাইজযোগ্য ফোন, হোয়াটসঅ্যাপ ও পলিসি লেখা)
  const [topBarCodText, setTopBarCodText] = useState(
    settings.topBarCodText || 'Cash on Delivery (COD)'
  );
  const [topBarReturnText, setTopBarReturnText] = useState(
    settings.topBarReturnText || '7 Days Return Policy'
  );
  const [contactPhone, setContactPhone] = useState(
    settings.contactPhone || '+880 1712-345678'
  );
  const [whatsAppNumber, setWhatsAppNumber] = useState(
    settings.whatsAppNumber || '+880 1712-345678'
  );

  const [isUploadingBannerImage, setIsUploadingBannerImage] = useState(false);
  const bannerImageInputRef = useRef<HTMLInputElement>(null);

  // Track user edits so background updates don't wipe typed changes
  const isLoadedRef = useRef(false);
  const isDirtyRef = useRef(false);

  // Sync settings when initially loaded from Firestore or context
  useEffect(() => {
    if (settings && !isLoadedRef.current) {
      if (settings.hotDealFestivalName !== undefined) setHotDealFestivalName(settings.hotDealFestivalName);
      if (settings.hotDealTitle !== undefined) setHotDealTitle(settings.hotDealTitle);
      if (settings.hotDealSubtitle !== undefined) setHotDealSubtitle(settings.hotDealSubtitle);
      if (settings.hotDealBadgeText !== undefined) setHotDealBadgeText(settings.hotDealBadgeText);
      if (settings.isHotDealActive !== undefined) setIsHotDealActive(settings.isHotDealActive);
      if (settings.hotDealEndTime) setHotDealEndTime(formatIsoToDateTimeInput(settings.hotDealEndTime));
      if (settings.hotDealBannerImage !== undefined || settings.hotDealHeaderBgImage !== undefined) {
        setHotDealBannerImage(settings.hotDealBannerImage || settings.hotDealHeaderBgImage || '');
      }
      if (settings.hotDealShowOverlay !== undefined) setHotDealShowOverlay(settings.hotDealShowOverlay !== false);
      if (settings.hotDealOverlayColor !== undefined) setHotDealOverlayColor(settings.hotDealOverlayColor);
      if (settings.hotDealOverlayOpacity !== undefined) setHotDealOverlayOpacity(settings.hotDealOverlayOpacity);
      if (settings.hotDealHeaderBgColor !== undefined) setHotDealHeaderBgColor(settings.hotDealHeaderBgColor);
      if (settings.hotDealThemePreset !== undefined) setHotDealThemePreset(settings.hotDealThemePreset);
      if (settings.topBarCodText !== undefined) setTopBarCodText(settings.topBarCodText);
      if (settings.topBarReturnText !== undefined) setTopBarReturnText(settings.topBarReturnText);
      if (settings.contactPhone !== undefined) setContactPhone(settings.contactPhone);
      if (settings.whatsAppNumber !== undefined) setWhatsAppNumber(settings.whatsAppNumber);
      isLoadedRef.current = true;
    }
  }, [settings]);

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBannerImage(true);
    try {
      const dataUrl = await compressImageFile(file);
      setHotDealBannerImage(dataUrl);
      addToast('success', 'হট ডিল ব্যানার ছবি সফলভাবে নির্বাচন করা হয়েছে!');
    } catch (err: any) {
      addToast('error', err?.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে');
    } finally {
      setIsUploadingBannerImage(false);
      if (e.target) e.target.value = '';
    }
  };

  // Date and Time picker state (Format YYYY-MM-DDTHH:mm)
  const formatIsoToDateTimeInput = (isoString?: string) => {
    if (!isoString) {
      const d = new Date(Date.now() + 48 * 60 * 60 * 1000);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 16);
    }
    const d = new Date(isoString);
    if (isNaN(d.getTime())) {
      const fallback = new Date(Date.now() + 48 * 60 * 60 * 1000);
      fallback.setMinutes(fallback.getMinutes() - fallback.getTimezoneOffset());
      return fallback.toISOString().slice(0, 16);
    }
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const [hotDealEndTime, setHotDealEndTime] = useState(
    formatIsoToDateTimeInput(settings.hotDealEndTime)
  );
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Live timer state for preview inside Admin
  const [previewTimer, setPreviewTimer] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date(hotDealEndTime).getTime();
      const diff = target - Date.now();
      if (diff <= 0) {
        setPreviewTimer({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setPreviewTimer({ days, hours, minutes, seconds, isExpired: false });
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [hotDealEndTime]);

  // Shortcut setter for countdown duration
  const setDurationHours = (hoursToAdd: number) => {
    const d = new Date(Date.now() + hoursToAdd * 60 * 60 * 1000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setHotDealEndTime(d.toISOString().slice(0, 16));
    addToast('info', `টাইমার ${hoursToAdd} ঘণ্টার জন্য সেট করা হয়েছে!`);
  };

  const setDurationToMidnight = () => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setHotDealEndTime(d.toISOString().slice(0, 16));
    addToast('info', 'টাইমার আজকের রাত ১১:৫৯ পর্যন্ত সেট করা হয়েছে!');
  };

  // Save Settings Action
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      let isoDate = settings.hotDealEndTime || new Date(Date.now() + 48 * 3600 * 1000).toISOString();
      if (hotDealEndTime) {
        const parsed = new Date(hotDealEndTime);
        if (!isNaN(parsed.getTime())) {
          isoDate = parsed.toISOString();
        }
      }

      const updated: StoreSettings = {
        ...settings,
        isHotDealActive,
        hotDealFestivalName: hotDealFestivalName.trim(),
        hotDealTitle: hotDealTitle.trim(),
        hotDealSubtitle: hotDealSubtitle.trim(),
        hotDealBadgeText: hotDealBadgeText.trim(),
        hotDealEndTime: isoDate,
        hotDealBannerImage: hotDealBannerImage.trim(),
        hotDealHeaderBgImage: hotDealBannerImage.trim(),
        hotDealShowOverlay,
        hotDealOverlayColor,
        hotDealOverlayOpacity: Number(hotDealOverlayOpacity) || 0,
        hotDealHeaderBgColor: hotDealHeaderBgColor.trim(),
        hotDealThemePreset,
        topBarCodText: topBarCodText.trim(),
        topBarReturnText: topBarReturnText.trim(),
        contactPhone: contactPhone.trim(),
        whatsAppNumber: whatsAppNumber.trim(),
        updatedAt: new Date().toISOString(),
      };
      await updateSettingsAction(updated);
      isDirtyRef.current = false;
      addToast(
        'success',
        `🔥 ২ নাম্বার ছবির হট ডিল ও টাইমার সেটিংস সফলভাবে সেভ করা হয়েছে! অফার: "${hotDealFestivalName.trim() || 'হট ডিল'}"`
      );
    } catch (err: any) {
      addToast('error', 'সেটিংস সেভ করতে ব্যর্থ হয়েছে: ' + (err?.message || 'Error'));
    } finally {
      setIsSavingSettings(false);
    }
  };

  const [isSavingTopBar, setIsSavingTopBar] = useState(false);

  // Dedicated Save for Picture 1 (Top Bar & Trust Policy)
  const handleSaveTopBarSettings = async () => {
    setIsSavingTopBar(true);
    try {
      const updated: StoreSettings = {
        ...settings,
        topBarCodText: topBarCodText.trim(),
        topBarReturnText: topBarReturnText.trim(),
        contactPhone: contactPhone.trim(),
        whatsAppNumber: whatsAppNumber.trim(),
        updatedAt: new Date().toISOString(),
      };
      await updateSettingsAction(updated);
      isDirtyRef.current = false;
      addToast(
        'success',
        `✅ ১ নাম্বার ছবির টপ বার লেখা ও নম্বর সফলভাবে সেভ করা হয়েছে! (COD: ${topBarCodText.trim()}, রিটার্ন: ${topBarReturnText.trim()}, হটলাইন: ${contactPhone.trim()})`
      );
    } catch (err: any) {
      addToast('error', 'টপ বার সেটিংস সেভ করতে সমস্যা হয়েছে: ' + (err?.message || 'Error'));
    } finally {
      setIsSavingTopBar(false);
    }
  };

  // Modals
  const [isSelectExistingModalOpen, setIsSelectExistingModalOpen] = useState(false);
  const [isCreateNewModalOpen, setIsCreateNewModalOpen] = useState(false);
  const [editingDealProduct, setEditingDealProduct] = useState<Product | null>(null);

  // Form for adding from existing
  const [selectedProductId, setSelectedProductId] = useState('');
  const [dealPrice, setDealPrice] = useState<number | ''>('');
  const [dealStock, setDealStock] = useState<number | ''>(10);
  const [dealSold, setDealSold] = useState<number | ''>(25);
  const [dealBadge, setDealBadge] = useState('🔥 হট ডিল');

  // Form for creating new hot deal product
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState(categories[0]?.name || 'Smartphones & Gadgets');
  const [newRegularPrice, setNewRegularPrice] = useState<number | ''>('');
  const [newDealPrice, setNewDealPrice] = useState<number | ''>('');
  const [newStock, setNewStock] = useState<number | ''>(15);
  const [newSold, setNewSold] = useState<number | ''>(35);
  const [newBadge, setNewBadge] = useState('🔥 ধামাকা অফার');
  const [newImage, setNewImage] = useState('');
  const [newLinkedBannerId, setNewLinkedBannerId] = useState('');
  const [newLinkedBannerName, setNewLinkedBannerName] = useState('');
  const [newLinkedBannerLink, setNewLinkedBannerLink] = useState('');
  const [newLinkedBannerPosition, setNewLinkedBannerPosition] = useState('hero');
  const [autoUpdateBannerTarget, setAutoUpdateBannerTarget] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageInputTab, setImageInputTab] = useState<'upload' | 'camera' | 'url'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle direct file upload from PC or Mobile
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const compressed = await compressImageFile(file);
      setNewImage(compressed);
      addToast('success', 'মোবাইল/পিসি থেকে ছবি সফলভাবে যুক্ত হয়েছে!');
    } catch (err: any) {
      addToast('error', err?.message || 'ছবি আপলোড ব্যর্থ হয়েছে।');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Add existing product to hot deal
  const handleAddExistingToHotDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      addToast('info', 'একটি পণ্য নির্বাচন করুন।');
      return;
    }
    const targetProduct = products.find((p) => p.id === selectedProductId);
    if (!targetProduct) return;

    const priceNum = Number(dealPrice) || targetProduct.discountPrice || targetProduct.price;
    const discountPct = Math.round(
      ((targetProduct.price - priceNum) / targetProduct.price) * 100
    );

    const updatedProduct: Product = {
      ...targetProduct,
      isHotDeal: true,
      hotDealPrice: priceNum,
      hotDealDiscount: Math.max(5, discountPct),
      hotDealStock: Math.max(1, Number(dealStock) || 10),
      hotDealSold: Math.max(0, Number(dealSold) || 0),
      hotDealBadge: dealBadge.trim() || '🔥 হট ডিল',
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveProductAction(updatedProduct);
      addToast('success', `"${targetProduct.name}" সফলভাবে হট ডিলে যুক্ত হয়েছে!`);
      setIsSelectExistingModalOpen(false);
      setSelectedProductId('');
      setDealPrice('');
    } catch (err: any) {
      addToast('error', 'যুক্ত করতে সমস্যা হয়েছে।');
    }
  };

  // Save changes to existing hot deal product
  const handleUpdateDealProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDealProduct) return;

    const priceNum = Number(dealPrice) || editingDealProduct.discountPrice || editingDealProduct.price;
    const discountPct = Math.round(
      ((editingDealProduct.price - priceNum) / editingDealProduct.price) * 100
    );

    const updatedProduct: Product = {
      ...editingDealProduct,
      hotDealPrice: priceNum,
      hotDealDiscount: Math.max(5, discountPct),
      hotDealStock: Math.max(1, Number(dealStock) || 10),
      hotDealSold: Math.max(0, Number(dealSold) || 0),
      hotDealBadge: dealBadge.trim() || '🔥 হট ডিল',
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveProductAction(updatedProduct);
      addToast('success', 'হট ডিল আপডেট করা হয়েছে!');
      setEditingDealProduct(null);
    } catch (err: any) {
      addToast('error', 'আপডেট করতে ব্যর্থ হয়েছে।');
    }
  };

  // Remove product from hot deals
  const handleRemoveFromHotDeal = async (product: Product) => {
    if (!confirm(`আপনি কি "${product.name}" হট ডিল থেকে সরাতে চান?`)) return;
    try {
      const updatedProduct: Product = {
        ...product,
        isHotDeal: false,
        updatedAt: new Date().toISOString(),
      };
      await saveProductAction(updatedProduct);
      addToast('info', `"${product.name}" হট ডিল থেকে সরিয়ে দেওয়া হয়েছে।`);
    } catch (err: any) {
      addToast('error', 'সরানো যায়নি।');
    }
  };

  // Create new hot deal product
  const handleCreateNewHotDealProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newRegularPrice || !newDealPrice) {
      addToast('info', 'পণ্যের নাম, নিয়মিত মূল্য এবং হট ডিল মূল্য প্রদান করুন।');
      return;
    }

    const regPrice = Number(newRegularPrice);
    const dPrice = Number(newDealPrice);
    const discountPct = Math.round(((regPrice - dPrice) / regPrice) * 100);

    const defaultImg =
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
    const finalImage = newImage.trim() || defaultImg;

    const newProduct: Product = {
      id: `hotdeal-${Date.now()}`,
      name: newName.trim(),
      description: `${newName.trim()} - আজকের বিশেষ হট ডিল অফার! দ্রুত ডেলিভারি এবং জেনুইন কোয়ালিটি নিশ্চয়তা।`,
      price: regPrice,
      discountPrice: dPrice,
      discountPercentage: discountPct,
      rating: 5.0,
      reviewCount: 12,
      stock: Math.max(1, Number(newStock) || 15),
      salesCount: Math.max(0, Number(newSold) || 35),
      category: newCategory,
      sku: `HD-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'published',
      isFeatured: true,
      isBestseller: true,
      isHotDeal: true,
      hotDealPrice: dPrice,
      hotDealDiscount: Math.max(5, discountPct),
      hotDealStock: Math.max(1, Number(newStock) || 15),
      hotDealSold: Math.max(0, Number(newSold) || 35),
      hotDealBadge: newBadge.trim() || '🔥 হট ডিল',
      linkedBannerId: newLinkedBannerId.trim() || undefined,
      linkedBannerName: newLinkedBannerName.trim() || undefined,
      linkedBannerLink: newLinkedBannerLink.trim() || undefined,
      linkedBannerPosition: newLinkedBannerPosition || undefined,
      images: [finalImage],
      frontImage: finalImage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveProductAction(newProduct);

      // Auto update banner button link if selected
      if (autoUpdateBannerTarget && newLinkedBannerId && newLinkedBannerId !== 'custom') {
        const targetBanner = banners.find((b) => b.id === newLinkedBannerId);
        if (targetBanner) {
          const finalLink = newLinkedBannerLink.trim() || `/product/${newProduct.id}`;
          await saveBannerAction({
            ...targetBanner,
            buttonLink: finalLink,
            targetProductId: newProduct.id,
          });
          addToast('info', `ব্যানার "${targetBanner.title}" এর লিঙ্ক এই পণ্যের সাথে যুক্ত হয়েছে!`);
        } else {
          const targetAd = advertisements.find((a) => a.id === newLinkedBannerId);
          if (targetAd) {
            const finalLink = newLinkedBannerLink.trim() || `/product/${newProduct.id}`;
            await saveAdAction({
              ...targetAd,
              linkUrl: finalLink,
              targetProductId: newProduct.id,
            });
            addToast('info', `বিজ্ঞাপন "${targetAd.title}" এর লিঙ্ক এই পণ্যের সাথে যুক্ত হয়েছে!`);
          }
        }
      }

      addToast('success', 'নতুন হট ডিল পণ্য সফলভাবে তৈরি ও পাবলিশ করা হয়েছে!');
      setIsCreateNewModalOpen(false);
      // Reset form
      setNewName('');
      setNewRegularPrice('');
      setNewDealPrice('');
      setNewImage('');
      setNewLinkedBannerId('');
      setNewLinkedBannerName('');
      setNewLinkedBannerLink('');
    } catch (err: any) {
      addToast('error', 'পণ্য তৈরি করতে সমস্যা হয়েছে: ' + (err?.message || 'Error'));
    }
  };

  // Filter current active hot deal products
  const hotDealProducts = products.filter(
    (p) => p.status === 'published' && p.isHotDeal
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md shadow-rose-500/20">
              <Flame className="w-5 h-5 fill-current" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              🔥 হট ডিল ও ফ্ল্যাশ সেল ম্যানেজার (Hot Deals)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            হোমপেজের ব্যানার এর ঠিক নিচে স্পেশাল ডিসকাউন্ট পণ্য, লাইভ কাউন্টডাউন টাইমার এবং স্টক প্রগ্রেস বার পরিচালনা করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsSelectExistingModalOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>স্টোর থেকে পণ্য যুক্ত করুন</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateNewModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-rose-600 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-500/25 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>মোবাইল/পিসি ছবি দিয়ে নতুন ডিল তৈরি</span>
          </button>
        </div>
      </div>

      {/* 🌟 ১ নাম্বার ছবি: পেজের একদম শীর্ষে টপ বার ও ট্রাস্ট পলিসি কাস্টমাইজার (Top Bar & Trust Policy Customization) */}
      <div className="bg-white rounded-3xl border-2 border-indigo-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  🌟 ১ নাম্বার ছবির সেটিংস
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  হেডারের উপরে সরাসরি দৃশ্যমান
                </span>
              </div>
              <h2 className="text-base font-black text-slate-900 mt-0.5">
                টপ বার ও কাস্টমার ট্রাস্ট পলিসি (Cash on Delivery, Return & Hotline)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                ক্যাশ অন ডেলিভারি, ৭ দিনের রিটার্ন পলিসি, হটলাইন ফোন ও হোয়াটসঅ্যাপ সরাসরি কাস্টমাইজ করে সেভ করুন।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveTopBarSettings}
            disabled={isSavingTopBar}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
          >
            {isSavingTopBar ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>সেভ হচ্ছে...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>১ নাম্বার ছবির সেটিংস সেভ করুন</span>
              </>
            )}
          </button>
        </div>

        {/* 4 Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Cash on Delivery Text */}
          <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-1.5">
            <label className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>১. ক্যাশ অন ডেলিভারি (COD) লেখা:</span>
            </label>
            <input
              type="text"
              value={topBarCodText}
              onChange={(e) => {
                isDirtyRef.current = true;
                setTopBarCodText(e.target.value);
              }}
              placeholder="Cash on Delivery (COD)"
              className="w-full text-xs font-bold p-2.5 bg-white border border-emerald-300 rounded-xl focus:border-emerald-600 outline-hidden text-slate-950 shadow-xs"
            />
            <p className="text-[10px] text-emerald-800">
              গ্রাহক ক্লিক করলে সম্পূর্ণ ক্যাশ অন ডেলিভারি পলিসি পপআপে দেখাবে।
            </p>
          </div>

          {/* 2. 7 Days Return Policy Text */}
          <div className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-1.5">
            <label className="text-xs font-black text-rose-950 flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>২. রিটার্ন পলিসি লেখা:</span>
            </label>
            <input
              type="text"
              value={topBarReturnText}
              onChange={(e) => {
                isDirtyRef.current = true;
                setTopBarReturnText(e.target.value);
              }}
              placeholder="7 Days Return Policy"
              className="w-full text-xs font-bold p-2.5 bg-white border border-rose-300 rounded-xl focus:border-rose-600 outline-hidden text-slate-950 shadow-xs"
            />
            <p className="text-[10px] text-rose-800">
              গ্রাহক ক্লিক করলে ৭ দিনের সহজ রিটার্ন শর্তাবলী পপআপে দেখাবে।
            </p>
          </div>

          {/* 3. Customer Care Phone */}
          <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-1.5">
            <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
              <span>৩. হটলাইন ফোন নম্বর:</span>
            </label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => {
                isDirtyRef.current = true;
                setContactPhone(e.target.value);
              }}
              placeholder="+880 1712-345678"
              className="w-full text-xs font-mono font-bold p-2.5 bg-white border border-amber-300 rounded-xl focus:border-amber-600 outline-hidden text-slate-950 shadow-xs"
            />
            <p className="text-[10px] text-amber-800">
              গ্রাহক ক্লিক করলে সরাসরি তার ফোনে কল ডায়াল হবে (tel:)।
            </p>
          </div>

          {/* 4. WhatsApp Chat Number */}
          <div className="p-3.5 bg-teal-50/50 rounded-2xl border border-teal-200 space-y-1.5">
            <label className="text-xs font-black text-teal-950 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-teal-600" />
              <span>৪. হোয়াটসঅ্যাপ সাপোর্ট নম্বর:</span>
            </label>
            <input
              type="text"
              value={whatsAppNumber}
              onChange={(e) => {
                isDirtyRef.current = true;
                setWhatsAppNumber(e.target.value);
              }}
              placeholder="+880 1712-345678"
              className="w-full text-xs font-mono font-bold p-2.5 bg-white border border-teal-300 rounded-xl focus:border-teal-600 outline-hidden text-slate-950 shadow-xs"
            />
            <p className="text-[10px] text-teal-800">
              গ্রাহক ক্লিক করলে সরাসরি হোয়াটসঅ্যাপ অ্যাপে চ্যাট শুরু হবে।
            </p>
          </div>
        </div>

        {/* Live Top Bar Mini Preview */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>লাইভ টপ বার প্রিভিউ (হোমপেজের একদম উপরে যেমন দেখাচ্ছে):</span>
            <span className="text-[11px] text-slate-400 font-medium">ক্লিক করে পরীক্ষা করতে পারেন</span>
          </div>
          <div className="bg-[#0B192C] text-slate-200 text-xs py-2 px-3 sm:px-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 shadow-inner">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 font-bold text-[11px]">
                <Truck className="w-3 h-3 text-emerald-400" />
                <span>{topBarCodText || 'Cash on Delivery (COD)'}</span>
              </span>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-950/90 border border-rose-500/60 text-rose-300 font-bold text-[11px]">
                <RotateCcw className="w-3 h-3 text-rose-400" />
                <span>{topBarReturnText || '7 Days Return Policy'}</span>
              </span>
              <span className="text-slate-400 text-[11px] hidden md:inline">
                | ডেলিভারি চার্জ: ঢাকার ভিতরে ৳{settings.deliveryFeeInsideDhaka ?? 60} | ঢাকার বাহিরে ৳{settings.deliveryFeeOutsideDhaka ?? 120}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-slate-200 font-bold">
                <PhoneCall className="w-3 h-3 text-amber-400" />
                <span>হটলাইন: {contactPhone || '+880 1712-345678'}</span>
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <MessageCircle className="w-3 h-3" />
                <span>WhatsApp</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 ২ নাম্বার ছবি: উৎসবের নাম, ব্যানার ও লাইভ টাইমার সেটিংস (Hot Deals, Festival Name & Big Countdown Timer) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-rose-100 text-rose-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  🔥 ২ নাম্বার ছবির সেটিংস
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  বড় লাইভ কাউন্টডাউন টাইমার
                </span>
              </div>
              <h2 className="text-base font-black text-slate-900 mt-0.5">
                হট ডিল ব্যানার, উৎসবের নাম (Eid Special) ও লাইভ টাইমার
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                অফারের শেষ তারিখ, বড় কাউন্টডাউন টাইমার, উৎসবের নাম (Eid Special) এবং ব্যানার টাইটেল কনফিগার করুন
              </p>
            </div>
          </div>

          {/* Master Enable/Disable Toggle */}
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <span className="text-xs font-black text-slate-800">
              হোমপেজে হট ডিল প্রদর্শন:
            </span>
            <button
              type="button"
              onClick={() => setIsHotDealActive(!isHotDealActive)}
              className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors cursor-pointer ${
                isHotDealActive ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isHotDealActive ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className={`text-xs font-black ${
                isHotDealActive ? 'text-emerald-700' : 'text-slate-500'
              }`}
            >
              {isHotDealActive ? 'চালু (Active)' : 'বন্ধ (Off)'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Title, Subtitle, Badge, and Datetime */}
          <div className="lg:col-span-7 space-y-4">
            {/* 🎉 উৎসব বা বিশেষ অফারের নাম (যেমন: ঈদ স্পেশাল / ঈদ অফার / Eid Special) */}
            <div className="p-3.5 bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 rounded-2xl border-2 border-rose-300 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-rose-950 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-600 fill-current" />
                  <span>🎉 উৎসব বা বিশেষ অফারের নাম (Festival / Occasion Name)</span>
                </label>
                <span className="text-[10px] bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-full font-bold">
                  যেমন: Eid Special / ঈদ অফার
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hotDealFestivalName}
                  onChange={(e) => {
                    isDirtyRef.current = true;
                    setHotDealFestivalName(e.target.value);
                  }}
                  placeholder="যেমন: Eid Special / 🌙 ঈদ মেগা অফার / 🔥 স্পেশাল অফার"
                  className="flex-1 text-xs font-bold p-3 bg-white border-2 border-rose-300 rounded-xl focus:border-rose-600 outline-hidden text-slate-950 shadow-xs"
                />
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                  title="অফারের নাম অবিলম্বে সেভ করুন"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingSettings ? 'সেভ হচ্ছে...' : 'সেভ করুন'}</span>
                </button>
              </div>
              <p className="text-[11px] text-rose-800 font-medium">
                এখানে যে নাম দিবেন (যেমন: <b>Eid Special</b> বা <b>ঈদ অফার</b>), তা হোমপেজের হট ডিল ব্যানারের সামনে লাইভ টাইমারের ঠিক পাশে আকর্ষণীয় লাল ব্যাজে ও টাইটেলে বড় করে প্রদর্শিত হবে।
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1.5">
                  সেকশন টাইটেল (Title) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={hotDealTitle}
                  onChange={(e) => {
                    isDirtyRef.current = true;
                    setHotDealTitle(e.target.value);
                  }}
                  placeholder="যেমন: Hot Discount Specials"
                  className="w-full text-xs font-bold p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:bg-white outline-hidden text-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1.5">
                  স্পেশাল ব্যাজ টেক্সট (Badge)
                </label>
                <input
                  type="text"
                  value={hotDealBadgeText}
                  onChange={(e) => {
                    isDirtyRef.current = true;
                    setHotDealBadgeText(e.target.value);
                  }}
                  placeholder="যেমন: সীমিত সময়ের মেগা অফার!"
                  className="w-full text-xs font-bold p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:bg-white outline-hidden text-slate-950"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">
                সাবটাইটেল / অফার বিবরণ (Subtitle)
              </label>
              <input
                type="text"
                value={hotDealSubtitle}
                onChange={(e) => {
                  isDirtyRef.current = true;
                  setHotDealSubtitle(e.target.value);
                }}
                placeholder="যেমন: দ্রুত অর্ডার করুন সময় এবং স্টক শেষ হওয়ার আগেই!"
                className="w-full text-xs font-bold p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:bg-white outline-hidden text-slate-950"
              />
            </div>

            {/* 🎨 HOT DEAL THEME & COLOR CUSTOMIZATION (আগের কালার অপশন) */}
            <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl border-2 border-indigo-400/50 space-y-3.5 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-400" />
                  <div>
                    <h4 className="text-xs font-black text-indigo-200">
                      🎨 হট ডিল থিম ও কালার অপশন (Theme & Background Color)
                    </h4>
                    <p className="text-[10px] text-slate-300">
                      হট ডিল সেকশনের জন্য পছন্দের কালার বা থিম প্রিসেট নির্বাচন করুন
                    </p>
                  </div>
                </div>

                {hotDealHeaderBgColor && (
                  <button
                    type="button"
                    onClick={() => {
                      setHotDealHeaderBgColor('');
                      setHotDealThemePreset('crimson_velvet');
                    }}
                    className="text-[10px] text-indigo-300 hover:text-white underline cursor-pointer"
                  >
                    ডিফল্ট কালার
                  </button>
                )}
              </div>

              {/* Theme Presets */}
              <div className="space-y-1.5 pt-1 border-t border-white/10">
                <label className="text-[11px] font-bold text-slate-300 block">
                  কুইক থিম প্রিসেট:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { id: 'crimson_velvet', name: '🌙 ঈদ স্পেশাল (Crimson)', color: '#170712' },
                    { id: 'royal_gold', name: '👑 রয়েল গোল্ড (Royal)', color: '#1c1402' },
                    { id: 'midnight_obsidian', name: '🌌 মিডনাইট (Purple)', color: '#150926' },
                    { id: 'emerald_festive', name: '🌿 এমারেল্ড (Green)', color: '#04291f' },
                    { id: 'deep_slate', name: '🌑 ডার্ক স্লেট (Slate)', color: '#0f172a' },
                    { id: 'custom', name: '🎨 কাস্টম কালার (Custom)', color: '#000000' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setHotDealThemePreset(preset.id);
                        if (preset.id !== 'custom') {
                          setHotDealHeaderBgColor('');
                        }
                      }}
                      className={`px-2.5 py-2 rounded-xl text-[11px] font-bold text-left transition cursor-pointer border flex items-center gap-2 ${
                        hotDealThemePreset === preset.id
                          ? 'bg-white/20 text-white border-amber-400 ring-2 ring-amber-400/40 shadow-xs'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0"
                        style={{ backgroundColor: preset.color }}
                      />
                      <span className="truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color Picker */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                  <span>কাস্টম ব্যাকগ্রাউন্ড কালার / হেক্স কোড:</span>
                  {hotDealHeaderBgColor && (
                    <span className="font-mono text-amber-300 text-[10px]">{hotDealHeaderBgColor}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={hotDealHeaderBgColor || '#170712'}
                    onChange={(e) => {
                      setHotDealHeaderBgColor(e.target.value);
                      setHotDealThemePreset('custom');
                    }}
                    className="w-10 h-10 rounded-xl border-2 border-white/20 cursor-pointer bg-transparent shrink-0"
                    title="কালার নির্বাচন করুন"
                  />
                  <input
                    type="text"
                    value={hotDealHeaderBgColor}
                    onChange={(e) => {
                      setHotDealHeaderBgColor(e.target.value);
                      setHotDealThemePreset('custom');
                    }}
                    placeholder="যেমন: #170712 বা linear-gradient(...)"
                    className="flex-1 text-xs p-2.5 bg-white/10 border border-white/20 text-white rounded-xl focus:border-amber-400 outline-hidden font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 🖼️ BACKGROUND PICTURE & 🎭 BLACK SHADOW OVERLAY CONTROLS */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl border-2 border-amber-400/50 space-y-3.5 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🖼️</span>
                  <div>
                    <h4 className="text-xs font-black text-amber-300">
                      হট ডিল ব্যাকগ্রাউন্ড ছবি ও ব্ল্যাক শ্যাডো (Picture & Shadow Settings)
                    </h4>
                    <p className="text-[10px] text-slate-300">
                      ছবি আপলোড করুন, এবং ছবির ওপর কালো শ্যাডো চালু/বন্ধ বা পছন্দের কালার দিন
                    </p>
                  </div>
                </div>

                {/* ON / OFF Switch for Shadow */}
                <button
                  type="button"
                  onClick={() => setHotDealShowOverlay(!hotDealShowOverlay)}
                  className={`px-3 py-1 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-xs ${
                    hotDealShowOverlay
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      : 'bg-rose-600 text-white hover:bg-rose-500'
                  }`}
                >
                  {hotDealShowOverlay ? '✓ শ্যাডো চালু (ON)' : '✕ শ্যাডো বন্ধ (OFF)'}
                </button>
              </div>

              {/* Picture Upload / URL Input */}
              <div className="space-y-2 pt-1 border-t border-white/10">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                  <span>হট ডিল ব্যানার / ব্যাকগ্রাউন্ড ছবি:</span>
                  {hotDealBannerImage && (
                    <button
                      type="button"
                      onClick={() => setHotDealBannerImage('')}
                      className="text-[10px] text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                    >
                      ছবি মুছুন
                    </button>
                  )}
                </div>

                <input
                  ref={bannerImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerImageUpload}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => bannerImageInputRef.current?.click()}
                    disabled={isUploadingBannerImage}
                    className="py-2.5 px-3 border border-dashed border-amber-400/60 bg-white/5 hover:bg-white/10 rounded-xl text-center cursor-pointer transition flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">
                      {isUploadingBannerImage ? 'আপলোড হচ্ছে...' : '📁 কম্পিউটার বা মোবাইল থেকে আপলোড'}
                    </span>
                  </button>

                  <input
                    type="url"
                    placeholder="বা ছবির লিঙ্ক (URL) পেস্ট করুন..."
                    value={hotDealBannerImage}
                    onChange={(e) => setHotDealBannerImage(e.target.value)}
                    className="text-xs p-2.5 bg-white/10 border border-white/20 text-white rounded-xl focus:border-amber-400 outline-hidden font-bold placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Shadow Color & Opacity if Shadow is ON */}
              {hotDealShowOverlay ? (
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Color Picker & Quick Presets */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-200 block">
                        শ্যাডোর কালার (Shadow Color):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={hotDealOverlayColor}
                          onChange={(e) => setHotDealOverlayColor(e.target.value)}
                          className="w-9 h-9 rounded-lg border-2 border-white/20 cursor-pointer bg-transparent"
                          title="কালার নির্বাচন করুন"
                        />
                        <div className="flex items-center gap-1 flex-wrap">
                          {[
                            { label: 'কালো', hex: '#000000' },
                            { label: 'নেভি', hex: '#0f172a' },
                            { label: 'বার্গান্ডি', hex: '#450a0a' },
                            { label: 'পার্পল', hex: '#3b0764' },
                            { label: 'গ্রিন', hex: '#064e3b' },
                          ].map((preset) => (
                            <button
                              key={preset.hex}
                              type="button"
                              onClick={() => setHotDealOverlayColor(preset.hex)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer border ${
                                hotDealOverlayColor === preset.hex
                                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                                  : 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/20'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Opacity Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                        <span>শ্যাডোর ডার্কনেস (Darkness):</span>
                        <span className="text-amber-300 font-mono font-black">{hotDealOverlayOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="95"
                        step="5"
                        value={hotDealOverlayOpacity}
                        onChange={(e) => setHotDealOverlayOpacity(Number(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                        <span>১০% (হালকা)</span>
                        <span>৫০% (মিডিয়াম)</span>
                        <span>৯৫% (গাঢ় ডার্ক)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-amber-200 bg-amber-500/10 p-2.5 rounded-xl border border-amber-400/20 font-medium">
                  ✨ <b>শ্যাডো বন্ধ রাখা হয়েছে:</b> হোমপেজে আপনার ছবি ১০০% আসল রঙে, সম্পূর্ণ পরিষ্কার ও আলো ঝলমলে অবস্থায় দেখাবে। কোনো কালো শ্যাডো থাকবে না।
                </p>
              )}
            </div>

            {/* DATE & TIME PICKER WITH SHORTCUTS */}
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-700" />
                  <span>অফারের শেষ তারিখ ও সময় (Expiration Date & Time)</span>
                </label>
                <span className="text-[11px] font-bold text-amber-700">
                  হোমপেজে লাইভ টাইমার চলবে
                </span>
              </div>

              <input
                type="datetime-local"
                value={hotDealEndTime}
                onChange={(e) => setHotDealEndTime(e.target.value)}
                className="w-full text-sm font-black p-3 bg-white border-2 border-amber-300 rounded-xl focus:border-amber-600 outline-hidden text-slate-950 shadow-xs"
              />

              {/* Quick Duration Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-600 mr-1">
                  কুইক সেট:
                </span>
                <button
                  type="button"
                  onClick={() => setDurationHours(12)}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 text-slate-800 font-bold text-[11px] rounded-lg border border-amber-200 transition cursor-pointer"
                >
                  +১২ ঘণ্টা
                </button>
                <button
                  type="button"
                  onClick={() => setDurationHours(24)}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 text-slate-800 font-bold text-[11px] rounded-lg border border-amber-200 transition cursor-pointer"
                >
                  +২৪ ঘণ্টা (১ দিন)
                </button>
                <button
                  type="button"
                  onClick={() => setDurationHours(48)}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 text-slate-800 font-bold text-[11px] rounded-lg border border-amber-200 transition cursor-pointer"
                >
                  +৪৮ ঘণ্টা (২ দিন)
                </button>
                <button
                  type="button"
                  onClick={() => setDurationHours(72)}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 text-slate-800 font-bold text-[11px] rounded-lg border border-amber-200 transition cursor-pointer"
                >
                  +৩ দিন
                </button>
                <button
                  type="button"
                  onClick={setDurationToMidnight}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] rounded-lg shadow-xs transition cursor-pointer"
                >
                  আজ রাত ১১:৫৯
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSavingSettings ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>সেভ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>🔥 হট ডিল সেটিংস সেভ করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Live Preview on Website (আগের মতো নিখুঁত প্রিভিউ) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-900">
                <Flame className="w-4 h-4 fill-current text-rose-600" />
                <span>লাইভ প্রিভিউ (হোমপেজে যেমন দেখাবে)</span>
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                {isHotDealActive ? "সক্রিয় (Active)" : "বন্ধ (Off)"}
              </span>
            </div>

            {/* Unified Preview Box matching image.png with Live Background & Shadow */}
            <div
              className="rounded-2xl p-5 border border-rose-500/30 shadow-xl relative overflow-hidden text-white space-y-4 transition-all"
              style={{
                background: hotDealBannerImage
                  ? '#08080c'
                  : (hotDealHeaderBgColor ||
                     (hotDealThemePreset === 'royal_gold'
                       ? 'linear-gradient(135deg, #1c1402 0%, #2e2003 50%, #120d01 100%)'
                       : hotDealThemePreset === 'midnight_obsidian'
                       ? 'linear-gradient(135deg, #150926 0%, #0c0617 50%, #04020a 100%)'
                       : hotDealThemePreset === 'emerald_festive'
                       ? 'linear-gradient(135deg, #04291f 0%, #021712 50%, #010b08 100%)'
                       : hotDealThemePreset === 'deep_slate'
                       ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #020617 100%)'
                       : 'linear-gradient(135deg, #170712 0%, #280a1e 50%, #12040e 100%)')),
              }}
            >
              {/* Optional Background Picture in Preview */}
              {hotDealBannerImage && (
                <img
                  src={hotDealBannerImage}
                  alt=""
                  className={`absolute inset-0 w-full h-full object-cover ${
                    hotDealShowOverlay ? 'opacity-90' : 'opacity-100'
                  }`}
                />
              )}

              {/* Shadow Overlay in Preview */}
              {hotDealBannerImage && hotDealShowOverlay && (
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-300"
                  style={{
                    backgroundColor: hotDealOverlayColor,
                    opacity: hotDealOverlayOpacity / 100,
                  }}
                />
              )}

              {/* Top row: Pill 1 (Red Festival Badge) + Pill 2 (BIG LIVE COUNTDOWN TIMER RIGHT IN FRONT) */}
              <div className="relative z-10 flex flex-wrap items-center gap-2.5">
                {/* 🌙 উৎসব বা বিশেষ অফারের নাম (যেমন: ঈদ অফার) */}
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white text-xs font-black uppercase tracking-wider shadow-md border border-red-400/40">
                  <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-300 animate-pulse" />
                  <span>
                    {hotDealFestivalName || hotDealBadgeText || '🌙 ঈদ মেগা অফার (EID MEGA DEALS)'}
                  </span>
                </span>

                {/* ⏰ হট ডিলের সময় সামনে বড় থাকবে (BIG PROMINENT COUNTDOWN TIMER) */}
                <div className="flex items-center gap-2 bg-black/90 backdrop-blur-md px-3 py-2 rounded-xl border border-amber-400 shadow-lg">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span className="text-xs text-amber-300 font-bold px-0.5 hidden sm:inline">বাকি:</span>
                  {previewTimer.days > 0 && (
                    <>
                      <div className="flex flex-col items-center bg-slate-900 border border-amber-400/50 rounded-lg px-2 py-1 min-w-[36px]">
                        <span className="font-mono text-sm sm:text-base font-black text-amber-300">
                          {String(previewTimer.days).padStart(2, '0')}
                        </span>
                        <span className="text-[8px] text-slate-300 font-bold">দিন</span>
                      </div>
                      <span className="text-amber-400 font-bold text-sm">:</span>
                    </>
                  )}
                  <div className="flex flex-col items-center bg-slate-900 border border-amber-400/50 rounded-lg px-2 py-1 min-w-[36px]">
                    <span className="font-mono text-sm sm:text-base font-black text-white">
                      {String(previewTimer.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[8px] text-slate-300 font-bold">ঘণ্টা</span>
                  </div>
                  <span className="text-amber-400 font-bold text-sm">:</span>
                  <div className="flex flex-col items-center bg-slate-900 border border-amber-400/50 rounded-lg px-2 py-1 min-w-[36px]">
                    <span className="font-mono text-sm sm:text-base font-black text-white">
                      {String(previewTimer.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[8px] text-slate-300 font-bold">মিনিট</span>
                  </div>
                  <span className="text-amber-400 font-bold text-sm">:</span>
                  <div className="flex flex-col items-center bg-rose-950 border border-rose-500 rounded-lg px-2 py-1 min-w-[36px] animate-pulse">
                    <span className="font-mono text-sm sm:text-base font-black text-rose-300">
                      {String(previewTimer.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[8px] text-rose-200 font-bold">সেকেন্ড</span>
                  </div>
                </div>
              </div>

              {/* Title & Button row */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-white tracking-tight flex flex-wrap items-center gap-1.5 drop-shadow-sm">
                    <span>{hotDealTitle || 'Hot Discount Specials'}</span>
                    <span className="text-amber-400 font-black">
                      {hotDealFestivalName ? `(${hotDealFestivalName})` : '(হট ডিসকাউন্ট স্পেশাল)'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed">
                    {hotDealSubtitle || 'সেরা মানের জনপ্রিয় গ্যাজেট, ফোন ও ফ্যাশন পোশাকে সর্বোচ্চ ছাড় (ঢাকার ভিতরে ৳৬০ এবং ঢাকার বাহিরে ৳১২০ ডেলিভারি চার্জ)!'}
                  </p>
                </div>

                <div className="shrink-0">
                  <span className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-[11px] rounded-full shadow-md border border-amber-300 pointer-events-none">
                    <span>সবগুলো অফার দেখুন</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                </div>
              </div>

              <div className="relative z-10 pt-2 text-center border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="font-bold text-amber-300">
                  মোট {hotDealProducts.length} টি পণ্য এই অফারে যুক্ত রয়েছে
                </span>
                <span className="text-slate-300 text-[10px]">
                  {hotDealShowOverlay ? `শ্যাডো: ${hotDealOverlayOpacity}% (${hotDealOverlayColor})` : 'শ্যাডো বন্ধ'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE HOT DEAL PRODUCTS LIST */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-600" />
              <span>বর্তমান সক্রিয় হট ডিল পণ্যসমূহ ({hotDealProducts.length} টি)</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              এই পণ্যগুলো হোমপেজের ব্যানার এর ঠিক নিচে স্পেশাল ডিসকাউন্ট ও স্টক বার সহ প্রদর্শিত হচ্ছে
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSelectExistingModalOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>আরও পণ্য যুক্ত করুন</span>
            </button>
          </div>
        </div>

        {hotDealProducts.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <p className="text-sm font-black text-slate-900">
              বর্তমানে কোনো পণ্য হট ডিলে যুক্ত নেই!
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              উপরের বোতামগুলো ব্যবহার করে বিদ্যমান পণ্য হট ডিলে আনুন অথবা আপনার মোবাইল/পিসি থেকে ছবি আপলোড করে সরাসরি নতুন হট ডিল তৈরি করুন।
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSelectExistingModalOpen(true)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                বিদ্যমান পণ্য নির্বাচন করুন
              </button>
              <button
                type="button"
                onClick={() => setIsCreateNewModalOpen(true)}
                className="px-4 py-2 bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs"
              >
                নতুন পণ্য তৈরি করুন
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {hotDealProducts.map((p) => {
              const dPrice = p.hotDealPrice ?? p.discountPrice ?? p.price;
              const sold = p.hotDealSold ?? 30;
              const stock = p.hotDealStock ?? p.stock ?? 10;
              const total = sold + stock;
              const soldPct = Math.min(95, Math.max(10, Math.round((sold / total) * 100)));

              return (
                <div
                  key={p.id}
                  className="bg-slate-50 hover:bg-white border-2 border-slate-200 hover:border-amber-400 rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between shadow-2xs hover:shadow-md"
                >
                  <div>
                    {/* Thumbnail & Badges */}
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white border border-slate-200 mb-3">
                      <img
                        src={p.frontImage || p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                        <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                          -{p.hotDealDiscount || 20}% ছাড়
                        </span>
                        {p.hotDealBadge && (
                          <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                            {p.hotDealBadge}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider line-clamp-1 mb-1">
                      {p.category}
                    </p>
                    <h3 className="text-xs font-black text-slate-900 line-clamp-2 leading-tight mb-2">
                      {p.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-base font-black text-rose-600">
                        ৳{dPrice.toLocaleString()}
                      </span>
                      {p.price > dPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          ৳{p.price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Stock Status Bar */}
                    <div className="bg-white p-2 rounded-xl border border-slate-200 space-y-1 mb-3">
                      <div className="flex items-center justify-between text-[10px] font-black">
                        <span className="text-rose-600">🔥 বিক্রি: {sold}</span>
                        <span className="text-slate-600">বাকি: {stock}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-rose-600 rounded-full"
                          style={{ width: `${soldPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDealProduct(p);
                        setDealPrice(p.hotDealPrice ?? p.discountPrice ?? p.price);
                        setDealStock(p.hotDealStock ?? p.stock);
                        setDealSold(p.hotDealSold ?? 30);
                        setDealBadge(p.hotDealBadge ?? '🔥 হট ডিল');
                      }}
                      className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>এডিট</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveFromHotDeal(p)}
                      className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer border border-rose-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>সরান</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: SELECT EXISTING PRODUCT TO ADD TO HOT DEALS */}
      {isSelectExistingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-600" />
                <span>স্টোর থেকে হট ডিলে পণ্য যোগ করুন</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSelectExistingModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExistingToHotDeal} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1.5">
                  পণ্য নির্বাচন করুন <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const sel = products.find((p) => p.id === e.target.value);
                    if (sel) {
                      setDealPrice(
                        sel.discountPrice || Math.round(sel.price * 0.85)
                      );
                      setDealStock(sel.stock || 10);
                    }
                  }}
                  className="w-full text-xs font-bold p-3 bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-amber-500 text-slate-950 outline-hidden"
                >
                  <option value="">-- ড্রপডাউন থেকে পণ্য নির্বাচন করুন --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (মূল্য: ৳{p.price.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    হট ডিল বিশেষ মূল্য (৳) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={dealPrice}
                    onChange={(e) => setDealPrice(e.target.value ? Number(e.target.value) : '')}
                    placeholder="যেমন: ৪৯৯"
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-amber-500 text-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    স্পেশাল ব্যাজ
                  </label>
                  <input
                    type="text"
                    value={dealBadge}
                    onChange={(e) => setDealBadge(e.target.value)}
                    placeholder="যেমন: 🔥 হট ডিল"
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-amber-500 text-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    হট ডিল স্টক সংখ্যা
                  </label>
                  <input
                    type="number"
                    value={dealStock}
                    onChange={(e) => setDealStock(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    বিক্রি হয়েছে সংখ্যা (বার এর জন্য)
                  </label>
                  <input
                    type="number"
                    value={dealSold}
                    onChange={(e) => setDealSold(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-950"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSelectExistingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
                >
                  হট ডিলে যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE NEW PRODUCT DIRECTLY WITH MOBILE/PC PICTURE UPLOAD */}
      {isCreateNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-rose-600" />
                <span>মোবাইল বা পিসি থেকে ছবি দিয়ে নতুন হট ডিল তৈরি</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateNewModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewHotDealProduct} className="space-y-4">
              {/* IMAGE UPLOAD SECTION FROM MOBILE / PC */}
              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border-2 border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span>পণ্যের ছবি নির্বাচন করুন (Mobile / PC Upload)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setImageInputTab('upload')}
                      className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                        imageInputTab === 'upload'
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : 'text-slate-600'
                      }`}
                    >
                      📁 ফাইল/গ্যালারি
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputTab('camera')}
                      className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                        imageInputTab === 'camera'
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : 'text-slate-600'
                      }`}
                    >
                      📸 মোবাইল ক্যামেরা
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputTab('url')}
                      className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                        imageInputTab === 'url'
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : 'text-slate-600'
                      }`}
                    >
                      🔗 লিঙ্ক (URL)
                    </button>
                  </div>
                </div>

                {/* Upload Buttons */}
                {imageInputTab === 'upload' && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="w-full py-4 px-4 border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-100/50 rounded-xl text-center text-xs font-bold text-slate-800 transition cursor-pointer flex flex-col items-center justify-center gap-1.5"
                    >
                      {isUploadingImage ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
                          <span>ছবি প্রসেস হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-amber-600" />
                          <span className="font-black text-slate-900">
                            📁 আপনার কম্পিউটার বা মোবাইল ফাইল/গ্যালারি থেকে ছবি নিন
                          </span>
                          <span className="text-[11px] text-slate-500">
                            JPG, PNG, WebP ফরম্যাট সাপোর্টেড
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {imageInputTab === 'camera' && (
                  <div>
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleImageFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="w-full py-4 px-4 border-2 border-dashed border-rose-300 hover:border-rose-500 bg-rose-50/50 hover:bg-rose-100/50 rounded-xl text-center text-xs font-bold text-slate-800 transition cursor-pointer flex flex-col items-center justify-center gap-1.5"
                    >
                      {isUploadingImage ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin text-rose-600" />
                          <span>ক্যামেরা ছবি নেওয়া হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-6 h-6 text-rose-600" />
                          <span className="font-black text-rose-950">
                            📸 মোবাইলের ক্যামেরা চালু করে সরাসরি পণ্যের ছবি তুলুন
                          </span>
                          <span className="text-[11px] text-rose-700">
                            ট্যাপ করলে সরাসরি ক্যামেরা ওপেন হবে
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {imageInputTab === 'url' && (
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... বা যেকোনো ছবির লিংক"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-950"
                  />
                )}

                {/* Preview Thumbnail */}
                {newImage && (
                  <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200">
                    <img
                      src={newImage}
                      alt="Preview"
                      className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-black text-emerald-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>ছবি সফলভাবে লোড হয়েছে!</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => setNewImage('')}
                        className="text-[11px] text-rose-600 font-bold hover:underline cursor-pointer"
                      >
                        ছবি পরিবর্তন বা মুছুন
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  পণ্যের নাম (Product Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: প্রিমিয়াম ওয়্যারলেস এয়ারবাডস প্রো"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs font-bold p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-amber-500 text-slate-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    ক্যাটাগরি
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-950"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    স্পেশাল ব্যাজ
                  </label>
                  <input
                    type="text"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    placeholder="যেমন: 🔥 মেগা হট ডিল"
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    নিয়মিত পূর্বের মূল্য (৳) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={newRegularPrice}
                    onChange={(e) =>
                      setNewRegularPrice(e.target.value ? Number(e.target.value) : '')
                    }
                    placeholder="যেমন: ১৯৯০"
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    হট ডিল বিশেষ মূল্য (৳) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={newDealPrice}
                    onChange={(e) =>
                      setNewDealPrice(e.target.value ? Number(e.target.value) : '')
                    }
                    placeholder="যেমন: ১২৫০"
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    হট ডিল স্টক সংখ্যা
                  </label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) =>
                      setNewStock(e.target.value ? Number(e.target.value) : '')
                    }
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    বিক্রি হয়েছে সংখ্যা (প্রগ্রেস বার)
                  </label>
                  <input
                    type="number"
                    value={newSold}
                    onChange={(e) =>
                      setNewSold(e.target.value ? Number(e.target.value) : '')
                    }
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-950"
                  />
                </div>
              </div>

              {/* 🎯 Banner & Ad Placement Link */}
              <div className="p-3 bg-indigo-50/80 rounded-2xl border border-indigo-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <span>🎯 কোন ব্যানারে যাবে এই পণ্যটি? (Banner / Ad Link)</span>
                  </label>
                  <span className="text-[10px] text-indigo-800 font-bold bg-indigo-100 px-2 py-0.5 rounded">
                    ঐচ্ছিক
                  </span>
                </div>

                <select
                  value={newLinkedBannerId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewLinkedBannerId(val);
                    if (val === '') {
                      setNewLinkedBannerName('');
                      setNewLinkedBannerLink('');
                    } else if (val === 'custom') {
                      setNewLinkedBannerName(newLinkedBannerName || 'কাস্টম ব্যানার');
                      setNewLinkedBannerPosition('hero');
                    } else {
                      const foundBanner = banners.find((b) => b.id === val);
                      if (foundBanner) {
                        setNewLinkedBannerName(foundBanner.title);
                        setNewLinkedBannerPosition(foundBanner.position);
                        setNewLinkedBannerLink(foundBanner.buttonLink || '');
                      } else {
                        const foundAd = advertisements.find((a) => a.id === val);
                        if (foundAd) {
                          setNewLinkedBannerName(foundAd.title);
                          setNewLinkedBannerPosition(foundAd.position);
                          setNewLinkedBannerLink(foundAd.linkUrl || '');
                        }
                      }
                    }
                  }}
                  className="w-full text-xs p-2.5 bg-white border border-indigo-300 rounded-xl font-bold text-slate-950 outline-hidden"
                >
                  <option value="">❌ কোনো ব্যানারে নয় (শুধু হট ডিল সেকশন)</option>
                  {banners.length > 0 && (
                    <optgroup label="👑 হোমপেজ ব্যানারসমূহ (Banners)">
                      {banners.map((b, idx) => (
                        <option key={b.id} value={b.id}>
                          👑 #{idx + 1}: {b.title} ({b.position})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {advertisements.length > 0 && (
                    <optgroup label="📢 ওয়েবসাইট বিজ্ঞাপনসমূহ (Ads)">
                      {advertisements.map((a, idx) => (
                        <option key={a.id} value={a.id}>
                          📢 {a.title} ({a.position})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <option value="custom">✏️ কাস্টম ব্যানার নাম ও লিংক</option>
                </select>

                {newLinkedBannerId && (
                  <div className="space-y-2 pt-1 border-t border-indigo-200">
                    <input
                      type="text"
                      placeholder="ব্যানারের নাম"
                      value={newLinkedBannerName}
                      onChange={(e) => setNewLinkedBannerName(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-950"
                    />
                    <input
                      type="text"
                      placeholder="ব্যানার লিঙ্ক (যেমন: /product/...) বা ফাঁকা রাখুন স্বয়ংক্রিয় সেটের জন্য"
                      value={newLinkedBannerLink}
                      onChange={(e) => setNewLinkedBannerLink(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-950"
                    />
                    <label className="flex items-center gap-2 text-[11px] text-indigo-900 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoUpdateBannerTarget}
                        onChange={(e) => setAutoUpdateBannerTarget(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span>ব্যানারটির বাটন লিঙ্ক হিসেবে এই নতুন পণ্যটি অটো-সেট করুন</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-rose-600 to-red-600 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  তৈরি ও সরাসরি পাবলিশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT DEAL PRODUCT MODAL */}
      {editingDealProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                <span>হট ডিল অফার এডিট করুন</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingDealProduct(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDealProduct} className="space-y-4">
              <p className="text-xs font-black text-slate-900 line-clamp-2">
                {editingDealProduct.name}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    হট ডিল মূল্য (৳)
                  </label>
                  <input
                    type="number"
                    required
                    value={dealPrice}
                    onChange={(e) => setDealPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    স্পেশাল ব্যাজ
                  </label>
                  <input
                    type="text"
                    value={dealBadge}
                    onChange={(e) => setDealBadge(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    হট ডিল স্টক
                  </label>
                  <input
                    type="number"
                    value={dealStock}
                    onChange={(e) => setDealStock(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    বিক্রি হয়েছে সংখ্যা
                  </label>
                  <input
                    type="number"
                    value={dealSold}
                    onChange={(e) => setDealSold(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-950"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingDealProduct(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
                >
                  আপডেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
