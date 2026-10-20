import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  Image as ImageIcon,
  Megaphone,
  DollarSign,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Menu,
  X,
  User,
  Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';
import { subscribeOrders } from '../services/firestoreService';

interface AdminLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onExitAdmin: () => void;
  onLogoutAdmin: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  onExitAdmin,
  onLogoutAdmin,
  children,
}) => {
  const { logout, currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    const unsub = subscribeOrders((orders) => {
      const pending = orders.filter((o) => o.orderStatus === 'Pending').length;
      setPendingOrdersCount(pending);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to sign out from Admin Panel?')) {
      await logout();
      onLogoutAdmin();
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { id: 'hotdeals', label: '🔥 Hot Deals', path: '/admin/hotdeals', icon: Flame },
    { id: 'products', label: 'Products', path: '/admin/products', icon: Package },
    { id: 'categories', label: 'Categories', path: '/admin/categories', icon: Layers },
    { id: 'banners', label: 'Banners', path: '/admin/banners', icon: ImageIcon },
    { id: 'ads', label: 'Ads & Monetization', path: '/admin/ads', icon: DollarSign },
    { id: 'orders', label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', path: '/admin/customers', icon: Users },
    { id: 'settings', label: 'Store Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="h-[100dvh] bg-slate-100 text-slate-900 flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar for Desktop - Smooth Vertical Scrolling from Top to Bottom */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-4 shrink-0 shadow-xs h-full overflow-y-auto overscroll-y-auto justify-between">
        <div className="space-y-5">
          {/* Official Brand Logo */}
          <div className="px-2 py-2 border-b border-slate-100">
            <BrandLogo variant="color" size="md" />
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-amber-600 font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Admin Management Portal</span>
            </div>
          </div>

          {/* Admin User Badge */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <span>Logged In Admin</span>
            </div>
            <p className="text-[11px] font-mono text-amber-700 font-bold truncate" title={currentUser?.email || 'freelancerjahidul144@gmail.com'}>
              {currentUser?.email || 'freelancerjahidul144@gmail.com'}
            </p>
          </div>

          {/* Navigation links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const isOrderTab = item.id === 'orders';
              const showBadge = isOrderTab && pendingOrdersCount > 0;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-black shadow-sm shadow-amber-400/30'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {showBadge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                        {pendingOrdersCount}
                      </span>
                    )}
                    <span className="text-[10px] opacity-60 font-mono hidden lg:inline">
                      /admin/{item.id}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Utility Actions */}
        <div className="pt-4 border-t border-slate-200 space-y-2">

          {/* Return to Customer Store */}
          <button
            onClick={onExitAdmin}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-amber-500" />
              <span>Customer Storefront</span>
            </span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Sign Out (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header Bar - Clean White */}
      <div className="md:hidden bg-white border-b border-slate-200 p-3.5 flex items-center justify-between text-slate-900">
        <div className="flex items-center gap-2">
          <BrandLogo variant="color" size="sm" />
          <span className="text-[10px] text-amber-800 font-mono bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-bold">
            /{currentTab}
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-1 shadow-md">
          <div className="px-3 py-2 bg-slate-50 rounded-xl mb-2 text-xs text-slate-700 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Logged in as:</span>
            <span className="font-mono text-amber-700 font-bold">{currentUser?.email || 'freelancerjahidul144@gmail.com'}</span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isOrderTab = item.id === 'orders';
            const showBadge = isOrderTab && pendingOrdersCount > 0;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
                  isActive ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {showBadge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-200 flex gap-2">
            <button
              onClick={onExitAdmin}
              className="flex-1 py-2 text-xs font-bold bg-slate-100 text-slate-900 rounded-lg text-center"
            >
              Exit to Store
            </button>
            <button
              onClick={handleLogout}
              className="py-2 px-3 text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport with Clean Light Background, High-Contrast Text, and Smooth Side Scroll */}
      <main className="flex-1 h-full p-4 sm:p-8 overflow-y-auto overscroll-y-auto bg-slate-100 text-slate-900 scroll-smooth">
        {children}
      </main>
    </div>
  );
};
