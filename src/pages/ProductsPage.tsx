import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  SlidersHorizontal,
  Search,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  Sparkles,
  Tag,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/common/ProductCard';
import { AdvertisementBanner } from '../components/common/AdvertisementBanner';

interface ProductsPageProps {
  onNavigate: (page: string) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ onNavigate }) => {
  const { products, categories, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useStore();

  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'newest'>('featured');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const ITEMS_PER_PAGE = 12;

  // Active categories list
  const activeCategories = useMemo(() => {
    return categories
      .filter((c) => c.isActive !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [categories]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, minPrice, maxPrice, inStockOnly, discountOnly, sortBy]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Must be published
      if (prod.status !== 'published') return false;

      // Category filter
      if (selectedCategory) {
        const cat = categories.find((c) =>
          c.slug.toLowerCase() === selectedCategory.toLowerCase() ||
          c.name.trim().toLowerCase() === selectedCategory.trim().toLowerCase() ||
          c.id === selectedCategory
        );
        if (cat) {
          const matchName = prod.category?.trim().toLowerCase() === cat.name.trim().toLowerCase();
          const matchId = prod.categoryId === cat.id || prod.category === cat.id;
          const matchSlug = prod.categoryId === cat.slug || prod.category === cat.slug;
          if (!matchName && !matchId && !matchSlug) return false;
        } else {
          const matchName = prod.category?.trim().toLowerCase() === selectedCategory.trim().toLowerCase();
          const matchId = prod.categoryId === selectedCategory;
          if (!matchName && !matchId) return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = prod.name?.toLowerCase().includes(query);
        const matchDesc = prod.description?.toLowerCase().includes(query);
        const matchCategory = prod.category?.toLowerCase().includes(query);
        const matchSku = prod.sku?.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchCategory && !matchSku) return false;
      }

      // Price filter
      const price = prod.discountPrice ?? prod.price;
      if (price < minPrice || price > maxPrice) return false;

      // In stock filter
      if (inStockOnly && prod.stock <= 0) return false;

      // Discount only
      if (discountOnly && (!prod.discountPrice || prod.discountPrice >= prod.price)) return false;

      return true;
    }).sort((a, b) => {
      const priceA = a.discountPrice ?? a.price;
      const priceB = b.discountPrice ?? b.price;

      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      // default: featured
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, categories, selectedCategory, searchQuery, minPrice, maxPrice, inStockOnly, discountOnly, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setMinPrice(0);
    setMaxPrice(200000);
    setInStockOnly(false);
    setDiscountOnly(false);
    setCurrentPage(1);
  };

  const selectedCategoryObj = categories.find((c) =>
    c.slug.toLowerCase() === selectedCategory.toLowerCase() ||
    c.name.trim().toLowerCase() === selectedCategory.trim().toLowerCase() ||
    c.id === selectedCategory
  );

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-8 py-6 space-y-6">
      {/* Top Banner Advertisement */}
      <AdvertisementBanner position="product_page" onNavigate={onNavigate} />

      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {selectedCategoryObj ? selectedCategoryObj.name : searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Showing {filteredProducts.length} items with authentic brand warranty & cash on delivery
          </p>
        </div>

        {/* Toolbar: Sort & Mobile filter trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 shadow-2xs"
          >
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium hidden sm:inline">Sort By:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-gray-200 text-xs font-semibold text-gray-800 py-2 pl-3 pr-8 rounded-xl focus:border-emerald-500 outline-hidden shadow-2xs cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Arrivals</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Category Navigation Strip */}
      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2 px-1">
          <span className="font-bold text-[11px] uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-emerald-600" />
            <span>Select Category</span>
          </span>
          <span className="text-[11px] text-gray-400">
            {activeCategories.length} categories available
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('')}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              !selectedCategory
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/50'
            }`}
          >
            <span>All Categories</span>
            <span className="text-[10px] opacity-80">
              ({products.filter((p) => p.status === 'published').length})
            </span>
          </button>

          {activeCategories.map((cat) => {
            const isSelected =
              selectedCategory === cat.slug ||
              selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
              selectedCategory === cat.id;

            const count = products.filter(
              (p) =>
                p.status === 'published' &&
                (p.category?.trim().toLowerCase() === cat.name.trim().toLowerCase() ||
                  p.categoryId === cat.id ||
                  p.categoryId === cat.slug)
            ).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? '' : cat.slug)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold shadow-2xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-4 h-4 rounded-full object-cover shrink-0"
                />
                <span className="whitespace-nowrap">{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {count}
                </span>
                {isSelected && <X className="w-3 h-3 text-emerald-700 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Category Filter Banner */}
      {selectedCategory && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-emerald-50/80 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-600">Active Category Filter:</span>
            <span className="font-extrabold bg-white px-3 py-1 rounded-xl border border-emerald-300 text-emerald-800 flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>{selectedCategoryObj?.name || selectedCategory}</span>
              <button
                onClick={() => setSelectedCategory('')}
                className="text-gray-400 hover:text-rose-600 ml-1 p-0.5"
                title="Remove category filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          </div>

          <button
            onClick={handleResetFilters}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-6 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>Filters</span>
            </h3>
            {(selectedCategory || searchQuery || inStockOnly || discountOnly || minPrice > 0 || maxPrice < 200000) && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-2.5">
              Categories
            </h4>
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setCurrentPage(1);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                  !selectedCategory ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>All Categories</span>
                <span className="text-[10px] text-gray-400">
                  {products.filter(p => p.status === 'published').length}
                </span>
              </button>

              {categories.filter(c => c.isActive !== false).map((cat) => {
                const count = products.filter(
                  (p) => p.status === 'published' && (p.category === cat.name || p.categoryId === cat.id || p.categoryId === cat.slug)
                ).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                      selectedCategory === cat.slug || selectedCategory === cat.name ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate pr-2">{cat.name}</span>
                    <span className="text-[10px] text-gray-400">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="pt-2 border-t border-gray-100">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">
              Price Range (৳ BDT)
            </h4>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="text-[10px] text-gray-400 font-medium">Min (৳)</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(Number(e.target.value) || 0);
                    setCurrentPage(1);
                  }}
                  className="w-full text-xs p-1.5 border border-gray-200 rounded-lg outline-hidden focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-medium">Max (৳)</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(Number(e.target.value) || 200000);
                    setCurrentPage(1);
                  }}
                  className="w-full text-xs p-1.5 border border-gray-200 rounded-lg outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Availability & Offers */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-2">
              Options
            </h4>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 font-medium select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  setInStockOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="rounded-sm text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>In Stock Only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 font-medium select-none">
              <input
                type="checkbox"
                checked={discountOnly}
                onChange={(e) => {
                  setDiscountOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="rounded-sm text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Discounted Items Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          {paginatedProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-2xs">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-gray-800 text-lg mb-1">No products found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
                We couldn't find any products matching your selected category and filters. Try adjusting your filters or search terms.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-emerald-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                        currentPage === i + 1
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileFilterOpen(false)} />
          <div className="relative w-4/5 max-w-xs bg-white h-full p-5 overflow-y-auto z-10 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-sm text-gray-900">Filter Products</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category list */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-2">
                Categories
              </h4>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setMobileFilterOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-lg text-xs font-medium text-gray-700 hover:bg-emerald-50"
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      setMobileFilterOpen(false);
                    }}
                    className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium ${
                      selectedCategory === cat.slug ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* In stock */}
            <div className="pt-2 border-t border-gray-100">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-800">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded-sm text-emerald-600"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
