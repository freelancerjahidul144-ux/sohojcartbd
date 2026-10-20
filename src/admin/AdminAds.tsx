import React, { useState, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Megaphone,
  DollarSign,
  Code2,
  Eye,
  Save,
  HelpCircle,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Layers,
  Copy,
  Info,
  Upload,
  Smartphone,
  Link,
  RefreshCw,
  Image as ImageIcon,
  TrendingUp,
  CreditCard,
  Wallet,
  MousePointer,
  ArrowUpRight,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Advertisement, AdPosition } from '../types';
import { AdCodeRenderer } from '../components/common/AdCodeRenderer';
import { processImageFile } from '../utils/imageHelper';

export const AdminAds: React.FC = () => {
  const {
    advertisements,
    saveAdAction,
    deleteAdAction,
    settings,
    updateSettingsAction,
    addToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'promos' | 'adsterra'>('promos');

  // Promotional Ad Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [title, setTitle] = useState('');
  const [adType, setAdType] = useState<'image' | 'code'>('image');
  const [image, setImage] = useState('');
  const [imageSourceType, setImageSourceType] = useState<'upload' | 'url'>('upload');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [adCode, setAdCode] = useState('');
  const [linkUrl, setLinkUrl] = useState('/products');
  const [position, setPosition] = useState<AdPosition>('homepage');
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingImage(true);
    try {
      const dataUrl = await processImageFile(file, 1600, 900, 0.85);
      setImage(dataUrl);
      addToast('success', 'বিজ্ঞাপনের ছবি সফলভাবে আপলোড করা হয়েছে!');
    } catch (err: any) {
      addToast('error', err?.message || 'ছবি আপলোড করতে সমস্যা হয়েছে');
    } finally {
      setIsProcessingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  // Adsterra Network Settings state
  const [isAdsterraEnabled, setIsAdsterraEnabled] = useState(
    settings.isAdsterraEnabled ?? false
  );
  const [banner728x90, setBanner728x90] = useState(
    settings.adsterraBanner728x90 || ''
  );
  const [banner300x250, setBanner300x250] = useState(
    settings.adsterraBanner300x250 || ''
  );
  const [nativeBanner, setNativeBanner] = useState(
    settings.adsterraNativeBanner || ''
  );
  const [headerScript, setHeaderScript] = useState(
    settings.adsterraHeaderScript || ''
  );
  // Adsterra Earnings & Analytics state
  const [totalEarnedUsd, setTotalEarnedUsd] = useState<number>(
    settings.adsterraTotalEarnedUsd ?? 42.50
  );
  const [todayEarnedUsd, setTodayEarnedUsd] = useState<number>(
    settings.adsterraTodayEarnedUsd ?? 3.80
  );
  const [impressionsCount, setImpressionsCount] = useState<number>(
    settings.adsterraImpressionsCount ?? 14250
  );
  const [clicksCount, setClicksCount] = useState<number>(
    settings.adsterraClicksCount ?? 385
  );
  const [cpmRate, setCpmRate] = useState<number>(
    settings.adsterraCpmRate ?? 0.85
  );
  const [usdToBdtRate, setUsdToBdtRate] = useState<number>(122);
  const [paymentMethod, setPaymentMethod] = useState<string>(
    settings.adsterraPaymentMethod || 'Binance (USDT) / bKash'
  );
  const [isSavingAdsterra, setIsSavingAdsterra] = useState(false);

  const handleOpenAdd = () => {
    setEditingAd(null);
    setTitle('');
    setAdType('image');
    setImage(
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80'
    );
    setAdCode('');
    setLinkUrl('/products');
    setPosition('homepage');
    setIsActive(true);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setTitle(ad.title);
    setAdType(ad.adType || 'image');
    setImage(ad.image || '');
    setAdCode(ad.adCode || '');
    setLinkUrl(ad.linkUrl || '/products');
    setPosition(ad.position);
    setIsActive(ad.isActive);
    setStartDate(ad.startDate || '');
    setEndDate(ad.endDate || '');
    setIsModalOpen(true);
  };

  const handleToggleActive = async (ad: Advertisement) => {
    try {
      await saveAdAction({ ...ad, isActive: !ad.isActive });
      addToast(
        'success',
        ad.isActive ? 'বিজ্ঞাপনটি নিষ্ক্রিয় করা হয়েছে' : 'বিজ্ঞাপনটি সক্রিয় করা হয়েছে'
      );
    } catch {
      addToast('error', 'স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('error', 'বিজ্ঞাপনের শিরোনাম দিন');
      return;
    }
    if (adType === 'image' && !image.trim()) {
      addToast('error', 'কম্পিউটার বা মোবাইল থেকে ব্যানার ছবি আপলোড করুন অথবা লিংক দিন');
      return;
    }
    if (adType === 'code' && !adCode.trim()) {
      addToast('error', 'বিজ্ঞাপনের HTML বা স্ক্রিপ্ট কোড দিন');
      return;
    }

    setIsSaving(true);
    const payload: Advertisement = {
      id: editingAd ? editingAd.id : `ad-${Date.now()}`,
      title: title.trim(),
      image: image.trim() || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
      linkUrl: linkUrl.trim(),
      position,
      isActive,
      adType,
      adCode: adCode.trim() || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      createdAt: editingAd?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveAdAction(payload);
      addToast('success', 'বিজ্ঞাপন সফলভাবে সেভ করা হয়েছে');
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      addToast('error', 'বিজ্ঞাপন সেভ করতে সমস্যা হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('আপনি কি এই বিজ্ঞাপনটি মুছে ফেলতে চান?')) {
      await deleteAdAction(id);
      addToast('success', 'বিজ্ঞাপন মুছে ফেলা হয়েছে');
    }
  };

  const handleSaveAdsterraSettings = async () => {
    setIsSavingAdsterra(true);
    try {
      await updateSettingsAction({
        ...settings,
        isAdsterraEnabled,
        adsterraBanner728x90: banner728x90.trim(),
        adsterraBanner300x250: banner300x250.trim(),
        adsterraNativeBanner: nativeBanner.trim(),
        adsterraHeaderScript: headerScript.trim(),
        adsterraTotalEarnedUsd: Number(totalEarnedUsd) || 0,
        adsterraTodayEarnedUsd: Number(todayEarnedUsd) || 0,
        adsterraImpressionsCount: Number(impressionsCount) || 0,
        adsterraClicksCount: Number(clicksCount) || 0,
        adsterraCpmRate: Number(cpmRate) || 0,
        adsterraPaymentMethod: paymentMethod,
        updatedAt: new Date().toISOString(),
      });
      addToast('success', 'Adsterra অ্যাড ও আর্নিংস সেটিংস সফলভাবে সেভ করা হয়েছে!');
    } catch (err) {
      console.error(err);
      addToast('error', 'সেটিংস সেভ করতে সমস্যা হয়েছে');
    } finally {
      setIsSavingAdsterra(false);
    }
  };

  const loadSampleCodes = () => {
    setBanner728x90(
      `<div style="display:flex;align-items:center;justify-content:center;height:90px;background:linear-gradient(135deg,#0f172a,#1e293b);border:1px solid #334155;border-radius:12px;color:#f8fafc;font-family:sans-serif;padding:0 20px;text-align:center;">
  <div>
    <div style="font-size:11px;font-weight:700;color:#fbbf24;text-transform:uppercase;letter-spacing:1px;">DEMO 728x90 ADSTERRA BANNER</div>
    <div style="font-size:15px;font-weight:800;color:#ffffff;margin-top:2px;">Special Tech Gadgets Clearance — Up to 40% Off</div>
  </div>
</div>`
    );
    setBanner300x250(
      `<div style="display:flex;align-items:center;justify-content:center;height:250px;background:linear-gradient(135deg,#18181b,#27272a);border:1px solid #3f3f46;border-radius:12px;color:#f4f4f5;font-family:sans-serif;padding:20px;text-align:center;">
  <div>
    <div style="font-size:10px;font-weight:700;color:#38bdf8;text-transform:uppercase;letter-spacing:1px;">DEMO 300x250 RECTANGLE</div>
    <div style="font-size:16px;font-weight:800;color:#ffffff;margin-top:8px;">Fast Nationwide Delivery on All Wireless Accessories</div>
    <button style="margin-top:14px;background:#38bdf8;color:#09090b;font-weight:800;font-size:12px;padding:8px 16px;border-radius:9999px;border:none;cursor:pointer;">Explore Deals</button>
  </div>
</div>`
    );
    setNativeBanner(
      `<div style="display:flex;align-items:center;justify-content:space-between;height:120px;background:#090d16;border:1px solid #1e293b;border-radius:12px;color:#fff;font-family:sans-serif;padding:16px 24px;width:100%;">
  <div>
    <span style="font-size:10px;color:#a855f7;font-weight:700;text-transform:uppercase;">Native Sponsored</span>
    <h4 style="margin:4px 0 0;font-size:14px;color:#f1f5f9;">Official Premium Smart Watches & Wireless Earbuds</h4>
  </div>
  <span style="background:#a855f7;color:#fff;padding:6px 14px;border-radius:8px;font-size:11px;font-weight:bold;">Shop Now</span>
</div>`
    );
    setIsAdsterraEnabled(true);
    addToast('info', 'নমুনা ডেমো অ্যাড কোড লোড করা হয়েছে! আপনি চাইলে এটি সেভ করে দেখতে পারেন।');
  };

  const handleClearAllAdsterraCodes = async () => {
    if (!window.confirm('আপনি কি নিশ্চিত যে সব Adsterra বিজ্ঞাপনের কোড মুছে ফেলবেন এবং বিজ্ঞাপন বন্ধ করবেন?')) {
      return;
    }
    setBanner728x90('');
    setBanner300x250('');
    setNativeBanner('');
    setHeaderScript('');
    setIsAdsterraEnabled(false);
    setIsSavingAdsterra(true);
    try {
      await updateSettingsAction({
        ...settings,
        isAdsterraEnabled: false,
        adsterraBanner728x90: '',
        adsterraBanner300x250: '',
        adsterraNativeBanner: '',
        adsterraHeaderScript: '',
        updatedAt: new Date().toISOString(),
      });
      addToast('success', 'সকল Adsterra বিজ্ঞাপন কোড সফলভাবে মুছে ফেলা ও বন্ধ করা হয়েছে!');
    } catch (err) {
      console.error(err);
      addToast('error', 'বিজ্ঞাপন কোড মুছতে সমস্যা হয়েছে');
    } finally {
      setIsSavingAdsterra(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-slate-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              Advertisement & Monetization
            </h1>
            <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-amber-600" />
              ইনকাম ও বিজ্ঞাপন
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            ওয়েবসাইটে প্রচারণামূলক নিজস্ব অফার ব্যানার এবং Adsterra অ্যাড বসিয়ে ডলার উপার্জনের নিয়ন্ত্রণ
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('promos')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'promos'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>নিজস্ব ব্যানার ({advertisements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('adsterra')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'adsterra'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Adsterra নেটওয়ার্ক</span>
            {settings.isAdsterraEnabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-200 animate-ping"></span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: Promotional / Custom Banners */}
      {activeTab === 'promos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-black text-slate-950">স্টোরের নিজস্ব ব্যানার ও ক্যাম্পেইন</h3>
              <p className="text-xs text-slate-600 font-medium">
                হোমপেজ, প্রোডাক্ট পেজ বা ফুটারের নিজস্ব ডিসকাউন্ট অফার ও স্পেশাল ব্যানার
              </p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ব্যানার তৈরি করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {advertisements.map((ad) => (
              <div
                key={ad.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
              >
                {ad.adType === 'code' && ad.adCode ? (
                  <div className="p-3 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Code2 className="w-3 h-3 text-purple-600" />
                        Custom HTML / Script Ad
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">
                        {ad.position}
                      </span>
                    </div>
                    <AdCodeRenderer
                      code={ad.adCode}
                      format={
                        ad.position === 'homepage'
                          ? '728x90'
                          : ad.position === 'bottom'
                          ? 'native'
                          : '300x250'
                      }
                      className="my-0"
                    />
                  </div>
                ) : (
                  <div className="relative h-44 bg-slate-100">
                    <img
                      src={ad.image}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                        Position: {ad.position.replace('_', ' ')}
                      </span>
                      <span className="bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 shadow-xs">
                        Image Banner
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-slate-950 text-sm line-clamp-2">
                    {ad.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono truncate">
                    Link: {ad.linkUrl}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleToggleActive(ad)}
                      className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border transition cursor-pointer ${
                        ad.isActive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}
                    >
                      {ad.isActive ? (
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3 h-3 text-slate-400" />
                      )}
                      <span>{ad.isActive ? 'Active (ওয়েবসাইটে চলছে)' : 'Disabled'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(ad)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition border border-slate-200"
                        title="Edit Banner"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg cursor-pointer transition"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Adsterra Monetization & Income Settings */}
      {activeTab === 'adsterra' && (
        <div className="space-y-6">
          {/* Main Status & Toggle Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
                      isAdsterraEnabled
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isAdsterraEnabled ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                      }`}
                    ></span>
                    {isAdsterraEnabled
                      ? 'Adsterra বিজ্ঞাপন বর্তমানে সক্রিয় (Earning Active)'
                      : 'Adsterra বিজ্ঞাপন নিষ্ক্রিয় রয়েছে'}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-950 tracking-tight">
                  Adsterra বিজ্ঞাপন থেকে ওয়েবসাইট মনিটাইজেশন
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Adsterra-তে বিনামূল্যে অ্যাকাউন্ট খুলে ব্যানার কোড নিচে বসালে আপনার প্রতিটি
                  ভিজিটরের পেজ ভিউ এবং অ্যাডে ক্লিক থেকে ডলার ইনকাম জমা হবে।
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdsterraEnabled(!isAdsterraEnabled)}
                  className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition cursor-pointer shadow-xs ${
                    isAdsterraEnabled
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold'
                  }`}
                >
                  {isAdsterraEnabled ? (
                    <>
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>অ্যাড দেখানো বন্ধ করুন</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-white" />
                      <span>অ্যাড চালু করুন (Enable Ads)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClearAllAdsterraCodes}
                  className="flex items-center justify-center gap-1.5 px-4 py-3 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 font-bold text-xs rounded-xl transition cursor-pointer"
                  title="সব Adsterra বিজ্ঞাপন কোড এক ক্লিকে মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>সব কোড কাটুন / মুছুন</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAdsterraSettings}
                  disabled={isSavingAdsterra}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl transition shadow-md shadow-amber-400/20 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingAdsterra ? 'সেভ হচ্ছে...' : 'সেটিংস সেভ করুন'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ADSTERRA EARNINGS & INCOME DASHBOARD (আর্নিংস ও ইনকাম ট্র্যাকার) */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-emerald-500/30 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Adsterra Earning & Monetization Analytics</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>Adsterra ইনকাম ও ব্যালেন্স হিসাব</span>
                </h3>
                <p className="text-xs text-slate-400">
                  আপনার ওয়েবসাইটে প্রদর্শিত বিজ্ঞাপনের ইম্প্রেশন, ক্লিক এবং ডলার/টাকার মোট আয়ের হিসাব
                </p>
              </div>

              {/* Direct Link to Official Adsterra Publisher Dashboard */}
              <a
                href="https://publishers.adsterra.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-400/20 cursor-pointer"
              >
                <span>অফিশিয়াল Adsterra ড্যাশবোর্ড লগইন</span>
                <ArrowUpRight className="w-4 h-4 stroke-[3]" />
              </a>
            </div>

            {/* 4 Stat Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Earned */}
              <div className="bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">সর্বমোট ইনকাম (Total Balance)</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                    ${Number(totalEarnedUsd).toFixed(2)}
                  </p>
                  <p className="text-xs text-emerald-300/80 font-bold mt-0.5">
                    ≈ ৳{(Number(totalEarnedUsd) * usdToBdtRate).toLocaleString()} টাকা
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-800">
                  উইথড্র যোগ্য মোট আর্নিংস
                </span>
              </div>

              {/* Today's Earning */}
              <div className="bg-slate-900/90 rounded-2xl p-4 border border-blue-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">আজকের আয় (Today's Earned)</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">
                    ${Number(todayEarnedUsd).toFixed(2)}
                  </p>
                  <p className="text-xs text-blue-300/80 font-bold mt-0.5">
                    ≈ ৳{(Number(todayEarnedUsd) * usdToBdtRate).toLocaleString()} টাকা
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-800">
                  গত ২৪ ঘণ্টার আনুমানিক আয়
                </span>
              </div>

              {/* Total Impressions */}
              <div className="bg-slate-900/90 rounded-2xl p-4 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">মোট ইম্প্রেশন (Views)</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">
                    {Number(impressionsCount).toLocaleString()}
                  </p>
                  <p className="text-xs text-purple-300/80 font-bold mt-0.5">
                    ক্লিক: {Number(clicksCount).toLocaleString()} টি (CTR: {((clicksCount / (impressionsCount || 1)) * 100).toFixed(1)}%)
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-800">
                  বিজ্ঞাপন প্রদর্শনের সংখ্যা
                </span>
              </div>

              {/* eCPM Rate */}
              <div className="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">গড় CPM রেট (Rate)</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                    ${Number(cpmRate).toFixed(2)}
                  </p>
                  <p className="text-xs text-amber-300/80 font-bold mt-0.5">
                    প্রতি ১,০০০ ভিউয়ে আয়
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-800">
                  ১ ডলার = ৳{usdToBdtRate} টাকা হিসাবে
                </span>
              </div>
            </div>

            {/* Quick Update Form: To record actual Adsterra metrics */}
            <div className="p-4 sm:p-5 bg-slate-900/95 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>আপনার Adsterra আর্নিংস আপডেট করুন (Update Stats)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Adsterra একাউন্টে লগইন করে বর্তমান ব্যালেন্স ও সংখ্যা এখানে লিখে সেভ করতে পারেন
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveAdsterraSettings}
                  disabled={isSavingAdsterra}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer self-start sm:self-auto"
                >
                  {isSavingAdsterra ? 'সেভ হচ্ছে...' : 'হিসাব সেভ করুন'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    মোট ব্যালেন্স ($ USD):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={totalEarnedUsd}
                    onChange={(e) => setTotalEarnedUsd(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:border-emerald-500 outline-hidden font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    আজকের আয় ($ USD):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={todayEarnedUsd}
                    onChange={(e) => setTodayEarnedUsd(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:border-blue-500 outline-hidden font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    মোট ইম্প্রেশন (Views):
                  </label>
                  <input
                    type="number"
                    value={impressionsCount}
                    onChange={(e) => setImpressionsCount(parseInt(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:border-purple-500 outline-hidden font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    ডলার রেট (১ USD = কত টাকা):
                  </label>
                  <input
                    type="number"
                    value={usdToBdtRate}
                    onChange={(e) => setUsdToBdtRate(parseFloat(e.target.value) || 122)}
                    className="w-full text-xs p-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:border-amber-500 outline-hidden font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* How to withdraw to bKash / Bangladesh Guide */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
              <div className="space-y-1">
                <p className="font-extrabold text-white flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Adsterra থেকে বাংলাদেশে টাকা তোলার নিয়ম (Payment Withdrawal):</span>
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  সবচেয়ে সহজ উপায় হলো <strong>Binance (USDT)</strong> নির্বাচন করা (মিনিমাম মাত্র $5 উইথড্র)। Adsterra থেকে Binance-এ ডলার আসার পর বাইনান্স P2P দিয়ে ১ মিনিটে সরাসরি <strong>bKash / Nagad / Bank</strong>-এ ক্যাশ টাকা পেয়ে যাবেন। এছাড়া সরাসরি ব্যাংক ট্রান্সফার ($1000) বা WebMoney ($5) ব্যবহার করতে পারেন।
                </p>
              </div>
            </div>
          </div>

          {/* Quick Guide & Safety Warnings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Bengali Step-by-Step Guide */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-extrabold text-sm">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>Adsterra কোড পাওয়ার সহজ ধাপসমূহ:</span>
              </div>
              <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside leading-relaxed font-medium">
                <li>
                  <a
                    href="https://adsterra.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-700 hover:underline font-bold inline-flex items-center gap-1"
                  >
                    adsterra.com <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  এ গিয়ে <strong className="text-slate-950 font-bold">"Join as Publisher"</strong> নির্বাচন করে ফ্রি অ্যাকাউন্ট খুলুন।
                </li>
                <li>
                  ড্যাশবোর্ডে গিয়ে <strong className="text-slate-950 font-bold">"Add Website"</strong> চাপুন এবং আপনার ওয়েবসাইটের লিঙ্ক দিন।
                </li>
                <li>
                  ওয়েবসাইটের ক্যাটাগরি হিসেবে <strong className="text-slate-950 font-bold">Ecommerce / Gadgets</strong> সিলেক্ট করুন।
                </li>
                <li>
                  ব্যানার টাইপ হিসেবে <strong className="text-slate-950 font-bold">728x90</strong> (বড় ব্যানার) এবং <strong className="text-slate-950 font-bold">300x250</strong> (মোবাইল ব্যানার) তৈরি করে কোডটি কপি করুন।
                </li>
                <li>
                  নিচের বক্সে সেই কোডটি পেস্ট করে দিয়ে <strong className="text-amber-800 font-bold">"সেটিংস সেভ করুন"</strong> বাটনে চাপ দিন!
                </li>
              </ol>
            </div>

            {/* Crucial Safety Notice */}
            <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>ই-কমার্স সাইটের জন্য গুরুত্বপূর্ণ সতর্কতা:</span>
              </div>
              <ul className="text-xs text-amber-950 space-y-2 list-disc list-inside leading-relaxed font-medium">
                <li>
                  <strong className="text-rose-700 font-bold">Popunder (পপ-আপ) অ্যাড এড়িয়ে চলুন:</strong> এটি চালু করলে কাস্টমার ক্লিক করার সাথে সাথে নতুন ট্যাব খুলে যাবে এবং কাস্টমার বিরক্ত হয়ে প্রডাক্ট না কিনে চলে যেতে পারে।
                </li>
                <li>
                  <strong className="text-emerald-800 font-bold">ব্যানার ও নেটিভ অ্যাড ব্যবহার করুন:</strong> 728x90 এবং 300x250 ব্যানার অ্যাড সাইটের স্বাভাবিক লুক নষ্ট করে না এবং সুরক্ষিত থাকে।
                </li>
                <li>
                  <strong className="text-slate-950 font-bold">ইনকাম কীভাবে জমা হয়:</strong> Adsterra-তে CPM (প্রতি ১০০০ ভিউ) এবং ক্লিকে ডলার জমা হবে। প্রতি মাসে ২ বার (১৫ তারিখ ও মাসের শেষে) $৫ ডলার হলেই USDT, WebMoney বা ব্যাংকে টাকা তুলতে পারবেন।
                </li>
              </ul>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={loadSampleCodes}
                  className="text-[11px] text-amber-800 hover:text-amber-950 font-bold underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>ক্লিক করে নমুনা ডেমো অ্যাড কোড লোড করুন (পরীক্ষা করার জন্য)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Ad Slot Inputs */}
          <div className="space-y-6">
            {/* Slot 1: 728x90 Homepage Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <h3 className="text-sm font-black text-slate-950">
                      হোমপেজ ও মিড ব্যানার (728x90 Leaderboard Code)
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    কম্পিউটার, ল্যাপটপ ও হোমপেজের মাঝখানে ডিসপ্লে করার জন্য সেরা সাইজ
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded-md self-start sm:self-auto font-bold">
                  Format: 728 x 90 px
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Adsterra স্ক্রিপ্ট বা HTML কোড পেস্ট করুন:
                  </label>
                  {banner728x90 && (
                    <button
                      type="button"
                      onClick={() => {
                        setBanner728x90('');
                        addToast('info', 'হোমপেজ ব্যানার কোড মুছে ফেলা হয়েছে। স্থায়ী করতে সেভ করুন।');
                      }}
                      className="text-[11px] text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1 cursor-pointer font-bold transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>কোডটি মুছুন</span>
                    </button>
                  )}
                </div>
                <textarea
                  rows={4}
                  value={banner728x90}
                  onChange={(e) => setBanner728x90(e.target.value)}
                  placeholder={`<script type="text/javascript">\n  atOptions = { 'key': 'xxxxxxxx', 'format': 'iframe', 'height': 90, 'width': 728, 'params': {} };\n</script>\n<script type="text/javascript" src="//www.highperformanceformat.com/xxxxxxxx/invoke.js"></script>`}
                  className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden leading-relaxed shadow-inner placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* Live Preview for Slot 1 */}
              {banner728x90 && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-2">
                    <Eye className="w-3.5 h-3.5 text-amber-600" />
                    লাইভ প্রিভিউ (728x90):
                  </span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-center">
                    <AdCodeRenderer code={banner728x90} format="728x90" className="my-0 w-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Slot 2: 300x250 Medium Rectangle (Mobile / Products) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <h3 className="text-sm font-black text-slate-950">
                      প্রোডাক্ট পেজ ও মোবাইল ব্যানার (300x250 Medium Rectangle Code)
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    মোবাইল স্ক্রিন ও প্রোডাক্ট ব্রাউজিং পেজের উপরে সবচেয়ে বেশি ক্লিক পাওয়া সাইজ
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded-md self-start sm:self-auto font-bold">
                  Format: 300 x 250 px
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Adsterra স্ক্রিপ্ট বা HTML কোড পেস্ট করুন:
                  </label>
                  {banner300x250 && (
                    <button
                      type="button"
                      onClick={() => {
                        setBanner300x250('');
                        addToast('info', 'প্রোডাক্ট/মোবাইল ব্যানার কোড মুছে ফেলা হয়েছে। স্থায়ী করতে সেভ করুন।');
                      }}
                      className="text-[11px] text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1 cursor-pointer font-bold transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>কোডটি মুছুন</span>
                    </button>
                  )}
                </div>
                <textarea
                  rows={4}
                  value={banner300x250}
                  onChange={(e) => setBanner300x250(e.target.value)}
                  placeholder={`<script type="text/javascript">\n  atOptions = { 'key': 'xxxxxxxx', 'format': 'iframe', 'height': 250, 'width': 300, 'params': {} };\n</script>\n<script type="text/javascript" src="//www.highperformanceformat.com/xxxxxxxx/invoke.js"></script>`}
                  className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden leading-relaxed shadow-inner placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* Live Preview for Slot 2 */}
              {banner300x250 && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-2">
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    লাইভ প্রিভিউ (300x250):
                  </span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-center">
                    <AdCodeRenderer code={banner300x250} format="300x250" className="my-0 w-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Slot 3: Native Banner / Footer Ad */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    <h3 className="text-sm font-black text-slate-950">
                      বটম ব্যানার ও নেটিভ অ্যাড (Native Banner / Footer Code)
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    স্টোরের নিচে ফুটারের ওপরে রেসপনসিভ নেটিভ ব্যানার অথবা 468x60 কোড
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded-md self-start sm:self-auto font-bold">
                  Format: Native / Responsive
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Adsterra Native Banner বা HTML কোড পেস্ট করুন:
                  </label>
                  {nativeBanner && (
                    <button
                      type="button"
                      onClick={() => {
                        setNativeBanner('');
                        addToast('info', 'নেটিভ/বটম ব্যানার কোড মুছে ফেলা হয়েছে। স্থায়ী করতে সেভ করুন।');
                      }}
                      className="text-[11px] text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1 cursor-pointer font-bold transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>কোডটি মুছুন</span>
                    </button>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={nativeBanner}
                  onChange={(e) => setNativeBanner(e.target.value)}
                  placeholder={`<script async="async" data-cfasync="false" src="//www.highperformanceformat.com/xxxxxxxx/invoke.js"></script>\n<div id="container-xxxxxxxx"></div>`}
                  className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden leading-relaxed shadow-inner placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* Live Preview for Slot 3 */}
              {nativeBanner && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-2">
                    <Eye className="w-3.5 h-3.5 text-purple-600" />
                    লাইভ প্রিভিউ (Native):
                  </span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-center">
                    <AdCodeRenderer code={nativeBanner} format="native" className="my-0 w-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Slot 4: Header / Verification Script (Optional) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-black text-slate-950">
                    হেডার বা ভেরিফিকেশন স্ক্রিপ্ট (Header Script / Social Bar - ঐচ্ছিক)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Adsterra অ্যাকাউন্ট ভেরিফিকেশনের জন্য মেটাট্যাগ বা সোশ্যাল বার স্ক্রিপ্ট কোড
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded-md font-bold">
                  Optional
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800">
                    হেডার স্ক্রিপ্ট কোড:
                  </label>
                  {headerScript && (
                    <button
                      type="button"
                      onClick={() => {
                        setHeaderScript('');
                        addToast('info', 'হেডার স্ক্রিপ্ট কোড মুছে ফেলা হয়েছে। স্থায়ী করতে সেভ করুন।');
                      }}
                      className="text-[11px] text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1 cursor-pointer font-bold transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>কোডটি মুছুন</span>
                    </button>
                  )}
                </div>
                <textarea
                  rows={2}
                  value={headerScript}
                  onChange={(e) => setHeaderScript(e.target.value)}
                  placeholder="<script type='text/javascript' src='//...popunder or socialbar... '></script>"
                  className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden leading-relaxed shadow-inner placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Bottom Save Bar */}
          <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-300 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>কোড পরিবর্তনের পর অবশ্যই নিচের বাটনে চাপ দিয়ে সেভ করুন।</span>
            </div>
            <button
              type="button"
              onClick={handleSaveAdsterraSettings}
              disabled={isSavingAdsterra}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl transition shadow-md shadow-amber-400/20 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingAdsterra ? 'সেভ হচ্ছে...' : 'সেভ করুন'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Promotional / Custom Ad Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-lg font-black text-slate-950">
                {editingAd ? 'বিজ্ঞাপন এডিট করুন' : 'নতুন বিজ্ঞাপন তৈরি করুন'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Switcher */}
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setAdType('image')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    adType === 'image'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  ইমেজ ব্যানার (Internal Offer)
                </button>
                <button
                  type="button"
                  onClick={() => setAdType('code')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    adType === 'code'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  Adsterra / কাস্টম কোড অ্যাড
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  বিজ্ঞাপনের শিরোনাম / নাম
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: স্পেশাল গ্যাজেট অফার বা Adsterra 728x90"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:bg-white focus:border-amber-500 outline-hidden font-medium"
                />
              </div>

              {adType === 'image' ? (
                <>
                  {/* Banner Image with Device Upload / Link options */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <label className="block text-xs font-bold text-slate-800">
                        ব্যানার ছবি (Banner Image) <span className="text-amber-600">*</span>
                      </label>
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setImageSourceType('upload')}
                          className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            imageSourceType === 'upload'
                              ? 'bg-amber-400 text-slate-950 shadow-2xs font-black'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>ডিভাইস আপলোড</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageSourceType('url')}
                          className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            imageSourceType === 'url'
                              ? 'bg-amber-400 text-slate-950 shadow-2xs font-black'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Link className="w-3.5 h-3.5" />
                          <span>ছবির লিংক (URL)</span>
                        </button>
                      </div>
                    </div>

                    {imageSourceType === 'upload' ? (
                      <div className="space-y-2">
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50/80 rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition group"
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                          />
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition border border-amber-300">
                              {isProcessingImage ? (
                                <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
                              ) : (
                                <Upload className="w-6 h-6" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-900">
                                {isProcessingImage
                                  ? 'ছবি প্রসেস হচ্ছে, দয়া করে অপেক্ষা করুন...'
                                  : 'কম্পিউটার বা মোবাইল থেকে ছবি সিলেক্ট করুন'}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                ক্লিক করে ফাইল বা মোবাইল গ্যালারি থেকে যেকোনো ব্যানার ছবি (JPG, PNG, WebP) নির্বাচন করুন
                              </p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300 mt-1">
                              <Smartphone className="w-3.5 h-3.5 text-amber-700" />
                              <span>মোবাইল ক্যামেরা ও গ্যালারি সাপোর্টেড</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:bg-white focus:border-amber-500 outline-hidden font-medium"
                        />
                        <p className="text-[10px] text-slate-500">
                          অনলাইন ইমেজ লিংক পেস্ট করুন (যেমন: Unsplash, Imgur ইত্যাদি)
                        </p>
                      </div>
                    )}

                    {/* Live Ad Image Preview */}
                    {image && (
                      <div className="mt-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-700 font-bold flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                            <span>বিজ্ঞাপন প্রিভিউ (Live Preview):</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-[10px] font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 cursor-pointer"
                            >
                              <Upload className="w-3 h-3" />
                              <span>অন্য ছবি দিন</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setImage('')}
                              className="text-[10px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>মুছুন</span>
                            </button>
                          </div>
                        </div>
                        <div className="relative aspect-[16/7] rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
                          <img
                            src={image}
                            alt="Advertisement Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      ক্লিক করলে কোথায় যাবে (Target Click URL)
                    </label>
                    <input
                      type="text"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="/products অথবা https://..."
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:bg-white focus:border-amber-500 outline-hidden font-medium"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Adsterra বা থার্ড-পার্টি HTML / Script কোড
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={adCode}
                    onChange={(e) => setAdCode(e.target.value)}
                    placeholder={`<script type="text/javascript">\n ... \n</script>`}
                    className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:bg-white focus:border-amber-500 outline-hidden leading-relaxed"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  কোথায় শো করবে (Placement)
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as AdPosition)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:bg-white focus:border-amber-500 outline-hidden cursor-pointer font-medium"
                >
                  <option value="homepage">Homepage Banner (মাঝখানে)</option>
                  <option value="product_page">Products Page (উপরে)</option>
                  <option value="bottom">Bottom Store Banner (ফুটারের উপরে)</option>
                  <option value="promotional">Promotional Popup / Strip</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    শুরুর তারিখ (ঐচ্ছিক)
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:bg-white focus:border-amber-500 outline-hidden font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    শেষের তারিখ (ঐচ্ছিক)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:bg-white focus:border-amber-500 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-800 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-amber-500 cursor-pointer"
                  />
                  <span>সক্রিয় রাখুন (Active & Displaying on Website)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition border border-slate-200"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isSaving ? 'সেভ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
