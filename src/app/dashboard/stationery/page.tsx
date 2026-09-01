"use client";

import React, { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  order: number;
  _count?: { products: number };
}

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  stock: number;
  categoryId: string;
  category?: Category;
}

export default function StationeryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [newCategory, setNewCategory] = useState({ name: "", description: "", icon: "", order: "0" });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({ name: "", description: "", price: "", stock: "0", categoryId: "", image: "" });
  const [uploading, setUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);

  const loadCategories = async () => {
    const res = await fetch("/api/stationery/categories");
    if (res.ok) setCategories(await res.json());
  };

  const loadProducts = async () => {
    const url = selectedCategory ? `/api/stationery/products?categoryId=${selectedCategory}` : "/api/stationery/products";
    const res = await fetch(url);
    if (res.ok) setProducts(await res.json());
  };

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { loadProducts(); }, [selectedCategory]);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "my_school_preset");
    const res = await fetch("https://api.cloudinary.com/v1_1/vyhjq4m7/image/upload", {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    if (!data.secure_url) throw new Error(data.error?.message || "فشل رفع الصورة");
    return data.secure_url;
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;
    const res = await fetch("/api/stationery/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCategory),
    });
    const data = await res.json();
    if (!res.ok) alert(data.error || "حدث خطأ");
    else setNewCategory({ name: "", description: "", icon: "", order: "0" });
    loadCategories();
  };

  const saveCategoryEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const res = await fetch(`/api/stationery/categories/${editingCategory.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editingCategory.name,
        description: editingCategory.description || "",
        icon: editingCategory.icon || "",
        order: String(editingCategory.order ?? 0),
      }),
    });
    const data = await res.json();
    if (!res.ok) alert(data.error || "حدث خطأ");
    else setEditingCategory(null);
    loadCategories();
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("حذف الفئة؟ ستُحذف جميع منتجاتها أيضاً.")) return;
    const res = await fetch(`/api/stationery/categories/${id}?deleteProducts=true`, { method: "DELETE" });
    if (!res.ok) alert("حدث خطأ أثناء حذف الفئة");
    if (selectedCategory === id) setSelectedCategory("");
    loadCategories();
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: "", description: "", price: "", stock: "0", categoryId: selectedCategory || categories[0]?.id || "", image: "" });
    setShowProductModal(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      description: p.description || "",
      price: String(p.price ?? ""),
      stock: String(p.stock ?? 0),
      categoryId: p.categoryId || selectedCategory,
      image: p.image || "",
    });
    setShowProductModal(true);
  };

  const uploadProductImage = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setProductForm({ ...productForm, image: url });
    } catch (err) {
      alert(err instanceof Error ? err.message : "فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const url = editingProduct
        ? `/api/stationery/products/${editingProduct.id}`
        : "/api/stationery/products";
      const res = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productForm),
      });
      const data = await res.json();
      if (!res.ok) alert(data.error || "حدث خطأ");
      else setShowProductModal(false);
    } finally {
      setSavingProduct(false);
    }
    loadProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("حذف المنتج؟")) return;
    const res = await fetch(`/api/stationery/products/${id}`, { method: "DELETE" });
    if (!res.ok) alert("حدث خطأ أثناء حذف المنتج");
    loadProducts();
  };

  const currentCatLabel = (id: string) => categories.find((c) => c.id === id)?.name || "";

  return (
    <div>
      <div className="bg-white rounded-xl border p-4 shadow-sm mb-6">
        <h3 className="font-bold text-gray-900 mb-3">🏷️ فئات الأدوات المكتبية</h3>
        <form onSubmit={addCategory} className="flex flex-wrap gap-2 mb-4">
          <input type="text" placeholder="اسم الفئة (مثال: كراسات، أقلام)" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} className="flex-1 min-w-[160px] px-3 py-2 border rounded-lg text-sm" required />
          <input type="text" placeholder="أيقونة (emoji)" value={newCategory.icon} onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })} className="w-28 px-3 py-2 border rounded-lg text-sm" />
          <input type="number" placeholder="الترتيب" value={newCategory.order} onChange={(e) => setNewCategory({ ...newCategory, order: e.target.value })} className="w-24 px-3 py-2 border rounded-lg text-sm" />
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700">+ إضافة</button>
        </form>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              {editingCategory?.id === cat.id ? (
                <form onSubmit={saveCategoryEdit} className="flex flex-wrap gap-2 flex-1">
                  <input type="text" value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} className="flex-1 min-w-[140px] px-3 py-1.5 border rounded text-sm" required />
                  <input type="text" placeholder="أيقونة" value={editingCategory.icon || ""} onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })} className="w-24 px-3 py-1.5 border rounded text-sm" />
                  <input type="number" value={editingCategory.order ?? 0} onChange={(e) => setEditingCategory({ ...editingCategory, order: parseInt(e.target.value) || 0 })} className="w-20 px-3 py-1.5 border rounded text-sm" />
                  <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold">حفظ</button>
                  <button type="button" onClick={() => setEditingCategory(null)} className="px-3 py-1.5 border rounded text-xs font-bold">إلغاء</button>
                </form>
              ) : (
                <>
                  <span className="text-lg">{cat.icon || "📁"}</span>
                  <span className="font-bold text-sm flex-1">{cat.name}</span>
                  {cat.description && <span className="text-xs text-gray-400 hidden md:inline">{cat.description}</span>}
                  <span className="text-xs text-gray-400">{cat._count?.products ?? 0} منتج</span>
                  <button onClick={() => setEditingCategory(cat)} className="text-blue-600 text-xs font-bold">تعديل</button>
                  <button onClick={() => deleteCategory(cat.id)} className="text-red-500 text-xs font-bold">حذف</button>
                </>
              )}
            </div>
          ))}
          {categories.length === 0 && <p className="text-xs text-gray-400 text-center py-2">لا توجد فئات — أضف فئة أولاً</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white">
          <option value="">كل الفئات</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.icon || "📁"} {cat.name}</option>
          ))}
        </select>
        <button onClick={openAddProduct} disabled={categories.length === 0} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-blue-300 text-sm">
          + إضافة منتج
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border p-5 shadow-sm">
            {p.image ? (
              <img src={p.image} alt={p.name} className="w-full h-32 object-cover rounded-lg mb-3" />
            ) : (
              <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400 text-3xl">📎</div>
            )}
            <h3 className="font-bold text-gray-900">{p.name}</h3>
            {p.category && <p className="text-xs text-gray-400">{p.category.icon || "📁"} {p.category.name}</p>}
            {p.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>}
            <div className="flex items-center justify-between mt-2 text-sm">
              <span className="font-bold text-blue-600">{p.price} ج.م</span>
              <span className={`text-xs font-bold ${p.stock > 0 ? "text-green-600" : "text-red-500"}`}>المخزون: {p.stock}</span>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => openEditProduct(p)} className="flex-1 px-3 py-1.5 border border-blue-300 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-50">تعديل</button>
              <button onClick={() => deleteProduct(p.id)} className="flex-1 px-3 py-1.5 border border-red-300 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50">حذف</button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full text-center p-12 text-gray-400">لا توجد منتجات في هذه الفئة</div>
        )}
      </div>

      {showProductModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowProductModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{editingProduct ? "تعديل منتج" : "إضافة منتج"}</h3>
            <form onSubmit={saveProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج <span className="text-red-500">*</span></label>
                <input type="text" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السعر (ج.م) <span className="text-red-500">*</span></label>
                  <input type="number" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المخزون</label>
                  <input type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                <select value={productForm.categoryId} onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white" required>
                  <option value="" disabled>اختر فئة</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.icon || "📁"} {cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">صورة المنتج</label>
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadProductImage(e.target.files[0])} className="text-sm" disabled={uploading} />
                {uploading && <p className="text-xs text-blue-500 mt-1">جاري الرفع...</p>}
                {productForm.image ? (
                  <img src={productForm.image} alt="" className="w-full h-32 object-cover rounded-lg mt-2" />
                ) : (
                  <p className="text-xs text-gray-400 mt-1 text-center">لا توجد صورة — ارفع صورة من Cloudinary</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowProductModal(false)} className="flex-1 py-2.5 border rounded-lg text-sm font-bold">إلغاء</button>
                <button type="submit" disabled={savingProduct} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:bg-blue-300">{savingProduct ? "جاري الحفظ..." : "حفظ"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}