"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  order: number;
  products: { id: string }[];
}

export default function StationeryCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", icon: "", order: "0" });
  const [editing, setEditing] = useState<Category | null>(null);

  const load = async () => {
    const res = await fetch("/api/stationery/categories");
    if (res.ok) setCategories(await res.json());
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editing ? `/api/stationery/categories/${editing.id}` : "/api/stationery/categories";
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) alert(data.error || "حدث خطأ");
    setShowModal(false);
    setEditing(null);
    setForm({ name: "", description: "", icon: "", order: "0" });
    load();
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", description: "", icon: "", order: "0" });
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || "", icon: cat.icon || "", order: String(cat.order ?? 0) });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف الفئة؟ ستُحذف جميع منتجاتها أيضاً.")) return;
    const res = await fetch(`/api/stationery/categories/${id}?deleteProducts=true`, { method: "DELETE" });
    if (!res.ok) alert("حدث خطأ أثناء حذف الفئة");
    load();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => openAdd()} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition text-sm">
          + إضافة فئة جديدة
        </button>
        <Link href="/dashboard/stationery" className="text-sm text-gray-500 hover:text-blue-700">← العودة للإحصائيات</Link>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right p-4">الأيقونة</th>
              <th className="text-right p-4">الاسم</th>
              <th className="text-right p-4">الوصف</th>
              <th className="text-center p-4">الترتيب</th>
              <th className="text-center p-4">المنتجات</th>
              <th className="text-center p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-center text-xl">{cat.icon || "📁"}</td>
                <td className="p-4 font-medium">{cat.name}</td>
                <td className="p-4 text-gray-500">{cat.description || "—"}</td>
                <td className="p-4 text-center">{cat.order}</td>
                <td className="p-4 text-center">{cat.products?.length || 0}</td>
                <td className="p-4 text-center">
                  <button onClick={() => openEdit(cat)} className="px-3 py-1.5 border border-blue-300 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-50 ml-2">تعديل</button>
                  <button onClick={() => handleDelete(cat.id)} className="px-3 py-1.5 border border-red-300 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50">حذف</button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">لا توجد فئات — أضف فئة جديدة</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{editing ? "تعديل فئة" : "إضافة فئة"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الفئة <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الأيقونة</label>
                  <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="✏️" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الترتيب</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
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