"use client";

import React, { useEffect, useState } from "react";

interface Teacher {
  id: string;
  name: string;
  email: string;
  referralCode: string | null;
  referralActive: boolean;
}

export default function ReferralCodesPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {teachers.length === 0 && (
          <div className="text-center text-gray-500 py-12">لا يوجد معلمون مسجلون حتى الآن</div>
        )}
      </div>
    </div>
  );
}
