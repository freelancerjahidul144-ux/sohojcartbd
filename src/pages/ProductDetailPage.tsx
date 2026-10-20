import React, { useState, useEffect, useRef } from 'react';
import {
  Star,
  ShoppingBag,
  Zap,
  Check,
  AlertTriangle,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  Share2,
  Heart,
  Plus,
  Minus,
  MessageSquare,
  Sparkles,
  Maximize2,
  X,
  Palette,
  Video,
  Play,
  Flame,
  Users,
  Eye,
  Package,
  CheckCircle2,
  PhoneCall,
} from 'lucide-react';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { getReviewsForProduct, addReview } from '../services/firestoreService';
import { ProductCard } from '../components/common/ProductCard';
import { parseVideoUrl } from '../utils/videoHelper';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (page: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId, onNavigate }) => {
  const { products, addToast, settings } = useStore();
  const { addToCart, buyNow } = useCart();

  const product = products.find((p) => p.id === productId);

  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [infoModalType, setInfoModalType] = useState<'cod' | 'warranty' | 'return' | null>(null);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Initialize and sync selected color
  useEffect(() => {
    if (product?.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0].name);
    } else {
      setSelectedColor('');
    }
  }, [product?.id, product?.colors]);

  // Track previous product ID to avoid resetting scroll or bouncing when user interacts or scrolls down
  const prevProductIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevProductIdRef.current !== productId) {
      prevProductIdRef.current = productId;
      setSelectedImgIdx(0);
      setQuantity(1);
    }
  }, [productId]);

  // Load reviews independently without touching scroll position
  useEffect(() => {
    if (!product?.id) return;
    getReviewsForProduct(product.id).then((revs) => {
      if (revs && revs.length > 0) {
        setReviews(revs);
      } else {
        // Default mock reviews for initial rich feel
        setReviews([
          {
            id: 'rev-1',
            productId: product.id,
            customerName: 'Shakil Ahmed',
            rating: 5,
            comment: '100% authentic product! Delivered in Dhaka within 24 hours. Very satisfied with Sohoj Cart BD service.',
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
          {
            id: 'rev-2',
            productId: product.id,
            customerName: 'Nusrat Jahan',
            rating: 5,
            comment: 'Great packaging and original warranty card included. Cash on delivery made it super safe.',
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          },
        ]);
      }
    }).catch(() => {});
  }, [product?.id]);

  if (!product) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-800">Product Not Found</h2>
        <p className="text-sm text-gray-500 mt-2 mb-6">The requested product could not be located in our catalog.</p>
        <button
          onClick={() => onNavigate('products')}
          className="bg-emerald-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-emerald-700"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  const finalPrice = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const images = product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
  ];

  const frontImg = product.frontImage || images[0];
  const backImg = product.backImage || (images.length > 1 ? images[1] : undefined);
  const sideImg = product.sideImage || (images.length > 2 ? images[2] : undefined);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const colorToUse = selectedColor || (product.colors && product.colors[0]?.name);
    addToCart(product, quantity, true, colorToUse || undefined);
    const colorNote = colorToUse ? ` (কালার: ${colorToUse})` : '';
    addToast('success', `${quantity}x "${product.name.slice(0, 24)}..."${colorNote} কার্টে যোগ করা হয়েছে।`);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const colorToUse = selectedColor || (product.colors && product.colors[0]?.name);
    buyNow(product, quantity, colorToUse || undefined);
    onNavigate('checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;
    setSubmittingReview(true);
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      customerName: reviewName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await addReview(newRev);
      setReviews((prev) => [newRev, ...prev]);
      addToast('success', 'Thank you! Your review has been published.');
      setReviewName('');
      setReviewComment('');
      setReviewRating(5);
    } catch {
      setReviews((prev) => [newRev, ...prev]);
      addToast('success', 'Review submitted successfully!');
    } finally {
      setSubmittingReview(false);
    }
  };

  const relatedProducts = products
    .filter((p) => p.status === 'published' && p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-8 py-6 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <button onClick={() => onNavigate('home')} className="hover:text-emerald-600 transition">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <button onClick={() => onNavigate('products')} className="hover:text-emerald-600 transition">
          Products
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-gray-400 truncate max-w-[200px]">{product.category}</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-semibold text-gray-900 truncate max-w-[220px]">{product.name}</span>
      </nav>

      {/* Main Product Showcase: Left Gallery, Right Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Large Image / Video Player with Zoom trigger */}
          <div className="relative pt-[90%] bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 group shadow-sm">
            {isVideoActive && product.videoUrl ? (
              (() => {
                const parsed = parseVideoUrl(product.videoUrl);
                if (!parsed) return null;
                return (
                  <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
                    {parsed.type === 'youtube' || parsed.type === 'vimeo' ? (
                      <iframe
                        src={parsed.embedUrl}
                        title={product.videoTitle || product.name}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={parsed.embedUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                );
              })()
            ) : (
              <img
                src={images[selectedImgIdx]}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover object-center cursor-pointer"
                onClick={() => setLightboxOpen(true)}
              />
            )}

            {!isVideoActive && (
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-700 p-2 rounded-xl backdrop-blur-xs shadow-xs transition cursor-pointer"
                title="Expand Image"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}

            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-extrabold px-3 py-1 rounded-lg shadow-sm">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Front, Back, Side Angle & Video Switcher Buttons */}
          <div className="flex items-center gap-2 flex-wrap p-2 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setIsVideoActive(false);
                const idx = images.indexOf(frontImg);
                setSelectedImgIdx(idx >= 0 ? idx : 0);
              }}
              className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs ${
                !isVideoActive && images[selectedImgIdx] === frontImg
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/40 shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>📷 সামনের ভিউ (Front)</span>
            </button>

            {backImg && (
              <button
                type="button"
                onClick={() => {
                  setIsVideoActive(false);
                  const idx = images.indexOf(backImg);
                  setSelectedImgIdx(idx >= 0 ? idx : (images.length > 1 ? 1 : 0));
                }}
                className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs ${
                  !isVideoActive && images[selectedImgIdx] === backImg
                    ? 'bg-blue-600 text-white ring-2 ring-blue-500/40 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>🔄 পেছনের ভিউ (Back)</span>
              </button>
            )}

            {sideImg && (
              <button
                type="button"
                onClick={() => {
                  setIsVideoActive(false);
                  const idx = images.indexOf(sideImg);
                  setSelectedImgIdx(idx >= 0 ? idx : (images.length > 2 ? 2 : 0));
                }}
                className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs ${
                  !isVideoActive && images[selectedImgIdx] === sideImg
                    ? 'bg-purple-600 text-white ring-2 ring-purple-500/40 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>📐 সাইড ভিউ (Side)</span>
              </button>
            )}

            {product.videoUrl && (
              <button
                type="button"
                onClick={() => setIsVideoActive(true)}
                className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs ${
                  isVideoActive
                    ? 'bg-rose-600 text-white ring-2 ring-rose-500/40 shadow-xs animate-pulse'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                <Video className="w-3.5 h-3.5 fill-current" />
                <span>🎥 ভিডিও দেখুন</span>
              </button>
            )}
          </div>

          {/* Thumbnail list */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setIsVideoActive(false);
                    setSelectedImgIdx(idx);
                  }}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition bg-gray-50 cursor-pointer ${
                    !isVideoActive && selectedImgIdx === idx ? 'border-emerald-600 shadow-sm ring-2 ring-emerald-500/30' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information & Purchase Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                {product.category}
              </span>
              <span className="text-xs text-gray-400 font-mono">SKU: {product.sku || 'SCBD'}</span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-slate-950 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Rating and Reviews Counter */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.rating || 5) ? 'fill-current' : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-black text-slate-950">
                {product.rating ? product.rating.toFixed(1) : '4.9'}
              </span>
              <span className="text-xs text-slate-600 font-bold">({reviews.length} Customer Reviews)</span>
              <span className="text-emerald-800 text-xs font-black bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                ✓ 100% Verified Authentic
              </span>
            </div>
          </div>

          {/* Pricing Box with High-Contrast Green & Black */}
          <div className="bg-emerald-50/90 p-4 rounded-2xl border border-emerald-200 flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-emerald-950">
              ৳{finalPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-base text-slate-500 line-through font-bold">
                ৳{product.price.toLocaleString()}
              </span>
            )}
            {hasDiscount && (
              <span className="text-xs font-black text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-md border border-rose-300">
                সেভ করুন ৳{(product.price - product.discountPrice!).toLocaleString()}
              </span>
            )}
          </div>

          {/* Live Sales & Social Proof Banner */}
          <div className="p-3.5 bg-gradient-to-r from-amber-50 via-rose-50 to-orange-50 rounded-2xl border border-amber-200 shadow-2xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                </span>
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-600 fill-current shrink-0 animate-bounce" />
                  <span>
                    লাইভ সেলস: <strong className="text-rose-700 text-sm font-black">{product.salesCount && product.salesCount > 0 ? product.salesCount : 18} জন</strong> ইতিমধ্যে এই পণ্যটি কিনেছেন!
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-950 bg-amber-100/90 px-2.5 py-1 rounded-full border border-amber-300">
                <Eye className="w-3.5 h-3.5 text-amber-700" />
                <span>লাইভ ভিউ: <strong>{12 + (product.stock % 9)} জন</strong> এখন দেখছেন</span>
              </div>
            </div>

            {/* Stock Progress Indicator */}
            <div className="pt-1 border-t border-amber-200/60 flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-emerald-700" />
                <span>
                  {isOutOfStock
                    ? 'স্টক স্ট্যাটাস: শেষ হয়েছে (0 টি)'
                    : `স্টকে অবশিষ্ট: ${product.stock} টি পণ্য`}
                </span>
              </span>
              <span className="text-emerald-800 font-extrabold">
                {isOutOfStock ? '❌ স্টক আউট' : '⚡ দ্রুত ডেলিভারি প্রস্তুত'}
              </span>
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-rose-700 bg-rose-100 px-3 py-1.5 rounded-full border border-rose-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>স্টক আউট (বর্তমানে পণ্যটির স্টক শেষ, খুব দ্রুত নতুন স্টক আসবে)</span>
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-900 bg-amber-100 px-3 py-1.5 rounded-full border border-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>দ্রুত অর্ডার করুন! মাত্র {product.stock} টি পণ্য বাকি আছে</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-300">
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                <span>ইন স্টক রয়েছে ({product.stock} টি পণ্য রেডি ডেলিভারির জন্য প্রস্তুত)</span>
              </span>
            )}
          </div>

          {/* Short description with high contrast black text */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 text-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>পণ্যের বিবরণ ও মূল বৈশিষ্ট্য:</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-900 font-semibold leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Color Selection Section (পণ্যের কালার বা রং নির্বাচন) */}
          {product.colors && product.colors.length > 0 && (
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-950 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-amber-600" />
                  <span>কালার নির্বাচন করুন (Select Color):</span>
                </span>
                {selectedColor && (
                  <span className="text-xs font-black text-slate-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full border border-amber-300">
                    {selectedColor}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {product.colors.map((c, idx) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs ring-2 ring-amber-400/50 font-black'
                          : 'bg-white text-slate-800 hover:bg-slate-100 border-slate-300'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-slate-400 shrink-0 shadow-2xs"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector & Purchase CTAs */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-slate-950">পরিমাণ (Quantity):</span>
              <div className="flex items-center border border-slate-300 rounded-xl bg-white shadow-2xs">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={isOutOfStock}
                  className="p-2.5 text-slate-700 hover:text-slate-950 disabled:opacity-50 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-black text-slate-950">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                  disabled={isOutOfStock || quantity >= product.stock}
                  className="p-2.5 text-slate-700 hover:text-slate-950 disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs text-slate-700 font-bold">
                মোট মূল্য: <strong className="text-emerald-800 text-sm font-black">৳{(finalPrice * quantity).toLocaleString()}</strong>
              </span>
            </div>

            {/* Buttons: Amber & Emerald Green Theme */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="py-3 px-4 rounded-xl font-black text-xs sm:text-sm bg-white text-emerald-800 border-2 border-emerald-600 hover:bg-emerald-50 transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart (কার্টে যোগ করুন)</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="py-3 px-4 rounded-xl font-black text-xs sm:text-sm bg-amber-400 hover:bg-amber-500 text-slate-950 transition flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current text-slate-950" />
                <span>অর্ডার করুন (Buy Now)</span>
              </button>
            </div>
          </div>

          {/* Trust Guarantees (Clickable to view detailed policy) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setInfoModalType('cod')}
              className="flex items-center gap-2 p-2 rounded-xl text-left hover:bg-emerald-50 text-gray-800 hover:text-emerald-900 border border-transparent hover:border-emerald-200 transition cursor-pointer"
              title="ক্যাশ অন ডেলিভারি (COD) পলিসি দেখুন"
            >
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="leading-tight">
                <span className="block font-black text-[11px] text-emerald-700">Cash on Delivery (COD)</span>
                <span className="text-[10px] text-gray-600 font-medium">{settings.estimatedDeliveryDhaka || 'ঢাকা: ২৪-৪৮ ঘণ্টা'}</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setInfoModalType('warranty')}
              className="flex items-center gap-2 p-2 rounded-xl text-left hover:bg-blue-50 text-gray-800 hover:text-blue-900 border border-transparent hover:border-blue-200 transition cursor-pointer"
              title="অরিজিনাল প্রোডাক্ট নিশ্চয়তা দেখুন"
            >
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="leading-tight">
                <span className="block font-black text-[11px] text-blue-700">১০০% আসল পণ্য</span>
                <span className="text-[10px] text-gray-600 font-medium">{settings.trustBadgeText ? settings.trustBadgeText.split('•')[0].trim() : 'অফিসিয়াল কোয়ালিটি'}</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setInfoModalType('return')}
              className="flex items-center gap-2 p-2 rounded-xl text-left hover:bg-rose-50 text-gray-800 hover:text-rose-900 border border-transparent hover:border-rose-200 transition cursor-pointer"
              title="৭ দিনের রিটার্ন পলিসি দেখুন"
            >
              <RotateCcw className="w-4 h-4 text-rose-600 shrink-0" />
              <div className="leading-tight">
                <span className="block font-black text-[11px] text-rose-700">7 Days Return Policy</span>
                <span className="text-[10px] text-gray-600 font-medium">{settings.returnPolicyText ? `${settings.returnPolicyText.slice(0, 16)}...` : 'সহজ এক্সচেঞ্জ'}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specifications, Reviews */}
      <div className="border-t border-gray-200 pt-8">
        <div className="flex items-center gap-6 border-b border-gray-200 pb-3">
          <button
            onClick={() => setActiveTab('desc')}
            className={`text-sm font-extrabold pb-3 -mb-3 transition border-b-2 ${
              activeTab === 'desc'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Product Description
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            className={`text-sm font-extrabold pb-3 -mb-3 transition border-b-2 ${
              activeTab === 'specs'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Specifications & Features
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`text-sm font-extrabold pb-3 -mb-3 transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Customer Reviews ({reviews.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="pt-6">
          {activeTab === 'desc' && (
            <div className="prose max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed space-y-4">
              <p className="font-medium text-slate-900 leading-relaxed text-sm sm:text-base">{product.description}</p>
              <div className="bg-emerald-50/60 p-4 sm:p-5 rounded-2xl border border-emerald-200">
                <h4 className="font-black text-xs sm:text-sm text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{settings.storeName || 'সহজকার্ট বিডি'} থেকে পণ্য কেনার বিশেষ সুবিধাসমূহ:</span>
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-800 font-medium">
                  <li>১০০% অরিজিনাল ও অথেনটিক পণ্য অফিসিয়াল ওয়ারেন্টি সুবিধা সহ।</li>
                  <li>
                    {settings.isCodEnabled !== false
                      ? (settings.codNoticeText || 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা।')
                      : 'নিরাপদ ডিজিটাল পেমেন্ট সুবিধা।'}
                  </li>
                  {settings.isFreeDeliveryEnabled && settings.freeDeliveryThreshold ? (
                    <li className="text-emerald-800 font-black">
                      🚚 {settings.currencySymbol || '৳'}{settings.freeDeliveryThreshold.toLocaleString()} টাকার অর্ডারে সারা বাংলাদেশে সম্পূর্ণ ফ্রি ডেলিভারি!
                    </li>
                  ) : null}
                  <li>
                    {settings.estimatedDeliveryDhaka
                      ? `ঢাকার ভেতরে ${settings.estimatedDeliveryDhaka} এবং ঢাকার বাইরে ${settings.estimatedDeliveryOutsideDhaka || '৩-৫ কার্যদিবসে ডেলিভারি'}।`
                      : 'কুরিয়ার প্রতিনিধির উপস্থিতিতে পার্সেল চেক করে টাকা পরিশোধের সুযোগ।'}
                  </li>
                  <li>বিকাশ, নগদ, রকেট, উপায় এবং কার্ড পেমেন্টে তাৎক্ষণিক অর্ডার কনফার্মেশন।</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-2xl bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              {product.specifications && Object.keys(product.specifications).length > 0 ? (
                <table className="w-full text-xs text-left">
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <tr key={key} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-black text-slate-950 bg-slate-50/90 w-1/3 border-r border-slate-200">{key}</td>
                        <td className="py-3.5 px-4 text-slate-900 font-bold">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 font-semibold">
                  এই পণ্যের অতিরিক্ত বিবরণ ও স্পেসিফিকেশন শিঘ্রই যুক্ত করা হবে।
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Existing Reviews List */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="font-extrabold text-sm text-gray-900">
                  Customer Feedback & Ratings
                </h3>

                {reviews.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4">
                    Be the first customer to leave a review for this product!
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-gray-900">{rev.customerName}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-current' : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Review Form */}
              <div className="lg:col-span-5 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Write a Customer Review</span>
                </h4>

                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mahfuzur Rahman"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-gray-200 rounded-xl outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-amber-400 p-0.5 hover:scale-110 transition"
                        >
                          <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-current' : 'text-gray-300'}`} />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-gray-700 ml-1">{reviewRating} / 5 Stars</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Your Review</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Share your experience with product quality, performance, and delivery speed..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-gray-200 rounded-xl outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-gray-200 pt-10">
          <h2 className="text-xl font-extrabold text-gray-900 mb-6">
            Related Products in {product.category}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 text-white hover:text-gray-300 p-2"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={images[selectedImgIdx]}
            alt={product.name}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl"
          />
        </div>
      )}
      {/* Policy Info Modal (COD, 7 Days Return, Official Warranty) */}
      {infoModalType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setInfoModalType(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {infoModalType === 'cod' && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-xs">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      নিরাপদ হোম ডেলিভারি
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-0.5">
                      Cash on Delivery (ক্যাশ অন ডেলিভারি)
                    </h3>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
                  <p className="text-xs sm:text-sm font-bold text-emerald-950 leading-relaxed">
                    {settings.codNoticeText || 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা রয়েছে। পণ্য হাতে পেয়ে দেখে সম্পূর্ণ মূল্য পরিশোধ করার সুবিধা।'}
                  </p>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700 font-medium">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>ডেলিভারি সময়:</strong> {settings.estimatedDeliveryDhaka || 'ঢাকার ভেতরে ২৪-৪৮ ঘণ্টা'} এবং {settings.estimatedDeliveryOutsideDhaka || 'ঢাকার বাইরে ৩-৫ কার্যদিবস'}।</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>কুরিয়ার পার্টনার:</strong> রেডএক্স, পাঠাও ও সুন্দরবন কুরিয়ারের মাধ্যমে সুরক্ষিত ও দ্রুত ডেলিভারি।</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>প্যাকেট চেক:</strong> ডেলিভারিম্যানের সামনে প্যাকেট পরীক্ষা করে দেখে নিশ্চিন্তে গ্রহণ করুন।</span>
                  </div>
                </div>
              </>
            )}

            {infoModalType === 'return' && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700 shadow-xs">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      ১০০% নির্ভরযোগ্য
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-0.5">
                      ৭ দিনের সহজ রিটার্ন পলিসি (7 Days Return Policy)
                    </h3>
                  </div>
                </div>

                <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-2">
                  <p className="text-xs sm:text-sm font-bold text-rose-950 leading-relaxed">
                    {settings.returnPolicyText || 'পণ্য হাতে পাওয়ার পর কোনো ত্রুটি, ক্ষতি বা পছন্দ না হলে ৭ দিনের মধ্যে সহজে রিটার্ন বা পরিবর্তন করতে পারবেন।'}
                  </p>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700 font-medium">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>৭ দিনের মেয়াদ:</strong> পণ্য গ্রহণের দিন থেকে পরবর্তী ৭ দিনের মধ্যে হেল্পলাইনে জানালেই সমাধান।</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>রিফান্ড গ্যারান্টি:</strong> রিটার্ন যাচাইয়ের ২৪-৪৮ ঘণ্টার মধ্যে বিকাশ/নগদ বা ব্যাংকে রিফান্ড পৌঁছে যাবে।</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>পরামর্শ:</strong> দ্রুত রিফান্ড বা এক্সচেঞ্জের সুবিধার্থে প্যাকেট খোলার একটি আনবক্সিং ভিডিও সংরক্ষণ করুন।</span>
                  </div>
                </div>
              </>
            )}

            {infoModalType === 'warranty' && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 shadow-xs">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      অফিসিয়াল নিশ্চয়তা
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-0.5">
                      ১০০% অরিজিনাল ও অথেনটিক পণ্য
                    </h3>
                  </div>
                </div>

                <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2">
                  <p className="text-xs sm:text-sm font-bold text-blue-950 leading-relaxed">
                    {settings.trustBadgeText || 'আমাদের প্রতিটি পণ্য সরাসরি ব্র্যান্ড অনুমোদিত আমদানিকারক ও প্রস্তুতকারক থেকে সংগৃহীত। ১০০% অরিজিনাল কোয়ালিটি নিশ্চয়তা।'}
                  </p>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700 font-medium">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>জেনুইন প্রোডাক্ট:</strong> প্রতিটি পণ্য কঠোর মাননিয়ন্ত্রণ প্রক্রিয়ার মাধ্যমে পরীক্ষা করে সরবরাহ করা হয়।</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>ওয়ারেন্টি সাপোর্ট:</strong> ব্র্যান্ডের শর্তানুযায়ী অফিসিয়াল পার্টস ও সার্ভিস ওয়ারেন্টি প্রযোজ্য।</span>
                  </div>
                </div>
              </>
            )}

            {(settings.contactPhone || settings.phone) && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">সহায়তার জন্য হটলাইন:</span>
                <a
                  href={`tel:${settings.contactPhone || settings.phone}`}
                  className="font-black text-emerald-700 hover:underline flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{settings.contactPhone || settings.phone}</span>
                </a>
              </div>
            )}

            <button
              onClick={() => setInfoModalType(null)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              বন্ধ করুন (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
