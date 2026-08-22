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
  image?: string;
  features: Feature[];
}

export default function TeacherPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", monthlyPrice: "", quarterlyPrice: "", features: [""] });
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const [editPkg, setEditPkg] = useState<Package | null>(null);
  const [editForm, setEditForm] = useState({ name: "", monthlyPrice: "", quarterlyPrice: "", features: [""] as string[] });
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editUploading, setEditUploading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const load = async () => {
    const res = await fetch("/api/dashboard/teacher");
    const data = await res.json();
    setPackages(data);
  };

  useEffect(() => { load(); }, []);

  const addFeature = () => setForm({ ...form, features: [...form.features, ""] });

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

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setImageUrl(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/dashboard/teacher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        monthlyPrice: parseFloat(form.monthlyPrice) || 0,
        quarterlyPrice: parseFloat(form.quarterlyPrice) || 0,
        image: imageUrl,
        features: form.features.filter((f) => f.trim()),
      }),
    });
    setShowModal(false);
    setImageUrl("");
    setForm({ name: "", monthlyPrice: "", quarterlyPrice: "", features: [""] });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("تأكيد الحذف؟")) return;
    await fetch(`/api/dashboard/teacher?id=${id}`, { method: "DELETE" });
    load();
  };

  const openEdit = (pkg: Package) => {
    setEditPkg(pkg);
    setEditForm({
      name: pkg.name,
      monthlyPrice: String(pkg.monthly_price ?? ""),
      quarterlyPrice: String(pkg.quarterly_price ?? ""),
      features: pkg.features.map((f) => f.text),
    });
    setEditImageUrl(pkg.image || "");
  };

  const closeEdit = () => {
    setEditPkg(null);
    setEditImageUrl("");
  };

  const uploadEditImage = async (file: File) => {
    setEditUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setEditImageUrl(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "فشل رفع الصورة");
    } finally {
      setEditUploading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPkg) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/teacher-packages/${editPkg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          monthlyPrice: parseFloat(editForm.monthlyPrice) || 0,
          quarterlyPrice: parseFloat(editForm.quarterlyPrice) || 0,
          image: editImageUrl,
          features: editForm.features.filter((f) => f.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) alert(data.error || "حدث خطأ");
    } finally {
      setSavingEdit(false);
    }
    closeEdit();
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
            {pkg.image ? (
              <img src={pkg.image} alt={pkg.name} className="w-full h-36 object-cover rounded-lg mb-3" />
            ) : (
              <div className="w-full h-36 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400 text-3xl">📦</div>
            )}
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-gray-900">{pkg.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => openEdit(pkg)} className="text-blue-600 hover:text-blue-700 text-sm">تعديل</button>
                <button onClick={() => handleDelete(pkg.id)} className="text-red-500 hover:text-red-700 text-sm">حذف</button>
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">صورة الباقة</label>
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} className="text-sm" disabled={uploading} />
                {uploading && <p className="text-xs text-blue-500 mt-1">جاري الرفع...</p>}
                {imageUrl && <img src={imageUrl} alt="" className="w-full h-32 object-cover rounded-lg mt-2" />}
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

      {editPkg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={closeEdit}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">تعديل باقة: {editForm.name}</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الباقة</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السعر الشهري</label>
                  <input type="number" step="0.01" value={editForm.monthlyPrice} onChange={(e) => setEditForm({ ...editForm, monthlyPrice: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السعر الفصلي</label>
                  <input type="number" step="0.01" value={editForm.quarterlyPrice} onChange={(e) => setEditForm({ ...editForm, quarterlyPrice: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">صورة الباقة</label>
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadEditImage(e.target.files[0])} className="text-sm" disabled={editUploading} />
                {editUploading && <p className="text-xs text-blue-500 mt-1">جاري الرفع...</p>}
                {editImageUrl ? (
                  <img src={editImageUrl} alt="" className="w-full h-32 object-cover rounded-lg mt-2" />
                ) : (
                  <p className="text-xs text-gray-400 mt-1">لا توجد صورة</p>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">المميزات</label>
                  <button type="button" onClick={() => setEditForm({ ...editForm, features: [...editForm.features, ""] })} className="text-blue-600 text-sm font-bold">+ إضافة ميزة</button>
                </div>
                <div className="space-y-2">
                  {editForm.features.map((feat, idx) => (
                    <input key={idx} type="text" placeholder="ميزة" value={feat} onChange={(e) => { const f = [...editForm.features]; f[idx] = e.target.value; setEditForm({ ...editForm, features: f }); }} className="w-full px-3 py-1.5 border rounded text-sm" />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeEdit} className="flex-1 py-2.5 border rounded-lg text-sm font-bold">إلغاء</button>
                <button type="submit" disabled={savingEdit} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:bg-blue-300">{savingEdit ? "جاري الحفظ..." : "حفظ التعديلات"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
