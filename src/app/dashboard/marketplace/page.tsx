"use client";

import React, { useState, useEffect } from "react";

interface Library {
  id: string;
  name: string;
  email: string;
  commission: number;
  active: number;
}

export default function MarketplacePage() {
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", commission: "10" });

  const load = async () => {
    const res = await fetch("/api/dashboard/marketplace");
    const data = await res.json();
    setLibraries(data);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/dashboard/marketplace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, commission: parseFloat(form.commission) || 10 }),
    });
    setShowModal(false);
    setForm({ name: "", email: "", commission: "10" });
    load();
  };

  const handleToggle = async (id: string) => {
    await fetch(`/api/dashboard/marketplace?id=${id}`, { method: "PATCH" });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("تأكيد الحذف؟")) return;
    await fetch(`/api/dashboard/marketplace?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <button onClick={() => setShowModal(true)} className="mb-6 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition text-sm">
        + إضافة مكتبة جديدة
      </button>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600 font-bold">
              <th className="text-right p-4">الاسم</th>
              <th className="text-right p-4">البريد الإلكتروني</th>
              <th className="text-center p-4">نسبة العمولة</th>
              <th className="text-center p-4">الحالة</th>
              <th className="text-center p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {libraries.map((lib) => (
              <tr key={lib.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{lib.name}</td>
                <td className="p-4 text-gray-500">{lib.email}</td>
                <td className="p-4 text-center font-mono">{lib.commission}%</td>
                <td className="p-4 text-center">
                  <button onClick={() => handleToggle(lib.id)} className={`px-3 py-1 rounded-full text-xs font-bold ${lib.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {lib.active ? "مفعل" : "معطل"}
                  </button>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => handleDelete(lib.id)} className="text-red-500 hover:text-red-700 text-xs font-bold">حذف</button>
                </td>
              </tr>
            ))}
            {libraries.length === 0 && (
              <tr><td colSpan={5} className="text-center p-8 text-gray-400">لا توجد مكتبات مضافة</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">إضافة مكتبة جديدة</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نسبة العمولة (%)</label>
                <input type="number" step="0.1" value={form.commission} onChange={(e) => setForm({ ...form, commission: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
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
