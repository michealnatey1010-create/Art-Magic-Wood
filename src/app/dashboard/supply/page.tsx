"use client";

import React, { useState, useEffect } from "react";

interface Product {
  name: string;
  price?: number;
  image?: string;
}

interface Stage {
  id: string;
  name: string;
  points: number;
  coverImage?: string;
  price?: number;
  products: Product[];
}

interface ProductForm {
  name: string;
  price: string;
  image: string;
}

const cacheBuster = Date.now();
const imgUrl = (url?: string) => url ? (url.startsWith("data:") ? url : `${url}?t=${cacheBuster}`) : "";

export default function SupplyPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", coverImage: "", points: "0", products: [{ name: "", price: "", image: "" }] as ProductForm[] });
  const [uploading, setUploading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");

  const load = async () => {
    const res = await fetch("/api/dashboard/supply");
    const data = await res.json();
    setStages(data);
  };

  useEffect(() => { load(); }, []);

  const addProductRow = () => {
    setForm({ ...form, products: [...form.products, { name: "", price: "", image: "" }] });
  };

  const updateProduct = (idx: number, field: string, value: string) => {
    const prods = [...form.products];
    (prods[idx] as any)[field] = value;
    setForm({ ...form, products: prods });
  };

  const uploadImage = async (idx: number, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("sub", "products");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    console.log("📸 Product image URL:", data.url);
    updateProduct(idx, "image", data.url);
  };

  const selectCoverImage = (file: File) => {
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("points", String(parseInt(form.points) || 0));
    fd.append("price", String(parseFloat(form.price) || 0));
    if (coverFile) {
      fd.append("file", coverFile);
      fd.append("coverImage", coverFile);
    }

    try {
      const res = await fetch("/api/supply-stages", { method: "POST", body: fd });
      const data = await res.json();
      console.log("Supply-stage response:", data);
      if (!data.success) alert(data.message || "حدث خطأ");
    } finally {
      setUploading(false);
    }

    setShowModal(false);
    setCoverFile(null);
    setCoverPreview("");
    setForm({ name: "", price: "", coverImage: "", points: "0", products: [{ name: "", price: "", image: "" }] });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("تأكيد الحذف؟")) return;
    await fetch(`/api/dashboard/supply?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <button onClick={() => setShowModal(true)} className="mb-6 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition text-sm">
        + إضافة مرحلة دراسية جديدة
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stages.map((stage) => (
          <div key={stage.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="relative">
              {stage.coverImage ? (
                <img
                  src={stage.coverImage}
                  alt={stage.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const placeholder = e.currentTarget.parentElement?.querySelector('.cover-placeholder') as HTMLElement;
                    if (placeholder) placeholder.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="cover-placeholder w-full h-48 bg-gray-200 items-center justify-center rounded-t-lg" style={{ display: stage.coverImage ? 'none' : 'flex' }}>
                <span className="text-4xl">📚</span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-900">{stage.name}</h3>
                  <p className="text-xs text-gray-500">نقاط المكافأة: {stage.points}</p>
                </div>
                <button onClick={() => handleDelete(stage.id)} className="text-red-500 hover:text-red-700 text-sm">حذف</button>
              </div>
              {stage.price ? (
                <div className="text-sm font-bold text-blue-600 mb-2">السعر: {stage.price} ج.م</div>
              ) : null}
              <div className="space-y-1.5 text-xs text-gray-600">
                {stage.products.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-1.5 bg-gray-50 rounded">
                    {p.image ? (
                      <img src={p.image} alt="" className="w-8 h-8 rounded object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-gray-400">📦</div>
                    )}
                    <span className="flex-1">{p.name}</span>
                    {p.price ? <span className="font-mono">{p.price} ج.م</span> : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        {stages.length === 0 && (
          <div className="col-span-full text-center p-12 text-gray-400">لا توجد مراحل دراسية مضافة</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">إضافة مرحلة دراسية</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المرحلة <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">سعر الحزمة (ج.م) <span className="text-red-500">*</span></label>
                <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نقاط المكافأة</label>
                <input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">صورة الغلاف</label>
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && selectCoverImage(e.target.files[0])} className="text-sm" />
                {coverPreview && (
                  <img src={coverPreview} alt="" className="w-full h-32 object-cover rounded-lg mt-2" />
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">المنتجات <span className="text-xs text-gray-400">(اختياري)</span></label>
                  <button type="button" onClick={addProductRow} className="text-blue-600 text-sm font-bold">+ إضافة منتج</button>
                </div>
                <div className="space-y-3">
                  {form.products.map((prod, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg space-y-2">
                      <input type="text" placeholder="اسم المنتج" value={prod.name} onChange={(e) => updateProduct(idx, "name", e.target.value)} className="w-full px-3 py-1.5 border rounded text-sm" required />
                      <input type="number" step="0.01" placeholder="سعر المنتج (ج.م) - اختياري" value={prod.price} onChange={(e) => updateProduct(idx, "price", e.target.value)} className="w-full px-3 py-1.5 border rounded text-sm" />
                      <div className="flex items-center gap-2">
                        <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(idx, e.target.files[0])} className="text-sm" />
                        {prod.image && <img src={imgUrl(prod.image)} alt="" className="w-10 h-10 rounded object-cover" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border rounded-lg text-sm font-bold">إلغاء</button>
                <button type="submit" disabled={uploading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:bg-blue-300">{uploading ? "جاري الرفع..." : "حفظ"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
