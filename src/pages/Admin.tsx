import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faGift, faHeart, faCakeCandles, faRing, faBaby, faBriefcase, faStar, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import type { Product, Category, Slide, Occasion } from '../types';
import { fetchProducts, addProduct, updateProduct, deleteProduct, fetchTags, addTag, deleteTag } from '../lib/products';
import { fetchCategories, addCategory, updateCategory, deleteCategory, slugify } from '../services/categories';
import { fetchOccasions, saveOccasions } from '../services/occasions';
import { fetchSlides, saveSlides } from '../lib/slides';
import { uploadImage } from '../lib/cloudinary';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import Loading from '../components/Loading';
import {
  LogIn, Store, PlusCircle, Package, Gift, Trash2, Loader2, ImagePlus,
  Pencil, X, Tag, Plus, Lightbulb, FolderPlus, Folder, LayoutGrid,
  BarChart2, ChevronRight, AlertTriangle, Wallet,
} from 'lucide-react';

type ActiveView = 'products' | 'categories' | 'tags' | 'occasions' | 'sales' | 'analytics' | 'slides';

type SaleRecord = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  amount: number;
  paymentMethod: string;
  customerName: string;
  status: 'Paid' | 'Pending' | 'Cancelled';
  notes: string;
  createdAt: string;
  // whether this sale has been applied to inventory (true when status was Paid and we adjusted stock)
  appliedInventory?: boolean;
};

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('products');

  // Product drawer state
  const [showProductDrawer, setShowProductDrawer] = useState(false);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productCostPrice, setProductCostPrice] = useState('');
  const [productSellingPrice, setProductSellingPrice] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [productTags, setProductTags] = useState<string[]>([]);
  const [productOccasion, setProductOccasion] = useState('');
  const [productIsNewArrival, setProductIsNewArrival] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Homepage slides
  const [slides, setSlides] = useState<Slide[]>([]);
  const [showSlideEditor, setShowSlideEditor] = useState(false);
  const [slideTitle, setSlideTitle] = useState('');
  const [slideSubtitle, setSlideSubtitle] = useState('');
  const [slideButtonText, setSlideButtonText] = useState('');
  const [slideButtonUrl, setSlideButtonUrl] = useState('');
  const [slideButton2Text, setSlideButton2Text] = useState('');
  const [slideButton2Url, setSlideButton2Url] = useState('');
  const [slideImageUrl, setSlideImageUrl] = useState('');
  const [slideImageFile, setSlideImageFile] = useState<File | null>(null);
  const [slideImagePreview, setSlideImagePreview] = useState('');
  const [slideImageMode, setSlideImageMode] = useState<'url' | 'upload'>('url');
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);

  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [saleProductId, setSaleProductId] = useState('');
  const [saleQuantity, setSaleQuantity] = useState('1');
  const [salePaymentMethod, setSalePaymentMethod] = useState('Cash');
  const [saleCustomerName, setSaleCustomerName] = useState('');
  const [saleNotes, setSaleNotes] = useState('');
  const [saleStatus, setSaleStatus] = useState<'Paid' | 'Pending' | 'Cancelled'>('Paid');
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);

  // Category modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categoryIsActive, setCategoryIsActive] = useState(true);
  const [categoryCoverImage, setCategoryCoverImage] = useState<File | null>(null);
  const [categoryCoverPreview, setCategoryCoverPreview] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const categoryCoverInputRef = useRef<HTMLInputElement>(null);

  // Inline category quick-add inside product drawer
  const [showInlineCategoryInput, setShowInlineCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryCreating, setCategoryCreating] = useState(false);

  // Tags modal
  const [showTagModal, setShowTagModal] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  // Occasion management
  const [showOccasionModal, setShowOccasionModal] = useState(false);
  const [occasionName, setOccasionName] = useState('');
  const [occasionKey, setOccasionKey] = useState('');
  const [occasionIcon, setOccasionIcon] = useState('');
  const [occasionIconMode, setOccasionIconMode] = useState<'emoji' | 'upload' | 'fontawesome'>('emoji');

  // Delete confirm modal
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'product' | 'category' | 'tag' | 'occasion' | 'slide' | 'sale'; id: string; name: string } | null>(null);

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  // Close drawer/modal on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowProductDrawer(false);
        setShowCategoryModal(false);
        setShowTagModal(false);
        setShowOccasionModal(false);
        setDeleteConfirm(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, tagsData, categoriesData, occasionData, slidesData] = await Promise.all([
        fetchProducts(), fetchTags(), fetchCategories(), fetchOccasions(), fetchSlides(),
      ]);
      setProducts(productsData);
      setTags(tagsData);
      setCategories(categoriesData);
      setOccasions(occasionData);
      setSlides(slidesData);
      const storedSalesRaw = JSON.parse(localStorage.getItem('uphar_sales') || '[]');
      const storedSales = (storedSalesRaw as SaleRecord[]).map((s) => ({ appliedInventory: false, ...s }));
      setSales(storedSales);
    } catch (err) {
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Product helpers ──────────────────────────────────────────────────────
  const openAddProduct = () => {
    cancelEdit();
    setShowProductDrawer(true);
    setActiveView('products');
  };

  const openEditProduct = (product: Product) => {
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
    setProductOccasion(product.occasion || '');
    setProductIsNewArrival(product.isNewArrival ?? false);
    setMessage({ type: '', text: '' });
    setShowProductDrawer(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setProductName(''); setProductDescription(''); setProductCostPrice('');
    setProductSellingPrice(''); setProductQuantity('');
    setSelectedCategoryId(''); setProductImage(null); setImagePreview(''); setProductTags([]);
    setProductOccasion('');
    setProductIsNewArrival(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setMessage({ type: '', text: '' });
    setShowInlineCategoryInput(false);
    setNewCategoryName('');
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

  const toggleProductTag = (tagName: string) => {
    setProductTags((prev) => prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]);
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
        occasion: productOccasion || undefined,
        isNewArrival: productIsNewArrival,
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

      cancelEdit();
      setTimeout(() => setShowProductDrawer(false), 1200);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'An unexpected processing error occurred.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteProduct(id);
    if (success) setProducts(products.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  };

  const saveSalesRecords = (nextSales: SaleRecord[]) => {
    setSales(nextSales);
    localStorage.setItem('uphar_sales', JSON.stringify(nextSales));
  };

  const resetSaleForm = () => {
    setEditingSaleId(null);
    setSaleProductId('');
    setSaleQuantity('1');
    setSalePaymentMethod('Cash');
    setSaleCustomerName('');
    setSaleNotes('');
    setSaleStatus('Paid');
  };

  /**
   * Applies a NET inventory change to a single product in one write.
   * stockDelta / soldDelta are the total (already-combined) amounts to add
   * to the product's current quantity / soldQuantity. Callers must compute
   * the net delta up front (e.g. "undo old sale" + "apply new sale" combined
   * into one number) rather than issuing separate revert/apply calls that
   * each re-read product state — two sequential calls based on the same
   * stale `products` snapshot will clobber each other.
   */
  const applyInventoryDelta = async (
    productId: string,
    stockDelta: number,
    soldDelta: number
  ) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return null;

    const updatedProduct = await updateProduct(productId, {
      quantity: Math.max(0, (product.quantity ?? 0) + stockDelta),
      soldQuantity: Math.max(0, (product.soldQuantity ?? 0) + soldDelta),
    });

    if (updatedProduct) {
      setProducts((prev) => prev.map((item) => (item.id === productId ? updatedProduct : item)));
    }

    return updatedProduct;
  };

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProduct = products.find((product) => product.id === saleProductId);
    const quantity = Number(saleQuantity);

    if (!selectedProduct) {
      setMessage({ type: 'error', text: 'Please select a product.' });
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid quantity.' });
      return;
    }

    try {
      if (editingSaleId) {
        const originalSale = sales.find((sale) => sale.id === editingSaleId);
        if (!originalSale) {
          setMessage({ type: 'error', text: 'The original sale record could not be found.' });
          return;
        }

        const newApplied = saleStatus === 'Paid';
        const sameProduct = originalSale.productId === selectedProduct.id;

        if (sameProduct) {
          // Same product: fold "undo old effect" + "apply new effect" into a
          // single net delta, computed once from current state, and issue
          // exactly one write. This avoids the stale-read clobbering bug.
          const undoStockDelta = originalSale.appliedInventory ? originalSale.quantity : 0; // give back old qty
          const undoSoldDelta = originalSale.appliedInventory ? -originalSale.quantity : 0;
          const redoStockDelta = newApplied ? -quantity : 0; // take new qty
          const redoSoldDelta = newApplied ? quantity : 0;

          const netStockDelta = undoStockDelta + redoStockDelta;
          const netSoldDelta = undoSoldDelta + redoSoldDelta;

          // Stock check: how much would actually be available once the old
          // sale's effect is undone.
          const availableIfReverted = (selectedProduct.quantity ?? 0) + undoStockDelta;
          if (newApplied && availableIfReverted < quantity) {
            setMessage({ type: 'error', text: `Only ${availableIfReverted} units left for ${selectedProduct.name}.` });
            return;
          }

          const updatedProduct = await applyInventoryDelta(selectedProduct.id, netStockDelta, netSoldDelta);
          if (!updatedProduct) {
            setMessage({ type: 'error', text: 'Could not save the sale update. Please try again.' });
            return;
          }
        } else {
          // Different product: these are two independent products, so a
          // separate revert-write and apply-write is safe (no shared stale
          // state between them).
          if (originalSale.appliedInventory) {
            await applyInventoryDelta(originalSale.productId, originalSale.quantity, -originalSale.quantity);
          }

          if (newApplied) {
            if ((selectedProduct.quantity ?? 0) < quantity) {
              setMessage({ type: 'error', text: `Only ${selectedProduct.quantity ?? 0} units left for ${selectedProduct.name}.` });
              return;
            }
            const updatedNewProduct = await applyInventoryDelta(selectedProduct.id, -quantity, quantity);
            if (!updatedNewProduct) {
              setMessage({ type: 'error', text: 'Could not save the sale update. Please try again.' });
              return;
            }
          }
        }

        const updatedSales = sales.map((sale) =>
          sale.id === editingSaleId
            ? {
                ...sale,
                productId: selectedProduct.id,
                productName: selectedProduct.name,
                quantity,
                amount: quantity * (selectedProduct.sellingPrice ?? 0),
                paymentMethod: salePaymentMethod,
                customerName: saleCustomerName.trim() || 'Walk-in customer',
                status: saleStatus,
                notes: saleNotes.trim(),
                appliedInventory: newApplied,
              }
            : sale
        );

        saveSalesRecords(updatedSales);
        resetSaleForm();
        setMessage({ type: 'success', text: `Sale updated for ${selectedProduct.name}.` });
        return;
      }

      const newApplied = saleStatus === 'Paid';
      if (newApplied && (selectedProduct.quantity ?? 0) < quantity) {
        setMessage({ type: 'error', text: `Only ${selectedProduct.quantity ?? 0} units left for ${selectedProduct.name}.` });
        return;
      }

      const updatedProduct = await applyInventoryDelta(
        selectedProduct.id,
        newApplied ? -quantity : 0,
        newApplied ? quantity : 0
      );
      if (!updatedProduct) {
        setMessage({ type: 'error', text: 'Could not save the sale. Please try again.' });
        return;
      }

      const nextSale: SaleRecord = {
        id: String(Date.now()),
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity,
        amount: quantity * (selectedProduct.sellingPrice ?? 0),
        paymentMethod: salePaymentMethod,
        customerName: saleCustomerName.trim() || 'Walk-in customer',
        status: saleStatus,
        notes: saleNotes.trim(),
        createdAt: new Date().toISOString(),
        appliedInventory: newApplied,
      };

      const nextSales = [nextSale, ...sales];
      saveSalesRecords(nextSales);
      resetSaleForm();
      setMessage({ type: 'success', text: `${quantity} unit(s) of ${selectedProduct.name} recorded as sold.` });
    } catch (error) {
      console.error('Failed to record sale:', error);
      setMessage({ type: 'error', text: 'The sale could not be saved.' });
    }
  };

  const handleDeleteSale = async (id: string) => {
    const saleToDelete = sales.find((sale) => sale.id === id);
    if (!saleToDelete) {
      setDeleteConfirm(null);
      return;
    }

    if (saleToDelete.appliedInventory) {
      await applyInventoryDelta(saleToDelete.productId, saleToDelete.quantity, -saleToDelete.quantity);
    }

    const nextSales = sales.filter((sale) => sale.id !== id);
    saveSalesRecords(nextSales);
    setDeleteConfirm(null);
  };

  // ── Category helpers ─────────────────────────────────────────────────────
  const openAddCategory = () => {
    resetCategoryForm();
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
    setCategorySlug(category.slug);
    setCategoryIsActive(category.isActive);
    setCategoryCoverPreview(category.coverImage || '');
    setCategoryCoverImage(null);
    setMessage({ type: '', text: '' });
    setShowCategoryModal(true);
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

  const handleCategoryCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCategoryCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setCategoryCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
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
          setMessage({ type: 'success', text: 'Category updated!' });
        }
      } else {
        const created = await addCategory(payload);
        if (created) {
          setCategories((prev) => [...prev, created]);
          setMessage({ type: 'success', text: 'Category created!' });
        }
      }
      resetCategoryForm();
      setTimeout(() => setShowCategoryModal(false), 1000);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to save category.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const success = await deleteCategory(id);
    if (success) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (selectedCategoryId === id) setSelectedCategoryId('');
    }
    setDeleteConfirm(null);
  };

  // ── Inline category quick-add (inside product drawer) ───────────────────
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

  // ── Tag helpers ──────────────────────────────────────────────────────────
  const handleAddTag = async () => {
    const tagName = newTagInput.trim();
    if (!tagName || tags.includes(tagName)) return;
    const success = await addTag(tagName);
    if (success) { setTags([...tags, tagName]); setNewTagInput(''); }
  };

  const handleDeleteTag = async (tagName: string) => {
    const success = await deleteTag(tagName);
    if (success) {
      setTags(tags.filter((t) => t !== tagName));
      setProductTags(productTags.filter((t) => t !== tagName));
    }
    setDeleteConfirm(null);
  };

  // ── Occasion helpers ─────────────────────────────────────────────────────
  const createOccasionSlug = (value: string) => value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  const iconNameMap: Record<string, any> = {
    whatsapp: faWhatsapp,
    instagram: faInstagram,
    gift: faGift,
    heart: faHeart,
    sparkle: faStar,
    sparkles: faStar,
    cake: faCakeCandles,
    ring: faRing,
    baby: faBaby,
    briefcase: faBriefcase,
    star: faStar,
    email: faEnvelope,
  };

  const normalizeOccasionIcon = (value: string) => value.trim();

  const renderOccasionIconPreview = (iconValue: string, sizeClass = 'text-xl') => {
    const normalized = normalizeOccasionIcon(iconValue);
    if (!normalized) return <span className="text-gray-400">🎁</span>;
    if (normalized.startsWith('http') || normalized.startsWith('data:image')) {
      return <img src={normalized} alt="occasion icon" className="h-7 w-7 object-cover rounded-md" />;
    }
    const key = normalized.toLowerCase().replace(/^fa-/, '').replace('fa-brands ', '').replace('fa-solid ', '').replace(/[^a-z0-9]/g, '');
    const icon = iconNameMap[key] || iconNameMap.gift;
    if (normalized.includes('fa-') || iconNameMap[key]) {
      return <FontAwesomeIcon icon={icon} className={sizeClass} />;
    }
    if (/^[\p{Extended_Pictographic}]$/u.test(normalized) || normalized.length <= 2) {
      return <span className={sizeClass}>{normalized}</span>;
    }
    return <FontAwesomeIcon icon={faGift} className={sizeClass} />;
  };

  const openAddOccasion = () => {
    setOccasionName('');
    setOccasionKey('');
    setOccasionIcon('');
    setOccasionIconMode('emoji');
    setShowOccasionModal(true);
    setActiveView('occasions');
  };

  const handleOccasionIconFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setOccasionIcon(String(reader.result || ''));
      setOccasionIconMode('upload');
    };
    reader.readAsDataURL(file);
  };

  const handleAddOccasion = () => {
    const label = occasionName.trim();
    if (!label) {
      setMessage({ type: 'error', text: 'Please enter an occasion name.' });
      return;
    }

    const key = (occasionKey.trim() || createOccasionSlug(label)).toLowerCase();
    if (occasions.some((item) => item.key === key)) {
      setMessage({ type: 'error', text: 'This occasion already exists.' });
      return;
    }

    const iconValue = occasionIconMode === 'upload' && !occasionIcon ? '' : normalizeOccasionIcon(occasionIcon);
    const nextOccasions = [...occasions, { key, label, icon: iconValue || undefined }];
    setOccasions(nextOccasions);
    saveOccasions(nextOccasions);
    setMessage({ type: 'success', text: 'Occasion added to storefront.' });
    setShowOccasionModal(false);
    setOccasionName('');
    setOccasionKey('');
    setOccasionIcon('');
    setOccasionIconMode('emoji');
  };

  const handleDeleteOccasion = (key: string) => {
    const nextOccasions = occasions.filter((item) => item.key !== key);
    setOccasions(nextOccasions);
    saveOccasions(nextOccasions);
    setDeleteConfirm(null);
  };

  // ── Slide helpers ────────────────────────────────────────────────────────
  const handleSlideImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSlideImageFile(file);
    setSlideImageMode('upload');
    setSlideImageUrl('');

    const reader = new FileReader();
    reader.onloadend = () => setSlideImagePreview(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const openAddSlide = () => {
    setEditingSlideId(null);
    setSlideTitle('');
    setSlideSubtitle('');
    setSlideButtonText('');
    setSlideImageUrl('');
    setSlideImageFile(null);
    setSlideImagePreview('');
    setSlideImageMode('url');
    setShowSlideEditor(true);
    setActiveView('slides');
  };

  const openEditSlide = (slide: Slide) => {
    setEditingSlideId(slide.id);
    setSlideTitle(slide.title);
    setSlideSubtitle(slide.subtitle);
    setSlideButtonText(slide.button || ' ');
    setSlideButtonUrl(slide.buttonUrl || ' ');
    setSlideButton2Text(slide.button2 || ' ');
    setSlideButton2Url(slide.button2Url || ' ');
    setSlideImageUrl(slide.image);
    setSlideImageFile(null);
    setSlideImagePreview(slide.image);
    setSlideImageMode(slide.image ? 'url' : 'upload');
    setShowSlideEditor(true);
    setActiveView('slides');
  };

  const cancelSlideEditor = () => {
    setEditingSlideId(null);
    setSlideTitle('');
    setSlideSubtitle('');
    setSlideButtonText('');
    setSlideImageUrl('');
    setSlideImageFile(null);
    setSlideImagePreview('');
    setSlideImageMode('url');
    setMessage({ type: '', text: '' });
    setShowSlideEditor(false);
  };

  const handleSlideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideTitle.trim() || !slideSubtitle.trim()) {
      setMessage({ type: 'error', text: 'Please complete the slide title and subtitle.' });
      return;
    }

    const hasImageSource = slideImageUrl.trim() || slideImagePreview || slideImageFile;
    if (!hasImageSource) {
      setMessage({ type: 'error', text: 'Please add a slide image or upload one.' });
      return;
    }

    try {
      let finalImageUrl = slideImageUrl.trim() || slideImagePreview;
      if (slideImageFile) {
        finalImageUrl = await uploadImage(slideImageFile);
      }

      const slidePayload: Slide = {
        id: editingSlideId || String(Date.now()),
        title: slideTitle.trim(),
        subtitle: slideSubtitle.trim(),
        button: slideButtonText.trim(),
        buttonUrl: slideButtonUrl.trim() || '/shop',
        button2: slideButton2Text.trim(),
        button2Url: slideButton2Url.trim() || '/shop',
        image: finalImageUrl,
      };

      const updatedSlides = editingSlideId
        ? slides.map((item) => (item.id === editingSlideId ? slidePayload : item))
        : [slidePayload, ...slides].slice(0, 8);

      setSlides(updatedSlides);
      await saveSlides(updatedSlides);
      setMessage({ type: 'success', text: editingSlideId ? 'Slide updated.' : 'Slide added.' });
      cancelSlideEditor();
    } catch (error) {
      console.error('Failed to save slide image:', error);
      setMessage({ type: 'error', text: 'The slide image could not be uploaded. Please try again.' });
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (slides.length <= 2) {
      setMessage({ type: 'error', text: 'Keep at least two homepage slides.' });
      setDeleteConfirm(null);
      return;
    }
    const updatedSlides = slides.filter((slide) => slide.id !== id);
    setSlides(updatedSlides);
    await saveSlides(updatedSlides);
    setDeleteConfirm(null);
  };

  // ── Auth ─────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.');
      return;
    }

    if (isSupabaseConfigured() && supabase) {
      const { data, error: authError } = await supabase.rpc('verify_admin_login', {
        input_email: email.trim(),
        input_password: password,
      });

      if (authError || !data) {
        setError('Invalid credentials');
        return;
      }

      sessionStorage.setItem('adminAuth', 'true');
      setIsAuthenticated(true);
      loadData();
    } else {
      setError('Supabase credentials not configured');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setError('');
  };

  // ── Login screen ─────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#fbf7f2]">
        <div className="bg-white p-10 rounded-3xl w-full max-w-md text-center shadow-[0_20px_60px_rgba(15,15,15,0.08)] border border-[#ece3d8]">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-normal text-black tracking-[0.2em] uppercase">UPHΛRT</h1>
            <span className="text-[10px] text-gray-500 block mt-1 tracking-widest uppercase">Admin Portal</span>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full px-4 py-3 bg-[#f9f7f5] border border-[#e8e0d8] rounded-xl text-black placeholder-gray-500 text-sm focus:outline-none focus:border-black transition-colors" required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 bg-[#f9f7f5] border border-[#e8e0d8] rounded-xl text-black placeholder-gray-500 text-sm focus:outline-none focus:border-black transition-colors" required />
            <button type="submit" className="w-full py-3 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 mt-2">
              <LogIn size={16} /> Sign In
            </button>
          </form>
          {error && <p className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-200">{error}</p>}
        </div>
      </div>
    );
  }

  // ── Sidebar nav items ────────────────────────────────────────────────────
  const navItems: { id: ActiveView; label: string; icon: React.ReactNode }[] = [
    { id: 'products', label: 'Products', icon: <Package size={18} /> },
    { id: 'categories', label: 'Categories', icon: <LayoutGrid size={18} /> },
    { id: 'tags', label: 'Tags', icon: <Tag size={18} /> },
    { id: 'occasions', label: 'Occasions', icon: <Gift size={18} /> },
    { id: 'sales', label: 'Sales', icon: <Wallet size={18} /> },
    { id: 'slides', label: 'Slides', icon: <ImagePlus size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={18} /> },
  ];

  // ── Main layout ──────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-white text-black font-sans">

      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 bg-white flex flex-col py-8 px-5 sticky top-0 h-screen border-r border-gray-200">
        {/* Brand */}
        <div className="mb-10 px-1">
          <h1 className="text-lg font-semibold tracking-[0.25em] uppercase text-black/90">Uphar</h1>
          <p className="text-[10px] text-gray-500 tracking-widest uppercase mt-0.5">Admin Portal</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeView === item.id
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:bg-[#f5f1eb] hover:text-black'
              }`}
            >
              {item.icon}
              {item.label}
              {activeView === item.id && <ChevronRight size={14} className="ml-auto opacity-60" />}
            </button>
          ))}
        </nav>

        {/* Add Product CTA */}
        <div className="mt-6 space-y-2">
          <button
            onClick={openAddProduct}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm"
          >
            <Plus size={16} />
            Add Product
          </button>
          <button
            onClick={openAddCategory}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#fbf7f2] border border-[#e8e0d8] text-black rounded-xl text-sm font-medium hover:bg-[#f3efe8] transition-all"
          >
            <FolderPlus size={15} />
            Add Category
          </button>
          <button
            onClick={openAddOccasion}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#f5f1eb] border border-[#e8e0d8] text-black rounded-xl text-sm font-medium hover:bg-[#efe8df] transition-all"
          >
            <Gift size={15} />
            Add Occasion
          </button>
        </div>

        {/* View shop */}
        <Link to="/" className="mt-5 flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-black text-xs transition-colors">
          <Store size={14} /> View Shop
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
        >
          <LogIn size={14} className="rotate-180" />
          Logout
        </button>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 p-8 overflow-auto">

        {/* Products view */}
        {activeView === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Products</h2>
              <button onClick={openAddProduct} className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-colors">
                <Plus size={15} /> Add product
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              {loading ? (
                <div className="py-20"><Loading message="Syncing inventory..." /></div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <Package size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No products yet.</p>
                  <button onClick={openAddProduct} className="mt-4 text-xs text-[#c084b0] underline underline-offset-4">Add your first product</button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200">
                    <tr className="text-gray-500 text-xs uppercase tracking-wider">
                      <th className="py-4 px-5 text-left font-medium">Product</th>
                      <th className="py-4 px-4 text-left font-medium">Category</th>
                      <th className="py-4 px-4 text-left font-medium">Tags</th>
                      <th className="py-4 px-4 text-right font-medium">Stock</th>
                      <th className="py-4 px-4 text-right font-medium">Price</th>
                      <th className="py-4 px-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <img src={product.image_url} alt="" className="w-10 h-10 object-cover rounded-lg bg-gray-100" />
                            <span className="font-medium text-gray-900 truncate max-w-[130px]">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-500 text-xs">{categories.find((c) => c.id === product.categoryId)?.name || '—'}</td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {product.tags?.map((t) => (
                              <span key={t} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">{t}</span>
                            ))}
                          </div>
                        </td>
                        <td className={`py-4 px-4 text-right font-semibold ${(product.quantity ?? 0) <= 5 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {product.quantity ?? 0}
                        </td>
                        <td className="py-4 px-4 text-right text-gray-900 font-medium">₹{product.sellingPrice}</td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditProduct(product)} className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"><Pencil size={13} /></button>
                            <button onClick={() => setDeleteConfirm({ type: 'product', id: product.id, name: product.name })} className="p-1.5 rounded-lg bg-black/5 text-black hover:bg-black/10 transition-colors"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Categories view */}
        {activeView === 'categories' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Categories</h2>
              <button onClick={openAddCategory} className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-colors">
                <FolderPlus size={15} /> Add Category
              </button>
            </div>
            {categories.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <Folder size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No categories yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="relative group rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
                    <div className="aspect-square bg-gray-100">
                      {category.coverImage
                        ? <img src={category.coverImage} alt={category.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-400"><Folder size={32} /></div>
                      }
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm truncate text-gray-900">{category.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">/{category.slug}</p>
                      {!category.isActive && <span className="text-[10px] text-amber-500">Inactive</span>}
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditCategory(category)} className="p-1.5 rounded-lg bg-black/60 text-amber-400 hover:bg-black/80"><Pencil size={12} /></button>
                      <button onClick={() => setDeleteConfirm({ type: 'category', id: category.id, name: category.name })} className="p-1.5 rounded-lg bg-black/60 text-red-400 hover:bg-black/80"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tags view */}
        {activeView === 'tags' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Tags</h2>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-lg shadow-sm">
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="e.g., Anime, Metal, Custom..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors"
                />
                <button onClick={handleAddTag} className="px-4 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5">
                  <Plus size={15} /> Add
                </button>
              </div>
              <div className="space-y-2">
                {tags.length === 0 && <p className="text-gray-500 text-sm text-center py-6">No tags yet.</p>}
                {tags.map((t) => (
                  <div key={t} className="flex justify-between items-center px-4 py-2.5 bg-gray-50 rounded-xl group border border-gray-100">
                    <span className="text-sm">{t}</span>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'tag', id: t, name: t })}
                      className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} className="text-gray-600 hover:text-red-400 transition-colors" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Occasions view */}
        {activeView === 'occasions' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">Occasions</h2>
                <p className="mt-1 text-sm text-gray-600">Create occasion buttons that appear across the storefront and on the gift browsing pages.</p>
              </div>
              <button onClick={openAddOccasion} className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-colors">
                <Plus size={15} /> Add occasion
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {occasions.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-500">
                  <Gift size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No occasion buttons yet.</p>
                </div>
              ) : (
                occasions.map((occasion) => (
                  <div key={occasion.key} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#f5f1eb] flex items-center justify-center border border-[#e8e0d8] text-lg">
                        {(() => {
                          const normalized = occasion.icon?.trim() || '';
                          if (!normalized) return <span className="text-gray-400">🎁</span>;
                          if (normalized.startsWith('http') || normalized.startsWith('data:image')) {
                            return <img src={normalized} alt={`${occasion.label} icon`} className="max-w-full max-h-full rounded" />;
                          }
                          const key = normalized.toLowerCase().replace(/^fa-/, '').replace('fa-brands ', '').replace('fa-solid ', '').replace(/[^a-z0-9]/g, '');
                          const mappedIcon = iconNameMap[key] || faGift;
                          if (normalized.includes('fa-') || iconNameMap[key]) {
                            return <FontAwesomeIcon icon={mappedIcon} className="text-lg" />;
                          }
                          if (/^[\p{Extended_Pictographic}]$/u.test(normalized) || normalized.length <= 2) {
                            return <span className="text-2xl">{normalized}</span>;
                          }
                          return <FontAwesomeIcon icon={faGift} className="text-lg" />;
                        })()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{occasion.label}</p>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 mt-1">/{occasion.key}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'occasion', id: occasion.key, name: occasion.label })}
                      className="p-2 rounded-lg bg-black/5 text-black hover:bg-black/10 transition-colors"
                      aria-label={`Delete ${occasion.label}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Slides view */}
        {activeView === 'slides' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-semibold">Homepage Slides</h2>
                <p className="mt-1 text-sm text-gray-600 max-w-2xl">Manage the hero carousel slides shown on the storefront. You can publish up to eight slides.</p>
              </div>
              <button
                onClick={openAddSlide}
                disabled={slides.length >= 8}
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium transition-colors hover:bg-gray-800 disabled:opacity-50"
              >
                <Plus size={15} /> Add Slide
              </button>
            </div>

            {slides.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600">
                <p className="font-medium text-gray-900">No slides available.</p>
                <p className="text-sm mt-2">Add a slide to begin customizing your homepage hero carousel.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {slides.map((slide) => (
                  <div key={slide.id} className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="h-48 overflow-hidden bg-gray-100">
                      <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-900">{slide.title}</h3>
                      <p className="mt-2 text-sm text-gray-600">{slide.subtitle}</p>
                      <p className="mt-4 text-xs uppercase tracking-[0.25em] text-red-600 font-semibold">{slide.button}</p>
                      <div className="mt-5 flex items-center gap-2">
                        <button onClick={() => openEditSlide(slide)} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm hover:bg-gray-200 transition-colors">Edit</button>
                        <button onClick={() => setDeleteConfirm({ type: 'slide', id: slide.id, name: slide.title })} disabled={slides.length <= 2} title={slides.length <= 2 ? "Keep at least two slides" : "Delete slide"} className="px-3 py-2 bg-black text-white rounded-xl text-sm hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sales view */}
        {activeView === 'sales' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">Sales Tracker</h2>
                <p className="mt-1 text-sm text-gray-600">Simple sales logging for non-technical staff. Mark sold quantity and stock updates happen automatically.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Items in stock</p>
                <p className="text-3xl font-bold text-emerald-600">{products.reduce((sum, product) => sum + (product.quantity ?? 0), 0)}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Units sold</p>
                <p className="text-3xl font-bold text-blue-600">{products.reduce((sum, product) => sum + (product.soldQuantity ?? 0), 0)}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Sales today</p>
                <p className="text-3xl font-bold text-amber-600">{sales.filter((sale) => new Date(sale.createdAt).toDateString() === new Date().toDateString()).length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
              <form onSubmit={handleRecordSale} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{editingSaleId ? 'Edit sale' : 'Record a sale'}</h3>
                  {editingSaleId && (
                    <button type="button" onClick={resetSaleForm} className="text-xs font-medium text-gray-600 hover:text-black">
                      Cancel edit
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Product</label>
                    <select
                      value={saleProductId}
                      onChange={(e) => setSaleProductId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#f9f7f5] border border-[#e8e0d8] rounded-xl text-black text-sm focus:outline-none focus:border-black transition-colors"
                    >
                      <option value="">Select product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>{product.name} ({product.quantity ?? 0} left)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Quantity sold</label>
                    <input
                      type="number"
                      min="1"
                      value={saleQuantity}
                      onChange={(e) => setSaleQuantity(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#f9f7f5] border border-[#e8e0d8] rounded-xl text-black text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Payment method</label>
                    <select
                      value={salePaymentMethod}
                      onChange={(e) => setSalePaymentMethod(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#f9f7f5] border border-[#e8e0d8] rounded-xl text-black text-sm focus:outline-none focus:border-black transition-colors"
                    >
                      <option>Cash</option>
                      <option>UPI</option>
                      <option>Bank Transfer</option>
                      <option>Card</option>
                      <option>COD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Customer name</label>
                    <input
                      type="text"
                      value={saleCustomerName}
                      onChange={(e) => setSaleCustomerName(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-3 py-2.5 bg-[#f9f7f5] border border-[#e8e0d8] rounded-xl text-black text-sm placeholder-gray-500 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Status</label>
                    <select
                      value={saleStatus}
                      onChange={(e) => setSaleStatus(e.target.value as 'Paid' | 'Pending' | 'Cancelled')}
                      className="w-full px-3 py-2.5 bg-[#f9f7f5] border border-[#e8e0d8] rounded-xl text-black text-sm focus:outline-none focus:border-black transition-colors"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Notes</label>
                    <textarea
                      value={saleNotes}
                      onChange={(e) => setSaleNotes(e.target.value)}
                      rows={3}
                      placeholder="Optional order notes"
                      className="w-full px-3 py-2.5 bg-[#f9f7f5] border border-[#e8e0d8] rounded-xl text-black text-sm placeholder-gray-500 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    {editingSaleId ? 'Update sale' : 'Save sale'}
                  </button>
                </div>
              </form>

              <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 px-5 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent sales</h3>
                </div>
                {sales.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">No sales logged yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium">Product</th>
                          <th className="text-left px-4 py-3 font-medium">Qty</th>
                          <th className="text-left px-4 py-3 font-medium">Amount</th>
                          <th className="text-left px-4 py-3 font-medium">Method</th>
                          <th className="text-left px-4 py-3 font-medium">Status</th>
                          <th className="text-left px-4 py-3 font-medium">Time</th>
                          <th className="text-left px-4 py-3 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales.map((sale) => (
                          <tr key={sale.id} className="border-t border-gray-200 align-top">
                            <td className="px-4 py-3 text-gray-900">{sale.productName}</td>
                            <td className="px-4 py-3 text-gray-700">{sale.quantity}</td>
                            <td className="px-4 py-3 text-gray-700">₹{sale.amount.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-gray-700">{sale.paymentMethod}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${sale.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : sale.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                {sale.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-700">{new Date(sale.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingSaleId(sale.id);
                                    setSaleProductId(sale.productId);
                                    setSaleQuantity(String(sale.quantity));
                                    setSalePaymentMethod(sale.paymentMethod);
                                    setSaleCustomerName(sale.customerName === 'Walk-in customer' ? '' : sale.customerName);
                                    setSaleNotes(sale.notes);
                                    setSaleStatus(sale.status);
                                    setMessage({ type: '', text: '' });
                                  }}
                                  className="text-gray-700 hover:text-black text-xs font-medium"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirm({ type: 'sale', id: sale.id, name: sale.productName })}
                                  className="text-red-600 hover:text-red-700 text-xs font-medium"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analytics view */}
        {activeView === 'analytics' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Total Products', value: products.length, color: 'text-red-600', helper: 'SKUs available' },
                { label: 'Units in Stock', value: products.reduce((sum, item) => sum + (item.quantity ?? 0), 0), color: 'text-emerald-500', helper: 'Current inventory' },
                { label: 'Units Sold', value: products.reduce((sum, item) => sum + (item.soldQuantity ?? 0), 0), color: 'text-blue-500', helper: 'Sales volume' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-2">{stat.helper}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Inventory Value', value: products.reduce((sum, item) => sum + ((item.costPrice ?? 0) * (item.quantity ?? 0)), 0), color: 'text-yellow-600', prefix: '₹' },
                { label: 'Revenue Potential', value: products.reduce((sum, item) => sum + ((item.sellingPrice ?? 0) * (item.quantity ?? 0)), 0), color: 'text-cyan-600', prefix: '₹' },
                { label: 'Profit Potential', value: products.reduce((sum, item) => sum + (((item.sellingPrice ?? 0) - (item.costPrice ?? 0)) * (item.quantity ?? 0)), 0), color: 'text-amber-500', prefix: '₹' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.prefix}{stat.value.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-700 shadow-sm">
              <BarChart2 size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">Analytics now calculates your current inventory, units sold, revenue potential, and profit potential.</p>
            </div>
          </div>
        )}
      </main>

      {/* ── Product Drawer ── */}
      {showProductDrawer && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => { setShowProductDrawer(false); cancelEdit(); }}
          />
          {/* Drawer */}
          <div className="fixed top-0 right-0 z-50 h-full w-full max-w-lg bg-white border-l border-[#e8e0d8] flex flex-col shadow-[0_20px_60px_rgba(15,15,15,0.12)] overflow-hidden"
            style={{ animation: 'slideInRight 0.25s ease' }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#efe7df] shrink-0">
              <div className="flex items-center gap-3">
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${editingId ? 'bg-amber-100' : 'bg-[#f3efe8]'}`}>
                  {editingId ? <Pencil size={17} className="text-amber-600" /> : <PlusCircle size={17} className="text-black" />}
                </span>
                <h3 className="font-semibold text-black">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
              </div>
              <button
                onClick={() => { setShowProductDrawer(false); cancelEdit(); }}
                className="p-2 rounded-lg text-gray-500 hover:text-black hover:bg-[#f5f1eb] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <form onSubmit={handleSubmit} className="space-y-5" id="product-form">

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center gap-1.5">
                    <Folder size={13} className="text-black" /> Category <span className="text-red-500">*</span>
                  </label>
                  {!showInlineCategoryInput ? (
                    <div className="flex gap-2">
                      <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="flex-1 px-3 py-2.5 bg-[#f9f7f5] border border-[#e8e0d8] rounded-xl text-black text-sm focus:outline-none focus:border-black transition-colors"
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowInlineCategoryInput(true)}
                        className="px-3 py-2 bg-[#f5f1eb] border border-[#e8e0d8] rounded-xl text-black text-xs hover:bg-[#efe8df] transition-colors flex items-center gap-1"
                      >
                        <FolderPlus size={14} /> New
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-[#f9f7f5] rounded-xl border border-[#e8e0d8]">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Category name..."
                          className="flex-1 px-3 py-2 bg-white border border-[#e8e0d8] rounded-lg text-black text-sm focus:outline-none focus:border-black transition-colors"
                        />
                        <button type="button" onClick={handleCreateCategoryInline} disabled={categoryCreating || !newCategoryName.trim()} className="px-3 py-2 bg-black text-white rounded-lg text-xs font-medium disabled:opacity-50">
                          {categoryCreating ? 'Saving…' : 'Save'}
                        </button>
                        <button type="button" onClick={() => { setShowInlineCategoryInput(false); setNewCategoryName(''); }} className="px-3 py-2 bg-[#f5f1eb] text-black rounded-lg text-xs">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Product Name</label>
                  <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., Naruto Keychain" className="w-full px-3 py-2.5 bg-[#f9f7f5] border border-[#e8e0d8] rounded-xl text-black text-sm placeholder-gray-500 focus:outline-none focus:border-black transition-colors" required />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Description</label>
                  <textarea value={productDescription} onChange={(e) => setProductDescription(e.target.value)} placeholder="Describe your product..." rows={3} className="w-full px-3 py-2.5 bg-[#f9f7f5] border border-[#e8e0d8] rounded-xl text-black text-sm placeholder-gray-500 focus:outline-none focus:border-black transition-colors resize-y min-h-[80px]" required />
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Buy Price', value: productCostPrice, setter: setProductCostPrice },
                    { label: 'Sell Price', value: productSellingPrice, setter: setProductSellingPrice },
                    { label: 'Quantity', value: productQuantity, setter: setProductQuantity },
                  ].map(({ label, value, setter }) => (
                    <div key={label}>
                      <label className="block text-xs font-medium text-gray-600 mb-2">{label}</label>
                      <div className="relative">
                        {label !== 'Quantity' && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₹</span>}
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          className={`w-full py-2.5 ${label !== 'Quantity' ? 'pl-7 pr-3' : 'px-3'} bg-[#f9f7f5] border border-[#e8e0d8] rounded-xl text-black text-sm focus:outline-none focus:border-black transition-colors`}
                          min="0"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Occasion (optional)</label>
                    <select
                      value={productOccasion}
                      onChange={(e) => setProductOccasion(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#f9f7f5] border border-[#e8e0d8] rounded-xl text-black text-sm focus:outline-none focus:border-black transition-colors"
                    >
                      <option value="">No occasion</option>
                      {occasions.map((occasion) => (
                        <option key={occasion.key} value={occasion.key}>{occasion.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      id="new-arrival"
                      type="checkbox"
                      checked={productIsNewArrival}
                      onChange={(e) => setProductIsNewArrival(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <label htmlFor="new-arrival" className="text-sm text-gray-700">
                      Mark as new arrival
                    </label>
                  </div>
                </div>

                {/* Profit forecast */}
                {productCostPrice && productSellingPrice && productQuantity && (
                  <div className="bg-[#f8f5f2] border border-[#efe7df] rounded-xl p-4">
                    <p className="text-[10px] text-gray-500 mb-3 font-medium flex items-center gap-1 uppercase tracking-wider"><Lightbulb size={11} /> Profit Forecast</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-amber-100 rounded-lg"><p className="text-[9px] text-gray-600 mb-1">Investment</p><p className="text-sm font-bold text-amber-700">₹{(Number(productCostPrice) * Number(productQuantity)).toLocaleString()}</p></div>
                      <div className="p-2 bg-blue-100 rounded-lg"><p className="text-[9px] text-gray-600 mb-1">Revenue</p><p className="text-sm font-bold text-blue-700">₹{(Number(productSellingPrice) * Number(productQuantity)).toLocaleString()}</p></div>
                      <div className="p-2 bg-emerald-100 rounded-lg"><p className="text-[9px] text-gray-600 mb-1">Margin</p><p className="text-sm font-bold text-emerald-700">₹{((Number(productSellingPrice) - Number(productCostPrice)) * Number(productQuantity)).toLocaleString()}</p></div>
                    </div>
                  </div>
                )}

                {/* Image */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Product Image</label>
                  <div
                    className="border-2 border-dashed border-[#e8e0d8] rounded-xl p-5 text-center cursor-pointer hover:border-black transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="max-h-[100px] mx-auto rounded-lg object-cover" />
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-[#f5f1eb] flex items-center justify-center mb-2 mx-auto"><ImagePlus size={18} className="text-gray-600" /></div>
                        <span className="text-xs text-gray-600">Click to upload image</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-600">Product Tags</label>
                    <button type="button" onClick={() => setShowTagModal(true)} className="text-[10px] text-black flex items-center gap-1 hover:underline">
                      <Tag size={11} /> Manage Tags
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleProductTag(tag)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${productTags.includes(tag) ? 'bg-black text-white' : 'bg-[#f5f1eb] text-gray-700 hover:bg-[#efe8df]'}`}
                      >
                        {tag}
                      </button>
                    ))}
                    {tags.length === 0 && <p className="text-xs text-gray-600">No tags yet. Create some in the Tags tab.</p>}
                  </div>
                </div>

              </form>
            </div>

            {/* Drawer footer */}
            <div className="px-6 py-4 border-t border-[#efe7df] shrink-0 space-y-3">
              {message.text && (
                <p className={`p-3 text-xs rounded-xl ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {message.text}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowProductDrawer(false); cancelEdit(); }}
                  className="flex-1 py-2.5 bg-[#f5f1eb] border border-[#e8e0d8] text-black rounded-xl text-sm hover:bg-[#efe8df] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="product-form"
                  disabled={uploading}
                  className="flex-1 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : editingId ? <Pencil size={15} /> : <Gift size={15} />}
                  {editingId ? 'Update Product' : 'Publish Product'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Category Modal ── */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md border border-gray-200 shadow-2xl overflow-hidden"
            style={{ animation: 'scaleIn 0.2s ease' }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <LayoutGrid size={17} className="text-black" />
                {editingCategoryId ? 'Edit Category' : 'New Category'}
              </h3>
              <button onClick={() => { setShowCategoryModal(false); resetCategoryForm(); }} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"><X size={17} /></button>
            </div>
            <form onSubmit={handleCategorySubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">Category Name</label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => { setCategoryName(e.target.value); if (!editingCategoryId) setCategorySlug(slugify(e.target.value)); }}
                    placeholder="e.g., Keychain"
                    className="w-full px-3 py-2.5 bg-[#f9f7f5] border border-[#e8e0d8] rounded-xl text-black text-sm placeholder-gray-500 focus:outline-none focus:border-black transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">Slug</label>
                  <input
                    type="text"
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    placeholder="e.g., keychain"
                    className="w-full px-3 py-2.5 bg-[#f9f7f5] border border-[#e8e0d8] rounded-xl text-black text-sm placeholder-gray-500 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">Cover Image</label>
                <div
                  className="border-2 border-dashed border-[#e8e0d8] rounded-xl p-4 text-center cursor-pointer hover:border-black transition-colors"
                  onClick={() => categoryCoverInputRef.current?.click()}
                >
                  <input type="file" ref={categoryCoverInputRef} onChange={handleCategoryCoverChange} accept="image/*" className="hidden" />
                  {categoryCoverPreview
                    ? <img src={categoryCoverPreview} alt="Preview" className="max-h-[80px] mx-auto rounded-lg object-cover" />
                    : <span className="text-xs text-gray-500">Click to upload cover image</span>
                  }
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="catActive" checked={categoryIsActive} onChange={(e) => setCategoryIsActive(e.target.checked)} className="rounded accent-black" />
                <label htmlFor="catActive" className="text-sm text-gray-700">Active (visible on storefront)</label>
              </div>
              {message.text && (
                <p className={`p-3 text-xs rounded-xl ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{message.text}</p>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowCategoryModal(false); resetCategoryForm(); }} className="flex-1 py-2.5 bg-[#f5f1eb] border border-[#e8e0d8] text-black rounded-xl text-sm hover:bg-[#efe8df] transition-colors">Cancel</button>
                <button type="submit" disabled={uploading} className="flex-1 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  {uploading ? <Loader2 size={15} className="animate-spin" /> : editingCategoryId ? <Pencil size={15} /> : <FolderPlus size={15} />}
                  {editingCategoryId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Occasion Modal ── */}
      {showOccasionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md border border-gray-200 shadow-2xl overflow-hidden" style={{ animation: 'scaleIn 0.2s ease' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Gift size={17} className="text-black" />
                New Occasion
              </h3>
              <button onClick={() => { setShowOccasionModal(false); setOccasionName(''); setOccasionKey(''); }} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"><X size={17} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">Occasion Name</label>
                <input
                  type="text"
                  value={occasionName}
                  onChange={(e) => setOccasionName(e.target.value)}
                  placeholder="e.g., Birthday"
                  className="w-full px-3 py-2.5 bg-[#f9f7f5] border border-[#e8e0d8] rounded-xl text-black text-sm placeholder-gray-500 focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1.5">Slug / URL key</label>
                <input
                  type="text"
                  value={occasionKey}
                  onChange={(e) => setOccasionKey(e.target.value)}
                  placeholder="birthday"
                  className="w-full px-3 py-2.5 bg-[#f9f7f5] border border-[#e8e0d8] rounded-xl text-black text-sm placeholder-gray-500 focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1.5">Icon</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(['emoji', 'upload', 'fontawesome'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setOccasionIconMode(mode)}
                      className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium border ${occasionIconMode === mode ? 'bg-black text-white border-black' : 'bg-[#f5f1eb] text-black border-[#e8e0d8]'}`}
                    >
                      {mode === 'emoji' ? 'Emoji' : mode === 'upload' ? 'Upload Image' : 'Font Awesome'}
                    </button>
                  ))}
                </div>

                {occasionIconMode === 'emoji' && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={occasionIcon}
                      onChange={(e) => setOccasionIcon(e.target.value)}
                      placeholder="🎉 or 😊"
                      className="flex-1 px-3 py-2.5 bg-[#f9f7f5] border border-[#e8e0d8] rounded-xl text-black text-sm placeholder-gray-500 focus:outline-none focus:border-black transition-colors"
                    />
                    <div className="w-12 h-12 rounded-xl bg-[#f5f1eb] flex items-center justify-center border border-[#e8e0d8]">
                      {renderOccasionIconPreview(occasionIcon)}
                    </div>
                  </div>
                )}

                {occasionIconMode === 'upload' && (
                  <div className="flex items-center gap-2">
                    <input type="file" accept="image/*" onChange={handleOccasionIconFile} className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-black file:text-white" />
                    <div className="w-12 h-12 rounded-xl bg-[#f5f1eb] flex items-center justify-center border border-[#e8e0d8] overflow-hidden">
                      {occasionIcon ? <img src={occasionIcon} alt="occasion icon preview" className="h-full w-full object-cover" /> : <span className="text-gray-400">🎁</span>}
                    </div>
                  </div>
                )}

                {occasionIconMode === 'fontawesome' && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={occasionIcon}
                      onChange={(e) => setOccasionIcon(e.target.value)}
                      placeholder="whatsapp, instagram, gift, star, heart"
                      className="flex-1 px-3 py-2.5 bg-[#f9f7f5] border border-[#e8e0d8] rounded-xl text-black text-sm placeholder-gray-500 focus:outline-none focus:border-black transition-colors"
                    />
                    <div className="w-12 h-12 rounded-xl bg-[#f5f1eb] flex items-center justify-center border border-[#e8e0d8]">
                      {renderOccasionIconPreview(occasionIcon)}
                    </div>
                  </div>
                )}
              </div>
              {message.text && (
                <p className={`p-3 text-xs rounded-xl ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{message.text}</p>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowOccasionModal(false); setOccasionName(''); setOccasionKey(''); }} className="flex-1 py-2.5 bg-[#f5f1eb] border border-[#e8e0d8] text-black rounded-xl text-sm hover:bg-[#efe8df] transition-colors">Cancel</button>
                <button type="button" onClick={handleAddOccasion} className="flex-1 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                  <Gift size={15} /> Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tags Modal ── */}
      {showTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Tag size={16} className="text-black" /> Manage Tags</h3>
              <button onClick={() => setShowTagModal(false)} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"><X size={17} /></button>
            </div>
            <div className="px-6 py-5">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="e.g., Anime, Metal..."
                  className="flex-1 px-3 py-2.5 bg-[#f9f7f5] border border-[#e8e0d8] rounded-xl text-black text-sm placeholder-gray-500 focus:outline-none focus:border-black transition-colors"
                />
                <button onClick={handleAddTag} className="px-3 py-2 bg-black text-white rounded-xl text-sm font-medium flex items-center gap-1 hover:bg-gray-800 transition-colors"><Plus size={15} /> Add</button>
              </div>
              <div className="max-h-52 overflow-auto space-y-1.5">
                {tags.map((t) => (
                  <div key={t} className="flex justify-between items-center px-3 py-2.5 bg-[#f9f7f5] rounded-xl group border border-[#efe7df]">
                    <span className="text-sm text-black">{t}</span>
                    <button onClick={() => setDeleteConfirm({ type: 'tag', id: t, name: t })} className="text-gray-500 hover:text-black transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm border border-gray-200 shadow-2xl p-6 text-center"
            style={{ animation: 'scaleIn 0.15s ease' }}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Delete {deleteConfirm.type}?</h3>
            <p className="text-sm text-gray-600 mb-6">
              <span className="font-medium text-gray-900">"{deleteConfirm.name}"</span> will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-sm hover:bg-gray-200 transition-colors">Cancel</button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === 'product') handleDelete(deleteConfirm.id);
                  else if (deleteConfirm.type === 'category') handleDeleteCategory(deleteConfirm.id);
                  else if (deleteConfirm.type === 'tag') handleDeleteTag(deleteConfirm.id);
                  else if (deleteConfirm.type === 'slide') handleDeleteSlide(deleteConfirm.id);
                  else if (deleteConfirm.type === 'sale') handleDeleteSale(deleteConfirm.id);
                  else if (deleteConfirm.type === 'occasion') handleDeleteOccasion(deleteConfirm.id);
                }}
                className="flex-1 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide editor modal */}
      {showSlideEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[calc(100vh-2rem)] border border-gray-200 shadow-2xl overflow-hidden flex flex-col" style={{ animation: 'scaleIn 0.2s ease' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{editingSlideId ? 'Edit Slide' : 'New Slide'}</h3>
                <p className="text-sm text-gray-500">Manage the homepage hero carousel slide.</p>
              </div>
              <button onClick={cancelSlideEditor} className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleSlideSubmit} className="px-6 py-5 space-y-4 overflow-y-auto min-h-0">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Slide Title</label>
                <input
                  type="text"
                  value={slideTitle}
                  onChange={(e) => setSlideTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:border-red-600 transition-colors"
                  placeholder="Enter the slide title"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Slide Subtitle</label>
                <textarea
                  value={slideSubtitle}
                  onChange={(e) => setSlideSubtitle(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:border-red-600 transition-colors"
                  placeholder="Enter the slide subtitle"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-3"><div><p className="text-sm font-semibold text-gray-900">Primary button</p><p className="text-xs text-gray-500 mt-0.5">Add a call to action to this slide.</p></div><span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Optional</span></div>
                <label className="sr-only">Primary button label</label>
                <div className="flex flex-col sm:flex-row gap-2"  >
                <input type="text" value={slideButtonText} onChange={(e) => setSlideButtonText(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors" placeholder="Shop now, Learn more, etc." />
                <input type="text" value={slideButtonUrl} onChange={(e) => setSlideButtonUrl(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors" placeholder="Button link, e.g. /new-arrivals" />
                </div>
              </div>
              <div >
                <div className="flex items-center justify-between mb-3"><div><p className="text-sm font-semibold text-gray-900">Secondary button</p><p className="text-xs text-gray-500 mt-0.5">Leave blank if you only need one button.</p></div><span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Optional</span></div>
                <label className="sr-only">Secondary button label</label>
                <div className="flex flex-col sm:flex-row gap-2">
                <input type="text" value={slideButton2Text} placeholder="Optional second button" onChange={(e) => setSlideButton2Text(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors" />
                <input type="text" value={slideButton2Url} placeholder="Second button link, e.g. /shop" onChange={(e) => setSlideButton2Url(e.target.value)} className="w-full  px-4 py-3 border border-gray-200 rounded-2xl text-gray-900" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Slide Image</label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSlideImageMode('url');
                      setSlideImageFile(null);
                      setSlideImagePreview(slideImageUrl || '');
                    }}
                    className={`px-3 py-2 rounded-xl text-sm border transition-colors ${slideImageMode === 'url' ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setSlideImageMode('upload')}
                    className={`px-3 py-2 rounded-xl text-sm border transition-colors ${slideImageMode === 'upload' ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                  >
                    Upload Image
                  </button>
                </div>

                {slideImageMode === 'url' ? (
                  <input
                    type="text"
                    value={slideImageUrl}
                    onChange={(e) => {
                      const nextUrl = e.target.value;
                      setSlideImageUrl(nextUrl);
                      setSlideImageFile(null);
                      setSlideImagePreview(nextUrl.trim() || '');
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:border-red-600 transition-colors"
                    placeholder="https://..."
                  />
                ) : (
                  <div className="border border-dashed border-gray-300 rounded-2xl p-4 bg-gray-50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSlideImageChange}
                      className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-black file:text-white"
                    />
                    {(slideImagePreview || slideImageUrl) && (
                      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                        <img src={slideImagePreview || slideImageUrl} alt="Slide preview" className="h-32 w-full object-cover" />
                      </div>
                    )}
                  </div>
                )}
              </div>
              {message.text && (
                <p className={`rounded-2xl p-3 text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {message.text}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="button" onClick={cancelSlideEditor} className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-2xl bg-black text-white font-semibold hover:bg-gray-800 transition-colors">
                  {editingSlideId ? 'Update Slide' : 'Create Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Admin;