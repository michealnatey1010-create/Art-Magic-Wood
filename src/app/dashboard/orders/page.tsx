"use client";

import React, { useState, useEffect } from "react";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  payment_phone: string;
  payment_receipt: string;
  items: string;
  total_amount: number;
  status: string;
  notes: string;
  source: string;
  created_at: string;
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
  supply: "سبورة المستلزمات",
  preorder: "الطلب المسبق",
  teacher: "صندوق المعلم",
};

const sourceIcons: Record<string, string> = {
  supply: "📋",
  preorder: "🛒",
  teacher: "📦",
};

const filters = [
  { value: "", label: "الكل", icon: "📋" },
  { value: "supply", label: "سبورة المستلزمات", icon: "📋" },
  { value: "teacher", label: "صندوق المعلم", icon: "📦" },
  { value: "preorder", label: "الطلب المسبق", icon: "🛒" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState("");

  const load = async () => {
    const url = filter ? `/api/dashboard/orders?source=${filter}` : "/api/dashboard/orders";
    const res = await fetch(url);
    const data = await res.json();
    setOrders(data);
  };

  useEffect(() => { load(); }, [filter]);

  const handleStatus = async (id: string, status: string) => {
    await fetch(`/api/dashboard/orders?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
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
          {orders.map((order) => {
            let itemsDisplay = "—";
            try {
              const parsed = JSON.parse(order.items);
              if (Array.isArray(parsed) && parsed.length > 0) {
                itemsDisplay = parsed.map((i: any) => i.name || i).join("، ");
              }
            } catch { /* ignore */ }

            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {order.customer_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{order.customer_name}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span>📱 {order.customer_phone}</span>
                          {order.payment_phone && <span>💳 {order.payment_phone}</span>}
                          {order.source && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                              {sourceIcons[order.source]} {sourceLabels[order.source] || order.source}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {order.customer_address && (
                      <div className="text-sm text-gray-600 mr-13">
                        <span className="font-medium">📍 العنوان:</span> {order.customer_address}
                      </div>
                    )}

                    <div className="text-sm text-gray-600 mr-13">
                      <span className="font-medium">🛒 الطلب:</span> {itemsDisplay}
                    </div>

                    {order.total_amount > 0 && (
                      <div className="text-sm font-bold text-blue-600 mr-13">
                        💰 {order.total_amount} ج.م
                      </div>
                    )}

                    {order.notes && (
                      <div className="text-sm text-gray-500 mr-13">
                        📝 {order.notes}
                      </div>
                    )}

                    {order.payment_receipt && (
                      <div className="mr-13 mt-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          🖼 عرض وصل الدفع
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      🕐 {new Date(order.created_at).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
                  {order.status === "pending" && (
                    <>
                      <button onClick={() => handleStatus(order.id, "confirmed")} className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">تأكيد الطلب</button>
                      <button onClick={() => handleStatus(order.id, "cancelled")} className="px-4 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200">إلغاء</button>
                    </>
                  )}
                  {order.status === "confirmed" && (
                    <button onClick={() => handleStatus(order.id, "shipped")} className="px-4 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">تم الشحن</button>
                  )}
                  {order.status === "shipped" && (
                    <button onClick={() => handleStatus(order.id, "delivered")} className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">تم التوصيل</button>
                  )}
                  <button onClick={() => handleDelete(order.id)} className="px-4 py-1.5 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50">حذف</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedOrder && selectedOrder.payment_receipt && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl p-4 max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold">وصل الدفع - {selectedOrder.customer_name}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
            </div>
            <img
              src={selectedOrder.payment_receipt}
              alt="وصل الدفع"
              className="w-full rounded-lg"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        </div>
      )}
    </div>
  );
}