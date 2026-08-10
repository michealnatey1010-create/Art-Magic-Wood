"use client";

import React, { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
  product_count: number;
}

interface MerchantProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  sku: string;
}

const roleLabels: Record<string, string> = {
  admin: "مشرف",
  MERCHANT: "🏪 تاجر",
  SCHOOL: "🏫 مدرسة",
  TEACHER: "👨‍🏫 معلم",
  STUDENT: "🎓 طالب",
};

const roleColors: Record<string, string> = {
  admin: "bg-blue-100 text-blue-700",
  MERCHANT: "bg-orange-100 text-orange-700",
  SCHOOL: "bg-purple-100 text-purple-700",
  TEACHER: "bg-blue-100 text-blue-700",
  STUDENT: "bg-green-100 text-green-700",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [modalVendor, setModalVendor] = useState<User | null>(null);
  const [products, setProducts] = useState<MerchantProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const load = async (q?: string) => {
    const url = q ? `/api/dashboard/users?search=${encodeURIComponent(q)}` : "/api/dashboard/users";
    const res = await fetch(url);
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    load(e.target.value);
  };

  const openProducts = async (vendor: User) => {
    setModalVendor(vendor);
    setLoadingProducts(true);
    const res = await fetch(`/api/merchant/products?vendorId=${vendor.id}`);
    const data = await res.json();
    setProducts(data);
    setLoadingProducts(false);
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`هل تريد حذف حساب "${user.name}" نهائياً؟`)) return;
    try {
      const res = await fetch(`/api/dashboard/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || data.message || "فشل الحذف");
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      alert(`✅ تم حذف حساب "${user.name}"`);
    } catch (e) {
      alert("❌ " + (e instanceof Error ? e.message : "حدث خطأ"));
    }
  };

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="بحث بالاسم أو البريد الإلكتروني..."
          className="w-full max-w-md px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600 font-bold">
              <th className="text-right p-4">الاسم</th>
              <th className="text-right p-4">البريد الإلكتروني</th>
              <th className="text-right p-4">رقم الهاتف</th>
              <th className="text-center p-4">نوع الحساب</th>
              <th className="text-center p-4">المنتجات</th>
              <th className="text-center p-4">تاريخ التسجيل</th>
              <th className="text-center p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{user.name}</td>
                <td className="p-4 text-gray-500">{user.email}</td>
                <td className="p-4 text-gray-500" dir="ltr">{user.phone || "—"}</td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${roleColors[user.role] || "bg-gray-100 text-gray-700"}`}>
                    {roleLabels[user.role] || user.role}
                  </span>
                </td>
                <td className="p-4 text-center">
                  {user.role === "MERCHANT" ? (
                    <button onClick={() => openProducts(user)} className="text-blue-600 hover:text-blue-800 text-xs font-bold underline">
                      {user.product_count} منتج
                    </button>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="p-4 text-center text-gray-500">{new Date(user.created_at).toLocaleDateString("ar-EG")}</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleDelete(user)}
                    className="px-3 py-1.5 border border-red-300 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors"
                  >
                    🗑️ حذف
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={7} className="text-center p-8 text-gray-400">لا يوجد مستخدمون</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalVendor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setModalVendor(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">منتجات {modalVendor.name}</h3>
              <button onClick={() => setModalVendor(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            {loadingProducts ? (
              <div className="text-center py-8 text-gray-400">جاري التحميل...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-gray-400">لا توجد منتجات لهذا التاجر</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div key={p.id} className="border rounded-xl p-4 bg-gray-50">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                    ) : (
                      <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center text-gray-400 text-3xl">📦</div>
                    )}
                    <h4 className="font-bold text-gray-900 text-sm">{p.name}</h4>
                    {p.description && <p className="text-xs text-gray-500 mt-1">{p.description}</p>}
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                      <span className="font-mono font-bold text-blue-600">{p.price} ج.م</span>
                      <span className={p.stock > 0 ? "text-green-600" : "text-red-500"}>{p.stock > 0 ? `المخزون: ${p.stock}` : "غير متوفر"}</span>
                    </div>
                    {p.sku && <p className="text-xs text-gray-400 mt-1">SKU: {p.sku}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
