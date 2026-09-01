"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Category {
  id: string;
  products: { stock: number; price: number }[];
}

export default function StationeryHomePage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/stationery/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const productCount = categories.reduce((acc, c) => acc + (c.products?.length || 0), 0);
  const totalStock = categories.reduce(
    (acc, c) => acc + (c.products || []).reduce((s, p) => s + (p.stock || 0), 0),
    0
  );
  const inventoryValue = categories.reduce(
    (acc, c) => acc + (c.products || []).reduce((s, p) => s + (p.price || 0) * (p.stock || 0), 0),
    0
  );

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <p className="text-sm text-gray-500">عدد الفئات</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{categories.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <p className="text-sm text-gray-500">عدد المنتجات</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{productCount}</p>
        </div>
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <p className="text-sm text-gray-500">المخزون الكلي</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalStock} قطعة</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-5 shadow-sm mb-6">
        <p className="text-sm text-gray-500">قيمة المخزون التقديرية</p>
        <p className="text-2xl font-bold text-blue-600 mt-1">{inventoryValue.toLocaleString("en")} ج.م</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/dashboard/stationery/categories" className="bg-white rounded-xl border p-6 shadow-sm hover:shadow-md transition group">
          <p className="text-3xl mb-2">🏷️</p>
          <p className="font-bold text-gray-900 group-hover:text-blue-700">إدارة الفئات</p>
          <p className="text-sm text-gray-500 mt-1">إضافة وتعديل وحذف فئات الأدوات المكتبية</p>
        </Link>
        <Link href="/dashboard/stationery/products" className="bg-white rounded-xl border p-6 shadow-sm hover:shadow-md transition group">
          <p className="text-3xl mb-2">📦</p>
          <p className="font-bold text-gray-900 group-hover:text-blue-700">إدارة المنتجات</p>
          <p className="text-sm text-gray-500 mt-1">إضافة وتعديل وحذف المنتجات مع رفع الصور</p>
        </Link>
      </div>
    </div>
  );
}