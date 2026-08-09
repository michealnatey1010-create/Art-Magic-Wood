"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";

interface Proposal {
  id: string;
  teacher_name: string;
  teacher_phone: string;
  teacher_email: string;
  package_details: string;
  status: string;
  created_at: string;
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selected, setSelected] = useState<Proposal | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    const res = await fetch("/api/teacher/propose-package");
    const data = await res.json();
    const items = Array.isArray(data) ? data : data?.data || [];
    setProposals(items);
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/teacher/proposals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "فشل التحديث");
      setProposals((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
      showToast("success", status === "approved" ? "تم قبول الاقتراح ✅" : "تم رفض الاقتراح ❌");
    } catch (e) {
      showToast("error", e instanceof Error ? e.message : "حدث خطأ");
    }
  };

  return (
    <div className="p-6" dir="rtl">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-bold ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📦 مقترحات الحزم التعليمية</h1>
          <p className="text-gray-500 text-sm">عرض اقتراحات المعلمين للحزم الخاصة بهم</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm">
          إجمالي الاقتراحات: {proposals.length}
        </div>
      </div>

      {proposals.length === 0 ? (
        <div className="text-center text-gray-500 py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-lg">لا توجد مقترحات حتى الآن</p>
          <p className="text-sm text-gray-400">سيظهر هنا اقتراحات المعلمين عند إرسالها من التطبيق</p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {proposal.teacher_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{proposal.teacher_name}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-0.5">
                        <span>📱 {proposal.teacher_phone}</span>
                        {proposal.teacher_email && (
                          <span>✉️ {proposal.teacher_email}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-1">📝 تفاصيل الحزمة المقترحة</p>
                    <p className="text-sm text-gray-700 line-clamp-3">{proposal.package_details}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    proposal.status === "approved" ? "bg-green-100 text-green-800" :
                    proposal.status === "rejected" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {proposal.status === "approved" ? "✅ مقبول" :
                     proposal.status === "rejected" ? "❌ مرفوض" :
                     "⏳ قيد المراجعة"}
                  </span>
                  <span className="text-xs text-gray-400">
                    🕐 {new Date(proposal.created_at).toLocaleDateString("ar-EG")}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                {proposal.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleStatus(proposal.id, "approved")}
                      className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      ✅ قبول
                    </button>
                    <button
                      onClick={() => handleStatus(proposal.id, "rejected")}
                      className="px-4 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      ❌ رفض
                    </button>
                  </>
                )}
                {proposal.status === "approved" && (
                  <span className="px-4 py-1.5 bg-green-100 text-green-800 text-sm rounded-lg font-bold">✅ تم القبول</span>
                )}
                {proposal.status === "rejected" && (
                  <span className="px-4 py-1.5 bg-red-100 text-red-800 text-sm rounded-lg font-bold">❌ تم الرفض</span>
                )}
                <button
                  onClick={() => setSelected(proposal)}
                  className="px-4 py-1.5 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  📋 عرض التفاصيل
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">تفاصيل الاقتراح</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">الاسم:</span>
                <span className="font-bold">{selected.teacher_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">البريد الإلكتروني:</span>
                <span className="font-bold" dir="ltr">{selected.teacher_email || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">رقم الهاتف:</span>
                <span className="font-bold" dir="ltr">{selected.teacher_phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">تاريخ الإرسال:</span>
                <span className="font-bold">{new Date(selected.created_at).toLocaleDateString("ar-EG")}</span>
              </div>
              <div>
                <p className="text-gray-500 mb-1">تفاصيل الحزمة المقترحة:</p>
                <div className="p-3 bg-gray-50 rounded-lg border text-gray-700 whitespace-pre-wrap">
                  {selected.package_details}
                </div>
              </div>
              <div>
                <p className="text-gray-500 mb-1">الحالة:</p>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  selected.status === "approved" ? "bg-green-100 text-green-800" :
                  selected.status === "rejected" ? "bg-red-100 text-red-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {selected.status === "approved" ? "✅ مقبول" :
                   selected.status === "rejected" ? "❌ مرفوض" :
                   "⏳ قيد المراجعة"}
                </span>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setSelected(null)} className="flex-1 py-2.5 border rounded-lg text-sm font-bold">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}