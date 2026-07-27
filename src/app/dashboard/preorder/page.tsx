"use client";

import React, { useState, useEffect } from "react";

interface PreOrderItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

export default function PreOrderPage() {
  const [items, setItems] = useState<PreOrderItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", image: "" });
  const [notifying, setNotifying] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/dashboard/preorder");
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => { load(); }, []);

  const uploadImage = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setForm({ ...form, image: data.url });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/dashboard/preorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, price: parseFloat(form.price) || 0, image: form.image }),
    });
    setForm({ name: "", price: "", image: "" });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("تأكيد الحذف؟")) return;
    await fetch(`/api/dashboard/preorder?id=${id}`, { method: "DELETE" });
    load();
  };

  const handleNotify = async (item: PreOrderItem) => {
    setNotifying(item.id);
    await fetch("/api/dashboard/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: item.id, product_name: item.name }),
    });
    setNotifying(null);
  };

  return (
    <div>
      <button onClick={() => setShowModal(true)} className="mb-6 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition text-sm">
        + إضافة منتج جديد للطلب المسبق
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border p-4 shadow-sm">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-36 object-cover rounded-lg mb-3" />
            ) : (
              <div className="w-full h-36 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400 text-3xl">📦</div>
            )}
            <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
            <p className="text-sm font-mono text-gray-600 mt-1">{item.price} EGP (سعر الحجر)</p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => handleNotify(item)}
                disabled={notifying === item.id}
                className="flex-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
              >
                {notifying === item.id ? "جاري..." : "🔔 إشعار بالتوفر"}
              </button>
              <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 border border-red-300 text-red-600 text-xs rounded-lg hover:bg-red-50">حذف</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">إضافة منتج للطلب المسبق</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">سعر الحجر</label>
                <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الصورة</label>
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} className="text-sm" />
                {form.image && <img src={form.image} alt="" className="w-20 h-20 rounded object-cover mt-2" />}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border rounded-lg text-sm font-bold">إغلاق</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">حفظ واستمرار</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
