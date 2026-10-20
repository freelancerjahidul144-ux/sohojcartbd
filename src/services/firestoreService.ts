import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Product, Category, Banner, Advertisement, Order, Review, StoreSettings, OrderStatus, PaymentStatus } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BANNERS, INITIAL_ADS, INITIAL_SETTINGS } from '../data/seedData';

// PRODUCTS
export function subscribeProducts(onData: (products: Product[]) => void, onError?: (err: Error) => void) {
  const path = 'products';
  try {
    const q = collection(db, path);
    return onSnapshot(
      q,
      (snapshot) => {
        const products: Product[] = [];
        snapshot.forEach((d) => {
          products.push({ id: d.id, ...d.data() } as Product);
        });
        onData(products);
      },
      (error) => {
        if (onError) {
          onError(error as Error);
        }
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveProduct(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    const docRef = doc(db, 'products', product.id);
    const rawPayload = {
      ...product,
      updatedAt: new Date().toISOString(),
      createdAt: product.createdAt || new Date().toISOString(),
    };
    const cleanPayload: Record<string, any> = {};
    Object.entries(rawPayload).forEach(([k, v]) => {
      if (v !== undefined) {
        cleanPayload[k] = v;
      }
    });
    await setDoc(docRef, cleanPayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function updateProductStock(productId: string, stock: number): Promise<void> {
  const path = `products/${productId}`;
  try {
    const docRef = doc(db, 'products', productId);
    await updateDoc(docRef, {
      stock: Math.max(0, stock),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function processOrderInventory(
  items: { productId: string; quantity: number }[]
): Promise<void> {
  for (const item of items) {
    if (!item.productId) continue;
    const path = `products/${item.productId}`;
    try {
      const docRef = doc(db, 'products', item.productId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const currentStock = typeof data.stock === 'number' ? data.stock : 10;
        const currentSold = typeof data.salesCount === 'number' ? data.salesCount : 0;
        const newStock = Math.max(0, currentStock - (item.quantity || 1));
        const newSold = currentSold + (item.quantity || 1);
        await updateDoc(docRef, {
          stock: newStock,
          salesCount: newSold,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn(`Could not deduct stock for ${item.productId}:`, err);
    }
  }
}

// CATEGORIES
export function subscribeCategories(onData: (categories: Category[]) => void) {
  const path = 'categories';
  try {
    const q = collection(db, path);
    return onSnapshot(
      q,
      (snapshot) => {
        const categories: Category[] = [];
        snapshot.forEach((d) => {
          categories.push({ id: d.id, ...d.data() } as Category);
        });
        categories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        onData(categories);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveCategory(category: Category): Promise<void> {
  const path = `categories/${category.id}`;
  try {
    const docRef = doc(db, 'categories', category.id);
    await setDoc(docRef, {
      ...category,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const path = `categories/${categoryId}`;
  try {
    await deleteDoc(doc(db, 'categories', categoryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function syncDefaultCategories(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, 'categories'));
    const existingIds = new Set(snap.docs.map((d) => d.id));
    const existingSlugs = new Set(snap.docs.map((d) => (d.data() as Category).slug));

    const batch = writeBatch(db);
    let count = 0;

    for (const cat of INITIAL_CATEGORIES) {
      if (!existingIds.has(cat.id) && !existingSlugs.has(cat.slug)) {
        const docRef = doc(db, 'categories', cat.id);
        batch.set(docRef, cat);
        count++;
      }
    }

    if (count > 0) {
      await batch.commit();
    }
  } catch (err) {
    console.warn('Auto-sync categories notice:', err);
  }
}

// BANNERS
export function subscribeBanners(onData: (banners: Banner[]) => void) {
  const path = 'banners';
  try {
    const q = collection(db, path);
    return onSnapshot(
      q,
      (snapshot) => {
        const banners: Banner[] = [];
        snapshot.forEach((d) => {
          banners.push({ id: d.id, ...d.data() } as Banner);
        });
        banners.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        onData(banners);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveBanner(banner: Banner): Promise<void> {
  const path = `banners/${banner.id}`;
  try {
    const docRef = doc(db, 'banners', banner.id);
    await setDoc(docRef, {
      ...banner,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBanner(bannerId: string): Promise<void> {
  const path = `banners/${bannerId}`;
  try {
    await deleteDoc(doc(db, 'banners', bannerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ADVERTISEMENTS
export function subscribeAdvertisements(onData: (ads: Advertisement[]) => void) {
  const path = 'advertisements';
  try {
    const q = collection(db, path);
    return onSnapshot(
      q,
      (snapshot) => {
        const ads: Advertisement[] = [];
        snapshot.forEach((d) => {
          ads.push({ id: d.id, ...d.data() } as Advertisement);
        });
        onData(ads);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveAdvertisement(ad: Advertisement): Promise<void> {
  const path = `advertisements/${ad.id}`;
  try {
    const docRef = doc(db, 'advertisements', ad.id);
    await setDoc(docRef, {
      ...ad,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteAdvertisement(adId: string): Promise<void> {
  const path = `advertisements/${adId}`;
  try {
    await deleteDoc(doc(db, 'advertisements', adId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ORDERS
export async function createOrder(order: Order): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    const docRef = doc(db, 'orders', order.id);
    await setDoc(docRef, {
      ...order,
      createdAt: order.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeOrders(onData: (orders: Order[]) => void) {
  const path = 'orders';
  try {
    const q = collection(db, path);
    return onSnapshot(
      q,
      (snapshot) => {
        const orders: Order[] = [];
        snapshot.forEach((d) => {
          orders.push({ id: d.id, ...d.data() } as Order);
        });
        orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onData(orders);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function updateOrderStatus(
  orderId: string,
  orderStatus: OrderStatus,
  paymentStatus?: PaymentStatus,
  extra?: {
    cancellationReason?: string;
    adminNotes?: string;
    courierProvider?: string;
    courierTrackingCode?: string;
    courierConsignmentId?: string;
    courierStatus?: string;
    courierBookedAt?: string;
    courierCodAmount?: number;
    courierNotes?: string;
  }
): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const docRef = doc(db, 'orders', orderId);
    const updatePayload: Record<string, any> = {
      orderStatus,
      updatedAt: new Date().toISOString(),
    };
    if (paymentStatus) {
      updatePayload.paymentStatus = paymentStatus;
    }
    if (extra?.cancellationReason !== undefined) {
      updatePayload.cancellationReason = extra.cancellationReason;
    }
    if (extra?.adminNotes !== undefined) {
      updatePayload.adminNotes = extra.adminNotes;
    }
    if (extra?.courierProvider !== undefined) {
      updatePayload.courierProvider = extra.courierProvider;
    }
    if (extra?.courierTrackingCode !== undefined) {
      updatePayload.courierTrackingCode = extra.courierTrackingCode;
    }
    if (extra?.courierConsignmentId !== undefined) {
      updatePayload.courierConsignmentId = extra.courierConsignmentId;
    }
    if (extra?.courierStatus !== undefined) {
      updatePayload.courierStatus = extra.courierStatus;
    }
    if (extra?.courierBookedAt !== undefined) {
      updatePayload.courierBookedAt = extra.courierBookedAt;
    }
    if (extra?.courierCodAmount !== undefined) {
      updatePayload.courierCodAmount = extra.courierCodAmount;
    }
    if (extra?.courierNotes !== undefined) {
      updatePayload.courierNotes = extra.courierNotes;
    }
    await setDoc(docRef, updatePayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const path = `orders/${orderId}`;
  try {
    const docRef = doc(db, 'orders', orderId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Order;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// REVIEWS
export async function getReviewsForProduct(productId: string): Promise<Review[]> {
  const path = 'reviews';
  try {
    const q = query(collection(db, path), where('productId', '==', productId));
    const snap = await getDocs(q);
    const reviews: Review[] = [];
    snap.forEach((d) => {
      reviews.push({ id: d.id, ...d.data() } as Review);
    });
    return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function addReview(review: Review): Promise<void> {
  const path = `reviews/${review.id}`;
  try {
    const docRef = doc(db, 'reviews', review.id);
    await setDoc(docRef, {
      ...review,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// STORE SETTINGS
export function subscribeStoreSettings(onData: (settings: StoreSettings) => void, onError?: (err: Error) => void) {
  const path = 'settings/store';
  try {
    const docRef = doc(db, 'settings', 'store');
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const dbData = snap.data() as Partial<StoreSettings>;
          onData({ ...INITIAL_SETTINGS, ...dbData } as StoreSettings);
        }
      },
      (error) => {
        if (onError) onError(error as Error);
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const path = 'settings/store';
  try {
    const docRef = doc(db, 'settings', 'store');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...INITIAL_SETTINGS, ...(snap.data() as Partial<StoreSettings>) } as StoreSettings;
    }
    return INITIAL_SETTINGS;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return INITIAL_SETTINGS;
  }
}

export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  const path = 'settings/store';
  try {
    const docRef = doc(db, 'settings', 'store');
    const raw = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    const cleanPayload: Record<string, any> = {};
    Object.entries(raw).forEach(([k, v]) => {
      if (v !== undefined) {
        cleanPayload[k] = v;
      }
    });
    await setDoc(docRef, cleanPayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// SEED DATABASE HELPER
export async function seedDatabase(force: boolean = false): Promise<{ count: number; message: string }> {
  try {
    // Check if products exist
    const prodSnap = await getDocs(collection(db, 'products'));
    if (!force && !prodSnap.empty) {
      return { count: prodSnap.size, message: 'Database already initialized with products.' };
    }

    const batch = writeBatch(db);

    // Seed products
    for (const prod of INITIAL_PRODUCTS) {
      const docRef = doc(db, 'products', prod.id);
      batch.set(docRef, prod);
    }

    // Seed categories
    for (const cat of INITIAL_CATEGORIES) {
      const docRef = doc(db, 'categories', cat.id);
      batch.set(docRef, cat);
    }

    // Seed banners
    for (const banner of INITIAL_BANNERS) {
      const docRef = doc(db, 'banners', banner.id);
      batch.set(docRef, banner);
    }

    // Seed advertisements
    for (const ad of INITIAL_ADS) {
      const docRef = doc(db, 'advertisements', ad.id);
      batch.set(docRef, ad);
    }

    // Seed settings ONLY IF settings doc does NOT exist yet so custom payment numbers are NEVER overwritten!
    const settingsRef = doc(db, 'settings', 'store');
    const existingSettingsSnap = await getDoc(settingsRef);
    if (!existingSettingsSnap.exists()) {
      batch.set(settingsRef, INITIAL_SETTINGS);
    }

    await batch.commit();
    return { count: INITIAL_PRODUCTS.length, message: `Successfully seeded ${INITIAL_PRODUCTS.length} products, categories, banners and ads!` };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'batch-seed');
  }
}
