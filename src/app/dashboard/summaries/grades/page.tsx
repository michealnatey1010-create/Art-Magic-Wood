"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Level { id: string; name: string; }
interface Grade {
  id: string;
  name: string;
  order: number;
  levelId: string;
  level?: Level | null;
  subjects: { id: string }[];
}

export default function SummariesGradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", order: "0", levelId: "" });
  const [editing, setEditing] = useState<Grade | null>(null);

  const load = async () => {
    const g = await fetch("/api/summaries/grades");
    if (g.ok) setGrades(await g.json());
    const l = await fetch("/api/summaries/levels");
    if (l.ok) setLevels(await l.json());
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: "", order: "0", levelId: levels[0]?.id || "" }); setShowModal(true); };
  const openEdit = (gr: Grade) => { setEditing(gr); setForm({ name: gr.name, order: String(gr.order ?? 0), levelId: gr.levelId }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.levelId) return alert("اختر المرحلة");
    const url = editing ? `/api/summaries/grades/${editing.id}` : "/api/summaries/grades";
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
    if (!confirm("حذف الصف؟ ستُحذف المواد والملخصات التابعة له.")) return;
    const res = await fetch(`/api/summaries/grades/${id}`, { method: "DELETE" });
    if (!res.ok) alert("حدث خطأ");
    load();
  };

  const levelName = (levelId: string) => levels.find((l) => l.id === levelId)?.name || "—";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button onClick={openAdd} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition text-sm">+ إضافة صف جديد</button>
        <Link href="/dashboard/summaries" className="text-sm text-gray-500 hover:text-blue-700">← العودة</Link>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right p-4">الاسم</th>
              <th className="text-right p-4">المرحلة</th>
              <th className="text-center p-4">الترتيب</th>
              <th className="text-center p-4">المواد</th>
              <th className="text-center p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((gr) => (
              <tr key={gr.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{gr.name}</td>
                <td className="p-4 text-gray-500">{levelName(gr.levelId)}</td>
                <td className="p-4 text-center">{gr.order}</td>
                <td className="p-4 text-center">{gr.subjects?.length || 0}</td>
                <td className="p-4 text-center">
                  <button onClick={() => openEdit(gr)} className="px-3 py-1.5 border border-blue-300 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-50 ml-2">تعديل</button>
                  <button onClick={() => handleDelete(gr.id)} className="px-3 py-1.5 border border-red-300 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50">حذف</button>
                </td>
              </tr>
            ))}
            {grades.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">لا توجد صفوف</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{editing ? "تعديل صف" : "إضافة صف"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الصف <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required placeholder="الأول" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المرحلة <span className="text-red-500">*</span></label>
                <select value={form.levelId} onChange={(e) => setForm({ ...form, levelId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                  <option value="" disabled>اختر المرحلة</option>
                  {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
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