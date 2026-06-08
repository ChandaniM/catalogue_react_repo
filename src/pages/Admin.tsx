import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Product, Category } from '../types';
import { fetchProducts, addProduct, updateProduct, deleteProduct, fetchTags, addTag, deleteTag } from '../lib/products';
import { fetchCategories, addCategory, updateCategory, deleteCategory, slugify } from '../services/categories';
import { uploadImage } from '../lib/cloudinary';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import Loading from '../components/Loading';
import {
  LogIn, Store, PlusCircle, Package, Gift, Trash2, Loader2, ImagePlus,
  Pencil, X, Tag, Plus, Lightbulb, FolderPlus, Folder, LayoutGrid,
} from 'lucide-react';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productCostPrice, setProductCostPrice] = useState('');
  const [productSellingPrice, setProductSellingPrice] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [productTags, setProductTags] = useState<string[]>([]);

  const [showInlineCategoryInput, setShowInlineCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryCreating, setCategoryCreating] = useState(false);

  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categoryIsActive, setCategoryIsActive] = useState(true);
  const [categoryCoverImage, setCategoryCoverImage] = useState<File | null>(null);
  const [categoryCoverPreview, setCategoryCoverPreview] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const categoryCoverInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagModal, setShowTagModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, tagsData, categoriesData] = await Promise.all([
        fetchProducts(), fetchTags(), fetchCategories(),
      ]);
      setProducts(productsData);
      setTags(tagsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategoryInline = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setCategoryCreating(true);
    try {
      const newCategory = await addCategory({ name });
      if (newCategory) {
        setCategories((prev) => [...prev, newCategory]);
        setSelectedCategoryId(newCategory.id);
        setNewCategoryName('');
        setShowInlineCategoryInput(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCategoryCreating(false);
    }
  };

  const handleCategoryCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCategoryCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setCategoryCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const resetCategoryForm = () => {
    setCategoryName('');
    setCategorySlug('');
    setCategoryIsActive(true);
    setCategoryCoverImage(null);
    setCategoryCoverPreview('');
    setEditingCategoryId(null);
    if (categoryCoverInputRef.current) categoryCoverInputRef.current.value = '';
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setUploading(true);
    try {
      let coverUrl = categoryCoverPreview;
      if (categoryCoverImage) coverUrl = await uploadImage(categoryCoverImage);

      const payload = {
        name: categoryName.trim(),
        slug: categorySlug.trim() || slugify(categoryName),
        coverImage: coverUrl || undefined,
        isActive: categoryIsActive,
      };

      if (editingCategoryId) {
        const updated = await updateCategory(editingCategoryId, payload);
        if (updated) {
          setCategories((prev) => prev.map((c) => (c.id === editingCategoryId ? updated : c)));
          setMessage({ type: 'success', text: 'Category updated successfully!' });
        }
      } else {
        const created = await addCategory(payload);
        if (created) {
          setCategories((prev) => [...prev, created]);
          setMessage({ type: 'success', text: 'Category created successfully!' });
        }
      }
      resetCategoryForm();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to save category.' });
    } finally {
      setUploading(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
    setCategorySlug(category.slug);
    setCategoryIsActive(category.isActive);
    setCategoryCoverPreview(category.coverImage || '');
    setCategoryCoverImage(null);
    setMessage({ type: '', text: '' });
  };

  const handleDeleteCategory = async (id: string) => {
    const productCount = products.filter((p) => p.categoryId === id).length;
    if (!confirm(`Delete this category? ${productCount} product(s) will be affected.`)) return;

    const success = await deleteCategory(id);
    if (success) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (selectedCategoryId === id) setSelectedCategoryId('');
      if (editingCategoryId === id) resetCategoryForm();
    }
  };

  const handleAddTag = async () => {
    const tagName = newTagInput.trim();
    if (!tagName || tags.includes(tagName)) return;
    const success = await addTag(tagName);
    if (success) { setTags([...tags, tagName]); setNewTagInput(''); }
  };

  const handleDeleteTag = async (tagName: string) => {
    if (confirm(`Delete tag "${tagName}"?`)) {
      const success = await deleteTag(tagName);
      if (success) {
        setTags(tags.filter((t) => t !== tagName));
        setProductTags(productTags.filter((t) => t !== tagName));
      }
    }
  };

  const toggleProductTag = (tagName: string) => {
    setProductTags((prev) => prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]);
  };

  const hashPassword = async (pwd: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pwd);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isSupabaseConfigured() && supabase) {
      const hashedPassword = await hashPassword(password);
      const { data, error: authError } = await supabase.rpc('verify_admin_login', {
        input_email: email, input_password: hashedPassword,
      });
      if (authError || !data) { setError('Invalid credentials'); return; }
      sessionStorage.setItem('adminAuth', 'true');
      setIsAuthenticated(true);
      loadData();
    } else {
      setError('Supabase credentials not configured');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!productName.trim() || !productDescription.trim() || !productCostPrice || !productSellingPrice || !productQuantity) {
      setMessage({ type: 'error', text: 'Please fill out all product information blocks.' });
      return;
    }
    if (!selectedCategoryId) {
      setMessage({ type: 'error', text: 'Please select a category for this product.' });
      return;
    }
    if (!editingId && !productImage) {
      setMessage({ type: 'error', text: 'Please select a photo asset.' });
      return;
    }

    setUploading(true);
    try {
      let finalImageUrl = imagePreview;
      if (productImage) finalImageUrl = await uploadImage(productImage);

      const baseProductData = {
        name: productName,
        description: productDescription,
        image_url: finalImageUrl,
        costPrice: Number(productCostPrice),
        sellingPrice: Number(productSellingPrice),
        quantity: Number(productQuantity),
        tags: productTags,
        categoryId: selectedCategoryId,
      };

      let savedProduct: Product | null = null;
      if (editingId) {
        savedProduct = await updateProduct(editingId, baseProductData);
        if (savedProduct) {
          setProducts((prev) => prev.map((p) => (p.id === editingId ? savedProduct! : p)));
          setMessage({ type: 'success', text: 'Product updated successfully!' });
        }
        setEditingId(null);
      } else {
        savedProduct = await addProduct(baseProductData);
        if (savedProduct) {
          setProducts((prev) => [savedProduct!, ...prev]);
          setMessage({ type: 'success', text: 'Product published successfully!' });
        }
      }

      if (savedProduct && selectedCategoryId) {
        const targetedCategory = categories.find((c) => c.id === selectedCategoryId);
        if (targetedCategory && !targetedCategory.coverImage) {
          const updated = await updateCategory(selectedCategoryId, { coverImage: finalImageUrl });
          if (updated) setCategories((prev) => prev.map((c) => (c.id === selectedCategoryId ? updated : c)));
        }
      }

      setProductName(''); setProductDescription(''); setProductCostPrice('');
      setProductSellingPrice(''); setProductQuantity('');
      setSelectedCategoryId(''); setProductImage(null); setImagePreview(''); setProductTags([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'An unexpected processing error occurred.' });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setProductName(product.name);
    setProductDescription(product.description);
    setProductCostPrice(String(product.costPrice));
    setProductSellingPrice(String(product.sellingPrice));
    setProductQuantity(String(product.quantity));
    setSelectedCategoryId(product.categoryId);
    setImagePreview(product.image_url);
    setProductImage(null);
    setProductTags(product.tags || []);
    setMessage({ type: '', text: '' });
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setProductName(''); setProductDescription(''); setProductCostPrice('');
    setProductSellingPrice(''); setProductQuantity('');
    setSelectedCategoryId(''); setProductImage(null); setImagePreview(''); setProductTags([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const success = await deleteProduct(id);
      if (success) setProducts(products.filter((p) => p.id !== id));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="modal-backdrop min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="bg-white p-10 rounded-3xl w-full max-w-md text-center shadow-2xl">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-normal text-[var(--primary)] tracking-[0.2em] uppercase">Uphar</h1>
            <span className="text-[10px] text-gray-400 block mt-2">Admin Portal</span>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="form-input" required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="form-input" required />
            <button type="submit" className="btn btn-primary w-full mt-3 gap-2"><LogIn size={18} /> Sign In</button>
          </form>
          {error && <p className="mt-5 p-4 bg-red-50 text-red-600 text-sm rounded-xl">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 py-4 bg-gradient-to-r from-[#7a4d6a] to-[#9c6b8a]">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <h1 className="font-display text-lg font-normal text-[#e8c5df] tracking-[0.15em] uppercase">Uphar Admin</h1>
          <Link to="/" className="btn bg-white/20 text-white border-0 hover:bg-white/30 gap-2">
            <Store size={18} /> <span>View Shop</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 py-12 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-6 space-y-10">

          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="mb-6 pb-5 border-b border-gray-100">
              <h2 className="font-display text-xl font-semibold text-[var(--charcoal)] flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[var(--primary-light)] flex items-center justify-center">
                  <LayoutGrid size={20} className="text-[var(--primary)]" />
                </span>
                Category Management
              </h2>
            </div>

            <form onSubmit={handleCategorySubmit} className="mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[var(--accent)]">
                  {editingCategoryId ? 'Edit Category' : 'Create New Category'}
                </h3>
                {editingCategoryId && (
                  <button type="button" onClick={resetCategoryForm} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                    <X size={14} /> Cancel
                  </button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category Name</label>
                  <input type="text" value={categoryName} onChange={(e) => { setCategoryName(e.target.value); if (!editingCategoryId) setCategorySlug(slugify(e.target.value)); }} placeholder="e.g., Keychain" className="form-input bg-white" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Slug</label>
                  <input type="text" value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} placeholder="e.g., keychain" className="form-input bg-white" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Cover Image</label>
                  <div className="file-upload border-2 border-dashed border-gray-200 rounded-xl p-3 text-center cursor-pointer hover:border-[var(--primary)] transition-colors" onClick={() => categoryCoverInputRef.current?.click()}>
                    <input type="file" ref={categoryCoverInputRef} onChange={handleCategoryCoverChange} accept="image/*" className="hidden" />
                    <span className="text-xs text-gray-500">Click to upload cover image</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" id="categoryActive" checked={categoryIsActive} onChange={(e) => setCategoryIsActive(e.target.checked)} className="rounded" />
                  <label htmlFor="categoryActive" className="text-sm text-gray-600">Active (visible on storefront)</label>
                </div>
              </div>
              {categoryCoverPreview && <img src={categoryCoverPreview} alt="Preview" className="max-w-[120px] max-h-[80px] rounded-lg object-cover" />}
              <button type="submit" disabled={uploading} className="btn btn-primary text-sm gap-2">
                {uploading ? <Loader2 size={16} className="animate-spin" /> : editingCategoryId ? <Pencil size={16} /> : <FolderPlus size={16} />}
                {editingCategoryId ? 'Update Category' : 'Create Category'}
              </button>
            </form>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="relative group rounded-2xl border border-gray-100 overflow-hidden bg-gray-50">
                  <div className="aspect-square bg-gray-200">
                    {category.coverImage ? (
                      <img src={category.coverImage} alt={category.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--primary)]"><Folder size={32} /></div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm truncate">{category.name}</h4>
                    <p className="text-[10px] text-gray-400">/{category.slug}</p>
                    {!category.isActive && <span className="text-[10px] text-amber-600">Inactive</span>}
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditCategory(category)} className="p-1.5 rounded bg-white/90 text-amber-600 hover:bg-amber-50 shadow-sm"><Pencil size={12} /></button>
                    <button onClick={() => handleDeleteCategory(category.id)} className="p-1.5 rounded bg-white/90 text-red-600 hover:bg-red-50 shadow-sm"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <div className="mb-8 pb-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-[var(--charcoal)] flex items-center gap-3">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${editingId ? 'bg-amber-100' : 'bg-[var(--primary-light)]'}`}>
                  {editingId ? <Pencil size={20} className="text-amber-600" /> : <PlusCircle size={20} className="text-[var(--primary)]" />}
                </span>
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              {editingId && <button type="button" onClick={cancelEdit} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"><X size={16} /> Cancel</button>}
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--accent)] mb-2 flex items-center gap-1">
                  <Folder size={16} className="text-[var(--primary)]" /> Category <span className="text-red-400">*</span>
                </label>
                {!showInlineCategoryInput ? (
                  <div className="flex gap-2">
                    <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} className="form-input flex-1 bg-white" required>
                      <option value="">Select a category</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button type="button" onClick={() => setShowInlineCategoryInput(true)} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 px-3 flex gap-1 items-center text-xs whitespace-nowrap">
                      <FolderPlus size={16} /> New
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex gap-2">
                      <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g., Keychain" className="form-input flex-1 bg-white" />
                      <button type="button" onClick={handleCreateCategoryInline} disabled={categoryCreating || !newCategoryName.trim()} className="btn btn-primary px-3 text-xs py-2 h-auto">{categoryCreating ? 'Saving...' : 'Save'}</button>
                      <button type="button" onClick={() => { setShowInlineCategoryInput(false); setNewCategoryName(''); }} className="btn bg-white border border-gray-300 text-gray-600 px-2 text-xs">Cancel</button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--accent)] mb-3">Product Name</label>
                <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., Naruto Keychain" className="form-input" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--accent)] mb-3">Description</label>
                <textarea value={productDescription} onChange={(e) => setProductDescription(e.target.value)} placeholder="Describe your product..." rows={3} className="form-input resize-y min-h-[90px]" required />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--accent)] mb-1">Buy Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <input type="number" value={productCostPrice} onChange={(e) => setProductCostPrice(e.target.value)} className="form-input pl-9" min="0" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--accent)] mb-1">Sell Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <input type="number" value={productSellingPrice} onChange={(e) => setProductSellingPrice(e.target.value)} className="form-input pl-9" min="0" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--accent)] mb-1">Quantity</label>
                  <input type="number" value={productQuantity} onChange={(e) => setProductQuantity(e.target.value)} className="form-input" min="0" required />
                </div>
              </div>

              {productCostPrice && productSellingPrice && productQuantity && (
                <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-1"><Lightbulb size={14} /> Profit Forecast</p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-2 bg-amber-50 rounded-lg"><p className="text-[10px] text-gray-500">Investment</p><p className="text-base font-bold text-amber-600">₹{(Number(productCostPrice) * Number(productQuantity)).toLocaleString()}</p></div>
                    <div className="p-2 bg-blue-50 rounded-lg"><p className="text-[10px] text-gray-500">Revenue</p><p className="text-base font-bold text-blue-600">₹{(Number(productSellingPrice) * Number(productQuantity)).toLocaleString()}</p></div>
                    <div className="p-2 bg-green-50 rounded-lg"><p className="text-[10px] text-gray-500">Margins</p><p className="text-base font-bold text-green-600">₹{((Number(productSellingPrice) - Number(productCostPrice)) * Number(productQuantity)).toLocaleString()}</p></div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--accent)] mb-3">Product Image</label>
                <div className="file-upload border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-[var(--primary)] transition-colors" onClick={() => fileInputRef.current?.click()}>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] flex items-center justify-center mb-2 mx-auto"><ImagePlus size={22} className="text-[var(--primary)]" /></div>
                  <span className="text-xs text-gray-500 font-medium block">Click to choose image file</span>
                </div>
                {imagePreview && <div className="mt-4"><img src={imagePreview} alt="Preview" className="max-w-[160px] max-h-[120px] rounded-xl object-cover shadow-sm" /></div>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-[var(--accent)]">Product Tags</label>
                  <button type="button" onClick={() => setShowTagModal(true)} className="text-xs text-[var(--primary)] font-medium flex items-center gap-1"><Tag size={14} /> Manage Tags</button>
                </div>
                <p className="text-[11px] text-gray-400 mb-2">Tags power filtering on category pages (e.g., Anime, Metal, Custom).</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button key={tag} type="button" onClick={() => toggleProductTag(tag)} className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${productTags.includes(tag) ? 'bg-[var(--primary)] text-white' : 'bg-gray-100 text-gray-600'}`}>{tag}</button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={uploading} className="btn btn-primary w-full gap-2">
                {uploading ? <Loader2 size={18} className="animate-spin" /> : editingId ? <Pencil size={18} /> : <Gift size={18} />}
                {editingId ? 'Update Product Details' : 'Publish Product to Catalogue'}
              </button>
              {message.text && <p className={`p-4 text-sm rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message.text}</p>}
            </form>
          </section>

          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="mb-6 pb-5 border-b border-gray-100">
              <h2 className="font-display text-xl font-semibold text-[var(--charcoal)] flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[var(--primary-light)] flex items-center justify-center"><Package size={20} className="text-[var(--primary)]" /></span>
                Stock Catalog Inventory
              </h2>
            </div>
            <div className="max-h-[380px] overflow-auto rounded-xl border border-gray-100">
              {loading ? (
                <div className="py-16"><Loading message="Syncing with database..." /></div>
              ) : products.length === 0 ? (
                <div className="text-center py-16"><p className="text-gray-500">No products found.</p></div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0 text-gray-500 text-left">
                    <tr>
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-2">Category</th>
                      <th className="py-3 px-2">Tags</th>
                      <th className="py-3 px-2 text-right">Stock</th>
                      <th className="py-3 px-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img src={product.image_url} alt="" className="w-10 h-10 object-cover rounded-lg" />
                            <span className="font-medium truncate max-w-[120px] block">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-[10px] text-gray-500">{categories.find((c) => c.id === product.categoryId)?.name || '—'}</td>
                        <td className="py-3 px-2">
                          <div className="flex flex-wrap gap-1">
                            {product.tags?.map((t) => (
                              <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{t}</span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right font-medium">{product.quantity ?? 0}</td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleEdit(product)} className="p-1.5 rounded bg-amber-50 text-amber-600 hover:bg-amber-100"><Pencil size={14} /></button>
                            <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </main>

      {showTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold flex items-center gap-2"><Tag size={18} /> Manage Tags</h3>
              <button onClick={() => setShowTagModal(false)}><X size={18} /></button>
            </div>
            <div className="flex gap-2 mb-4">
              <input type="text" value={newTagInput} onChange={(e) => setNewTagInput(e.target.value)} placeholder="e.g., Anime, Metal..." className="form-input flex-1" />
              <button type="button" onClick={handleAddTag} className="btn btn-primary"><Plus size={16} /> Add</button>
            </div>
            <div className="max-h-48 overflow-auto space-y-1.5">
              {tags.map((t) => (
                <div key={t} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm">{t}</span>
                  <button onClick={() => handleDeleteTag(t)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Admin;
