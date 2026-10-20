import React from 'react';
import {
  ShoppingBag,
  Zap,
  Package,
  Truck,
  Phone,
  Grid,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

interface StickyBottomBarProps {
  onNavigate: (page: string) => void;
  currentPath: string;
  currentProduct?: Product | null;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
}

export const StickyBottomBar: React.FC<StickyBottomBarProps> = ({
  onNavigate,
  currentPath,
  currentProduct,
  onAddToCart,
  onBuyNow,
}) => {
  const { cartCount, subtotal, setIsCartDrawerOpen } = useCart();
  const { settings } = useStore();

  // Do not render inside checkout, order success, or admin pages
  if (
    currentPath.startsWith('/admin') ||
    currentPath === '/checkout' ||
    currentPath === '/order-success'
  ) {
    return null;
  }

  const isProductDetail = currentPath.startsWith('/product/') && currentProduct;
  const contactPhone = settings.contactPhone || '01712-345678';

  return (
    <aside
      aria-label="Sticky bottom navigation and order bar"
      className="fixed bottom-0 inset-x-0 z-40"
    >
      {/* Floating Bottom Bar Container */}
      <div className="bg-white/98 backdrop-blur-md border-t-2 border-slate-200 shadow-2xl px-2 sm:px-4 lg:px-8 py-2.5">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* CASE A: Single Product Detail Page Sticky Bar */}
          {isProductDetail && currentProduct ? (
            <div className="w-full flex items-center justify-between gap-2 sm:gap-4">
              {/* Product Thumbnail & Details */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={currentProduct.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120'}
                  alt={currentProduct.name}
                  className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                />
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-slate-950 truncate leading-snug">
                    {currentProduct.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs sm:text-sm font-black text-emerald-800">
                      ৳{(currentProduct.discountPrice ?? currentProduct.price).toLocaleString()}
                    </span>
                    {currentProduct.discountPrice && (
                      <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                        ৳{currentProduct.price.toLocaleString()}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        currentProduct.stock <= 0
                          ? 'bg-rose-100 text-rose-800'
                          : currentProduct.stock <= 5
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {currentProduct.stock <= 0
                        ? 'স্টক শেষ'
                        : currentProduct.stock <= 5
                        ? `মাত্র ${currentProduct.stock} টি বাকি`
                        : `ইন স্টক (${currentProduct.stock} টি)`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigate('products')}
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                  title="সকল প্রোডাক্ট দেখুন"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>সকল প্রোডাক্ট</span>
                </button>

                {onAddToCart && (
                  <button
                    type="button"
                    onClick={onAddToCart}
                    disabled={currentProduct.stock <= 0}
                    className={`p-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-2xs ${
                      currentProduct.stock <= 0
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 cursor-pointer'
                    }`}
                    title="কার্টে যোগ করুন"
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-700" />
                    <span className="hidden sm:inline">কার্টে যোগ করুন</span>
                  </button>
                )}

                {onBuyNow && (
                  <button
                    type="button"
                    onClick={onBuyNow}
                    disabled={currentProduct.stock <= 0}
                    className={`px-4 sm:px-6 py-2 font-black text-xs sm:text-sm rounded-xl transition flex items-center gap-1.5 shadow-md shrink-0 ${
                      currentProduct.stock <= 0
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 shadow-amber-400/25 cursor-pointer'
                    }`}
                  >
                    <Zap className="w-4 h-4 fill-current text-slate-950" />
                    <span>{currentProduct.stock <= 0 ? 'স্টক আউট' : 'অর্ডার করুন (Buy Now)'}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* CASE B: General Storefront Sticky Bar (Home, Products, etc.) */
            <div className="w-full flex items-center justify-between gap-2 sm:gap-4">
              {/* Left: All Products Quick Navigation */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('products')}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition shadow-xs cursor-pointer group"
                  title="সকল প্রোডাক্টের ক্যাটালগ দেখুন"
                >
                  <Grid className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-90 transition-transform" />
                  <span>সকল প্রোডাক্ট</span>
                  <span className="hidden sm:inline-block bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    ১০,০০০+
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('track-order')}
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                  title="আপনার অর্ডার ট্র্যাক করুন"
                >
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>অর্ডার ট্র্যাক</span>
                </button>
              </div>

              {/* Center / Right: Phone Order & Fast Checkout CTAs */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Direct Phone Order Hotline */}
                <a
                  href={`tel:${contactPhone}`}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold transition"
                  title="সরাসরি ফোনে অর্ডার করুন"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-mono">{contactPhone}</span>
                </a>

                {/* Cart Drawer Trigger / Summary */}
                <button
                  type="button"
                  onClick={() => setIsCartDrawerOpen(true)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl transition cursor-pointer"
                  title="কার্ট ওপেন করুন"
                >
                  <div className="relative">
                    <ShoppingBag className="w-4 h-4 text-slate-800" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2.5 bg-rose-600 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <div className="hidden lg:block text-left">
                    <span className="text-[10px] text-slate-500 font-bold block leading-none">কার্ট</span>
                    <span className="text-xs font-black text-slate-950 font-mono">
                      ৳{subtotal.toLocaleString()}
                    </span>
                  </div>
                </button>

                {/* PROMINENT ORDER BUTTON (অর্ডার করুন) */}
                <button
                  type="button"
                  onClick={() => {
                    if (cartCount > 0) {
                      onNavigate('checkout');
                    } else {
                      onNavigate('products');
                    }
                  }}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition shadow-md shadow-amber-400/30 cursor-pointer shrink-0"
                >
                  <Zap className="w-4 h-4 fill-current text-slate-950 shrink-0" />
                  <span>
                    {cartCount > 0 ? `অর্ডার করুন (৳${subtotal.toLocaleString()})` : 'এখনই অর্ডার করুন'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
