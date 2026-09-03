"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Level {
  id: string;
  name: string;
  order: number;
  grades: { id: string }[];
}

export default function SummariesLevelsPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", order: "0" });
  const [editing, setEditing] = useState<Level | null>(null);

  const load = async () => {
    const res = await fetch("/api/summaries/levels");
    if (res.ok) setLevels(await res.json());
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: "", order: "0" }); setShowModal(true); };
  const openEdit = (l: Level) => { setEditing(l); setForm({ name: l.name, order: String(l.order ?? 0) }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editing ? `/api/summaries/levels/${editing.id}` : "/api/summaries/levels";
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) alert(data.error || "حدث خطأ");
    setShowModal(false); setEditing(null); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف المرحلة؟ ستُحذف جميع الصفوف والمواد والملخصات التابعة لها.")) return;
    const res = await fetch(`/api/summaries/levels/${id}`, { method: "DELETE" });
    if (!res.ok) alert("حدث خطأ");
    load();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button onClick={openAdd} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition text-sm">+ إضافة مرحلة جديدة</button>
        <Link href="/dashboard/summaries" className="text-sm text-gray-500 hover:text-blue-700">← العودة</Link>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right p-4">الاسم</th>
              <th className="text-center p-4">الترتيب</th>
              <th className="text-center p-4">الصفوف</th>
              <th className="text-center p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((l) => (
              <tr key={l.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{l.name}</td>
                <td className="p-4 text-center">{l.order}</td>
                <td className="p-4 text-center">{l.grades?.length || 0}</td>
                <td className="p-4 text-center">
                  <button onClick={() => openEdit(l)} className="px-3 py-1.5 border border-blue-300 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-50 ml-2">تعديل</button>
                  <button onClick={() => handleDelete(l.id)} className="px-3 py-1.5 border border-red-300 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50">حذف</button>
                </td>
              </tr>
            ))}
            {levels.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-400">لا توجد مراحل</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{editing ? "تعديل مرحلة" : "إضافة مرحلة"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المرحلة <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required placeholder="ابتدائي" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الترتيب</label>
                <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
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