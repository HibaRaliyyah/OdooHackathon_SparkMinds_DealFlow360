'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/data/store';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { BackButton } from '@/components/ui/BackButton';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Tag,
  DollarSign,
  Layers,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import type { Product, ProductType } from '@/lib/types';
import { canManageProductCatalog } from '@/lib/services/permissionService';

export default function ProductsPage() {
  const {
    products,
    productCategories,
    addProduct,
    updateProduct,
    deleteProduct,
    currentUser,
    addActivity,
  } = useStore();

  // RBAC Permission check (Strictly Admin only for CRUD)
  const authCheck = canManageProductCatalog(currentUser?.role);
  const isAdmin = authCheck.allowed;

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Form State for Create / Edit
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('cat-1');
  const [formBasePrice, setFormBasePrice] = useState<number>(100);
  const [formUnit, setFormUnit] = useState('unit');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<ProductType>('Hardware');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  // Banner Notice
  const [banner, setBanner] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showBanner = (message: string, type: 'success' | 'info' = 'success') => {
    setBanner({ message, type });
    setTimeout(() => setBanner(null), 5000);
  };

  // Open Create Modal
  const handleOpenAddModal = () => {
    if (!isAdmin) return;
    setFormName('');
    setFormSku(`HW-${Date.now().toString().slice(-4)}`);
    setFormCategoryId(productCategories[0]?.id || 'cat-1');
    setFormBasePrice(150);
    setFormUnit('unit');
    setFormDescription('');
    setFormType('Hardware');
    setFormStatus('Active');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (p: Product) => {
    if (!isAdmin) return;
    setEditingProduct(p);
    setFormName(p.name);
    setFormSku(p.sku);
    setFormCategoryId(p.categoryId);
    setFormBasePrice(p.basePrice);
    setFormUnit(p.unit || 'unit');
    setFormDescription(p.description || '');
    setFormType(p.type || 'Hardware');
    setFormStatus(p.status);
  };

  // Submit Create Product
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: formName,
      sku: formSku,
      categoryId: formCategoryId,
      basePrice: formBasePrice,
      unit: formUnit,
      description: formDescription,
      taxPercent: 15,
      type: formType,
      isSubscription: formType === 'Subscription',
      status: formStatus,
      variants: [],
      quantityOnHand: 50,
    };

    addProduct(newProd);
    setIsAddModalOpen(false);
    showBanner(`Product "${formName}" (${formSku}) created successfully!`, 'success');

    addActivity({
      id: `act-${Date.now()}`,
      type: 'alert',
      message: `Admin created new product "${formName}" (${formSku}) in catalog.`,
      relatedTo: newProd.id,
      timestamp: new Date().toISOString(),
    });
  };

  // Submit Update Product
  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingProduct) return;

    updateProduct(editingProduct.id, {
      name: formName,
      sku: formSku,
      categoryId: formCategoryId,
      basePrice: formBasePrice,
      unit: formUnit,
      description: formDescription,
      type: formType,
      isSubscription: formType === 'Subscription',
      status: formStatus,
    });

    setEditingProduct(null);
    showBanner(`Product "${formName}" updated successfully!`, 'success');

    addActivity({
      id: `act-${Date.now()}`,
      type: 'alert',
      message: `Admin updated product details for "${formName}".`,
      relatedTo: editingProduct.id,
      timestamp: new Date().toISOString(),
    });
  };

  // Confirm Delete Product
  const handleConfirmDelete = () => {
    if (!isAdmin || !deletingProduct) return;

    deleteProduct(deletingProduct.id);
    showBanner(`Product "${deletingProduct.name}" deleted from catalog.`, 'info');
    setDeletingProduct(null);

    addActivity({
      id: `act-${Date.now()}`,
      type: 'alert',
      message: `Admin deleted product "${deletingProduct.name}" from catalog.`,
      relatedTo: deletingProduct.id,
      timestamp: new Date().toISOString(),
    });
  };

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton href="/dashboard" label="Dashboard" />
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Product Catalog & Price Lists
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Catalog products, SKUs, category discount ceilings, and list price definitions.
            </p>
          </div>
        </div>

        {/* Action Button: Create Product (Admin Only) */}
        {isAdmin ? (
          <Button
            size="sm"
            variant="primary"
            onClick={handleOpenAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add New Product
          </Button>
        ) : (
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Read-Only Mode (Non-Admin)
          </span>
        )}
      </div>

      {/* RBAC Authorization Notice for Non-Admins */}
      {!isAdmin && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-3 shadow-lg">
          <Lock className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold text-white">Role Authorization Matrix Notice ({currentUser?.role || 'Guest'}):</span>{' '}
            {authCheck.reason} You can browse product catalog items and list prices, but adding, editing, or deleting catalog products is restricted to Platform Admins.
          </div>
        </div>
      )}

      {/* Global Action Banner */}
      {banner && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{banner.message}</span>
          </div>
          <button onClick={() => setBanner(null)} className="text-emerald-400 hover:text-white text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Category Filter Toolbar */}
      <div className="card p-4 bg-[var(--bg-card)] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search product name, SKU, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111827] border border-slate-700/60 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            All Products ({products.length})
          </button>

          {productCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              {cat.name} ({products.filter((p) => p.categoryId === cat.id).length})
            </button>
          ))}
        </div>
      </div>

      {/* Products Table with Admin CRUD Actions */}
      <div className="card p-6 bg-[var(--bg-card)] border border-slate-800 shadow-xl">
        <Table
          data={filteredProducts}
          keyExtractor={(p) => p.id}
          columns={[
            {
              header: 'Product Name & Description',
              cell: (p) => (
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs flex items-center gap-2">
                      <span>{p.name}</span>
                      {p.isSubscription && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Subscription
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 max-w-sm line-clamp-1">{p.description}</div>
                  </div>
                </div>
              ),
            },
            {
              header: 'SKU',
              cell: (p) => <span className="font-mono text-xs font-bold text-slate-300">{p.sku}</span>,
            },
            {
              header: 'Category & Ceiling',
              cell: (p) => {
                const cat = productCategories.find((c) => c.id === p.categoryId);
                return (
                  <div>
                    <span className="font-semibold text-xs text-white">{cat?.name || 'Category'}</span>
                    <div className="text-[10px] text-amber-400 font-medium">Ceiling: {cat?.discountCeiling}%</div>
                  </div>
                );
              },
            },
            {
              header: 'Base List Price',
              cell: (p) => (
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    ${p.basePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <div className="text-[10px] text-slate-400">Per {p.unit || 'unit'}</div>
                </div>
              ),
            },
            {
              header: 'Status',
              cell: (p) => <Badge variant={p.status === 'Active' ? 'success' : 'neutral'}>{p.status}</Badge>,
            },
            {
              header: 'Admin Actions',
              cell: (p) => (
                <div className="flex items-center gap-1.5">
                  {isAdmin ? (
                    <>
                      <button
                        type="button"
                        title="Edit Product"
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold px-2"
                      >
                        <Edit2 className="w-3 h-3 text-indigo-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        title="Delete Product"
                        onClick={() => setDeletingProduct(p)}
                        className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold px-2"
                      >
                        <Trash2 className="w-3 h-3 text-rose-400" />
                        <span>Delete</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-medium italic">Read-Only</span>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* ─── CREATE NEW PRODUCT MODAL (Admin Only) ─── */}
      {isAddModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Catalog Product"
          subtitle="Configure product details, SKU, base pricing, and category ceilings"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. UltraBook Enterprise 15"
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">SKU Number</label>
                <input
                  type="text"
                  required
                  value={formSku}
                  onChange={(e) => setFormSku(e.target.value)}
                  placeholder="HW-PRO-15"
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Category</label>
                <select
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  {productCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Discount Ceiling: {c.discountCeiling}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Base Price ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formBasePrice}
                  onChange={(e) => setFormBasePrice(Number(e.target.value))}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as ProductType)}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Hardware">Hardware (One-time delivery)</option>
                  <option value="Software">Software (License key)</option>
                  <option value="Services">Services (Onsite / Config)</option>
                  <option value="Subscription">Subscription (Care Plan / SLA)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'Active' | 'Inactive')}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Active">Active Catalog</option>
                  <option value="Inactive">Inactive / Legacy</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Specifications</label>
              <textarea
                rows={2}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="High-performance enterprise hardware specification..."
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" leftIcon={<ShieldCheck className="w-4 h-4" />}>
                Create Product
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── EDIT PRODUCT MODAL (Admin Only) ─── */}
      {editingProduct && (
        <Modal
          isOpen={true}
          onClose={() => setEditingProduct(null)}
          title={`Edit Product — ${editingProduct.name}`}
          subtitle={`SKU: ${editingProduct.sku}`}
          maxWidth="lg"
        >
          <form onSubmit={handleUpdateProduct} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">SKU Number</label>
                <input
                  type="text"
                  required
                  value={formSku}
                  onChange={(e) => setFormSku(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Category</label>
                <select
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  {productCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Ceiling: {c.discountCeiling}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Base Price ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formBasePrice}
                  onChange={(e) => setFormBasePrice(Number(e.target.value))}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as ProductType)}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Services">Services</option>
                  <option value="Subscription">Subscription</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'Active' | 'Inactive')}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Active">Active Catalog</option>
                  <option value="Inactive">Inactive / Legacy</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Specifications</label>
              <textarea
                rows={2}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setEditingProduct(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" leftIcon={<ShieldCheck className="w-4 h-4" />}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── DELETE CONFIRMATION MODAL (Admin Only) ─── */}
      {deletingProduct && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingProduct(null)}
          title="Confirm Product Deletion"
          subtitle={`Are you sure you want to remove ${deletingProduct.name}?`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Warning: Permanent Catalog Removal
              </div>
              <p>
                Deleting <strong>{deletingProduct.name}</strong> ({deletingProduct.sku}) will remove it from active quote builder dropdowns.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setDeletingProduct(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmDelete} leftIcon={<Trash2 className="w-4 h-4" />}>
                Confirm Delete Product
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
