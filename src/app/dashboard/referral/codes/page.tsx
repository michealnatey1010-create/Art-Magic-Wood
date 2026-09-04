"use client";

import React, { useEffect, useState } from "react";

interface Teacher {
  id: string;
  name: string;
  email: string;
  referralCode: string | null;
  referralActive: boolean;
  referralDiscount: number;
  referralPointsPerUse: number;
}

export default function ReferralCodesPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [discount, setDiscount] = useState(50);
  const [pointsPerUse, setPointsPerUse] = useState(30);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/users");
      const data = await res.json();
      const users = Array.isArray(data) ? data : data.users || [];
      setTeachers(users.filter((u: any) => u.referralCode));
    } catch (e) {
      console.error("Error fetching teachers:", e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTeachers(); }, []);

  const toggleReferral = async (userId: string, active: boolean) => {
    try {
      const res = await fetch("/api/referral/toggle", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, active }),
      });
      if (res.ok) {
        fetchTeachers();
      } else {
        alert("فشل تحديث حالة الكود");
      }
    } catch {
      alert("حدث خطأ أثناء التحديث");
    }
  };

  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setDiscount(teacher.referralDiscount ?? 50);
    setPointsPerUse(teacher.referralPointsPerUse ?? 30);
  };

  const saveSettings = async () => {
    if (!editingTeacher) return;
    try {
      const res = await fetch("/api/referral/update-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingTeacher.id,
          discount,
          pointsPerUse,
        }),
      });
      if (res.ok) {
        setEditingTeacher(null);
        fetchTeachers();
      } else {
        alert("فشل حفظ الإعدادات");
      }
    } catch {
      alert("حدث خطأ أثناء الحفظ");
    }
  };

  if (loading) return <div className="text-center py-8">جاري التحميل...</div>;

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">🔑 أكواد الإحالة للمعلمين</h1>

      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المعلم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">البريد الإلكتروني</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">كود الإحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">خصم الطالب (ج.م)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نقاط المعلم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teachers.map((teacher) => (
              <tr key={teacher.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{teacher.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{teacher.email}</td>
                <td className="px-6 py-4 text-sm font-mono font-bold text-blue-600">
                  {teacher.referralCode || "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{teacher.referralDiscount ?? 50} ج.م</td>
                <td className="px-6 py-4 text-sm text-gray-700">{teacher.referralPointsPerUse ?? 30} نقطة</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    teacher.referralActive
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {teacher.referralActive ? "✅ مفعّل" : "⏳ غير مفعّل"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(teacher)}
                      className="px-3 py-1 text-sm rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => toggleReferral(teacher.id, !teacher.referralActive)}
                      className={`px-3 py-1 text-sm rounded ${
                        teacher.referralActive
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {teacher.referralActive ? "تعطيل" : "تفعيل"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {teachers.length === 0 && (
          <div className="text-center text-gray-500 py-12">لا يوجد معلمون مسجلون حتى الآن</div>
        )}
      </div>

      {editingTeacher && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setEditingTeacher(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">إعدادات الإحالة - {editingTeacher.name}</h3>
              <button onClick={() => setEditingTeacher(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">قيمة الخصم للطالب (ج.م)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">نقاط المعلم لكل إحالة</label>
                <input
                  type="number"
                  value={pointsPerUse}
                  onChange={(e) => setPointsPerUse(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  إلغاء
                </button>
                <button
                  onClick={saveSettings}
                  className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  حفظ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
