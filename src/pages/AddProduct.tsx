import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../services/products';
import { fetchCategories } from '../services/categories';
import { fetchTags } from '../lib/products';
import { uploadImage, isCloudinaryConfigured } from '../lib/cloudinary';

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [categoryId, setCategoryId] = useState('');
  const [productTags, setProductTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const cats = await fetchCategories(true);
      setCategories(cats);
      const t = await fetchTags();
      setTags(t);
      if (cats.length) setCategoryId(cats[0].id);
    })();
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setImageFile(f);
    if (!f) { setImagePreview(null); return; }
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const toggleTag = (t: string) => {
    setProductTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      let imageUrl = imagePreview || '';
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const payload = {
        name,
        description,
        image_url: imageUrl,
        costPrice: Number(costPrice) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        quantity: Number(quantity) || 0,
        tags: productTags,
        categoryId,
      };

      const created = await productApi.create(payload as any);
      if (created) {
        setMessage('Product created successfully');
        navigate('/admin');
      } else {
        setMessage('Failed to create product');
      }
    } catch (err) {
      console.error(err);
      setMessage('Upload or save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-white text-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Add Product</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="form-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="form-input">
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="form-input" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cost Price</label>
              <input value={costPrice} onChange={(e) => setCostPrice(e.target.value)} type="number" className="form-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sell Price</label>
              <input value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} type="number" className="form-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <input value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" className="form-input" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
            <div className="border border-gray-200 rounded-lg p-4">
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="max-h-48 mx-auto rounded" />
              ) : (
                <div className="text-center text-gray-500">No image selected</div>
              )}
              <div className="mt-3 flex gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-secondary">Select Image</button>
                {isCloudinaryConfigured() && <span className="text-xs text-gray-500 self-center">Uploads use Cloudinary</span>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <button type="button" key={t} onClick={() => toggleTag(t)} className={`px-3 py-1 rounded-full text-sm ${productTags.includes(t) ? 'bg-black text-white' : 'bg-white border border-gray-200'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {message && <p className="text-sm text-rose-500">{message}</p>}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Saving…' : 'Create Product'}</button>
            <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
