"use client";

import React, { useState, useEffect } from "react";

interface InventoryRecord {
  id: string;
  merchantId: string;
  merchantName: string;
  merchantEmail: string;
  storeName: string;
  storeAddress: string;
  phone: string;
  fileUrl: string;
  fileName: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  approved: "مقبول",
  rejected: "مرفوض",
};

export default function MerchantInventoryPage() {
  const [records, setRecords] = useState<InventoryRecord[]>([]);

  const load = async () => {
    const res = await fetch("/api/merchant/inventory");
    const data = await res.json();
    setRecords(data.data || []);
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">📦 طلبات مخزون التجار</h2>
      <p className="text-sm text-gray-500 mb-6">الملفات التي يرفعها التجار من تطبيق Android</p>

      {records.length === 0 ? (
        <div className="text-center text-gray-500 py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-lg">لا توجد ملفات مخزون مرفوعة</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600 font-bold">
                <th className="text-right p-4">التاجر</th>
                <th className="text-right p-4">اسم المتجر</th>
                <th className="text-right p-4">العنوان</th>
                <th className="text-right p-4">الهاتف</th>
                <th className="text-center p-4">اسم الملف</th>
                <th className="text-center p-4">الملف</th>
                <th className="text-center p-4">الحالة</th>
                <th className="text-center p-4">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium">{r.merchantName || "-"}</div>
                    <div className="text-xs text-gray-400">{r.merchantEmail}</div>
                  </td>
                  <td className="p-4 text-gray-600">{r.storeName || "-"}</td>
                  <td className="p-4 text-gray-600">{r.storeAddress || "-"}</td>
                  <td className="p-4 text-gray-600" dir="ltr">{r.phone || "-"}</td>
                  <td className="p-4 text-gray-600">{r.fileName || "-"}</td>
                  <td className="p-4 text-center">
                    {r.fileUrl ? (
                      <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs font-bold underline hover:text-blue-800">
                        عرض/تحميل
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${statusColors[r.status] || "bg-gray-100 text-gray-700"}`}>
                      {statusLabels[r.status] || r.status}
                    </span>
                  </td>
                  <td className="p-4 text-center text-gray-500 text-xs">
                    {new Date(r.createdAt).toLocaleDateString("ar-EG")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}