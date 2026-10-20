import React, { useState, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Image as ImageIcon,
  Sparkles,
  Upload,
  Smartphone,
  Link,
  RefreshCw,
  Video,
  Monitor,
  Maximize2,
  Play,
  Film,
  Check,
  Camera,
  Target,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Banner } from '../types';
import { processImageFile } from '../utils/imageHelper';

export const AdminBanners: React.FC = () => {
  const { banners, products, saveBannerAction, deleteBannerAction, addToast } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');

  // Media Type: Image or Video
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [image, setImage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageSourceType, setImageSourceType] = useState<'upload' | 'url'>('upload');
  const [videoSourceType, setVideoSourceType] = useState<'url' | 'upload'>('url');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [buttonText, setButtonText] = useState('Shop Now');
  const [buttonLink, setButtonLink] = useState('/products');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [position, setPosition] = useState<'hero' | 'promo' | 'deal'>('hero');
  const [isSaving, setIsSaving] = useState(false);

  // 🎭 Picture Shadow / Overlay Customization (শ্যাডো অন/অফ ও কালার কাস্টমাইজেশন)
  const [showOverlay, setShowOverlay] = useState(true);
  const [overlayColor, setOverlayColor] = useState('#000000');
  const [overlayOpacity, setOverlayOpacity] = useState(75);
  const [overlayDirection, setOverlayDirection] = useState<'left' | 'radial' | 'full' | 'bottom'>('left');

  // Process image file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingImage(true);
    try {
      const dataUrl = await processImageFile(file, 1920, 1080, 0.85);
      setImage(dataUrl);
      addToast('success', 'ব্যানার ছবি সফলভাবে আপলোড করা হয়েছে!');
    } catch (err: any) {
      addToast('error', err?.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে');
    } finally {
      setIsProcessingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  // Process video file from device
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      addToast(
        'error',
        'ভিডিওর সাইজ সর্বোচ্চ ২৫ মেগাবাইট (25MB) হওয়া উচিত। বড় ভিডিওর ক্ষেত্রে YouTube বা অনলাইন লিঙ্ক ব্যবহার করুন।'
      );
      return;
    }

    setIsProcessingVideo(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setVideoUrl(reader.result);
          addToast('success', 'ভিডিও সফলভাবে নির্বাচন করা হয়েছে!');
        }
        setIsProcessingVideo(false);
      };
      reader.onerror = () => {
        addToast('error', 'ভিডিও রিড করতে সমস্যা হয়েছে');
        setIsProcessingVideo(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setIsProcessingVideo(false);
      addToast('error', 'ভিডিও আপলোড করতে সমস্যা হয়েছে');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setMediaType('image');
    setImage(
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1920&q=85'
    );
    setVideoUrl('');
    setButtonText('Shop Now');
    setButtonLink('/products');
    setDisplayOrder(banners.length + 1);
    setIsActive(true);
    setPosition('hero');
    setShowOverlay(true);
    setOverlayColor('#000000');
    setOverlayOpacity(75);
    setOverlayDirection('left');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle || '');
    setMediaType(banner.mediaType || 'image');
    setImage(banner.image);
    setVideoUrl(banner.videoUrl || '');
    setButtonText(banner.buttonText || 'Shop Now');
    setButtonLink(banner.buttonLink || '/products');
    setDisplayOrder(banner.displayOrder || 1);
    setIsActive(banner.isActive);
    setPosition(banner.position || 'hero');
    setShowOverlay(banner.showOverlay !== false);
    setOverlayColor(banner.overlayColor || '#000000');
    setOverlayOpacity(banner.overlayOpacity ?? 75);
    setOverlayDirection(banner.overlayDirection || 'left');
    setIsModalOpen(true);
  };

  const handleToggleActive = async (b: Banner) => {
    try {
      await saveBannerAction({ ...b, isActive: !b.isActive });
    } catch {
      // handled
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('error', 'দয়া করে ব্যানারের শিরোনাম (Title) দিন।');
      return;
    }

    if (mediaType === 'video' && !videoUrl.trim() && !image.trim()) {
      addToast('error', 'দয়া করে ভিডিওর লিঙ্ক বা ফাইল দিন, অথবা অন্তত একটি পোস্টার ছবি দিন।');
      return;
    }

    if (mediaType === 'image' && !image.trim()) {
      addToast('error', 'দয়া করে একটি ছবি আপলোড করুন অথবা ছবির লিঙ্ক দিন।');
      return;
    }

    setIsSaving(true);
    const payload: Banner = {
      id: editingBanner ? editingBanner.id : `banner-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim(),
      mediaType,
      image:
        image.trim() ||
        'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1920&q=85',
      videoUrl: mediaType === 'video' ? videoUrl.trim() : undefined,
      buttonText: buttonText.trim(),
      buttonLink: buttonLink.trim(),
      displayOrder: Number(displayOrder) || 1,
      isActive,
      position,
      showOverlay,
      overlayColor,
      overlayOpacity: Number(overlayOpacity) || 0,
      overlayDirection,
      createdAt: editingBanner?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveBannerAction(payload);
      addToast(
        'success',
        editingBanner
          ? 'ব্যানার সফলভাবে আপডেট করা হয়েছে!'
          : 'নতুন ব্যানার সফলভাবে তৈরি করা হয়েছে!'
      );
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      addToast('error', 'ব্যানার সংরক্ষণ করতে সমস্যা হয়েছে।');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this promotional banner?')) {
      await deleteBannerAction(id);
    }
  };

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeEmbed = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1&controls=0&loop=1&playlist=${match[2]}&playsinline=1`;
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-slate-900">
      {/* Top Header - High Contrast Dark Text */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
            <Film className="w-6 h-6 text-amber-500" />
            <span>Banner & Video Showcase (ব্যানার ও ভিডিও ম্যানেজমেন্ট)</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-semibold">
            হোমপেজের মূল হিরো স্লাইডার, ফটো ব্যানার এবং আকর্ষণীয় ভিডিও ব্যানার কন্ট্রোল করুন
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl transition shadow-md shadow-amber-400/20 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ নতুন ব্যানার বা ভিডিও যুক্ত করুন</span>
        </button>
      </div>

      {/* RECOMMENDED BANNER SIZES ON SCREEN (ব্যানার সাইজ গাইড - স্পষ্ট ডার্ক টেক্সট ও ক্লিয়ার ব্যাকগ্রাউন্ড) */}
      <div className="bg-white border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 border border-amber-500 font-black shadow-xs">
            <Maximize2 className="w-5 h-5" />
          </div>
          <div className="space-y-3 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                <span>📐 ব্যানার সাইজ কত দিবেন? (Recommended Banner Sizes)</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-500/40">
                  সাইজ নির্দেশিকা
                </span>
              </h3>
              <span className="text-[11px] text-slate-700 font-bold">
                সঠিক সাইজের ছবি দিলে ওয়েবসাইট দ্রুত লোড হবে ও ঝাপসা হবে না
              </span>
            </div>

            {/* 4 Quick Size Cards with Pure Dark High Contrast Text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-amber-100/70 border-2 border-amber-300 p-3 rounded-xl space-y-1">
                <span className="text-[11px] text-amber-950 font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-amber-800" /> Hero Carousel (মূল ব্যানার)
                </span>
                <p className="text-base font-black text-slate-950">1920 × 600 px</p>
                <p className="text-[11px] text-slate-800 font-bold">
                  বা 1600 × 600 px (১৬:৯ / ২১:৯ ওয়াইড)
                </p>
              </div>

              <div className="bg-blue-100/70 border-2 border-blue-300 p-3 rounded-xl space-y-1">
                <span className="text-[11px] text-blue-950 font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-800" /> মোবাইল অপ্টিমাইজড
                </span>
                <p className="text-base font-black text-slate-950">1200 × 630 px</p>
                <p className="text-[11px] text-slate-800 font-bold">
                  বা 1080 × 1080 px (১:১ স্কয়ার ছবি)
                </p>
              </div>

              <div className="bg-emerald-100/70 border-2 border-emerald-300 p-3 rounded-xl space-y-1">
                <span className="text-[11px] text-emerald-950 font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-800" /> প্রোমো স্ট্রিপ ব্যানার
                </span>
                <p className="text-base font-black text-slate-950">1200 × 400 px</p>
                <p className="text-[11px] text-slate-800 font-bold">মাঝের অফার বা ছাড়ের বিজ্ঞাপনে</p>
              </div>

              <div className="bg-rose-100/70 border-2 border-rose-300 p-3 rounded-xl space-y-1">
                <span className="text-[11px] text-rose-950 font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-rose-800" /> ভিডিও ব্যানার (Video)
                </span>
                <p className="text-base font-black text-slate-950">1920 × 1080 px</p>
                <p className="text-[11px] text-slate-800 font-bold">
                  16:9 Full HD (MP4 বা YouTube)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banners Grid - Clean White Cards with High-Contrast Dark Text & Dark Borders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.length === 0 && (
          <div className="col-span-full bg-white border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-950">বর্তমানে কোনো ব্যানার যোগ করা নেই</h3>
            <p className="text-xs text-slate-700 font-bold max-w-md mx-auto">
              হোমপেজের মূল স্লাইডার বা প্রোমোশনাল অফার প্রদর্শনের জন্য নতুন ব্যানার বা ভিডিও ব্যানার যুক্ত করুন।
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl transition shadow-md shadow-amber-400/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ প্রথম ব্যানার যুক্ত করুন</span>
            </button>
          </div>
        )}

        {banners.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl border-2 border-slate-300 overflow-hidden shadow-md hover:border-amber-400 transition flex flex-col justify-between"
          >
            {/* Media Area */}
            <div className="relative h-48 bg-slate-950 overflow-hidden flex items-center justify-center">
              {b.mediaType === 'video' && b.videoUrl ? (
                isYouTubeUrl(b.videoUrl) ? (
                  <iframe
                    src={getYouTubeEmbed(b.videoUrl) || ''}
                    className="w-full h-full pointer-events-none opacity-90"
                    title={b.title}
                  />
                ) : (
                  <video
                    src={b.videoUrl}
                    poster={b.image}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-90"
                  />
                )
              ) : (
                <img
                  src={b.image}
                  alt={b.title}
                  className="w-full h-full object-cover opacity-90"
                />
              )}

              {/* Badges on preview */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded shadow-sm uppercase border border-amber-500">
                  {b.position}
                </span>
                {b.mediaType === 'video' ? (
                  <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                    <Video className="w-3 h-3" /> ভিডিও ব্যানার
                  </span>
                ) : (
                  <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm border border-slate-700">
                    <ImageIcon className="w-3 h-3 text-amber-400" /> ফটো ব্যানার
                  </span>
                )}
                <span className="bg-slate-900 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-sm border border-slate-700">
                  #{b.displayOrder}
                </span>
              </div>
            </div>

            {/* Banner Text Details - PURE DARK BLACK TEXT ON WHITE BACKGROUND */}
            <div className="p-4 space-y-3 bg-white border-t border-slate-200">
              <div>
                <h3 className="font-black text-slate-950 text-base line-clamp-1">{b.title}</h3>
                {b.subtitle && (
                  <p className="text-xs text-slate-700 font-bold line-clamp-2 mt-1">
                    {b.subtitle}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  onClick={() => handleToggleActive(b)}
                  className={`flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-full border-2 transition cursor-pointer ${
                    b.isActive
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-400'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {b.isActive ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-500 stroke-[2.5]" />
                  )}
                  <span>{b.isActive ? 'Active on Store' : 'Disabled'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl transition cursor-pointer border border-slate-300"
                    title="Edit Banner"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl transition cursor-pointer border-2 border-rose-300"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FULLY SCROLLABLE MODAL: ADD / EDIT BANNER OR VIDEO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white border-2 border-slate-300 w-full max-w-xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95">
            {/* Fixed Dark High Contrast Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950 text-white shrink-0">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>{editingBanner ? 'ব্যানার এডিট করুন (Edit)' : 'নতুন ব্যানার বা ভিডিও যোগ করুন (Create)'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>


            {/* Scrollable Form Body - User can smoothly scroll up and down */}
            <form
              onSubmit={handleSubmit}
              id="banner-modal-form"
              className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 overscroll-contain text-slate-900"
            >
              {/* Media Type Selector */}
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1.5">
                  মিডিয়া নির্বাচন করুন (Media Type):
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setMediaType('image')}
                    className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                      mediaType === 'image'
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : 'text-slate-700 hover:text-slate-950'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>📷 ছবি ব্যানার (Image)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaType('video')}
                    className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                      mediaType === 'video'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-950'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>🎥 ভিডিও ব্যানার (Video)</span>
                  </button>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  শিরোনাম / ব্যানার টাইটেল <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: গ্র্যান্ড ঈদ অফার ২০২৬ • নতুন কালেকশন"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-3 bg-white border-2 border-slate-300 text-slate-950 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden font-black placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  সাবটাইটেল / বিবরণ (Subtitle)
                </label>
                <textarea
                  rows={2}
                  placeholder="যেমন: সকল পোশাকে ৩০% ছাড়! সারাদেশে দ্রুত ডেলিভারি"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full text-xs p-3 bg-white border-2 border-slate-300 text-slate-950 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden font-bold placeholder:text-slate-400"
                />
              </div>

              {/* VIDEO BANNER SECTION */}
              {mediaType === 'video' && (
                <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-rose-600" />
                      <span>ভিডিও সোর্স (Video Source)</span>
                    </label>
                    <div className="flex items-center bg-white p-0.5 rounded-lg border border-rose-200 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setVideoSourceType('url')}
                        className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                          videoSourceType === 'url'
                            ? 'bg-rose-600 text-white'
                            : 'text-slate-600 hover:text-slate-950'
                        }`}
                      >
                        YouTube / লিঙ্ক
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoSourceType('upload')}
                        className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                          videoSourceType === 'upload'
                            ? 'bg-rose-600 text-white'
                            : 'text-slate-600 hover:text-slate-950'
                        }`}
                      >
                        ডিভাইস আপলোড
                      </button>
                    </div>
                  </div>

                  {videoSourceType === 'url' ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="https://www.youtube.com/watch?v=... বা https://site.com/video.mp4"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-rose-200 text-slate-950 rounded-xl focus:border-rose-500 outline-hidden font-mono font-bold"
                      />
                      <p className="text-[11px] text-rose-800 font-medium">
                        💡 YouTube ভিডিও লিংক অথবা সরাসরি MP4/WebM ভিডিওর লিংক পেস্ট করুন।
                      </p>
                    </div>
                  ) : (
                    <div>
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/mp4,video/webm"
                        className="hidden"
                        onChange={handleVideoUpload}
                      />
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        disabled={isProcessingVideo}
                        className="w-full py-3 px-4 border-2 border-dashed border-rose-300 hover:border-rose-400 bg-white rounded-xl text-center text-xs font-bold text-slate-700 hover:text-slate-950 transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isProcessingVideo ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
                            <span>ভিডিও প্রসেস হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-rose-600" />
                            <span>কম্পিউটার বা মোবাইল থেকে ভিডিও আপলোড করুন (সর্বোচ্চ ২৫MB)</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Video Live Preview */}
                  {videoUrl && (
                    <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-rose-900 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Play className="w-3.5 h-3.5" />
                          <span>ভিডিও প্রিভিউ (Live Preview):</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setVideoUrl('')}
                          className="text-[10px] text-rose-600 hover:underline cursor-pointer font-bold"
                        >
                          মুছুন
                        </button>
                      </div>
                      <div className="relative aspect-[16/7] rounded-lg overflow-hidden bg-black flex items-center justify-center">
                        {isYouTubeUrl(videoUrl) ? (
                          <iframe
                            src={getYouTubeEmbed(videoUrl) || ''}
                            className="w-full h-full"
                            title="Video Preview"
                          />
                        ) : (
                          <video
                            src={videoUrl}
                            controls
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-rose-700 font-semibold pt-1">
                    * ভিডিও লোড হওয়ার সময় বা দুর্বল নেটওয়ার্কে প্রদর্শনের জন্য নিচের ছবিটি পোস্টার হিসেবে ব্যবহৃত হবে।
                  </p>
                </div>
              )}

              {/* IMAGE OR POSTER UPLOAD SECTION */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label className="block text-xs font-black text-slate-900">
                    {mediaType === 'video'
                      ? 'ভিডিওর কভার / পোস্টার ছবি (Poster Image)'
                      : 'ব্যানার ছবি (Banner Image)'}{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageSourceType('upload')}
                      className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        imageSourceType === 'upload'
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-950'
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
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      <Link className="w-3.5 h-3.5" />
                      <span>ছবির লিংক (URL)</span>
                    </button>
                  </div>
                </div>

                {imageSourceType === 'upload' ? (
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessingImage}
                        className="py-3 px-3 border-2 border-dashed border-amber-300 hover:border-amber-400 bg-amber-50/40 hover:bg-amber-50/80 rounded-xl text-center cursor-pointer transition flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4 text-amber-700" />
                        <span className="text-xs font-black text-slate-950">
                          📁 কম্পিউটার বা মোবাইল ফাইল
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        disabled={isProcessingImage}
                        className="py-3 px-3 border-2 border-dashed border-rose-300 hover:border-rose-400 bg-rose-50/40 hover:bg-rose-50/80 rounded-xl text-center cursor-pointer transition flex items-center justify-center gap-2"
                      >
                        <Camera className="w-4 h-4 text-rose-600" />
                        <span className="text-xs font-black text-rose-950">
                          📸 সরাসরি ক্যামেরা দিয়ে তুলুন
                        </span>
                      </button>
                    </div>

                    <p className="text-[11px] text-center text-slate-600 font-semibold">
                      রিকমেন্ডেড সাইজ: 1920 × 600 px (১৬:৯ / ২১:৯)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-300 text-slate-950 rounded-xl focus:border-amber-500 focus:bg-white outline-hidden font-bold"
                    />
                  </div>
                )}

                {/* Image Live Preview */}
                {image && (
                  <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-800 font-bold flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                        <span>ছবির প্রিভিউ (Preview):</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        মুছুন
                      </button>
                    </div>
                    <div className="relative aspect-[16/7] rounded-lg overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center">
                      <img
                        src={image}
                        alt="Preview"
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          showOverlay ? 'opacity-90' : 'opacity-100'
                        }`}
                      />
                      {showOverlay && (
                        <div
                          className="absolute inset-0 pointer-events-none transition-all duration-300"
                          style={{
                            background:
                              overlayDirection === 'full'
                                ? overlayColor
                                : overlayDirection === 'bottom'
                                ? `linear-gradient(to top, ${overlayColor}ee 0%, ${overlayColor}88 60%, transparent 100%)`
                                : `linear-gradient(to right, ${overlayColor}ee 0%, ${overlayColor}99 45%, transparent 100%)`,
                            opacity: overlayOpacity / 100,
                          }}
                        />
                      )}
                      <div className="absolute left-3 bottom-3 z-10 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold border border-white/20">
                        {showOverlay ? `শ্যাডো চালু (${overlayOpacity}%)` : 'শ্যাডো বন্ধ (১০০% ক্লিয়ার)'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 🎭 PICTURE BLACK SHADOW / OVERLAY CUSTOMIZATION (শ্যাডো অন/অফ ও কালার কাস্টমাইজেশন) */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl border-2 border-amber-400/50 space-y-3.5 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎭</span>
                    <div>
                      <h4 className="text-xs font-black text-amber-300">
                        ছবির ওপর ডার্ক শ্যাডো অপশন (Picture Shadow & Overlay)
                      </h4>
                      <p className="text-[10px] text-slate-300">
                        ছবি পরিষ্কার দেখতে চাইলে শ্যাডো বন্ধ করুন, অথবা পছন্দের কালার দিয়ে সাজান
                      </p>
                    </div>
                  </div>

                  {/* ON / OFF Switch */}
                  <button
                    type="button"
                    onClick={() => setShowOverlay(!showOverlay)}
                    className={`px-3 py-1 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-xs ${
                      showOverlay
                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                        : 'bg-rose-600 text-white hover:bg-rose-500'
                    }`}
                  >
                    {showOverlay ? '✓ শ্যাডো চালু (ON)' : '✕ শ্যাডো বন্ধ (OFF)'}
                  </button>
                </div>

                {showOverlay ? (
                  <div className="space-y-3 pt-1 border-t border-white/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Color Picker & Quick Presets */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-200 block">
                          শ্যাডোর কালার (Shadow Color):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={overlayColor}
                            onChange={(e) => setOverlayColor(e.target.value)}
                            className="w-9 h-9 rounded-lg border-2 border-white/20 cursor-pointer bg-transparent"
                            title="কাস্টম কালার নির্বাচন করুন"
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
                                onClick={() => setOverlayColor(preset.hex)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer border ${
                                  overlayColor === preset.hex
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
                          <span>শ্যাডোর অস্বচ্ছতা (Opacity):</span>
                          <span className="text-amber-300 font-mono font-black">{overlayOpacity}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="95"
                          step="5"
                          value={overlayOpacity}
                          onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                          <span>১০% (হালকা)</span>
                          <span>৫০% (মিডিয়াম)</span>
                          <span>৯৫% (গাঢ় ডার্ক)</span>
                        </div>
                      </div>
                    </div>

                    {/* Gradient Style Direction */}
                    <div className="pt-1">
                      <label className="text-[11px] font-bold text-slate-200 block mb-1">
                        শ্যাডোর ধরণ (Gradient Style):
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'left', label: 'বাম থেকে ডানে (Text Fade)' },
                          { id: 'full', label: 'পুরো ছবিতে সমান (Uniform Tint)' },
                          { id: 'bottom', label: 'নিচ থেকে ওপরে (Bottom Up)' },
                        ].map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setOverlayDirection(d.id as any)}
                            className={`p-2 rounded-xl text-[10px] font-bold transition text-center cursor-pointer border ${
                              overlayDirection === d.id
                                ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/15'
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-200 bg-amber-500/10 p-2.5 rounded-xl border border-amber-400/20 font-medium">
                    ✨ <b>শ্যাডো বন্ধ রাখা হয়েছে:</b> হোমপেজে আপনার ব্যানার ছবিটি ১০০% আসল রঙে, সম্পূর্ণ পরিষ্কার ও আলো ঝলমলে অবস্থায় দেখাবে। কোনো কালো শ্যাডো থাকবে না।
                  </p>
                )}
              </div>

              {/* Target Product Quick Selector */}
              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-amber-600" />
                    <span>🎯 নির্দিষ্ট পণ্যের সাথে ব্যানার লিংক করুন (Target Product)</span>
                  </label>
                  <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                    ১-ক্লিক লিঙ্ক
                  </span>
                </div>
                <select
                  onChange={(e) => {
                    const prodId = e.target.value;
                    if (prodId) {
                      setButtonLink(`/product/${prodId}`);
                      const found = products.find((p) => p.id === prodId);
                      if (found) {
                        setButtonText('এখনই অর্ডার করুন');
                        addToast('info', `"${found.name.slice(0, 22)}..." এর লিংক সেট করা হয়েছে!`);
                      }
                    }
                  }}
                  className="w-full text-xs p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-slate-950 outline-hidden cursor-pointer"
                >
                  <option value="">-- স্টোর থেকে যেকোনো পণ্য নির্বাচন করুন --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      📦 {p.name} (৳{p.discountPrice || p.price})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 font-medium">
                  পণ্য নির্বাচন করলে বাটন লিংক স্বয়ংক্রিয়ভাবে <span className="font-mono text-amber-800 font-bold">/product/[id]</span> হবে এবং ব্যানারে ক্লিক করলে কাস্টমার এই পণ্যে যাবে।
                </p>
              </div>

              {/* Button Text & Link */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    বাটন টেক্সট (Button Text)
                  </label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full text-xs p-3 bg-white border-2 border-slate-300 text-slate-950 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden font-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    বাটন লিঙ্ক (Button Link)
                  </label>
                  <input
                    type="text"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    className="w-full text-xs p-3 bg-white border-2 border-slate-300 text-slate-950 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden font-black"
                  />
                </div>
              </div>

              {/* Position & Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    অবস্থান (Position)
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as any)}
                    className="w-full text-xs p-3 bg-white border-2 border-slate-300 text-slate-950 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden cursor-pointer font-black"
                  >
                    <option value="hero">Hero Carousel (হোমপেজ টপ স্লাইডার)</option>
                    <option value="promo">Promotional Strip (মাঝের অফার)</option>
                    <option value="deal">Deals Showcase (স্পেশাল ডিল)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    সিরিয়াল নম্বর (Display Order)
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value) || 1)}
                    className="w-full text-xs p-3 bg-white border-2 border-slate-300 text-slate-950 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden font-black"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-900 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>সক্রিয় রাখুন (Active & Visible to Customers)</span>
                </label>
              </div>
            </form>

            {/* Fixed Footer - Always accessible without getting cut off */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer transition"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                form="banner-modal-form"
                disabled={isSaving}
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer shadow-md shadow-amber-400/20 disabled:opacity-50"
              >
                {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'ব্যানার সংরক্ষণ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
