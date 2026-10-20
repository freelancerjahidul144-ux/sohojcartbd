import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Layers,
  Search,
  SlidersHorizontal,
  Image as ImageIcon,
  Sparkles,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Category } from '../types';

const IMAGE_PRESETS = [
  { name: 'Gadgets', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80' },
  { name: 'Computers', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80' },
  { name: 'Fashion', url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=600&q=80' },
  { name: 'Saree', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80' },
  { name: 'Beauty', url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80' },
  { name: 'Grocery', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80' },
  { name: 'Appliances', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80' },
  { name: 'Footwear', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80' },
  { name: 'Bags', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80' },
  { name: 'Fitness', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80' },
];

export const AdminCategories: React.FC = () => {
  const { categories, products, saveCategoryAction, deleteCategoryAction, addToast } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);

  // Search & filter in Admin
  const [adminSearch, setAdminSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80');
    setIsActive(true);
    setDisplayOrder(categories.length + 1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImage(cat.image);
    setIsActive(cat.isActive !== false);
    setDisplayOrder(cat.displayOrder || 1);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleToggleActive = async (cat: Category) => {
    const updatedStatus = !(cat.isActive !== false);
    try {
      await saveCategoryAction({ ...cat, isActive: updatedStatus });
      addToast(
        'info',
        `Category "${cat.name}" is now ${updatedStatus ? 'Active on storefront' : 'Deactivated / Hidden from storefront'}.`
      );
    } catch {
      // Handled in context
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    const cleanSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const payload: Category = {
      id: editingCategory ? editingCategory.id : `cat-${Date.now()}`,
      name: name.trim(),
      slug: cleanSlug,
      description: description.trim(),
      image: image.trim() || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
      isActive,
      displayOrder: Number(displayOrder) || 1,
      createdAt: editingCategory?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveCategoryAction(payload);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    const attachedCount = products.filter(
      (p) => p.category === cat.name || p.categoryId === cat.id || p.categoryId === cat.slug
    ).length;

    const confirmMsg = attachedCount > 0
      ? `Warning: Category "${cat.name}" has ${attachedCount} products attached to it.\n\nDeleting this category will remove it from the storefront and database. Products will remain in inventory.\n\nAre you sure you want to proceed?`
      : `Are you sure you want to delete category "${cat.name}" from Firebase?`;

    if (window.confirm(confirmMsg)) {
      await deleteCategoryAction(cat.id);
    }
  };

  // Filtered categories for admin view
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        if (statusFilter === 'active' && cat.isActive === false) return false;
        if (statusFilter === 'inactive' && cat.isActive !== false) return false;
        if (adminSearch.trim()) {
          const q = adminSearch.toLowerCase().trim();
          const matchName = cat.name.toLowerCase().includes(q);
          const matchSlug = cat.slug.toLowerCase().includes(q);
          const matchDesc = cat.description?.toLowerCase().includes(q);
          if (!matchName && !matchSlug && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [categories, statusFilter, adminSearch]);

  const activeCount = categories.filter((c) => c.isActive !== false).length;
  const inactiveCount = categories.filter((c) => c.isActive === false).length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">Category Management (ক্যাটাগরি ম্যানেজমেন্ট)</h1>
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black px-2.5 py-0.5 rounded-full">
              {categories.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 font-semibold">
            ক্যাটাগরি যুক্ত, এডিট, ডিলিট বা সক্রিয়/নিষ্ক্রিয় করুন। পরিবর্তন সরাসরি ওয়েবসাইটে ও ফায়ারবেজে সেভ হবে।
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Total Categories</p>
          <p className="text-2xl font-black text-slate-950 mt-1">{categories.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5 font-medium">স্টোরের মোট ক্যাটাগরি</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs">
          <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">Active on Storefront</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{activeCount}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">ওয়েবসাইটে দৃশ্যমান</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs">
          <p className="text-[11px] font-bold text-rose-800 uppercase tracking-wide">Deactivated / Hidden</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{inactiveCount}</p>
          <p className="text-[10px] text-rose-500 mt-0.5 font-medium">লুকিয়ে রাখা হয়েছে</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
          <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Total Products</p>
          <p className="text-2xl font-black text-amber-900 mt-1">{products.length}</p>
          <p className="text-[10px] text-amber-700 mt-0.5 font-medium">ক্যাটাগরিভুক্ত পণ্যসমূহ</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search categories by name, slug or description..."
            value={adminSearch}
            onChange={(e) => setAdminSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-950 font-bold rounded-xl text-xs outline-hidden focus:border-emerald-600 focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          {adminSearch && (
            <button
              onClick={() => setAdminSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-700 font-bold">Status:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({categories.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                statusFilter === 'inactive'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inactive ({inactiveCount})
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid - High Contrast White & Pure Black with Emerald Green Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCategories.map((cat) => {
          const productCount = products.filter(
            (p) =>
              p.category?.trim().toLowerCase() === cat.name.trim().toLowerCase() ||
              p.categoryId === cat.id ||
              p.categoryId === cat.slug
          ).length;

          const isCatActive = cat.isActive !== false;

          return (
            <div
              key={cat.id}
              className={`bg-white rounded-2xl border p-4.5 space-y-3.5 shadow-xs hover:shadow-md hover:border-slate-300 transition flex flex-col justify-between ${
                isCatActive ? 'border-slate-200' : 'border-rose-300 bg-rose-50/20'
              }`}
            >
              <div>
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative group shadow-2xs">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-1 left-1 bg-slate-950/80 text-white text-[9px] font-mono px-1 rounded-xs">
                      #{cat.displayOrder || 1}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-sm text-slate-950 truncate" title={cat.name}>
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{cat.slug}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-100 font-black px-2 py-0.5 rounded-md border border-emerald-300">
                        {productCount} Products
                      </span>
                    </div>
                  </div>
                </div>

                {cat.description ? (
                  <p className="text-xs text-slate-700 line-clamp-2 mt-2.5 leading-relaxed font-medium">
                    {cat.description}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 italic mt-2.5">
                    No description provided
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {/* Activate / Deactivate button */}
                <button
                  onClick={() => handleToggleActive(cat)}
                  className={`flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-full border transition cursor-pointer ${
                    isCatActive
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-400 hover:bg-emerald-200'
                      : 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
                  }`}
                  title="Click to toggle active on storefront"
                >
                  {isCatActive ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Hidden</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg transition cursor-pointer"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <p className="text-slate-600 text-sm font-semibold">No categories match your search or filter.</p>
          <button
            onClick={() => {
              setAdminSearch('');
              setStatusFilter('all');
            }}
            className="mt-3 text-xs text-emerald-700 hover:underline font-black cursor-pointer"
          >
            Clear Search & Filters
          </button>
        </div>
      )}

      {/* Add / Edit Category Modal (Clean White & Black Theme) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 my-8 animate-in fade-in text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-black text-slate-950">
                  {editingCategory ? 'Edit Category (ক্যাটাগরি এডিট)' : 'Create New Category (নতুন ক্যাটাগরি)'}
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  {editingCategory
                    ? 'ক্যাটাগরি তথ্য ও ওয়েবসাইটে প্রকাশের অবস্থা আপডেট করুন'
                    : 'সহজকার্ট বিডি-তে নতুন ডিপার্টমেন্ট বা ক্যাটাগরি তৈরি করুন'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Category Name (ক্যাটাগরির নাম) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Watches & Wearables"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-950 font-bold rounded-xl focus:border-emerald-600 focus:bg-white outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Slug URL (ইউআরএল লিংক) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. smart-watches"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 font-mono rounded-xl focus:border-emerald-600 focus:bg-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Display Order (ক্রম সংখ্যা)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value) || 1)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 font-bold rounded-xl focus:border-emerald-600 focus:bg-white outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-900">
                    Image URL (ছবির লিংক) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">High resolution link</span>
                </div>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 font-medium rounded-xl focus:border-emerald-600 focus:bg-white outline-hidden"
                />

                {/* Quick Presets */}
                <div className="mt-2.5">
                  <span className="text-[10px] text-slate-600 font-bold block mb-1">
                    Quick Photo Presets (ক্লিক করে ছবি নির্বাচন করুন):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {IMAGE_PRESETS.map((p) => (
                      <button
                        type="button"
                        key={p.name}
                        onClick={() => setImage(p.url)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border transition font-bold cursor-pointer ${
                          image === p.url
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {image && (
                  <div className="mt-2.5 flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <img
                      src={image}
                      alt="Preview"
                      className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                    />
                    <div className="text-[11px] text-slate-700 min-w-0">
                      <p className="font-bold text-slate-900">Image Preview</p>
                      <p className="text-slate-500 truncate text-[10px] font-mono">{image}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Description (বিবরণ)</label>
                <textarea
                  rows={2}
                  placeholder="Short summary for SEO and storefront collection header..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 text-slate-900 font-medium rounded-xl focus:border-emerald-600 focus:bg-white outline-hidden"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-slate-900">Active on Storefront (ওয়েবসাইটে দৃশ্যমান)</p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    চালু থাকলে কাস্টমাররা ওয়েবসাইটে এই ক্যাটাগরি দেখতে ও ব্রাউজ করতে পারবেন
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Saving to Firebase...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
