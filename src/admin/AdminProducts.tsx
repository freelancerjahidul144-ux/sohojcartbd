import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Sparkles,
  AlertTriangle,
  X,
  Upload,
  Image as ImageIcon,
  Camera,
  Palette,
  Check,
  Link as LinkIcon,
  Video,
  Play,
  Flame,
  Smartphone,
  Laptop,
  PackagePlus,
  FileVideo,
  ShieldCheck,
  RefreshCw,
  ArrowUpRight,
  Save,
  Target,
  Megaphone,
  Flag,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, ProductStatus, ProductColor } from '../types';
import { parseVideoUrl } from '../utils/videoHelper';

// Browser-based image compression helper for fast upload and Firestore storage
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('দয়া করে কোনো ইমেজ ফাইল (JPG, PNG, WebP) সিলেক্ট করুন।'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
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
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

const PRESET_COLORS: ProductColor[] = [
  { name: 'কালো (Black)', hex: '#000000' },
  { name: 'সাদা (White)', hex: '#FFFFFF' },
  { name: 'লাল (Red)', hex: '#E11D48' },
  { name: 'নীল (Blue)', hex: '#2563EB' },
  { name: 'নেভি ব্লু (Navy Blue)', hex: '#1E3A8A' },
  { name: 'সবুজ (Green)', hex: '#16A34A' },
  { name: 'হলুদ (Yellow)', hex: '#FACC15' },
  { name: 'গোল্ডেন (Gold)', hex: '#EAB308' },
  { name: 'মেরুন (Maroon)', hex: '#881337' },
  { name: 'বেগুনি (Purple)', hex: '#9333EA' },
  { name: 'কমলা (Orange)', hex: '#EA580C' },
  { name: 'গোলাপি (Pink)', hex: '#EC4899' },
  { name: 'ধূসর / সিলভার (Silver)', hex: '#64748B' },
  { name: 'জলপাই (Olive)', hex: '#65A30D' },
  { name: 'কফি / বাদামি (Brown)', hex: '#78350F' },
  { name: 'আকাশী (Sky Blue)', hex: '#0284C7' },
  { name: 'ছাই কালার (Grey)', hex: '#94A3B8' },
  { name: 'অফ-হোয়াইট (Off-White)', hex: '#F8FAFC' },
];

export const AdminProducts: React.FC = () => {
  const {
    products,
    categories,
    banners,
    advertisements,
    saveBannerAction,
    saveAdAction,
    saveProductAction,
    deleteProductAction,
    incrementProductStockAction,
    adjustProductStockAction,
    addToast,
  } = useStore();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Quick Restock State
  const [customRestockProduct, setCustomRestockProduct] = useState<Product | null>(null);
  const [customRestockQuantity, setCustomRestockQuantity] = useState<number>(50);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(undefined);
  const [stock, setStock] = useState<number>(100);
  const [salesCount, setSalesCount] = useState<number>(0);
  const [category, setCategory] = useState('');
  const [sku, setSku] = useState('');
  const [status, setStatus] = useState<ProductStatus>('published');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isHotDeal, setIsHotDeal] = useState(false);
  const [hotDealPrice, setHotDealPrice] = useState<number | undefined>(undefined);
  const [hotDealDiscount, setHotDealDiscount] = useState<number | undefined>(undefined);
  const [hotDealStock, setHotDealStock] = useState<number>(10);
  const [hotDealSold, setHotDealSold] = useState<number>(25);
  const [hotDealBadge, setHotDealBadge] = useState('🔥 হট ডিল');

  // Banner / Ad Connection & Placement Link
  const [linkedBannerId, setLinkedBannerId] = useState('');
  const [linkedBannerName, setLinkedBannerName] = useState('');
  const [linkedBannerLink, setLinkedBannerLink] = useState('');
  const [linkedBannerPosition, setLinkedBannerPosition] = useState('hero');
  const [autoUpdateBannerTarget, setAutoUpdateBannerTarget] = useState(true);

  // Dedicated Product Views: Front, Back, Side & Gallery
  const [frontImage, setFrontImage] = useState('');
  const [backImage, setBackImage] = useState('');
  const [sideImage, setSideImage] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [showUrlInput, setShowUrlInput] = useState<{ front?: boolean; back?: boolean; side?: boolean }>({});

  // Product Colors State
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#E11D48');

  // Product Video State (Direct Upload from PC/Mobile or YouTube URL)
  const [videoTab, setVideoTab] = useState<'upload' | 'youtube'>('upload');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoFileName, setVideoFileName] = useState('');
  const [videoFileSize, setVideoFileSize] = useState('');
  const [isVideoUploading, setIsVideoUploading] = useState(false);

  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');
  const [specifications, setSpecifications] = useState<Record<string, string>>({});

  const filteredProducts = products.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterCategory && p.category !== filterCategory) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    return true;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice(1000);
    setDiscountPrice(undefined);
    setStock(100);
    setSalesCount(0);
    setCategory(categories[0]?.name || 'Smartphones & Gadgets');
    setSku(`SCBD-${Math.floor(1000 + Math.random() * 9000)}`);
    setStatus('published');
    setIsFeatured(false);
    setIsBestseller(false);
    setIsHotDeal(false);
    setHotDealPrice(undefined);
    setHotDealDiscount(undefined);
    setHotDealStock(10);
    setHotDealSold(25);
    setHotDealBadge('🔥 হট ডিল');
    setLinkedBannerId('');
    setLinkedBannerName('');
    setLinkedBannerLink('');
    setLinkedBannerPosition('hero');
    setAutoUpdateBannerTarget(true);
    setFrontImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80');
    setBackImage('');
    setSideImage('');
    setAdditionalImages([]);
    setShowUrlInput({});
    setColors([
      { name: 'কালো (Black)', hex: '#000000' },
      { name: 'সাদা (White)', hex: '#FFFFFF' },
    ]);
    setVideoTab('upload');
    setVideoUrl('');
    setVideoTitle('');
    setVideoFileName('');
    setVideoFileSize('');
    setSpecifications({
      'Brand Warranty': '1 Year Official Warranty',
      'Delivery': 'Express Doorstep Delivery in Bangladesh',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price);
    setDiscountPrice(p.discountPrice);
    setStock(p.stock);
    setSalesCount(p.salesCount || 0);
    setCategory(p.category);
    setSku(p.sku || '');
    setStatus(p.status);
    setIsFeatured(p.isFeatured);
    setIsBestseller(p.isBestseller);
    setIsHotDeal(p.isHotDeal || false);
    setHotDealPrice(p.hotDealPrice);
    setHotDealDiscount(p.hotDealDiscount);
    setHotDealStock(p.hotDealStock || 10);
    setHotDealSold(p.hotDealSold || 25);
    setHotDealBadge(p.hotDealBadge || '🔥 হট ডিল');
    setLinkedBannerId(p.linkedBannerId || '');
    setLinkedBannerName(p.linkedBannerName || '');
    setLinkedBannerLink(p.linkedBannerLink || '');
    setLinkedBannerPosition(p.linkedBannerPosition || 'hero');
    setAutoUpdateBannerTarget(true);
    setFrontImage(p.frontImage || p.images[0] || '');
    setBackImage(p.backImage || p.images[1] || '');
    setSideImage(p.sideImage || p.images[2] || '');
    setAdditionalImages(p.images.slice(3) || []);
    setShowUrlInput({});
    setColors(p.colors || []);
    setVideoUrl(p.videoUrl || '');
    setVideoTitle(p.videoTitle || '');
    setVideoFileName(p.videoFileName || '');
    setVideoFileSize('');
    if (p.videoUrl && (p.videoUrl.startsWith('data:video') || p.videoUrl.startsWith('blob:') || /\.(mp4|webm|mov|m4v)/i.test(p.videoUrl))) {
      setVideoTab('upload');
    } else if (p.videoUrl) {
      setVideoTab('youtube');
    } else {
      setVideoTab('upload');
    }
    setSpecifications(p.specifications || {});
    setIsModalOpen(true);
  };

  // Upload handler for single slot (Front, Back, Side)
  const handleUploadSingleSlot = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      setter(compressed);
      addToast('success', 'ছবি সফলভাবে আপলোড করা হয়েছে!');
    } catch (err: any) {
      addToast('error', err?.message || 'ছবি প্রসেস করতে ব্যর্থ হয়েছে।');
    }
  };

  // Upload handler for multiple additional gallery images
  const handleUploadAdditional = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const newImgs: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressImageFile(files[i]);
        newImgs.push(compressed);
      }
      setAdditionalImages((prev) => [...prev, ...newImgs]);
      addToast('success', `${newImgs.length} টি অতিরিক্ত ছবি সফলভাবে যোগ হয়েছে!`);
    } catch (err: any) {
      addToast('error', err?.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে।');
    }
  };

  const handleAddAdditionalUrl = () => {
    setAdditionalImages((prev) => [...prev, '']);
  };

  const handleAdditionalUrlChange = (idx: number, val: string) => {
    setAdditionalImages((prev) => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  const handleRemoveAdditionalImage = (idx: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Upload video from mobile camera/gallery or PC files
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      addToast('error', 'দয়া করে একটি সঠিক ভিডিও ফাইল (MP4, WebM, MOV ইত্যাদি) নির্বাচন করুন।');
      return;
    }

    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > 35) {
      addToast(
        'error',
        `ভিডিওর সাইজ (${sizeInMB.toFixed(1)}MB) কিছুটা বড়। স্টোরে দ্রুত লোড হওয়ার জন্য ৩০MB এর নিচের ভিডিও ফাইল দিন অথবা YouTube লিংক ব্যবহার করুন।`
      );
      return;
    }

    setIsVideoUploading(true);
    setVideoFileName(file.name);
    setVideoFileSize(`${sizeInMB.toFixed(1)} MB`);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setVideoUrl(result);
        if (!videoTitle.trim()) {
          setVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
        setIsVideoUploading(false);
        addToast('success', `"${file.name}" ভিডিও ফাইল সফলভাবে যুক্ত হয়েছে!`);
      };
      reader.onerror = () => {
        setIsVideoUploading(false);
        addToast('error', 'ভিডিও রিড করতে ব্যর্থ হয়েছে।');
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsVideoUploading(false);
      addToast('error', 'ভিডিও প্রসেসিং করতে ব্যর্থ হয়েছে।');
    }
  };

  const handleQuickRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRestockProduct) return;
    const qty = Number(customRestockQuantity);
    if (isNaN(qty) || qty <= 0) {
      addToast('error', 'দয়া করে সঠিক স্টক সংখ্যা দিন (যেমন: ৫০)।');
      return;
    }
    await incrementProductStockAction(customRestockProduct.id, qty);
    setCustomRestockProduct(null);
  };

  // Color management
  const handleTogglePresetColor = (preset: ProductColor) => {
    const exists = colors.some((c) => c.name === preset.name);
    if (exists) {
      setColors((prev) => prev.filter((c) => c.name !== preset.name));
    } else {
      setColors((prev) => [...prev, preset]);
    }
  };

  const handleAddCustomColor = () => {
    if (!customColorName.trim()) {
      addToast('info', 'দয়া করে কালারের নাম লিখুন (যেমন: Royal Blue)।');
      return;
    }
    const newColor: ProductColor = {
      name: customColorName.trim(),
      hex: customColorHex,
    };
    if (colors.some((c) => c.name.toLowerCase() === newColor.name.toLowerCase())) {
      addToast('info', 'এই কালারটি ইতোমধ্যে তালিকায় রয়েছে।');
      return;
    }
    setColors((prev) => [...prev, newColor]);
    setCustomColorName('');
    addToast('success', `"${newColor.name}" কালার যুক্ত হয়েছে!`);
  };

  const handleRemoveColor = (index: number) => {
    setColors((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddSpec = () => {
    if (!specKey.trim() || !specVal.trim()) return;
    setSpecifications((prev) => ({ ...prev, [specKey.trim()]: specVal.trim() }));
    setSpecKey('');
    setSpecVal('');
  };

  const handleRemoveSpec = (key: string) => {
    setSpecifications((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  // Toggle publish / unpublish directly
  const handleTogglePublish = async (p: Product) => {
    const nextStatus: ProductStatus = p.status === 'published' ? 'draft' : 'published';
    try {
      await saveProductAction({ ...p, status: nextStatus });
    } catch {
      // error handled in context
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);

    // Combine Front, Back, Side, and Additional images in sequence
    const allImages: string[] = [];
    if (frontImage.trim()) allImages.push(frontImage.trim());
    if (backImage.trim()) allImages.push(backImage.trim());
    if (sideImage.trim()) allImages.push(sideImage.trim());
    additionalImages.forEach((img) => {
      if (img.trim() && !allImages.includes(img.trim())) {
        allImages.push(img.trim());
      }
    });

    if (allImages.length === 0) {
      allImages.push('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80');
    }

    const calculatedDiscount =
      discountPrice && discountPrice < price
        ? Math.round(((price - discountPrice) / price) * 100)
        : undefined;

    const catObj = categories.find((c) => c.name === category);

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      discountPercentage: calculatedDiscount,
      rating: editingProduct?.rating ?? 5.0,
      reviewCount: editingProduct?.reviewCount ?? 1,
      stock: Math.max(0, Number(stock)),
      salesCount: Math.max(0, Number(salesCount)),
      category,
      categoryId: catObj?.id || '',
      sku: sku.trim() || `SCBD-${Math.floor(1000 + Math.random() * 9000)}`,
      status,
      isFeatured,
      isBestseller,
      isHotDeal,
      hotDealPrice: isHotDeal ? (hotDealPrice || discountPrice || price) : undefined,
      hotDealDiscount: isHotDeal
        ? (hotDealDiscount || calculatedDiscount || (discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 20))
        : undefined,
      hotDealStock: isHotDeal ? Math.max(1, Number(hotDealStock) || 10) : undefined,
      hotDealSold: isHotDeal ? Math.max(0, Number(hotDealSold) || 0) : undefined,
      hotDealBadge: isHotDeal ? (hotDealBadge || '🔥 হট ডিল') : undefined,
      // Banner / Advertisement Link & Placement
      linkedBannerId: linkedBannerId.trim() || undefined,
      linkedBannerName: linkedBannerName.trim() || undefined,
      linkedBannerLink: linkedBannerLink.trim() || undefined,
      linkedBannerPosition: linkedBannerPosition || undefined,
      images: allImages,
      frontImage: frontImage.trim() || allImages[0],
      backImage: backImage.trim() || undefined,
      sideImage: sideImage.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      videoTitle: videoTitle.trim() || undefined,
      videoFileName: videoFileName.trim() || undefined,
      colors: colors.length > 0 ? colors : undefined,
      specifications,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveProductAction(productPayload);

      // Auto-sync selected banner or ad if user checked auto-update
      if (autoUpdateBannerTarget && linkedBannerId && linkedBannerId !== 'custom') {
        const targetBanner = banners.find((b) => b.id === linkedBannerId);
        if (targetBanner) {
          const finalLink = linkedBannerLink.trim() || `/product/${productPayload.id}`;
          await saveBannerAction({
            ...targetBanner,
            buttonLink: finalLink,
            targetProductId: productPayload.id,
          });
          addToast('info', `ব্যানার "${targetBanner.title}" এর বাটন লিংক এই পণ্যের সাথে যুক্ত হয়েছে!`);
        } else {
          const targetAd = advertisements.find((a) => a.id === linkedBannerId);
          if (targetAd) {
            const finalLink = linkedBannerLink.trim() || `/product/${productPayload.id}`;
            await saveAdAction({
              ...targetAd,
              linkUrl: finalLink,
              targetProductId: productPayload.id,
            });
            addToast('info', `বিজ্ঞাপন "${targetAd.title}" এর লিংক এই পণ্যের সাথে যুক্ত হয়েছে!`);
          }
        }
      }

      setIsModalOpen(false);
      addToast('success', 'পণ্যটি সফলভাবে স্টোরে পাবলিশ করা হয়েছে!');
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProductAction(id);
      setDeleteConfirmId(null);
    } catch {
      // handled
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Products Management</h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Publish products to instantly update customer storefront
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 py-2 px-3 rounded-xl outline-hidden cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 py-2 px-3 rounded-xl outline-hidden cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft (Unpublished)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-800 font-extrabold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price (BDT)</th>
                <th className="py-3 px-4">ইনভেন্টরি স্টক ও লাইভ সেলস</th>
                <th className="py-3 px-4">Flags</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const finalPrice = p.discountPrice ?? p.price;
                  const isPub = p.status === 'published';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.frontImage || p.images[0] || ''}
                            alt=""
                            className="w-11 h-11 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0 max-w-xs space-y-0.5">
                            <p className="font-black text-slate-950 truncate" title={p.name}>{p.name}</p>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] text-slate-500 font-mono">SKU: {p.sku}</span>
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-semibold border border-slate-200" title="Front image">
                                📷 Front
                              </span>
                              {p.backImage && (
                                <span className="text-[9px] bg-blue-50 text-blue-700 px-1 py-0.2 rounded font-semibold border border-blue-200" title="Back image">
                                  🔄 Back
                                </span>
                              )}
                              {p.sideImage && (
                                <span className="text-[9px] bg-purple-50 text-purple-700 px-1 py-0.2 rounded font-semibold border border-purple-200" title="Side image">
                                  📐 Side
                                </span>
                              )}
                              {p.videoUrl && (
                                <span className="text-[9px] bg-rose-50 text-rose-700 px-1 py-0.2 rounded font-semibold border border-rose-200" title="Video available">
                                  🎥 Video
                                </span>
                              )}
                            </div>

                            {/* Color Swatches */}
                            {p.colors && p.colors.length > 0 && (
                              <div className="flex items-center gap-1 pt-0.5" title={`কালার: ${p.colors.map(c => c.name).join(', ')}`}>
                                {p.colors.slice(0, 5).map((c, i) => (
                                  <span
                                    key={i}
                                    className="w-2.5 h-2.5 rounded-full border border-slate-300 shadow-2xs inline-block"
                                    style={{ backgroundColor: c.hex }}
                                  />
                                ))}
                                {p.colors.length > 5 && (
                                  <span className="text-[9px] text-slate-400 font-bold">+{p.colors.length - 5}</span>
                                )}
                                <span className="text-[9px] text-slate-600 font-medium">({p.colors.length} কালার)</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-700 font-medium">{p.category}</td>

                      <td className="py-3 px-4">
                        <div className="font-black text-slate-950">
                          ৳{finalPrice.toLocaleString()}
                        </div>
                        {p.discountPrice && (
                          <div className="text-[10px] text-slate-400 line-through">
                            ৳{p.price.toLocaleString()}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1.5 min-w-[155px]">
                          {/* Stock status badge */}
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[11px] font-black px-2 py-0.5 rounded-md border flex items-center gap-1 shadow-2xs ${
                                p.stock <= 0
                                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                                  : p.stock <= 5
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              }`}
                            >
                              {p.stock <= 0 ? (
                                '❌ স্টক শেষ (0)'
                              ) : (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                  <span>স্টক: {p.stock} টি</span>
                                </>
                              )}
                            </span>
                          </div>

                          {/* Live sold / buyers counter */}
                          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                            <Flame className="w-3.5 h-3.5 text-rose-600 fill-current animate-pulse shrink-0" />
                            <span>
                              মোট বিক্রি: <strong className="text-rose-700 font-black">{p.salesCount || 0} টি</strong>
                            </span>
                          </div>

                          {/* Quick Restock Action Buttons */}
                          <div className="flex items-center gap-1 pt-0.5">
                            <span className="text-[10px] text-slate-500 font-bold">বৃদ্ধি:</span>
                            <button
                              type="button"
                              onClick={() => incrementProductStockAction(p.id, 10)}
                              className="px-1.5 py-0.5 bg-slate-100 hover:bg-emerald-100 text-slate-800 hover:text-emerald-900 text-[10px] font-black rounded border border-slate-300 hover:border-emerald-400 transition cursor-pointer"
                              title="স্টকে ১০টি পণ্য যোগ করুন"
                            >
                              +10
                            </button>
                            <button
                              type="button"
                              onClick={() => incrementProductStockAction(p.id, 50)}
                              className="px-1.5 py-0.5 bg-slate-100 hover:bg-emerald-100 text-slate-800 hover:text-emerald-900 text-[10px] font-black rounded border border-slate-300 hover:border-emerald-400 transition cursor-pointer"
                              title="স্টকে ৫০টি পণ্য যোগ করুন"
                            >
                              +50
                            </button>
                            <button
                              type="button"
                              onClick={() => incrementProductStockAction(p.id, 100)}
                              className="px-1.5 py-0.5 bg-slate-100 hover:bg-emerald-100 text-slate-800 hover:text-emerald-900 text-[10px] font-black rounded border border-slate-300 hover:border-emerald-400 transition cursor-pointer"
                              title="স্টকে ১০০টি পণ্য যোগ করুন"
                            >
                              +100
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCustomRestockProduct(p);
                                setCustomRestockQuantity(50);
                              }}
                              className="px-1.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-black rounded border border-emerald-300 transition cursor-pointer flex items-center gap-0.5"
                              title="কাস্টম স্টক যোগ করুন"
                            >
                              <Plus className="w-2.5 h-2.5" />
                              <span>কাস্টম</span>
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <div className="flex gap-1 flex-wrap">
                            {p.isHotDeal && (
                              <span className="bg-rose-100 text-rose-900 text-[9px] font-black px-1.5 py-0.5 rounded border border-rose-300 flex items-center gap-0.5">
                                <Flame className="w-2.5 h-2.5 fill-current text-rose-600" />
                                <span>হট ডিল</span>
                              </span>
                            )}
                            {p.isFeatured && (
                              <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-300">
                                Featured
                              </span>
                            )}
                            {p.isBestseller && (
                              <span className="bg-orange-100 text-orange-900 text-[9px] font-bold px-1.5 py-0.5 rounded border border-orange-300">
                                Best
                              </span>
                            )}
                          </div>
                          {p.linkedBannerName && (
                            <span
                              className="bg-indigo-50 text-indigo-800 text-[9px] font-black px-1.5 py-0.5 rounded border border-indigo-200 flex items-center gap-1"
                              title={`ব্যানার: ${p.linkedBannerName} (${p.linkedBannerPosition || 'Hero'}) • লিঙ্ক: ${p.linkedBannerLink || '-'}`}
                            >
                              <Target className="w-2.5 h-2.5 text-indigo-600" />
                              <span className="truncate max-w-[110px]">{p.linkedBannerName}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleTogglePublish(p)}
                          className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border transition cursor-pointer ${
                            isPub
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
                          }`}
                          title="Click to toggle publish status"
                        >
                          {isPub ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                          <span>{isPub ? 'Published' : 'Draft'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg transition cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal (Clean White Theme & Full Vertical Scroll) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center items-start p-2 sm:p-4 md:p-6 overscroll-contain">
          <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl shadow-2xl my-2 sm:my-6 text-slate-900 flex flex-col max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-3rem)] overflow-hidden animate-in fade-in">
            {/* Sticky Header with Title, Quick Scroll to Bottom, and Close */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 bg-white/95 backdrop-blur-xs shrink-0 sticky top-0 z-20 rounded-t-3xl shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-400/20 text-slate-950 rounded-xl shrink-0">
                  <PackagePlus className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-950">
                    {editingProduct ? 'Edit Product (পণ্য সম্পাদনা)' : 'Add New Product (নতুন পণ্য যোগ)'}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    প্রয়োজনীয় তথ্য ও ছবি দিয়ে পণ্যটি সাজান (স্ক্রোল করে উপর-নিচে দেখুন)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const scrollContainer = document.getElementById('product-modal-scrollable-body');
                    if (scrollContainer) {
                      scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
                    }
                  }}
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                  title="এক ক্লিকে নিচে সেভ বাটনে যান"
                >
                  <span>নিচে যান ⬇</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                  title="বন্ধ করুন"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Form Body with Dedicated Scrollbar */}
            <div
              id="product-modal-scrollable-body"
              className="overflow-y-auto px-5 sm:px-6 py-5 flex-1 overscroll-contain focus:outline-hidden"
              style={{ scrollBehavior: 'smooth' }}
            >
              <form id="product-edit-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Product Title / Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samsung Galaxy S24 Ultra (Titanium Black)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden cursor-pointer font-bold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SCBD-778"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Regular Price (৳ BDT) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Discount Price (৳ BDT - Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="Leave blank if no discount"
                    value={discountPrice || ''}
                    onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>ইনভেন্টরি স্টক সংখ্যা (Stock) <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] text-slate-500 font-semibold">যেমন: 100 টি</span>
                  </label>
                  <div className="space-y-1.5">
                    <input
                      type="number"
                      required
                      min={0}
                      value={stock}
                      onChange={(e) => setStock(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-bold"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-500 font-bold">কুইক বৃদ্ধি:</span>
                      <button
                        type="button"
                        onClick={() => setStock((s) => s + 10)}
                        className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[10px] font-black cursor-pointer"
                      >
                        +10
                      </button>
                      <button
                        type="button"
                        onClick={() => setStock((s) => s + 25)}
                        className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[10px] font-black cursor-pointer"
                      >
                        +25
                      </button>
                      <button
                        type="button"
                        onClick={() => setStock((s) => s + 50)}
                        className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[10px] font-black cursor-pointer"
                      >
                        +50
                      </button>
                      <button
                        type="button"
                        onClick={() => setStock((s) => s + 100)}
                        className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[10px] font-black cursor-pointer"
                      >
                        +100
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>মোট কতজন কিনেছেন (Total Sold Count)</span>
                    <span className="text-[10px] text-rose-600 font-bold">🔥 লাইভ সেলস কাউন্টার</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={salesCount}
                    onChange={(e) => setSalesCount(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-bold"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">
                    গ্রাহক অর্ডার দেওয়ার সাথে সাথে স্বয়ংক্রিয়ভাবে স্টক কমবে এবং এই বিক্রির সংখ্যা বাড়বে।
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProductStatus)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-bold"
                  >
                    <option value="published">Published (Visible on storefront)</option>
                    <option value="draft">Draft (Hidden from storefront)</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Mark as Featured Product</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestseller}
                    onChange={(e) => setIsBestseller(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Mark as Best Seller</span>
                </label>
              </div>

              {/* 🔥 HOT DEAL SPECIAL PROMOTION SETTINGS */}
              <div className="p-3.5 bg-gradient-to-r from-amber-50 to-rose-50 rounded-2xl border-2 border-rose-200 space-y-3">
                <label className="flex items-center gap-2.5 text-xs text-slate-950 font-black cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHotDeal}
                    onChange={(e) => {
                      setIsHotDeal(e.target.checked);
                      if (e.target.checked && !hotDealPrice) {
                        setHotDealPrice(discountPrice || (price ? Math.round(price * 0.85) : undefined));
                      }
                    }}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-400"
                  />
                  <Flame className="w-4 h-4 text-rose-600 fill-current animate-pulse" />
                  <span>🔥 এই পণ্যটি হোমপেজের 'হট ডিল' সেকশনে যুক্ত করুন (Show in Today's Hot Deals)</span>
                </label>

                {isHotDeal && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-rose-200">
                    <div>
                      <label className="block text-[11px] font-black text-slate-900 mb-1">
                        হট ডিল বিশেষ অফার মূল্য (৳)
                      </label>
                      <input
                        type="number"
                        value={hotDealPrice || ''}
                        onChange={(e) => setHotDealPrice(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder={discountPrice ? String(discountPrice) : String(price)}
                        className="w-full text-xs p-2 bg-white border border-rose-300 rounded-xl font-bold text-slate-950"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-900 mb-1">
                        হট ডিল স্টক সংখ্যা (বাকি আছে)
                      </label>
                      <input
                        type="number"
                        value={hotDealStock}
                        onChange={(e) => setHotDealStock(Math.max(1, Number(e.target.value) || 1))}
                        className="w-full text-xs p-2 bg-white border border-rose-300 rounded-xl font-bold text-slate-950"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-900 mb-1">
                        স্পেশাল ব্যাজ
                      </label>
                      <input
                        type="text"
                        value={hotDealBadge}
                        onChange={(e) => setHotDealBadge(e.target.value)}
                        placeholder="যেমন: 🔥 মেগা ডিল"
                        className="w-full text-xs p-2 bg-white border border-rose-300 rounded-xl font-bold text-slate-950"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 🎯 BANNER & ADVERTISEMENT LINKAGE (কোন ব্যানারে যাবে পণ্যটি এবং অ্যাড লিঙ্ক) */}
              <div className="p-3.5 bg-gradient-to-r from-indigo-50/90 via-sky-50/70 to-amber-50/60 rounded-2xl border-2 border-indigo-200/90 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-black text-slate-950">
                      🎯 ব্যানার ও বিজ্ঞাপন সংযোগ (Banner & Ad Placement Link)
                    </span>
                  </div>
                  <span className="text-[10px] text-indigo-800 font-bold bg-indigo-100/80 px-2 py-0.5 rounded-md border border-indigo-200">
                    কোন ব্যানারে যাবে ও লিঙ্ক নির্ধারণ
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  এই পণ্যটি ওয়েবসাইটের কোন ব্যানার বা বিজ্ঞাপনে যাবে তা নির্বাচন করুন। ব্যানারে ক্লিক করলে গ্রাহক সরাসরি এই পণ্যে চলে আসবে।
                </p>

                {/* Dropdown: Select which banner this product belongs to */}
                <div>
                  <label className="block text-[11px] font-black text-slate-900 mb-1">
                    কোন ব্যানার বা বিজ্ঞাপনে যাবে পণ্যটি? (Select Target Banner / Ad)
                  </label>
                  <select
                    value={linkedBannerId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLinkedBannerId(val);
                      if (val === '') {
                        setLinkedBannerName('');
                        setLinkedBannerLink('');
                        setLinkedBannerPosition('hero');
                      } else if (val === 'custom') {
                        setLinkedBannerName(linkedBannerName || 'কাস্টম ব্যানার অফার');
                        setLinkedBannerPosition('custom');
                        if (!linkedBannerLink) {
                          setLinkedBannerLink(`/product/${editingProduct?.id || 'new'}`);
                        }
                      } else {
                        // Check if it's a banner
                        const foundBanner = banners.find((b) => b.id === val);
                        if (foundBanner) {
                          setLinkedBannerName(foundBanner.title);
                          setLinkedBannerPosition(foundBanner.position);
                          setLinkedBannerLink(
                            foundBanner.buttonLink || `/product/${editingProduct?.id || 'new'}`
                          );
                        } else {
                          // Check if it's an ad
                          const foundAd = advertisements.find((a) => a.id === val);
                          if (foundAd) {
                            setLinkedBannerName(foundAd.title);
                            setLinkedBannerPosition(foundAd.position);
                            setLinkedBannerLink(
                              foundAd.linkUrl || `/product/${editingProduct?.id || 'new'}`
                            );
                          }
                        }
                      }
                    }}
                    className="w-full text-xs p-2.5 bg-white border-2 border-indigo-200 rounded-xl font-bold text-slate-950 focus:border-indigo-500 outline-hidden"
                  >
                    <option value="">❌ কোনো ব্যানারে নয় (স্বাভাবিক প্রোডাক্ট ক্যাটালগ)</option>
                    
                    {banners.length > 0 && (
                      <optgroup label="👑 হোমপেজ ব্যানারসমূহ (Hero & Promo Banners)">
                        {banners.map((b, idx) => (
                          <option key={b.id} value={b.id}>
                            {b.position === 'hero' ? '👑 [Hero ব্যানার]' : `✨ [${b.position.toUpperCase()}]`} #{idx + 1}: {b.title}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {advertisements.length > 0 && (
                      <optgroup label="📢 ওয়েবসাইট বিজ্ঞাপনসমূহ (Advertisements)">
                        {advertisements.map((a, idx) => (
                          <option key={a.id} value={a.id}>
                            📢 [বিজ্ঞাপন #{idx + 1}] {a.title} ({a.position})
                          </option>
                        ))}
                      </optgroup>
                    )}

                    <option value="custom">✏️ কাস্টম ব্যানার / অন্য ব্যানার নাম ও লিংক দিন</option>
                  </select>
                </div>

                {/* If a banner is chosen or custom is selected */}
                {linkedBannerId && (
                  <div className="p-3 bg-white/90 rounded-xl border border-indigo-200 space-y-3 shadow-2xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-black text-slate-900 mb-1">
                          ব্যানার বা বিজ্ঞাপনের নাম (Banner / Ad Name)
                        </label>
                        <input
                          type="text"
                          value={linkedBannerName}
                          onChange={(e) => setLinkedBannerName(e.target.value)}
                          placeholder="যেমন: সামার মেগা অফার ব্যানার"
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-950 focus:border-indigo-500 focus:bg-white outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-900 mb-1">
                          ব্যানারের অবস্থান (Banner Placement)
                        </label>
                        <select
                          value={linkedBannerPosition}
                          onChange={(e) => setLinkedBannerPosition(e.target.value)}
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-950 focus:border-indigo-500 focus:bg-white outline-hidden cursor-pointer"
                        >
                          <option value="hero">Hero Carousel (হোমপেজ টপ স্লাইডার)</option>
                          <option value="promo">Promotional Strip (মাঝের প্রোমো ব্যানার)</option>
                          <option value="deal">Special Deal Banner (ডিল ব্যানার)</option>
                          <option value="homepage">Homepage Ad (হোমপেজ বিজ্ঞাপন)</option>
                          <option value="product_page">Product Page Ad (প্রোডাক্ট পেজ অ্যাড)</option>
                          <option value="bottom">Bottom Ad (নিচের ব্যানার)</option>
                          <option value="custom">Custom Banner (অন্যান্য ব্যানার)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-black text-slate-900 flex items-center gap-1">
                          <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
                          <span>ব্যানার অ্যাকশন লিংক (Destination Link)</span>
                        </label>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const prodId = editingProduct?.id || 'new';
                              setLinkedBannerLink(`/product/${prodId}`);
                            }}
                            className="text-[10px] text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded font-bold border border-indigo-200 cursor-pointer"
                          >
                            + এই পণ্যের লিংক
                          </button>
                          <button
                            type="button"
                            onClick={() => setLinkedBannerLink('/products')}
                            className="text-[10px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded font-bold border border-slate-200 cursor-pointer"
                          >
                            ক্যাটালগ লিংক
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={linkedBannerLink}
                        onChange={(e) => setLinkedBannerLink(e.target.value)}
                        placeholder="যেমন: /product/prod-171800... অথবা https://..."
                        className="w-full text-xs p-2.5 bg-slate-50 border border-indigo-300 rounded-xl font-mono text-slate-950 focus:border-indigo-500 focus:bg-white outline-hidden"
                      />
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">
                        💡 গ্রাহক ওয়েবসাইটে যখন এই ব্যানার বা ব্যানারের বাটনে ক্লিক করবে, সরাসরি এই পণ্য বা লিংকে চলে যাবে।
                      </p>
                    </div>

                    {/* Auto Update Banner Target Checkbox */}
                    {linkedBannerId !== 'custom' && (
                      <label className="flex items-center gap-2 pt-1 text-xs text-indigo-950 font-black cursor-pointer bg-indigo-50/60 p-2 rounded-xl border border-indigo-200">
                        <input
                          type="checkbox"
                          checked={autoUpdateBannerTarget}
                          onChange={(e) => setAutoUpdateBannerTarget(e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-400"
                        />
                        <span>
                          🔄 সেভ করার সাথে সাথে নির্বাচিত ব্যানারের বাটনের লিঙ্ক হিসেবে এই পণ্যটি সেট করুন (Auto-Sync)
                        </span>
                      </label>
                    )}

                    {/* Live Selected Banner Info / Thumbnail */}
                    {(() => {
                      const selectedBanner = banners.find((b) => b.id === linkedBannerId);
                      const selectedAd = advertisements.find((a) => a.id === linkedBannerId);
                      const img = selectedBanner?.image || selectedAd?.image;
                      if (!img) return null;
                      return (
                        <div className="flex items-center gap-3 p-2.5 bg-indigo-50/70 rounded-xl border border-indigo-200">
                          <img
                            src={img}
                            alt=""
                            className="w-16 h-10 object-cover rounded-lg border border-indigo-300 shrink-0 shadow-2xs"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-slate-900 truncate">
                              {selectedBanner?.title || selectedAd?.title}
                            </p>
                            <p className="text-[10px] text-indigo-800 font-bold">
                              পজিশন: {selectedBanner?.position || selectedAd?.position} • ক্লিক করলে যাবে: {linkedBannerLink || 'স্বয়ংক্রিয় সেট হবে'}
                            </p>
                          </div>
                          <span className="text-[10px] bg-emerald-600 text-white font-black px-2.5 py-0.5 rounded-full shadow-2xs shrink-0 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>কানেক্টেড</span>
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed specifications, features, warranty, and package contents..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-medium"
                />
              </div>

              {/* Product Views: Front, Back, Side, and Additional Gallery Photos */}
              <div className="space-y-4 pt-3 border-t border-slate-200">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="text-xs font-black text-slate-950 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-amber-500" />
                      <span>পণ্যের প্রধান ৩টি অ্যাঙ্গেলের ছবি (Front, Back & Side Views)</span>
                    </label>
                    <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      মোবাইল বা কম্পিউটার থেকে সরাসরি আপলোড করুন
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 font-medium">
                    কাস্টমার যাতে পণ্যের সামনের দিক, পেছনের দিক ও সাইড ভিউ নিখুঁতভাবে দেখতে পায়
                  </p>
                </div>

                {/* 3 Main View Slots */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Slot 1: FRONT VIEW (Main Image) */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-slate-900 flex items-center gap-1">
                        <span>১. সামনের ছবি (Front)</span>
                        <span className="text-rose-500 font-black">*প্রধান</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowUrlInput((prev) => ({ ...prev, front: !prev.front }))}
                        className="text-[10px] text-amber-700 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>{showUrlInput.front ? 'আপলোড' : 'URL'}</span>
                      </button>
                    </div>

                    {frontImage ? (
                      <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-300 bg-white group">
                        <img src={frontImage} alt="Front View" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 p-2">
                          <label className="p-1.5 bg-white hover:bg-amber-100 text-slate-900 rounded-lg text-[10px] font-black cursor-pointer shadow-md flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            <span>ফাইল</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleUploadSingleSlot(e, setFrontImage)}
                            />
                          </label>
                          <label className="p-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-[10px] font-black cursor-pointer shadow-md flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            <span>ক্যামেরা</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={(e) => handleUploadSingleSlot(e, setFrontImage)}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setFrontImage('')}
                            className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-black cursor-pointer shadow-md"
                          >
                            মুছুন
                          </button>
                        </div>
                      </div>
                    ) : showUrlInput.front ? (
                      <div className="space-y-1.5 py-4">
                        <input
                          type="url"
                          placeholder="https://... (ইমেজ লিংক দিন)"
                          value={frontImage}
                          onChange={(e) => setFrontImage(e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-xl outline-hidden focus:border-amber-500 font-medium"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/40 p-2.5 flex flex-col justify-center gap-2 text-center">
                        <span className="text-[11px] font-black text-slate-900">
                          সামনের প্রধান ছবি নির্বাচন করুন
                        </span>
                        
                        {/* Option 1: Mobile Camera */}
                        <label className="w-full py-2 px-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-[11px] rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95">
                          <Camera className="w-3.5 h-3.5" />
                          <span>📸 সরাসরি ছবি তুলুন (Camera)</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => handleUploadSingleSlot(e, setFrontImage)}
                          />
                        </label>

                        {/* Option 2: Choose File from Mobile Gallery / PC */}
                        <label className="w-full py-2 px-2 bg-white hover:bg-slate-100 text-slate-800 font-bold text-[11px] rounded-lg border border-slate-300 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95">
                          <Upload className="w-3.5 h-3.5 text-amber-600" />
                          <span>📁 মোবাইল গ্যালারি বা পিসি ফাইল</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUploadSingleSlot(e, setFrontImage)}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Slot 2: BACK VIEW */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-slate-900 flex items-center gap-1">
                        <span>২. পেছনের ছবি (Back)</span>
                        <span className="text-slate-400 text-[10px]">(ঐচ্ছিক)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowUrlInput((prev) => ({ ...prev, back: !prev.back }))}
                        className="text-[10px] text-amber-700 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>{showUrlInput.back ? 'আপলোড' : 'URL'}</span>
                      </button>
                    </div>

                    {backImage ? (
                      <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-300 bg-white group">
                        <img src={backImage} alt="Back View" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 p-2">
                          <label className="p-1.5 bg-white hover:bg-amber-100 text-slate-900 rounded-lg text-[10px] font-black cursor-pointer shadow-md flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            <span>ফাইল</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleUploadSingleSlot(e, setBackImage)}
                            />
                          </label>
                          <label className="p-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-[10px] font-black cursor-pointer shadow-md flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            <span>ক্যামেরা</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={(e) => handleUploadSingleSlot(e, setBackImage)}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setBackImage('')}
                            className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-black cursor-pointer shadow-md"
                          >
                            মুছুন
                          </button>
                        </div>
                      </div>
                    ) : showUrlInput.back ? (
                      <div className="space-y-1.5 py-4">
                        <input
                          type="url"
                          placeholder="https://... (পেছনের ছবির লিংক)"
                          value={backImage}
                          onChange={(e) => setBackImage(e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-xl outline-hidden focus:border-amber-500 font-medium"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square rounded-xl border-2 border-dashed border-slate-300 bg-slate-100/60 p-2.5 flex flex-col justify-center gap-2 text-center">
                        <span className="text-[11px] font-black text-slate-900">
                          পেছনের ছবি নির্বাচন করুন
                        </span>
                        
                        {/* Option 1: Mobile Camera */}
                        <label className="w-full py-2 px-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold text-[11px] rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95">
                          <Camera className="w-3.5 h-3.5" />
                          <span>📸 সরাসরি ছবি তুলুন (Camera)</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => handleUploadSingleSlot(e, setBackImage)}
                          />
                        </label>

                        {/* Option 2: Choose File from Mobile Gallery / PC */}
                        <label className="w-full py-2 px-2 bg-white hover:bg-slate-100 text-slate-800 font-bold text-[11px] rounded-lg border border-slate-300 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95">
                          <Upload className="w-3.5 h-3.5 text-slate-700" />
                          <span>📁 মোবাইল গ্যালারি বা পিসি ফাইল</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUploadSingleSlot(e, setBackImage)}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Slot 3: SIDE VIEW */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-slate-900 flex items-center gap-1">
                        <span>৩. পাশের ছবি (Side View)</span>
                        <span className="text-slate-400 text-[10px]">(ঐচ্ছিক)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowUrlInput((prev) => ({ ...prev, side: !prev.side }))}
                        className="text-[10px] text-amber-700 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>{showUrlInput.side ? 'আপলোড' : 'URL'}</span>
                      </button>
                    </div>

                    {sideImage ? (
                      <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-300 bg-white group">
                        <img src={sideImage} alt="Side View" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 p-2">
                          <label className="p-1.5 bg-white hover:bg-amber-100 text-slate-900 rounded-lg text-[10px] font-black cursor-pointer shadow-md flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            <span>ফাইল</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleUploadSingleSlot(e, setSideImage)}
                            />
                          </label>
                          <label className="p-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-[10px] font-black cursor-pointer shadow-md flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            <span>ক্যামেরা</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={(e) => handleUploadSingleSlot(e, setSideImage)}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setSideImage('')}
                            className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-black cursor-pointer shadow-md"
                          >
                            মুছুন
                          </button>
                        </div>
                      </div>
                    ) : showUrlInput.side ? (
                      <div className="space-y-1.5 py-4">
                        <input
                          type="url"
                          placeholder="https://... (পাশের ছবির লিংক)"
                          value={sideImage}
                          onChange={(e) => setSideImage(e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-xl outline-hidden focus:border-amber-500 font-medium"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square rounded-xl border-2 border-dashed border-slate-300 bg-slate-100/60 p-2.5 flex flex-col justify-center gap-2 text-center">
                        <span className="text-[11px] font-black text-slate-900">
                          পাশের ছবি নির্বাচন করুন
                        </span>
                        
                        {/* Option 1: Mobile Camera */}
                        <label className="w-full py-2 px-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold text-[11px] rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95">
                          <Camera className="w-3.5 h-3.5" />
                          <span>📸 সরাসরি ছবি তুলুন (Camera)</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => handleUploadSingleSlot(e, setSideImage)}
                          />
                        </label>

                        {/* Option 2: Choose File from Mobile Gallery / PC */}
                        <label className="w-full py-2 px-2 bg-white hover:bg-slate-100 text-slate-800 font-bold text-[11px] rounded-lg border border-slate-300 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95">
                          <Upload className="w-3.5 h-3.5 text-slate-700" />
                          <span>📁 মোবাইল গ্যালারি বা পিসি ফাইল</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUploadSingleSlot(e, setSideImage)}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Gallery Photos */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                      <span>অতিরিক্ত গ্যালারি ছবিসমূহ (Optional Gallery Images):</span>
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Mobile Camera */}
                      <label className="text-[11px] font-black text-slate-950 bg-amber-400 hover:bg-amber-500 px-2.5 py-1 rounded-lg cursor-pointer transition flex items-center gap-1 shadow-2xs">
                        <Camera className="w-3 h-3" />
                        <span>📸 ক্যামেরা</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={handleUploadAdditional}
                        />
                      </label>
                      {/* Gallery / PC File */}
                      <label className="text-[11px] font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-lg cursor-pointer transition flex items-center gap-1 shadow-2xs">
                        <Upload className="w-3 h-3 text-amber-600" />
                        <span>📁 গ্যালারি বা পিসি</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleUploadAdditional}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleAddAdditionalUrl}
                        className="text-[11px] text-slate-700 font-bold hover:underline cursor-pointer"
                      >
                        + URL যোগ করুন
                      </button>
                    </div>
                  </div>

                  {additionalImages.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {additionalImages.map((img, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {img.startsWith('data:image') || img.startsWith('http') ? (
                            <img
                              src={img}
                              alt=""
                              className="w-9 h-9 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                            />
                          ) : null}
                          <input
                            type="url"
                            placeholder="https://... (অতিরিক্ত ছবির ইমেজ লিংক)"
                            value={img}
                            onChange={(e) => handleAdditionalUrlChange(idx, e.target.value)}
                            className="flex-1 text-xs p-2 bg-white border border-slate-300 text-slate-900 rounded-xl outline-hidden focus:border-amber-500 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveAdditionalImage(idx)}
                            className="p-2 text-rose-500 hover:text-rose-700 cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Colors Section (কালার বা রঙের অপশন) */}
              <div className="space-y-3 pt-3 border-t border-slate-200 bg-amber-50/40 p-4 rounded-2xl border border-amber-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-950 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-600" />
                    <span>পণ্যের কালার / রঙের অপশন সমূহ (Product Colors)</span>
                  </label>
                  <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                    {colors.length} টি কালার ভ্যারিয়েন্ট যোগ করা আছে
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  কাস্টমার যাতে অর্ডার করার সময় তার পছন্দের রং সিলেক্ট করতে পারে, সেজন্য কালার যোগ করুন:
                </p>

                {/* 1-Click Popular Preset Colors */}
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                    জনপ্রিয় কালারসমূহ (১-ক্লিকে সিলেক্ট করুন):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.map((preset, idx) => {
                      const isSelected = colors.some((c) => c.name === preset.name);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleTogglePresetColor(preset)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition border cursor-pointer ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs ring-2 ring-amber-400/40 font-black'
                              : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span>{preset.name}</span>
                          {isSelected && <Check className="w-3 h-3 text-slate-950 font-black" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Color Input */}
                <div className="pt-2 border-t border-amber-200/70">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                    অথবা কাস্টম কালার তৈরি করুন:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-300">
                      <input
                        type="color"
                        value={customColorHex}
                        onChange={(e) => setCustomColorHex(e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                        title="কালার পিকার"
                      />
                      <span className="text-[11px] font-mono font-bold text-slate-600 pr-1">
                        {customColorHex}
                      </span>
                    </div>

                    <input
                      type="text"
                      placeholder="কালারের নাম (যেমন: Royal Blue, অলিভ গ্রিন...)"
                      value={customColorName}
                      onChange={(e) => setCustomColorName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomColor();
                        }
                      }}
                      className="flex-1 min-w-[180px] text-xs p-2 bg-white border border-slate-300 rounded-xl outline-hidden focus:border-amber-500 font-medium"
                    />

                    <button
                      type="button"
                      onClick={handleAddCustomColor}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>কালার যুক্ত করুন</span>
                    </button>
                  </div>
                </div>

                {/* Active Selected Colors Chips */}
                {colors.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-black text-slate-700 block mb-1">
                      বর্তমান নির্বাচিত কালারসমূহ ({colors.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((c, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-slate-300 shadow-2xs text-xs font-bold text-slate-900"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-400 shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(idx)}
                            className="text-slate-400 hover:text-rose-600 transition cursor-pointer p-0.5 ml-1"
                            title="মুছে ফেলুন"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Video Section (কম্পিউটার/মোবাইল থেকে সরাসরি ভিডিও আপলোড ও ইউটিউব লিংক অপশন) */}
              <div className="space-y-3 pt-3 border-t border-slate-200 bg-rose-50/50 p-4.5 rounded-2xl border border-rose-200">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-black text-slate-950 flex items-center gap-2">
                    <Video className="w-4 h-4 text-rose-600" />
                    <span>পণ্যের ভিডিও অপশন (Product Video - Mobile / PC / YouTube)</span>
                  </label>
                  {videoUrl.trim() && (
                    <span className="text-[11px] font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-300 flex items-center gap-1">
                      <Check className="w-3 h-3 text-rose-600" />
                      <span>ভিডিও সংযুক্ত আছে</span>
                    </span>
                  )}
                </div>

                {/* Tabs: Upload from Device vs YouTube Link */}
                <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-rose-200">
                  <button
                    type="button"
                    onClick={() => setVideoTab('upload')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer ${
                      videoTab === 'upload'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>মোবাইল বা কম্পিউটার থেকে আপলোড</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoTab('youtube')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer ${
                      videoTab === 'youtube'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>ইউটিউব / অনলাইন ভিডিও লিংক</span>
                  </button>
                </div>

                {/* TAB 1: Device Upload (Mobile Camera/Gallery or PC) */}
                {videoTab === 'upload' && (
                  <div className="space-y-3 pt-1">
                    <p className="text-[11px] text-slate-600 font-medium">
                      মোবাইল বা কম্পিউটার থেকে সরাসরি ভিডিও ফাইল (MP4, WebM, MOV) আপলোড করুন:
                    </p>

                    {/* Upload Drop Zone / Input */}
                    <div className="relative border-2 border-dashed border-rose-300 hover:border-rose-500 rounded-2xl p-4 bg-white text-center transition group">
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                        onChange={handleVideoFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        title="কম্পিউটার বা মোবাইল থেকে ভিডিও ফাইল নির্বাচন করুন"
                      />
                      <div className="flex flex-col items-center justify-center gap-2 py-2">
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-110 transition">
                          <FileVideo className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">
                            {isVideoUploading ? 'ভিডিও আপলোড হচ্ছে...' : 'মোবাইল বা পিসি থেকে ভিডিও ফাইল বেছে নিন'}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            ক্লিক করুন বা ড্র্যাগ করে ফাইল ড্রপ করুন (MP4, WebM, MOV — সর্বোচ্চ ৩৫MB)
                          </p>
                        </div>
                        {isVideoUploading && (
                          <div className="flex items-center gap-1.5 text-xs text-rose-600 font-bold animate-pulse">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>প্রসেসিং হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selected File Details */}
                    {videoFileName && (
                      <div className="flex items-center justify-between p-2.5 bg-rose-100/70 border border-rose-300 rounded-xl text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileVideo className="w-4 h-4 text-rose-700 shrink-0" />
                          <span className="font-black text-slate-900 truncate">{videoFileName}</span>
                          {videoFileSize && (
                            <span className="text-[10px] bg-white text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">
                              {videoFileSize}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setVideoUrl('');
                            setVideoFileName('');
                            setVideoFileSize('');
                          }}
                          className="text-xs text-rose-700 hover:text-rose-900 font-bold px-2 py-1 rounded-lg bg-white/80 hover:bg-white transition cursor-pointer"
                        >
                          মুছুন
                        </button>
                      </div>
                    )}

                    {/* Video Caption */}
                    <div>
                      <input
                        type="text"
                        placeholder="ভিডিওর শিরোনাম বা ক্যাপশন (ঐচ্ছিক - যেমন: সম্পূর্ণ আনবক্সিং ভিডিও)"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl outline-hidden focus:border-rose-500 font-medium text-slate-900"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: YouTube / Online Link */}
                {videoTab === 'youtube' && (
                  <div className="space-y-3 pt-1">
                    <p className="text-[11px] text-slate-600 font-medium">
                      YouTube ভিডিও বা YouTube Shorts লিংক দিন (কাস্টমার স্টোরে সরাসরি এটি দেখতে পাবে):
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="e.g. https://www.youtube.com/watch?v=... বা YouTube Shorts লিংক"
                        value={videoUrl}
                        onChange={(e) => {
                          setVideoUrl(e.target.value);
                          setVideoFileName('');
                        }}
                        className="flex-1 text-xs p-2.5 bg-white border border-slate-300 rounded-xl outline-hidden focus:border-rose-500 font-medium text-slate-900"
                      />
                      {videoUrl.trim() && (
                        <button
                          type="button"
                          onClick={() => {
                            setVideoUrl('');
                            setVideoFileName('');
                          }}
                          className="px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold rounded-xl transition cursor-pointer"
                          title="ভিডিও লিংক মুছুন"
                        >
                          মুছুন
                        </button>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="ভিডিওর শিরোনাম বা ক্যাপশন (ঐচ্ছিক - যেমন: অফিশিয়াল রিভিউ ও ডেমো)"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl outline-hidden focus:border-rose-500 font-medium text-slate-900"
                      />
                    </div>
                  </div>
                )}

                {/* Live Video Player Preview (Works for both Uploaded file and YouTube link!) */}
                {(() => {
                  const parsed = parseVideoUrl(videoUrl);
                  if (!parsed) return null;
                  return (
                    <div className="pt-2 border-t border-rose-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-black text-slate-800 flex items-center gap-1.5">
                          <Play className="w-3.5 h-3.5 text-rose-600 fill-current" />
                          <span>ভিডিও লাইভ প্রিভিউ (Player Preview):</span>
                        </span>
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                          {parsed.type === 'youtube'
                            ? 'YouTube Player'
                            : parsed.type === 'vimeo'
                            ? 'Vimeo Player'
                            : 'সরাসরি ভিডিও প্লেয়ার'}
                        </span>
                      </div>
                      <div className="relative aspect-video max-w-md rounded-2xl overflow-hidden border border-slate-300 bg-black shadow-md">
                        {parsed.type === 'youtube' || parsed.type === 'vimeo' ? (
                          <iframe
                            src={parsed.embedUrl}
                            title="Product Video Preview"
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={parsed.embedUrl}
                            controls
                            className="absolute inset-0 w-full h-full object-contain"
                          />
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Specifications key-values */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Specifications & Highlights
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Feature (e.g. Display)"
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    className="flex-1 text-xs p-2 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 6.8 inch AMOLED)"
                    value={specVal}
                    onChange={(e) => setSpecVal(e.target.value)}
                    className="flex-1 text-xs p-2 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {Object.keys(specifications).length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {Object.entries(specifications).map(([k, v]) => (
                      <span
                        key={k}
                        className="bg-slate-100 text-slate-800 text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5 font-medium"
                      >
                        <strong>{k}:</strong> {v}
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(k)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              </form>
            </div>

            {/* Sticky Footer with Go to Top and Action Buttons */}
            <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200 bg-slate-50/95 backdrop-blur-xs flex items-center justify-between shrink-0 sticky bottom-0 z-20 rounded-b-3xl">
              <button
                type="button"
                onClick={() => {
                  const scrollContainer = document.getElementById('product-modal-scrollable-body');
                  if (scrollContainer) {
                    scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="text-xs font-bold text-slate-600 hover:text-slate-950 flex items-center gap-1 cursor-pointer transition hover:underline"
              >
                <span>⬆ উপরে যান (Top)</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  form="product-edit-form"
                  type="submit"
                  disabled={isSaving}
                  className="px-5 sm:px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black rounded-xl transition shadow-md shadow-amber-400/20 cursor-pointer disabled:opacity-50 active:scale-98 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isSaving
                      ? 'সংরক্ষণ হচ্ছে...'
                      : editingProduct
                      ? 'আপডেট করুন (Save Changes)'
                      : 'পণ্য যোগ করুন (Publish Product)'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Custom Restock Modal */}
      {customRestockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl max-w-sm w-full space-y-4 text-slate-900 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-950 text-sm">স্টক বৃদ্ধি করুন (Restock)</h3>
              </div>
              <button
                onClick={() => setCustomRestockProduct(null)}
                className="text-slate-400 hover:text-slate-800 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-black text-slate-900 truncate">{customRestockProduct.name}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <span>বর্তমান স্টক: <strong className="text-emerald-700">{customRestockProduct.stock} টি</strong></span>
                <span>•</span>
                <span>মোট বিক্রি: <strong>{customRestockProduct.salesCount || 0} টি</strong></span>
              </div>
            </div>

            <form onSubmit={handleQuickRestockSubmit} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  কতগুলো নতুন পণ্য যোগ করতে চান?
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={customRestockQuantity}
                  onChange={(e) => setCustomRestockQuantity(Math.max(1, Number(e.target.value) || 0))}
                  className="w-full text-sm font-black p-2.5 bg-slate-50 border border-slate-300 text-slate-950 rounded-xl focus:border-emerald-500 outline-hidden"
                />
              </div>

              {/* Quick Select Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[10, 25, 50, 100, 200, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCustomRestockQuantity(amt)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition border cursor-pointer ${
                      customRestockQuantity === amt
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
                    }`}
                  >
                    +{amt}
                  </button>
                ))}
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 font-bold flex items-center justify-between">
                <span>আপডেটের পর মোট স্টক হবে:</span>
                <span className="text-sm font-black text-emerald-950">
                  {customRestockProduct.stock + (Number(customRestockQuantity) || 0)} টি
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCustomRestockProduct(null)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition shadow-md shadow-emerald-600/25 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <PackagePlus className="w-4 h-4" />
                  <span>স্টক যোগ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Clean White) */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl max-w-sm w-full space-y-4 text-center text-slate-900 shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="font-black text-slate-950 text-base">Delete Product?</h3>
            <p className="text-xs text-slate-600 font-medium">
              This will permanently delete the product from Firestore database and remove it from the customer catalog.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
