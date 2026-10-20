import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { CartProvider, useCart } from './context/CartContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/common/CartDrawer';
import { ToastContainer } from './components/common/Toast';
import { StickyBottomBar } from './components/common/StickyBottomBar';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { AuthModal } from './pages/AuthModal';

import { AdminLogin } from './admin/AdminLogin';
import { AdminLayout } from './admin/AdminLayout';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminHotDeals } from './admin/AdminHotDeals';
import { AdminProducts } from './admin/AdminProducts';
import { AdminCategories } from './admin/AdminCategories';
import { AdminBanners } from './admin/AdminBanners';
import { AdminAds } from './admin/AdminAds';
import { AdminOrders } from './admin/AdminOrders';
import { AdminCustomers } from './admin/AdminCustomers';
import { AdminSettings } from './admin/AdminSettings';

import { Order } from './types';
import { Loader2, MessageCircle } from 'lucide-react';

function MainApp() {
  const { isAdmin, loading: authLoading } = useAuth();
  const { settings } = useStore();

  // Route state initialized from browser window.location.pathname
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Sync state with browser URL navigation (Back/Forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Inject Adsterra / 3rd-party Header Script safely if enabled
  useEffect(() => {
    if (!settings.isAdsterraEnabled || !settings.adsterraHeaderScript) return;
    const existing = document.getElementById('adsterra-header-inject');
    if (existing) existing.remove();

    const scriptContainer = document.createElement('div');
    scriptContainer.id = 'adsterra-header-inject';
    scriptContainer.innerHTML = settings.adsterraHeaderScript;
    const scripts = scriptContainer.querySelectorAll('script');
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
    document.head.appendChild(scriptContainer);

    return () => {
      const el = document.getElementById('adsterra-header-inject');
      if (el) el.remove();
    };
  }, [settings.isAdsterraEnabled, settings.adsterraHeaderScript]);

  // Universal navigation helper
  const navigate = (path: string) => {
    // Normalise short codes
    let target = path;
    if (path === 'home') target = '/';
    else if (path === 'products') target = '/products';
    else if (path.startsWith('product-')) target = `/product/${path.replace('product-', '')}`;
    else if (path === 'cart') target = '/cart';
    else if (path === 'checkout') target = '/checkout';
    else if (path === 'order-success') target = '/order-success';
    else if (path === 'track-order') target = '/track-order';
    else if (path === 'admin') target = isAdmin ? '/admin/dashboard' : '/admin/login';
    else if (path === 'admin/login') target = '/admin/login';
    else if (path === 'admin/dashboard') target = '/admin/dashboard';

    if (!target.startsWith('/')) {
      target = '/' + target;
    }

    try {
      window.history.pushState({}, '', target);
    } catch {
      // In restricted iframe environments, pushState is guarded
    }
    setCurrentPath(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderCompleted = (order: Order) => {
    setLastPlacedOrder(order);
    navigate('/order-success');
  };

  // Determine active view from currentPath
  const isVisitingAdmin = currentPath.startsWith('/admin');

  // ADMIN ROUTE PROTECTION
  if (isVisitingAdmin) {
    // Wait for Firebase Auth initialization to avoid flashing login on refresh
    if (authLoading) {
      return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <p className="text-xs text-gray-400 font-mono">Verifying Firebase Authentication...</p>
        </div>
      );
    }

    // 1. Admin Login Page: /admin/login
    if (currentPath === '/admin/login') {
      // If already logged in as authorized admin, redirect to /admin/dashboard
      if (isAdmin) {
        navigate('/admin/dashboard');
        return null;
      }

      return (
        <AdminLogin
          onSuccess={() => navigate('/admin/dashboard')}
          onBackToStore={() => navigate('/')}
        />
      );
    }

    // 2. Protect all other /admin/* routes:
    // If not authenticated as authorized admin, redirect to /admin/login
    if (!isAdmin) {
      navigate('/admin/login');
      return null;
    }

    // Determine active admin tab from path (default: dashboard)
    const adminTabMatch = currentPath.replace('/admin/', '').replace('/admin', '');
    const activeTab = adminTabMatch || 'dashboard';

    return (
      <AdminLayout
        currentTab={activeTab}
        onSelectTab={(tab) => navigate(`/admin/${tab}`)}
        onExitAdmin={() => navigate('/')}
        onLogoutAdmin={() => navigate('/admin/login')}
      >
        {(activeTab === 'dashboard' || activeTab === '') && (
          <AdminDashboard onNavigateTab={(tab) => navigate(`/admin/${tab}`)} />
        )}
        {activeTab === 'hotdeals' && <AdminHotDeals />}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'categories' && <AdminCategories />}
        {activeTab === 'banners' && <AdminBanners />}
        {activeTab === 'ads' && <AdminAds />}
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'customers' && <AdminCustomers />}
        {activeTab === 'settings' && <AdminSettings />}
      </AdminLayout>
    );
  }

  const { products } = useStore();
  const { addToCart, buyNow } = useCart();

  // CUSTOMER STOREFRONT
  const isProductsPage = currentPath === '/products';
  const isCartPage = currentPath === '/cart';
  const isCheckoutPage = currentPath === '/checkout';
  const isOrderSuccessPage = currentPath === '/order-success';
  const isTrackOrderPage = currentPath === '/track-order';
  const isProductDetailPage = currentPath.startsWith('/product/');
  const currentProductId = isProductDetailPage ? currentPath.replace('/product/', '') : '';
  const currentProduct = isProductDetailPage ? products.find((p) => p.id === currentProductId) : null;

  const handleDetailAddToCart = () => {
    if (currentProduct) {
      addToCart(currentProduct, 1, true);
    }
  };

  const handleDetailBuyNow = () => {
    if (currentProduct) {
      buyNow(currentProduct, 1);
      navigate('/checkout');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Main Sticky Header */}
      <Header
        onNavigate={navigate}
        currentPage={currentPath}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area with padding bottom to accommodate sticky bar */}
      <main className="flex-1 pb-20 md:pb-16">
        {isProductDetailPage && (
          <ProductDetailPage productId={currentProductId} onNavigate={navigate} />
        )}

        {isProductsPage && <ProductsPage onNavigate={navigate} />}

        {isCartPage && <CartPage onNavigate={navigate} />}

        {isCheckoutPage && (
          <CheckoutPage onNavigate={navigate} onOrderCompleted={handleOrderCompleted} />
        )}

        {isOrderSuccessPage && lastPlacedOrder && (
          <OrderSuccessPage order={lastPlacedOrder} onNavigate={navigate} />
        )}

        {isTrackOrderPage && (
          <TrackOrderPage onNavigate={navigate} initialOrderNumber={lastPlacedOrder?.orderNumber} />
        )}

        {!isProductsPage &&
          !isProductDetailPage &&
          !isCartPage &&
          !isCheckoutPage &&
          !isOrderSuccessPage &&
          !isTrackOrderPage && <HomePage onNavigate={navigate} />}
      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer onNavigate={navigate} />

      {/* Sticky Bottom Floating Action & Order Bar */}
      <StickyBottomBar
        onNavigate={navigate}
        currentPath={currentPath}
        currentProduct={currentProduct}
        onAddToCart={handleDetailAddToCart}
        onBuyNow={handleDetailBuyNow}
      />

      {/* Floating WhatsApp Live Chat Button */}
      {settings.isWhatsAppChatActive && settings.whatsAppNumber && !currentPath.startsWith('/admin') && (
        <a
          href={`https://wa.me/${settings.whatsAppNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
            settings.whatsAppDefaultMessage || 'হ্যালো, আমি একটি পণ্য সম্পর্কে তথ্য জানতে চাই।'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-20 right-4 z-40 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group"
          title="WhatsApp এ সরাসরি চ্যাট করুন"
        >
          <MessageCircle className="w-6 h-6 fill-current" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold text-xs pl-0 group-hover:pl-2">
            WhatsApp চ্যাট
          </span>
        </a>
      )}

      {/* Customer Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onNavigateAdmin={() => navigate('/admin/login')}
      />

      {/* Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
