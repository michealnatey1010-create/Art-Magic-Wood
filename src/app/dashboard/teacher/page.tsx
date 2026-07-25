"use client";

import React, { useState, useEffect } from "react";

interface Feature {
  id: string;
  text: string;
}

interface Package {
  id: string;
  name: string;
  monthly_price: number;
  quarterly_price: number;
  features: Feature[];
}

export default function TeacherPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", monthlyPrice: "", quarterlyPrice: "", features: [""] });

  const load = async () => {
    const res = await fetch("/api/dashboard/teacher");
    const data = await res.json();
    setPackages(data);
  };

  useEffect(() => { load(); }, []);

  const addFeature = () => setForm({ ...form, features: [...form.features, ""] });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/dashboard/teacher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        monthlyPrice: parseFloat(form.monthlyPrice) || 0,
        quarterlyPrice: parseFloat(form.quarterlyPrice) || 0,
        features: form.features.filter((f) => f.trim()),
      }),
    });
    setShowModal(false);
    setForm({ name: "", monthlyPrice: "", quarterlyPrice: "", features: [""] });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("تأكيد الحذف؟")) return;
    await fetch(`/api/dashboard/teacher?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <button onClick={() => setShowModal(true)} className="mb-6 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition text-sm">
        + إضافة اشتراك جديد
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-xl border p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-gray-900">{pkg.name}</h3>
              <button onClick={() => handleDelete(pkg.id)} className="text-red-500 hover:text-red-700 text-sm">حذف</button>
            </div>
            <div className="space-y-1 text-sm mb-3">
              <p className="text-gray-500">شهري: <span className="font-bold text-gray-800">{pkg.monthly_price} EGP</span></p>
              <p className="text-gray-500">فصلي: <span className="font-bold text-gray-800">{pkg.quarterly_price} EGP</span></p>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              {pkg.features.map((f, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="text-green-500">✓</span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">إضافة باقة اشتراك</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الباقة</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السعر الشهري</label>
                  <input type="number" step="0.01" value={form.monthlyPrice} onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السعر الفصلي</label>
                  <input type="number" step="0.01" value={form.quarterlyPrice} onChange={(e) => setForm({ ...form, quarterlyPrice: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">المميزات</label>
                  <button type="button" onClick={addFeature} className="text-blue-600 text-sm font-bold">+ إضافة ميزة</button>
                </div>
                <div className="space-y-2">
                  {form.features.map((feat, idx) => (
                    <input key={idx} type="text" placeholder="ميزة" value={feat} onChange={(e) => { const f = [...form.features]; f[idx] = e.target.value; setForm({ ...form, features: f }); }} className="w-full px-3 py-1.5 border rounded text-sm" />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border rounded-lg text-sm font-bold">إلغاء</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
