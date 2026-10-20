import React from 'react';
import { Star, ShoppingBag, Zap, Check, AlertTriangle, Flame } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const { addToCart, buyNow } = useCart();
  const { addToast } = useStore();

  const finalPrice = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1, false);
    addToast('success', `Added "${product.name.slice(0, 24)}..." to cart.`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    buyNow(product, 1);
    onNavigate('checkout');
  };

  return (
    <div
      onClick={() => onNavigate(`product-${product.id}`)}
      className="group relative bg-white rounded-2xl border border-gray-100 hover:border-emerald-300 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Top Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 items-start">
        {hasDiscount && (
          <span className="bg-rose-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
            -{discountPercent}% OFF
          </span>
        )}
        {product.isFeatured && (
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
            Featured
          </span>
        )}
        {product.isBestseller && (
          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
            Best Seller
          </span>
        )}
        {product.videoUrl && (
          <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
            🎥 Video
          </span>
        )}
      </div>

      {/* Stock Status Tag */}
      <div className="absolute top-2.5 right-2.5 z-10">
        {isOutOfStock ? (
          <span className="bg-rose-900/90 text-white text-[10px] font-black px-2 py-0.5 rounded-md backdrop-blur-xs shadow-xs">
            ❌ স্টক শেষ
          </span>
        ) : isLowStock ? (
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>মাত্র {product.stock} টি বাকি</span>
          </span>
        ) : (
          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>স্টক: {product.stock} টি</span>
          </span>
        )}
      </div>

      {/* Product Image with smooth Front/Back hover effect */}
      <div className="relative pt-[85%] bg-gray-50 overflow-hidden">
        <img
          src={product.frontImage || product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 ${
            (product.backImage || product.images[1]) ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'
          }`}
        />
        {(product.backImage || product.images[1]) && (
          <img
            src={product.backImage || product.images[1]}
            alt={`${product.name} Back`}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
        )}
      </div>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & SKU */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-bold uppercase tracking-wider text-emerald-700 truncate max-w-[140px]">
              {product.category}
            </span>
            <span className="font-mono text-[10px] text-slate-400">SKU: {product.sku || 'SCBD'}</span>
          </div>

          {/* Product Name (Bold Crisp Black) */}
          <h3 className="font-black text-sm text-slate-950 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-black text-slate-900">{product.rating ? product.rating.toFixed(1) : '4.8'}</span>
            <span className="text-xs text-slate-400 font-medium">({product.reviewCount || 12})</span>
          </div>

          {/* Available Colors Indicator */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1 mt-2" title={`উপলব্ধ কালার: ${product.colors.map((c) => c.name).join(', ')}`}>
              {product.colors.slice(0, 4).map((c, idx) => (
                <span
                  key={idx}
                  className="w-3 h-3 rounded-full border border-slate-300 shadow-2xs inline-block shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[10px] text-slate-500 font-bold ml-0.5">
                  +{product.colors.length - 4}
                </span>
              )}
              <span className="text-[10px] text-slate-500 font-semibold ml-1">
                ({product.colors.length} কালার)
              </span>
            </div>
          )}

          {/* Live Buyers / Sales Badge */}
          <div className="mt-2.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 shadow-2xs">
              <Flame className="w-3 h-3 text-rose-600 fill-current animate-pulse shrink-0" />
              <span>
                {product.salesCount && product.salesCount > 0
                  ? `${product.salesCount} জন কিনেছেন`
                  : product.isBestseller
                  ? 'হট সেলিং পণ্য'
                  : 'জনপ্রিয় কালেকশন'}
              </span>
            </span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-black text-slate-950 tracking-tight font-mono">
              ৳{finalPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through font-bold font-mono">
                ৳{product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Action Buttons: Add to Cart and Buy Now */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-white text-emerald-800 hover:bg-emerald-50 border-2 border-emerald-600 shadow-2xs'
              }`}
              title="কার্টে যোগ করুন"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
              <span>কার্টে নিন</span>
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 shadow-md shadow-amber-400/25'
              }`}
              title="সরাসরি অর্ডার করুন"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-slate-950" />
              <span>অর্ডার করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
