import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  User,
  ShieldCheck,
  Menu,
  X,
  PhoneCall,
  Truck,
  Sparkles,
  ChevronDown,
  LogOut,
  SlidersHorizontal,
  Compass,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Check,
  MessageCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage, onOpenAuthModal }) => {
  const { categories, searchQuery, setSearchQuery, setSelectedCategory, selectedCategory, products, settings } = useStore();
  const { cartCount, subtotal, setIsCartDrawerOpen } = useCart();
  const { currentUser, isAdmin, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [codModalOpen, setCodModalOpen] = useState(false);
  const [returnPolicyModalOpen, setReturnPolicyModalOpen] = useState(false);

  // Live search suggestions
  const searchSuggestions = searchQuery.trim().length > 1
    ? products
        .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchFocused(false);
    onNavigate('products');
  };

  const handleSelectCategory = (catSlug: string) => {
    setSelectedCategory(catSlug);
    setCategoriesDropdownOpen(false);
    setMobileMenuOpen(false);
    onNavigate('products');
  };

  // Hotline and WhatsApp helpers
  const rawPhone = settings.contactPhone || '+880 1712-345678';
  const cleanPhone = rawPhone.replace(/[^0-9+]/g, '');

  const rawWhatsApp = settings.whatsAppNumber || settings.contactPhone || '8801712345678';
  const digitsOnly = rawWhatsApp.replace(/[^0-9]/g, '');
  const finalWhatsAppNumber = digitsOnly.startsWith('88')
    ? digitsOnly
    : `88${digitsOnly.replace(/^0+/, '')}`;
  const whatsappMsg = encodeURIComponent(
    settings.whatsAppDefaultMessage || 'হ্যালো! Sohoj Cart BD থেকে আমি অর্ডার ও তথ্য জানতে চাই।'
  );
  const whatsappUrl = `https://wa.me/${finalWhatsAppNumber}?text=${whatsappMsg}`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      {/* Optional Top Announcement / Notice Bar configured from Admin Settings */}
      {settings.isNoticeBarActive && settings.noticeBarText && (
        <div
          className="text-xs py-1.5 px-4 text-center font-bold tracking-wide transition-colors"
          style={{
            backgroundColor: settings.noticeBarBgColor || '#059669',
            color: settings.announcementTextColor || '#ffffff',
          }}
        >
          {settings.noticeBarLink ? (
            <button
              type="button"
              onClick={() => onNavigate(settings.noticeBarLink || 'products')}
              className="hover:underline cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>{settings.noticeBarText}</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span>{settings.noticeBarText}</span>
          )}
        </div>
      )}

      {/* 🌟 Top Banner Bar (উপরে Cash on Delivery, 7 Days Return, Hotline, WhatsApp & Delivery Info) */}
      <div className="bg-[#0B192C] text-slate-200 text-xs py-2 px-2 sm:px-4 md:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-[1780px] w-full mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
          {/* Left: Cash on Delivery (COD) & 7 Days Return Policy (একদম পেজের শীর্ষে ছবির উপরে দৃশ্যমান ও ক্লিকযোগ্য) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* 1. Cash on Delivery (COD) Button */}
            <button
              type="button"
              onClick={() => setCodModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 hover:text-white transition font-bold text-xs shadow-xs cursor-pointer group"
              title="ক্যাশ অন ডেলিভারি (COD) পলিসি বিস্তারিত দেখুন"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>{settings.topBarCodText || 'Cash on Delivery (COD)'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            {/* 2. 7 Days Return Policy Button */}
            <button
              type="button"
              onClick={() => setReturnPolicyModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/90 hover:bg-rose-900 border border-rose-500/60 text-rose-300 hover:text-white transition font-bold text-xs shadow-xs cursor-pointer group"
              title="৭ দিনের সহজ রিটার্ন পলিসি বিস্তারিত দেখুন"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400 group-hover:-rotate-45 transition-transform" />
              <span>{settings.topBarReturnText || '7 Days Return Policy'}</span>
            </button>

            {/* 3. Delivery Fee Notice */}
            <span className="hidden lg:flex items-center gap-1.5 text-slate-300 text-xs font-medium pl-1">
              <span className="text-slate-600">|</span>
              <span>
                {settings.topBarDeliveryNotice || (
                  <>
                    ডেলিভারি চার্জ: ঢাকার ভিতরে{' '}
                    <strong className="text-white">
                      {settings.currencySymbol || '৳'}{settings.deliveryFeeInsideDhaka ?? 60}
                    </strong>{' '}
                    | ঢাকার বাহিরে{' '}
                    <strong className="text-white">
                      {settings.currencySymbol || '৳'}{settings.deliveryFeeOutsideDhaka ?? 120}
                    </strong>
                  </>
                )}
              </span>
            </span>
          </div>

          {/* Right: Phone Helpline, WhatsApp Chat, Track Order & Admin Panel */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5">
            {/* 4. Customer Care Hotline (Click to Dial) */}
            <a
              href={`tel:${cleanPhone}`}
              className="flex items-center gap-1.5 text-slate-300 hover:text-amber-400 transition font-semibold text-xs"
              title="সরাসরি ফোন করতে ক্লিক করুন"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                হটলাইন:{' '}
                <strong className="text-white font-mono font-bold hover:underline">
                  {settings.contactPhone || '+880 1712-345678'}
                </strong>
              </span>
            </a>

            {/* 5. WhatsApp Direct Chat Button (Clicking opens WhatsApp with this number) */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs transition shadow-sm group cursor-pointer"
              title={`হোয়াটসঅ্যাপে সরাসরি চ্যাট করতে ক্লিক করুন (${settings.whatsAppNumber || settings.contactPhone || '+880 1712-345678'})`}
            >
              <MessageCircle className="w-3.5 h-3.5 text-white group-hover:scale-110 transition-transform fill-current" />
              <span>WhatsApp</span>
              <span className="hidden sm:inline font-mono font-bold text-[11px] opacity-95">
                {settings.whatsAppNumber || settings.contactPhone || '+880 1712-345678'}
              </span>
            </a>

            {/* 6. Track Order */}
            <button
              onClick={() => onNavigate('track-order')}
              className="hidden sm:flex hover:text-white transition items-center gap-1 text-slate-300 hover:underline cursor-pointer text-xs"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Track Order</span>
            </button>

            {/* Admin Panel Quick Access Button - Visible only to logged in Admin */}
            {isAdmin && (
              <>
                <span className="text-slate-700 hidden sm:inline">|</span>
                <button
                  onClick={() => onNavigate('admin')}
                  className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold transition cursor-pointer bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                  <span>Admin Panel</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header (Clean White Background) */}
      <div className="max-w-[1780px] w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Mobile menu toggle & Official Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Official Sohoj Cart BD Brand Logo */}
          <button
            onClick={() => {
              setSelectedCategory('');
              setSearchQuery('');
              onNavigate('home');
            }}
            className="flex items-center text-left group transition-transform active:scale-98 cursor-pointer"
            title="Sohoj Cart BD - Home"
          >
            <BrandLogo size="md" className="group-hover:opacity-95 transition-opacity" />
          </button>
        </div>

        {/* Search Bar with Yellow Accent Button */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4 relative">
          <form onSubmit={handleSearchSubmit} className="w-full flex items-center">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search over 10,000+ phones, fashion, electronics, appliances..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-full pl-11 pr-24 py-2.5 bg-gray-100/90 focus:bg-white border border-gray-200 focus:border-amber-400 rounded-full text-sm outline-hidden transition shadow-2xs font-medium"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-amber-400 hover:bg-amber-500 text-slate-950 px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer shadow-xs"
              >
                Search
              </button>
            </div>
          </form>

          {/* Autocomplete suggestion dropdown */}
          {searchFocused && searchSuggestions.length > 0 && (
            <div
              className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2"
              onMouseDown={(e) => e.preventDefault()}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-3 py-1">
                Suggested Products
              </div>
              {searchSuggestions.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => {
                    setSearchFocused(false);
                    onNavigate(`product-${prod.id}`);
                  }}
                  className="w-full flex items-center gap-3 p-2 hover:bg-amber-50 rounded-xl transition text-left cursor-pointer"
                >
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{prod.name}</p>
                    <p className="text-[11px] text-amber-600 font-black">৳{(prod.discountPrice ?? prod.price).toLocaleString()}</p>
                  </div>
                </button>
              ))}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={handleSearchSubmit}
                  className="w-full text-center text-xs font-bold text-amber-700 hover:text-amber-800 py-1.5 cursor-pointer"
                >
                  View all results for "{searchQuery}"
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Action Icons: Account, Cart */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* User Account */}
          <div className="relative">
            {currentUser ? (
              <div>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-black flex items-center justify-center text-xs border border-amber-300">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : currentUser.email?.[0].toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-gray-900 leading-none">
                      {currentUser.displayName || currentUser.email?.split('@')[0]}
                    </p>
                    <span className="text-[10px] text-amber-600 font-bold">Customer Account</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden lg:block" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900 truncate">{currentUser.email}</p>
                      <p className="text-[10px] text-gray-500">{isAdmin ? 'Administrator' : 'Verified Shopper'}</p>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('track-order');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Truck className="w-3.5 h-3.5 text-amber-500" />
                      <span>My Orders</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-black text-amber-900 bg-amber-50/60 hover:bg-amber-100 flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                  <User className="w-4 h-4 text-amber-600" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-gray-900 leading-none">Sign In</p>
                  <span className="text-[10px] text-gray-500 font-medium">Account / Join</span>
                </div>
              </button>
            )}
          </div>

          {/* Cart Trigger Button (Yellow Theme with Crisp Contrast) */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="flex items-center gap-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-slate-900 px-3.5 py-2 rounded-xl transition group shadow-2xs cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-50">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block leading-none">
                Cart
              </span>
              <span className="text-xs font-black text-slate-950">
                ৳{subtotal.toLocaleString()}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar with Yellow Button */}
      <div className="md:hidden px-4 pb-2.5">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search phones, panjabi, appliances..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-20 py-2 bg-gray-100 text-xs rounded-full border border-gray-200 outline-hidden focus:border-amber-400 font-medium"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-amber-400 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Sub Navigation: Category pills & Highlights */}
      <div className="hidden lg:block border-t border-gray-100 bg-gray-50/70">
        <div className="max-w-[1780px] w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-6">
            {/* All Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className="flex items-center gap-2 font-bold text-gray-800 bg-white border border-gray-200 hover:border-amber-400 px-3.5 py-1.5 rounded-lg transition shadow-2xs cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                <span>All Categories</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {categoriesDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 max-h-96 overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between border-b border-gray-100 mb-1">
                    <span>Browse Categories</span>
                    <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                      {categories.filter((c) => c.isActive !== false).length}
                    </span>
                  </div>
                  {categories
                    .filter((c) => c.isActive !== false)
                    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                    .map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.slug)}
                        className={`w-full text-left px-4 py-2 hover:bg-amber-50 flex items-center justify-between text-xs font-medium transition cursor-pointer ${
                          selectedCategory === cat.slug ? 'text-amber-900 bg-amber-50 font-bold' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <img
                            src={cat.image}
                            alt=""
                            className="w-4 h-4 rounded-full object-cover shrink-0"
                          />
                          <span className="truncate">{cat.name}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {products.filter(p => p.category === cat.name || p.categoryId === cat.id || p.categoryId === cat.slug).length} items
                        </span>
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Quick Links with Yellow / Amber Active States */}
            <button
              onClick={() => {
                setSelectedCategory('');
                onNavigate('products');
              }}
              className={`hover:text-amber-600 transition font-medium cursor-pointer ${currentPage === 'products' && !selectedCategory ? 'text-amber-600 font-bold' : 'text-gray-600'}`}
            >
              All Products
            </button>

            {categories
              .filter((c) => c.isActive !== false)
              .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
              .slice(0, 5)
              .map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.slug)}
                  className={`hover:text-amber-600 transition font-medium cursor-pointer ${selectedCategory === cat.slug ? 'text-amber-600 font-bold' : 'text-gray-600'}`}
                >
                  {cat.name}
                </button>
              ))}

            <button
              onClick={() => onNavigate('products')}
              className="flex items-center gap-1 text-rose-600 font-bold hover:text-rose-700 transition cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Eid Mega Deals</span>
              <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">HOT</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
            <button
              type="button"
              onClick={() => setCodModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 border border-transparent hover:border-emerald-200 transition cursor-pointer"
              title="ক্যাশ অন ডেলিভারি (COD) পলিসি দেখুন"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cash on Delivery (COD)</span>
            </button>
            <span className="text-gray-300">•</span>
            <button
              type="button"
              onClick={() => setReturnPolicyModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-rose-50 text-gray-700 hover:text-rose-700 border border-transparent hover:border-rose-200 transition cursor-pointer"
              title="৭ দিনের সহজ রিটার্ন পলিসি দেখুন"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>7 Days Return Policy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-sm bg-white h-full p-5 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <BrandLogo size="sm" />
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-md text-gray-500 hover:text-gray-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('home');
                  }}
                  className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-gray-800 hover:bg-amber-50"
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setMobileMenuOpen(false);
                    onNavigate('products');
                  }}
                  className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-gray-800 hover:bg-amber-50"
                >
                  All Products
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('track-order');
                  }}
                  className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-gray-800 hover:bg-amber-50"
                >
                  Track Order
                </button>

                <div className="pt-3 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 flex items-center justify-between">
                  <span>Shop By Category</span>
                  <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                    {categories.filter((c) => c.isActive !== false).length}
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto pr-1 space-y-0.5">
                  {categories
                    .filter((c) => c.isActive !== false)
                    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                    .map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.slug)}
                        className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                          selectedCategory === cat.slug
                            ? 'bg-amber-50 text-amber-900 font-bold'
                            : 'text-gray-700 hover:bg-amber-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <img
                            src={cat.image}
                            alt=""
                            className="w-4 h-4 rounded-full object-cover shrink-0"
                          />
                          <span className="truncate">{cat.name}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {products.filter(p => p.category === cat.name || p.categoryId === cat.id || p.categoryId === cat.slug).length}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Customer Trust Quick Links */}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCodModalOpen(true);
                }}
                className="w-full text-left py-2 px-3 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 flex items-center justify-between border border-emerald-200 transition"
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>{settings.topBarCodText || 'ক্যাশ অন ডেলিভারি (Cash on Delivery)'}</span>
                </div>
                <span className="text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-full font-black">পলিসি</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setReturnPolicyModalOpen(true);
                }}
                className="w-full text-left py-2 px-3 rounded-xl text-xs font-bold text-rose-900 bg-rose-50 hover:bg-rose-100 flex items-center justify-between border border-rose-200 transition"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  <span>{settings.topBarReturnText || '৭ দিনের রিটার্ন পলিসি (7 Days Return)'}</span>
                </div>
                <span className="text-[10px] bg-rose-200 text-rose-950 px-2 py-0.5 rounded-full font-black">পলিসি</span>
              </button>

              {/* Direct Phone & WhatsApp buttons inside Mobile Drawer */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`tel:${cleanPhone}`}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 text-white text-xs font-black shadow-xs hover:bg-slate-800 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                  <span>কল করুন</span>
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-xs hover:bg-emerald-500 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-white fill-current" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {isAdmin && (
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('admin');
                  }}
                  className="w-full py-2.5 bg-amber-400 text-slate-950 text-xs font-black rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>Go to Admin Panel</span>
                </button>
              </div>
            )}
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* 🚚 Cash on Delivery (COD) Detailed Modal */}
      {codModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-100 relative max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setCodModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-xs">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  নিরাপদ কেনাকাটা
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  সারা দেশে ক্যাশ অন ডেলিভারি (COD)
                </h3>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
              <p className="text-xs sm:text-sm font-bold text-emerald-950 leading-relaxed">
                {settings.codNoticeText || 'সারা বাংলাদেশে নির্ভরযোগ্য ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা। পার্সেল হাতে পেয়ে সম্পূর্ণ টাকা পরিশোধ করুন।'}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                ক্যাশ অন ডেলিভারির মূল সুবিধাসমূহ:
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>৬৪ জেলায় হোম ডেলিভারি:</strong> দেশের যেকোনো উপজেলা ও জেলা শহরে দ্রুত ও নিরাপদ ডেলিভারি।</span>
                </li>
                <li className="flex items-start gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>হাতে পেয়ে মূল্য পরিশোধ:</strong> পণ্য ডেলিভারি প্রতিনিধির হাত থেকে গ্রহণ করার পর মূল্য পরিশোধ করুন।</span>
                </li>
                <li className="flex items-start gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>ডেলিভারি সময়সীমা:</strong> {settings.estimatedDeliveryDhaka || 'ঢাকার ভেতরে ২৪-৪৮ ঘণ্টা'} এবং {settings.estimatedDeliveryOutsideDhaka || 'ঢাকার বাইরে ৩-৫ কার্যদিবস'}।</span>
                </li>
                <li className="flex items-start gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>অর্ডার ভেরিফিকেশন:</strong> অর্ডার প্লেস করার পর কাস্টমার সাপোর্ট টিম থেকে কল দিয়ে অর্ডারটি কনফার্ম করা হবে।</span>
                </li>
              </ul>
            </div>

            {(settings.contactPhone || settings.phone) && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">যেকোনো তথ্যের জন্য কল করুন:</span>
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
              onClick={() => setCodModalOpen(false)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              বুঝেছি (Close)
            </button>
          </div>
        </div>
      )}

      {/* 🔄 7 Days Return Policy Detailed Modal */}
      {returnPolicyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-rose-100 relative max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setReturnPolicyModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700 shadow-xs">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  ১০০% গ্যারান্টি
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  ৭ দিনের সহজ রিটার্ন ও এক্সচেঞ্জ পলিসি
                </h3>
              </div>
            </div>

            <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-2">
              <p className="text-xs sm:text-sm font-bold text-rose-950 leading-relaxed">
                {settings.returnPolicyText || 'পণ্য হাতে পাওয়ার পর কোনো সমস্যা, ডিফেক্ট বা অমিল থাকলে ৭ দিনের মধ্যে সম্পূর্ণ রিটার্ন বা রিপ্লেসমেন্ট পাবেন।'}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                রিটার্ন করার সহজ নিয়ম ও শর্তাবলী:
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span><strong>৭ দিনের সময়সীমা:</strong> পণ্য ডেলিভারি সম্পন্ন হওয়ার ৭ দিনের মধ্যে হেল্পলাইনে যোগাযোগ করতে হবে।</span>
                </li>
                <li className="flex items-start gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span><strong>ইনট্যাক্ট প্যাকেজিং:</strong> পণ্যের বক্স, ইনভয়েস এবং মূল ট্যাগ অক্ষত থাকা বাঞ্ছনীয়।</span>
                </li>
                <li className="flex items-start gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span><strong>আনবক্সিং ভিডিও:</strong> পার্সেল খোলার সময় একটি স্পষ্ট ভিডিও করে রাখলে যেকোনো অভিযোগ অবিলম্বে নিষ্পত্তি করা হয়।</span>
                </li>
                <li className="flex items-start gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span><strong>তাৎক্ষণিক রিফান্ড:</strong> রিটার্ন যাচাই হওয়ার ২৪-৪৮ ঘণ্টার মধ্যে বিকাশ, নগদ বা ব্যাংক ট্রান্সফারের মাধ্যমে টাকা ফেরত দেয়া হয়।</span>
                </li>
              </ul>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-bold flex items-center justify-between">
              <span>রিটার্ন রিকোয়েস্ট করতে:</span>
              <span className="font-extrabold text-amber-950">হটলাইন / WhatsApp-এ মেসেজ দিন</span>
            </div>

            <button
              onClick={() => setReturnPolicyModalOpen(false)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              বুঝেছি (Close)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
