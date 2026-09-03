"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Grade { id: string; name: string; level?: { name: string } | null; }
interface Subject {
  id: string;
  name: string;
  order: number;
  gradeId: string;
  grade?: Grade | null;
  summaries: { id: string }[];
}

export default function SummariesSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", order: "0", gradeId: "" });
  const [editing, setEditing] = useState<Subject | null>(null);

  const load = async () => {
    const s = await fetch("/api/summaries/subjects");
    if (s.ok) setSubjects(await s.json());
    const g = await fetch("/api/summaries/grades");
    if (g.ok) setGrades(await g.json());
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: "", order: "0", gradeId: grades[0]?.id || "" }); setShowModal(true); };
  const openEdit = (s: Subject) => { setEditing(s); setForm({ name: s.name, order: String(s.order ?? 0), gradeId: s.gradeId }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.gradeId) return alert("اختر الصف");
    const url = editing ? `/api/summaries/subjects/${editing.id}` : "/api/summaries/subjects";
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
    if (!confirm("حذف المادة؟ ستُحذف الملخصات التابعة لها.")) return;
    const res = await fetch(`/api/summaries/subjects/${id}`, { method: "DELETE" });
    if (!res.ok) alert("حدث خطأ");
    load();
  };

  const gradeLabel = (subject: Subject) =>
    subject.grade
      ? `${subject.grade.level?.name || ""} - ${subject.grade.name}`
      : grades.find((g) => g.id === subject.gradeId)
        ? `${grades.find((g) => g.id === subject.gradeId)?.level?.name || ""} - ${grades.find((g) => g.id === subject.gradeId)?.name}`
        : "—";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button onClick={openAdd} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition text-sm">+ إضافة مادة جديدة</button>
        <Link href="/dashboard/summaries" className="text-sm text-gray-500 hover:text-blue-700">← العودة</Link>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right p-4">الاسم</th>
              <th className="text-right p-4">الصف / المرحلة</th>
              <th className="text-center p-4">الترتيب</th>
              <th className="text-center p-4">الملخصات</th>
              <th className="text-center p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{s.name}</td>
                <td className="p-4 text-gray-500">{gradeLabel(s)}</td>
                <td className="p-4 text-center">{s.order}</td>
                <td className="p-4 text-center">{s.summaries?.length || 0}</td>
                <td className="p-4 text-center">
                  <button onClick={() => openEdit(s)} className="px-3 py-1.5 border border-blue-300 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-50 ml-2">تعديل</button>
                  <button onClick={() => handleDelete(s.id)} className="px-3 py-1.5 border border-red-300 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50">حذف</button>
                </td>
              </tr>
            ))}
            {subjects.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">لا توجد مواد</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{editing ? "تعديل مادة" : "إضافة مادة"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المادة <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required placeholder="عربي" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الصف <span className="text-red-500">*</span></label>
                <select value={form.gradeId} onChange={(e) => setForm({ ...form, gradeId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                  <option value="" disabled>اختر الصف</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>{g.level?.name || ""} - {g.name}</option>
                  ))}
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