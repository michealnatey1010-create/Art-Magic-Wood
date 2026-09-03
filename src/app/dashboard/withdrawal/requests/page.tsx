"use client";

import React, { useEffect, useState } from "react";

interface WithdrawalRequest {
  id: string;
  amount: number;
  pointsUsed: number;
  phoneNumber: string;
  bankName: string | null;
  accountNumber: string | null;
  adminNotes: string | null;
  status: string;
  createdAt: string;
  user: { id: string; name: string; email: string; points: number };
}

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  approved: "تمت الموافقة",
  rejected: "مرفوض",
  completed: "مكتمل",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800",
};

export default function WithdrawalRequestsPage() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    const url = filter ? `/api/withdrawal/requests?status=${filter}` : "/api/withdrawal/requests";
    try {
      const res = await fetch(url);
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching requests:", e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/withdrawal/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNotes: notes || undefined }),
    });
    setEditingNotes(null);
    setNotes("");
    fetchRequests();
  };

  if (loading) return <div className="text-center py-8">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        {["", "pending", "approved", "rejected", "completed"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === s ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border"}`}
          >
            {s === "" ? "الكل" : statusLabels[s]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-600">المعلم</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">المبلغ</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">النقاط</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">رقم الهاتف</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">البنك</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الحالة</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">التاريخ</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">لا توجد طلبات</td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{req.user.name}</div>
                      <div className="text-xs text-gray-500">{req.user.email}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-blue-600">{req.amount} جنيه</td>
                    <td className="px-4 py-3 text-gray-600">{req.pointsUsed} نقطة</td>
                    <td className="px-4 py-3 text-gray-600">{req.phoneNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{req.bankName || "-"}<br />{req.accountNumber || ""}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[req.status] || ""}`}>
                        {statusLabels[req.status] || req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(req.createdAt).toLocaleDateString("ar-EG")}</td>
                    <td className="px-4 py-3">
                      {req.status === "pending" && (
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={() => updateStatus(req.id, "approved")} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200">قبول</button>
                          <button onClick={() => updateStatus(req.id, "rejected")} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200">رفض</button>
                        </div>
                      )}
                      {req.status === "approved" && (
                        <button onClick={() => updateStatus(req.id, "completed")} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200">إكمال</button>
                      )}
                      {editingNotes === req.id ? (
                        <div className="mt-1">
                          <input
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="ملاحظات..."
                            className="border rounded px-2 py-1 text-xs w-full"
                          />
                          <button onClick={() => updateStatus(req.id, req.status)} className="text-xs text-blue-600 mt-1">حفظ</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingNotes(req.id); setNotes(req.adminNotes || ""); }} className="text-xs text-gray-500 hover:text-gray-700 mt-1 block">ملاحظات</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
