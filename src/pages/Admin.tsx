import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { fetchProducts, addProduct, updateProduct, deleteProduct, fetchTags, addTag, deleteTag } from '../lib/products';
import { uploadImage } from '../lib/cloudinary';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import Loading from '../components/Loading';
import {
  LogIn,
  Store,
  PlusCircle,
  Package,
  Gift,
  Trash2,
  Loader2,
  ImagePlus,
  TrendingUp,
  ShoppingBag,
  Pencil,
  X,
  Tag,
  Plus,
  Lightbulb,
} from 'lucide-react';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productCostPrice, setProductCostPrice] = useState('');
  const [productSellingPrice, setProductSellingPrice] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [productTags, setProductTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagModal, setShowTagModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadProducts();
      loadTags();
    }
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const data = await fetchTags();
      setTags(data);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleAddTag = async () => {
    const tagName = newTagInput.trim();
    if (!tagName) return;
    if (tags.includes(tagName)) {
      setMessage({ type: 'error', text: 'Tag already exists' });
      return;
    }
    const success = await addTag(tagName);
    if (success) {
      setTags([...tags, tagName]);
      setNewTagInput('');
    }
  };

  const handleDeleteTag = async (tagName: string) => {
    if (confirm(`Delete tag "${tagName}"?`)) {
      const success = await deleteTag(tagName);
      if (success) {
        setTags(tags.filter(t => t !== tagName));
        setProductTags(productTags.filter(t => t !== tagName));
      }
    }
  };

  const toggleProductTag = (tagName: string) => {
    setProductTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Verify credentials using secure RPC function
    if (isSupabaseConfigured() && supabase) {
      const { data, error: authError } = await supabase
        .rpc('verify_admin_login', {
          input_email: email,
          input_password: password
        });

      if (authError || !data) {
        setError('Invalid credentials');
        return;
      }

      sessionStorage.setItem('adminAuth', 'true');
      setIsAuthenticated(true);
      loadProducts();
    } else {
      // Fallback for local development without Supabase
      setError('Supabase not configured');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !productDescription || !productCostPrice || !productSellingPrice || !productQuantity) {
      setMessage({ type: 'error', text: 'Please fill all fields' });
      return;
    }
    if (!editingId && !productImage) {
      setMessage({ type: 'error', text: 'Please select an image' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      // Upload image if new file selected
      let finalImageUrl = imagePreview;
      if (productImage) {
        finalImageUrl = await uploadImage(productImage);
      }

      if (editingId) {
        // Update existing product
        const updated = await updateProduct(editingId, {
          name: productName,
          description: productDescription,
          image_url: finalImageUrl,
          costPrice: Number(productCostPrice),
          sellingPrice: Number(productSellingPrice),
          quantity: Number(productQuantity),
          tags: productTags,
        });
        
        if (updated) {
          setProducts(products.map(p => p.id === editingId ? updated : p));
          setMessage({ type: 'success', text: 'Product updated successfully!' });
        } else {
          setMessage({ type: 'error', text: 'Failed to update product' });
        }
        setEditingId(null);
      } else {
        // Add new product
        const newProduct = await addProduct({
          name: productName,
          description: productDescription,
          image_url: finalImageUrl,
          costPrice: Number(productCostPrice),
          sellingPrice: Number(productSellingPrice),
          quantity: Number(productQuantity),
          tags: productTags,
        });

        if (newProduct) {
          setProducts([newProduct, ...products]);
          setMessage({ type: 'success', text: 'Product added successfully!' });
        } else {
          setMessage({ type: 'error', text: 'Failed to add product. Please try again.' });
        }
      }

      // Reset form
      setProductName('');
      setProductDescription('');
      setProductCostPrice('');
      setProductSellingPrice('');
      setProductQuantity('');
      setProductImage(null);
      setImagePreview('');
      setProductTags([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
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
    setImagePreview(product.image_url);
    setProductImage(null);
    setProductTags(product.tags || []);
    setMessage({ type: '', text: '' });
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setProductName('');
    setProductDescription('');
    setProductCostPrice('');
    setProductSellingPrice('');
    setProductQuantity('');
    setProductImage(null);
    setImagePreview('');
    setProductTags([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const success = await deleteProduct(id);
      if (success) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        setMessage({ type: 'error', text: 'Failed to delete product.' });
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="modal-backdrop min-h-screen flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl w-full max-w-md text-center shadow-2xl">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full border-2 border-[var(--primary)] flex items-center justify-center mx-auto mb-3">
              <span className="font-display text-3xl text-[var(--primary)]">U</span>
            </div>
            <h1 className="font-display text-2xl font-normal text-[var(--primary)] tracking-[0.2em] uppercase">Uphar</h1>
            <span className="text-[10px] text-[var(--accent-light)] uppercase tracking-[0.25em] font-normal block mt-1">
              The Gift Shop
            </span>
            <span className="text-[10px] text-gray-400 block mt-2">Admin Portal</span>
          </div>
          <p className="text-sm text-gray-500 mb-8">Sign in to manage your catalogue</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="form-input"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="form-input"
              required
            />
            <button type="submit" className="btn btn-primary w-full mt-3 gap-2">
              <LogIn size={18} strokeWidth={2.5} /> Sign In
            </button>
          </form>

          {error && (
            <p className="mt-5 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 py-4" style={{ background: 'linear-gradient(135deg, #7a4d6a 0%, #9c6b8a 100%)' }}>
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-[#e8c5df] flex items-center justify-center">
              <span className="font-display text-lg text-[#e8c5df]">U</span>
            </div>
            <div className="flex flex-col">
              <h1 className="font-display text-lg font-normal text-[#e8c5df] tracking-[0.15em] uppercase leading-tight">Uphar</h1>
              <span className="text-[8px] text-[#d4a5c9] uppercase tracking-[0.2em] font-normal">
                Admin Panel
              </span>
            </div>
          </div>
          <Link target='_blank' to="/" className="btn bg-white/20 text-white border-0 hover:bg-white/30 gap-2 whitespace-nowrap flex-shrink-0">
            <Store size={18} strokeWidth={2} />
            <span>View Shop</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-6 space-y-10">
          {/* Upload Form */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
              <div className="mb-8 pb-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-[var(--charcoal)] flex items-center gap-3">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${editingId ? 'bg-amber-100' : 'bg-[var(--primary-light)]'}`}>
                    {editingId ? <Pencil size={20} className="text-amber-600" strokeWidth={2} /> : <PlusCircle size={20} className="text-[var(--primary)]" strokeWidth={2} />}
                  </span>
                  {editingId ? 'Edit Product' : 'Add New Product'}
                </h2>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <X size={16} /> Cancel
                  </button>
                )}
              </div>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--accent)] mb-3">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g., Handcrafted Candle Set"
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--accent)] mb-3">
                    Description
                  </label>
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Describe your product beautifully..."
                    rows={3}
                    className="form-input resize-y min-h-[90px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--accent)] mb-1">
                      Buy Price
                    </label>
                    <span className="block text-[10px] text-gray-400 mb-2">You paid per piece</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                      <input
                        type="number"
                        value={productCostPrice}
                        onChange={(e) => setProductCostPrice(e.target.value)}
                        placeholder="100"
                        className="form-input pl-9"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--accent)] mb-1">
                      Sell Price
                    </label>
                    <span className="block text-[10px] text-gray-400 mb-2">You'll sell per piece</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                      <input
                        type="number"
                        value={productSellingPrice}
                        onChange={(e) => setProductSellingPrice(e.target.value)}
                        placeholder="150"
                        className="form-input pl-9"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--accent)] mb-1">
                      Quantity
                    </label>
                    <span className="block text-[10px] text-gray-400 mb-2">How many pieces</span>
                    <input
                      type="number"
                      value={productQuantity}
                      onChange={(e) => setProductQuantity(e.target.value)}
                      placeholder="300"
                      className="form-input"
                      min="1"
                      required
                    />
                  </div>
                </div>

                {/* Live Calculation Preview */}
                {productCostPrice && productSellingPrice && productQuantity && (
                  <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-3 font-medium flex items-center gap-1"><Lightbulb size={14} /> Quick Summary</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-[10px] text-gray-500 mb-1">You'll Pay</p>
                        <p className="text-lg font-bold text-amber-600">
                          ₹{(Number(productCostPrice) * Number(productQuantity)).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">Total investment</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-[10px] text-gray-500 mb-1">You'll Get</p>
                        <p className="text-lg font-bold text-blue-600">
                          ₹{(Number(productSellingPrice) * Number(productQuantity)).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">If sold all</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-[10px] text-gray-500 mb-1">Your Profit</p>
                        <p className="text-lg font-bold text-green-600">
                          ₹{((Number(productSellingPrice) - Number(productCostPrice)) * Number(productQuantity)).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          ₹{(Number(productSellingPrice) - Number(productCostPrice)).toLocaleString()}/piece
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[var(--accent)] mb-3">
                    Product Image
                  </label>
                  <div 
                    className="file-upload group" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                      required={!imagePreview}
                    />
                    <div className="w-14 h-14 rounded-2xl bg-[var(--primary-light)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <ImagePlus size={26} className="text-[var(--primary)]" strokeWidth={1.5} />
                    </div>
                    <span className="text-sm text-gray-500 font-medium">Drop image or click to upload</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                  </div>
                  {imagePreview && (
                    <div className="mt-5 relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-[200px] max-h-[150px] rounded-2xl object-cover shadow-md"
                      />
                    </div>
                  )}
                </div>

                {/* Tags Selection */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-[var(--accent)]">
                      Category Tags
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowTagModal(true)}
                      className="text-xs text-[var(--primary)] hover:text-[var(--accent)] font-medium flex items-center gap-1"
                    >
                      <Tag size={14} /> Manage Tags
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleProductTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                          productTags.includes(tag)
                            ? 'bg-[var(--primary)] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                    {tags.length === 0 && (
                      <button
                        type="button"
                        onClick={() => setShowTagModal(true)}
                        className="text-sm text-[var(--primary)] hover:underline"
                      >
                        + Create your first tag
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="btn btn-primary w-full gap-2 mt-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {editingId ? 'Updating...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      {editingId ? <Pencil size={18} strokeWidth={2} /> : <Gift size={18} strokeWidth={2} />}
                      {editingId ? 'Update Product' : 'Add Product'}
                    </>
                  )}
                </button>

                {message.text && (
                  <p
                    className={`mt-5 p-4 text-sm rounded-xl flex items-center gap-2 ${
                      message.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {message.text}
                  </p>
                )}
              </form>
            </section>

            {/* Products List */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="mb-6 pb-5 border-b border-gray-100">
                <h2 className="font-display text-xl font-semibold text-[var(--charcoal)] flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[var(--primary-light)] flex items-center justify-center">
                    <Package size={20} className="text-[var(--primary)]" strokeWidth={2} />
                  </span>
                  Your Products
                </h2>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="bg-gradient-to-br from-[var(--primary-light)] to-white p-4 rounded-xl border border-[var(--primary-light)]">
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingBag size={16} className="text-[var(--primary)]" />
                    <span className="text-xs text-gray-500">Total Items</span>
                  </div>
                  <p className="text-2xl font-bold text-[var(--primary)]">{products.reduce((sum, p) => sum + (p.quantity || 0), 0)}</p>
                  <p className="text-[10px] text-gray-400 mt-1">All products combined</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-white p-4 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-amber-600 font-medium">₹</span>
                    <span className="text-xs text-gray-500">You Paid</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">₹{products.reduce((sum, p) => sum + (p.costPrice * (p.quantity || 0)), 0).toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Total buying cost</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={16} className="text-blue-600" />
                    <span className="text-xs text-gray-500">You'll Get</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">₹{products.reduce((sum, p) => sum + (p.sellingPrice * (p.quantity || 0)), 0).toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 mt-1">If you sell everything</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border border-green-100">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={16} className="text-green-600" />
                    <span className="text-xs text-gray-500">Your Profit</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">₹{products.reduce((sum, p) => sum + ((p.sellingPrice - p.costPrice) * (p.quantity || 0)), 0).toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Money you earn</p>
                </div>
              </div>

              {/* Products Table */}
              <div className="max-h-[380px] overflow-auto rounded-xl border border-gray-100">
                {loading ? (
                  <div className="py-16">
                    <Loading message="Loading products..." />
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Gift size={28} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No products yet</p>
                    <p className="text-gray-400 text-sm mt-1">Add your first gift to get started!</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Product</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-500">
                          <span className="block">Qty</span>
                          <span className="text-[10px] font-normal text-gray-400">pieces</span>
                        </th>
                        <th className="text-right py-3 px-2 font-medium text-gray-500">
                          <span className="block">Buy Price</span>
                          <span className="text-[10px] font-normal text-gray-400">per piece</span>
                        </th>
                        <th className="text-right py-3 px-2 font-medium text-gray-500">
                          <span className="block">Sell Price</span>
                          <span className="text-[10px] font-normal text-gray-400">per piece</span>
                        </th>
                        <th className="text-right py-3 px-2 font-medium text-gray-500">
                          <span className="block">You Paid</span>
                          <span className="text-[10px] font-normal text-gray-400">total cost</span>
                        </th>
                        <th className="text-right py-3 px-2 font-medium text-gray-500">
                          <span className="block">Profit</span>
                          <span className="text-[10px] font-normal text-gray-400">you earn</span>
                        </th>
                        <th className="py-3 px-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.map((product) => {
                        const profitPerUnit = product.sellingPrice - product.costPrice;
                        const totalInvestment = product.costPrice * (product.quantity || 0);
                        const totalProfit = profitPerUnit * (product.quantity || 0);
                        return (
                          <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-11 h-11 object-cover rounded-lg shadow-sm flex-shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="font-medium text-[var(--charcoal)] truncate max-w-[120px]">{product.name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="text-right py-3 px-2 text-gray-600 font-medium">{product.quantity}</td>
                            <td className="text-right py-3 px-2 text-gray-500">₹{product.costPrice}</td>
                            <td className="text-right py-3 px-2 text-gray-600">₹{product.sellingPrice}</td>
                            <td className="text-right py-3 px-2 font-medium text-amber-600">₹{totalInvestment.toLocaleString()}</td>
                            <td className="text-right py-3 px-2">
                              <span className="inline-flex items-center text-green-600 font-semibold">
                                ₹{totalProfit.toLocaleString()}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEdit(product)}
                                  className="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-500 hover:text-amber-600 flex items-center justify-center transition-colors"
                                  title="Edit product"
                                >
                                  <Pencil size={15} strokeWidth={2} />
                                </button>
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 flex items-center justify-center transition-colors"
                                  title="Delete product"
                                >
                                  <Trash2 size={15} strokeWidth={2} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
        </div>
      </main>

      {/* Tag Management Modal */}
      {showTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowTagModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-semibold text-[var(--charcoal)] flex items-center gap-2">
                <Tag size={20} className="text-[var(--primary)]" />
                Manage Tags
              </h3>
              <button
                onClick={() => setShowTagModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Add New Tag */}
            <div className="flex gap-2 mb-5">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="New tag name..."
                className="form-input flex-1"
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!newTagInput.trim()}
                className="btn btn-primary gap-2 px-4"
              >
                <Plus size={18} /> Add
              </button>
            </div>

            {/* Existing Tags */}
            <div className="max-h-60 overflow-auto">
              {tags.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No tags yet. Create your first tag above!</p>
              ) : (
                <div className="space-y-2">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700">{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTag(tag)}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors border border-gray-200 hover:border-red-200"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowTagModal(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 w-full"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Admin;
