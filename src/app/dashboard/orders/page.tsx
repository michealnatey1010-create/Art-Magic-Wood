"use client";

import React, { useState, useEffect } from "react";

interface Order {
  id: string;
  userId: string;
  source: string;
  itemId: string;
  itemName: string;
  price: number;
  discount: number;
  pointsUsed: number;
  pointsEarned: number;
  status: string;
  receiptImage?: string | null;
  address?: string | null;
  phone?: string | null;
  senderPhone?: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string; phone: string };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "تم التأكيد",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
};

const sourceLabels: Record<string, string> = {
  stage: "سبورة المستلزمات",
  preorder: "الطلب المسبق",
  teacher_box: "صندوق المعلم",
};

const sourceIcons: Record<string, string> = {
  stage: "📋",
  preorder: "🛒",
  teacher_box: "📦",
};

const filters = [
  { value: "", label: "الكل", icon: "📋" },
  { value: "stage", label: "سبورة المستلزمات", icon: "📋" },
  { value: "teacher_box", label: "صندوق المعلم", icon: "📦" },
  { value: "preorder", label: "الطلب المسبق", icon: "🛒" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("");

  const load = async () => {
    const url = filter ? `/api/dashboard/orders?source=${filter}` : "/api/dashboard/orders";
    const res = await fetch(url);
    const data = await res.json();
    setOrders(data);
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (data.success) {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId ? { ...order, status } : order
          )
        );
        alert(`✅ تم ${status === 'confirmed' ? 'تأكيد' : status === 'shipped' ? 'شحن' : 'توصيل'} الطلب بنجاح`);
      } else {
        alert('❌ فشل تحديث الحالة: ' + (data.error || data.message || 'خطأ غير معروف'));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ حدث خطأ في الاتصال');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("تأكيد حذف الطلب؟")) return;
    await fetch(`/api/dashboard/orders?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📋 قائمة الطلبات</h1>
          <p className="text-gray-500 text-sm">عرض وإدارة طلبات الشراء</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm">
          إجمالي الطلبات: {orders.length}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              filter === f.value
                ? "bg-blue-600 text-white shadow"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="text-center text-gray-500 py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-lg">لا توجد طلبات حتى الآن</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {order.user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{order.user?.name || "غير معروف"}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span>📱 {order.phone || order.user?.phone || order.user?.email || "—"}</span>
                        <span>📍 {order.address || "—"}</span>
                        <span>📤 مرسل منه: {order.senderPhone || "—"}</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                          {sourceIcons[order.source]} {sourceLabels[order.source] || order.source}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mr-13">
                    <span className="font-medium">🛒 المنتج:</span> {order.itemName}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm text-gray-600">🧾 إيصال الدفع:</span>
                    {order.receiptImage ? (
                      <a href={order.receiptImage} target="_blank" rel="noopener noreferrer">
                        <img src={order.receiptImage} alt="إيصال الدفع" className="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition" />
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">لا يوجد إيصال</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="font-bold text-blue-600">💰 {order.price} ج.م</span>
                    {order.discount > 0 && <span className="text-green-600">خصم: {order.discount} ج.م</span>}
                    {order.pointsUsed > 0 && <span className="text-purple-600">نقاط مستخدمة: {order.pointsUsed}</span>}
                    {order.pointsEarned > 0 && <span className="text-orange-600">نقاط مكتسبة: {order.pointsEarned}</span>}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    🕐 {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
                {order.status === "pending" && (
                  <>
                    <button onClick={() => updateStatus(order.id, "confirmed")} className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">تأكيد الطلب</button>
                    <button onClick={() => updateStatus(order.id, "cancelled")} className="px-4 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200">إلغاء</button>
                  </>
                )}
                {order.status === "confirmed" && (
                  <button onClick={() => updateStatus(order.id, "shipped")} className="px-4 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">تم الشحن</button>
                )}
                {order.status === "shipped" && (
                  <button onClick={() => updateStatus(order.id, "delivered")} className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">تم التوصيل</button>
                )}
                <button onClick={() => handleDelete(order.id)} className="px-4 py-1.5 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50">حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}