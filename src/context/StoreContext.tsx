import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, Category, Banner, Advertisement, StoreSettings, Order } from '../types';
import {
  subscribeProducts,
  subscribeCategories,
  subscribeBanners,
  subscribeAdvertisements,
  saveProduct,
  deleteProduct as deleteProductFromDb,
  updateProductStock,
  processOrderInventory,
  saveCategory,
  deleteCategory as deleteCategoryFromDb,
  saveBanner,
  deleteBanner as deleteBannerFromDb,
  saveAdvertisement,
  deleteAdvertisement as deleteAdFromDb,
  getStoreSettings,
  saveStoreSettings,
  subscribeStoreSettings,
  seedDatabase,
  syncDefaultCategories,
} from '../services/firestoreService';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_BANNERS,
  INITIAL_ADS,
  INITIAL_SETTINGS,
} from '../data/seedData';

const SETTINGS_STORAGE_KEY = 'sohoj_store_settings_v4';

const getInitialSettings = (): StoreSettings => {
  try {
    const cached = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return { ...INITIAL_SETTINGS, ...parsed, isFreeDeliveryEnabled: false };
    }
  } catch {}
  return { ...INITIAL_SETTINGS, isFreeDeliveryEnabled: false };
};

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoreContextType {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  advertisements: Advertisement[];
  settings: StoreSettings;
  loading: boolean;
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
  // Product actions
  saveProductAction: (product: Product) => Promise<void>;
  deleteProductAction: (productId: string) => Promise<void>;
  adjustProductStockAction: (productId: string, newStock: number) => Promise<void>;
  incrementProductStockAction: (productId: string, amount: number) => Promise<void>;
  deductInventoryForOrderAction: (items: { productId: string; quantity: number }[]) => Promise<void>;
  // Category actions
  saveCategoryAction: (category: Category) => Promise<void>;
  deleteCategoryAction: (categoryId: string) => Promise<void>;
  // Banner actions
  saveBannerAction: (banner: Banner) => Promise<void>;
  deleteBannerAction: (bannerId: string) => Promise<void>;
  // Ad actions
  saveAdAction: (ad: Advertisement) => Promise<void>;
  deleteAdAction: (adId: string) => Promise<void>;
  // Settings
  updateSettingsAction: (settings: StoreSettings) => Promise<void>;
  // Database seed
  seedStoreDataAction: (force?: boolean) => Promise<{ count: number; message: string }>;
  // Global search & filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  viewingProduct: Product | null;
  setViewingProduct: (product: Product | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(INITIAL_ADS);
  const [settings, setSettings] = useState<StoreSettings>(getInitialSettings);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Set up real-time listeners to Firestore
  useEffect(() => {
    let unsubProducts: (() => void) | undefined;
    let unsubCategories: (() => void) | undefined;
    let unsubBanners: (() => void) | undefined;
    let unsubAds: (() => void) | undefined;
    let unsubSettings: (() => void) | undefined;

    try {
      unsubProducts = subscribeProducts((dbProducts) => {
        if (dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts);
        } else {
          // If Firestore is empty, auto-seed with initial products to make store immediately live!
          seedDatabase(false).catch(() => {});
        }
        setLoading(false);
      }, () => {
        setLoading(false);
      });

      unsubCategories = subscribeCategories((dbCategories) => {
        if (dbCategories && dbCategories.length > 0) {
          setCategories(dbCategories);
          if (dbCategories.length < INITIAL_CATEGORIES.length) {
            syncDefaultCategories().catch(() => {});
          }
        } else {
          syncDefaultCategories().catch(() => {});
        }
      });

      unsubBanners = subscribeBanners((dbBanners) => {
        if (dbBanners && dbBanners.length > 0) {
          setBanners(dbBanners);
        }
      });

      unsubAds = subscribeAdvertisements((dbAds) => {
        if (dbAds && dbAds.length > 0) {
          setAdvertisements(dbAds);
        }
      });

      unsubSettings = subscribeStoreSettings((dbSettings) => {
        if (dbSettings) {
          setSettings((prev) => {
            const cleanDb: Record<string, any> = {};
            Object.entries(dbSettings).forEach(([k, v]) => {
              if (v !== undefined && v !== null) {
                cleanDb[k] = v;
              }
            });
            const merged = { ...prev, ...cleanDb };
            try {
              localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      });
    } catch (err) {
      console.warn('Realtime listeners notice:', err);
      setLoading(false);
    }

    return () => {
      if (unsubProducts) unsubProducts();
      if (unsubCategories) unsubCategories();
      if (unsubBanners) unsubBanners();
      if (unsubAds) unsubAds();
      if (unsubSettings) unsubSettings();
    };
  }, []);

  // Sync favicon if custom iconUrl is configured
  useEffect(() => {
    if (settings.iconUrl?.trim()) {
      const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (favicon) {
        favicon.href = settings.iconUrl.trim();
      }
    }
  }, [settings.iconUrl]);

  // Product Actions
  const saveProductAction = async (product: Product) => {
    // Optimistic local update
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = product;
        return copy;
      }
      return [product, ...prev];
    });

    try {
      await saveProduct(product);
      addToast('success', `Product "${product.name.slice(0, 30)}..." saved and published to storefront.`);
    } catch (error) {
      addToast('error', 'Failed to save product to Firestore database.');
      throw error;
    }
  };

  const deleteProductAction = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    try {
      await deleteProductFromDb(productId);
      addToast('info', 'Product removed successfully.');
    } catch (error) {
      addToast('error', 'Failed to delete product from Firestore.');
      throw error;
    }
  };

  const adjustProductStockAction = async (productId: string, newStock: number) => {
    const finalStock = Math.max(0, newStock);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: finalStock } : p))
    );
    try {
      await updateProductStock(productId, finalStock);
      addToast('success', `পণ্যের স্টক আপডেট হয়ে ${finalStock} টি হয়েছে।`);
    } catch (err) {
      addToast('error', 'স্টক আপডেট করতে সমস্যা হয়েছে।');
    }
  };

  const incrementProductStockAction = async (productId: string, amount: number) => {
    let targetStock = 0;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          targetStock = Math.max(0, (p.stock || 0) + amount);
          return { ...p, stock: targetStock };
        }
        return p;
      })
    );
    try {
      await updateProductStock(productId, targetStock);
      addToast('success', `স্টকে +${amount} টি পণ্য সফলভাবে যোগ করা হয়েছে! (বর্তমান স্টক: ${targetStock})`);
    } catch (err) {
      addToast('error', 'স্টক বৃদ্ধি করতে সমস্যা হয়েছে।');
    }
  };

  const deductInventoryForOrderAction = async (
    items: { productId: string; quantity: number }[]
  ) => {
    // Deduct stock and increment salesCount in local state immediately
    setProducts((prev) => {
      const copy = [...prev];
      for (const item of items) {
        const idx = copy.findIndex((p) => p.id === item.productId);
        if (idx >= 0) {
          const current = copy[idx];
          const newStock = Math.max(0, (current.stock || 0) - item.quantity);
          const newSales = (current.salesCount || 0) + item.quantity;
          copy[idx] = {
            ...current,
            stock: newStock,
            salesCount: newSales,
          };
        }
      }
      return copy;
    });

    try {
      await processOrderInventory(items);
    } catch (err) {
      console.warn('Inventory sync notice:', err);
    }
  };

  // Category Actions
  const saveCategoryAction = async (category: Category) => {
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === category.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = category;
        return copy;
      }
      return [...prev, category];
    });
    try {
      await saveCategory(category);
      addToast('success', `Category "${category.name}" saved.`);
    } catch (error) {
      addToast('error', 'Failed to save category.');
      throw error;
    }
  };

  const deleteCategoryAction = async (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    try {
      await deleteCategoryFromDb(categoryId);
      addToast('info', 'Category removed.');
    } catch (error) {
      addToast('error', 'Failed to delete category.');
      throw error;
    }
  };

  // Banner Actions
  const saveBannerAction = async (banner: Banner) => {
    setBanners((prev) => {
      const idx = prev.findIndex((b) => b.id === banner.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = banner;
        return copy;
      }
      return [...prev, banner];
    });
    try {
      await saveBanner(banner);
      addToast('success', `Banner "${banner.title.slice(0, 25)}..." updated.`);
    } catch (error) {
      addToast('error', 'Failed to save banner.');
      throw error;
    }
  };

  const deleteBannerAction = async (bannerId: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== bannerId));
    try {
      await deleteBannerFromDb(bannerId);
      addToast('info', 'Banner removed.');
    } catch (error) {
      addToast('error', 'Failed to delete banner.');
      throw error;
    }
  };

  // Ad Actions
  const saveAdAction = async (ad: Advertisement) => {
    setAdvertisements((prev) => {
      const idx = prev.findIndex((a) => a.id === ad.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = ad;
        return copy;
      }
      return [...prev, ad];
    });
    try {
      await saveAdvertisement(ad);
      addToast('success', `Advertisement updated.`);
    } catch (error) {
      addToast('error', 'Failed to save advertisement.');
      throw error;
    }
  };

  const deleteAdAction = async (adId: string) => {
    setAdvertisements((prev) => prev.filter((a) => a.id !== adId));
    try {
      await deleteAdFromDb(adId);
      addToast('info', 'Advertisement removed.');
    } catch (error) {
      addToast('error', 'Failed to delete advertisement.');
      throw error;
    }
  };

  const updateSettingsAction = async (newSettings: StoreSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
    try {
      await saveStoreSettings(newSettings);
    } catch (error) {
      console.warn('Firestore settings save warning, local copy preserved:', error);
    }
  };

  const seedStoreDataAction = async (force: boolean = false) => {
    try {
      const result = await seedDatabase(force);
      addToast('success', result.message);
      return result;
    } catch (error) {
      addToast('error', 'Seeding failed. Please check network/permissions.');
      throw error;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        banners,
        advertisements,
        settings,
        loading,
        toasts,
        addToast,
        removeToast,
        saveProductAction,
        deleteProductAction,
        adjustProductStockAction,
        incrementProductStockAction,
        deductInventoryForOrderAction,
        saveCategoryAction,
        deleteCategoryAction,
        saveBannerAction,
        deleteBannerAction,
        saveAdAction,
        deleteAdAction,
        updateSettingsAction,
        seedStoreDataAction,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        viewingProduct,
        setViewingProduct,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
