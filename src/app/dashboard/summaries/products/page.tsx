"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Subject { id: string; name: string; grade?: { name: string; level?: { name: string } | null } | null; }
interface Summary {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  stock: number;
  subjectId: string;
  subject?: Subject | null;
}

export default function SummariesProductsPage() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "0", subjectId: "", image: "" });
  const [editing, setEditing] = useState<Summary | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const s = await fetch("/api/summaries/products");
    if (s.ok) setSummaries(await s.json());
    const sub = await fetch("/api/summaries/subjects");
    if (sub.ok) setSubjects(await sub.json());
  };

  useEffect(() => { load(); }, []);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "my_school_preset");
    const res = await fetch("https://api.cloudinary.com/v1_1/vyhjq4m7/image/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!data.secure_url) throw new Error(data.error?.message || "فشل رفع الصورة");
    return data.secure_url;
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try { setForm({ ...form, image: await uploadToCloudinary(file) }); }
    catch (err) { alert(err instanceof Error ? err.message : "فشل رفع الصورة"); }
    finally { setUploading(false); }
  };

  const openAdd = () => { setEditing(null); setForm({ name: "", description: "", price: "", stock: "0", subjectId: subjects[0]?.id || "", image: "" }); setShowModal(true); };
  const openEdit = (s: Summary) => { setEditing(s); setForm({ name: s.name, description: s.description || "", price: String(s.price ?? ""), stock: String(s.stock ?? 0), subjectId: s.subjectId, image: s.image || "" }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subjectId) return alert("اختر المادة");
    setSaving(true);
    try {
      const url = editing ? `/api/summaries/products/${editing.id}` : "/api/summaries/products";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) alert(data.error || "حدث خطأ");
      else { setShowModal(false); setEditing(null); }
      load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف الملخص؟")) return;
    const res = await fetch(`/api/summaries/products/${id}`, { method: "DELETE" });
    if (!res.ok) alert("حدث خطأ");
    load();
  };

  const subjectLabel = (s: Summary) =>
    s.subject
      ? `${s.subject.grade?.level?.name || ""} - ${s.subject.grade?.name || ""} - ${s.subject.name}`
      : "—";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button onClick={openAdd} disabled={subjects.length === 0} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-blue-300 transition text-sm">+ إضافة ملخص جديد</button>
        <Link href="/dashboard/summaries" className="text-sm text-gray-500 hover:text-blue-700">← العودة</Link>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right p-4">الصورة</th>
              <th className="text-right p-4">الاسم</th>
              <th className="text-right p-4">المادة / الصف</th>
              <th className="text-center p-4">السعر</th>
              <th className="text-center p-4">المخزون</th>
              <th className="text-center p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((s) => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-center">
                  {s.image ? <img src={s.image} alt={s.name} className="w-12 h-12 rounded object-cover" /> : <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">📄</div>}
                </td>
                <td className="p-4 font-medium">
                  {s.name}
                  {s.description && <div className="text-xs text-gray-400 max-w-[200px] truncate">{s.description}</div>}
                </td>
                <td className="p-4 text-gray-500">{subjectLabel(s)}</td>
                <td className="p-4 text-center font-mono">{s.price} ج.م</td>
                <td className={`p-4 text-center font-bold ${s.stock > 0 ? "text-green-600" : "text-red-500"}`}>{s.stock}</td>
                <td className="p-4 text-center">
                  <button onClick={() => openEdit(s)} className="px-3 py-1.5 border border-blue-300 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-50 ml-2">تعديل</button>
                  <button onClick={() => handleDelete(s.id)} className="px-3 py-1.5 border border-red-300 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50">حذف</button>
                </td>
              </tr>
            ))}
            {summaries.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">لا توجد ملخصات</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{editing ? "تعديل ملخص" : "إضافة ملخص"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الملخص <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المادة <span className="text-red-500">*</span></label>
                <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                  <option value="" disabled>اختر المادة</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.grade?.level?.name || ""} - {s.grade?.name || ""} - {s.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السعر (ج.م) <span className="text-red-500">*</span></label>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المخزون</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">صورة الملخص</label>
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} className="text-sm" disabled={uploading} />
                {uploading && <p className="text-xs text-blue-500 mt-1">جاري الرفع...</p>}
                {form.image ? <img src={form.image} alt="" className="w-full h-32 object-cover rounded-lg mt-2" /> : <p className="text-xs text-gray-400 mt-1 text-center">لا توجد صورة</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border rounded-lg text-sm font-bold">إلغاء</button>
                <button type="submit" disabled={saving || uploading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:bg-blue-300">{saving ? "جاري الحفظ..." : "حفظ"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}