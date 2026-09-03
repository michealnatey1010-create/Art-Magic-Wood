"use client";

import React, { useEffect, useState } from "react";

interface ReferralUser {
  id: string;
  name: string;
  email: string;
  referralCode: string | null;
  referralActive: boolean;
  points: number;
}

interface Settings {
  referralDiscount: number;
  referralPointsPerUse: number;
  minWithdrawalAmount: number;
}

export default function ReferralCodesPage() {
  const [users, setUsers] = useState<ReferralUser[]>([]);
  const [settings, setSettings] = useState<Settings>({ referralDiscount: 50, referralPointsPerUse: 30, minWithdrawalAmount: 100 });
  const [loading, setLoading] = useState(true);
  const [editingSettings, setEditingSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, settingsRes] = await Promise.all([
        fetch("/api/dashboard/users"),
        fetch("/api/referral/settings"),
      ]);
      const usersData = await usersRes.json();
      const settingsData = await settingsRes.json();
      if (usersData.users) setUsers(usersData.users.filter((u: ReferralUser) => u.referralCode));
      if (settingsData) setSettings(settingsData);
    } catch (e) {
      console.error("Error fetching data:", e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const toggleReferral = async (userId: string, active: boolean) => {
    await fetch("/api/referral/toggle", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, active }),
    });
    fetchData();
  };

  const saveSettings = async () => {
    await fetch("/api/referral/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tempSettings),
    });
    setSettings(tempSettings);
    setEditingSettings(false);
  };

  if (loading) return <div className="text-center py-8">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">إعدادات الإحالة</h3>
          <button
            onClick={() => editingSettings ? saveSettings() : (setTempSettings(settings), setEditingSettings(true))}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${editingSettings ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            {editingSettings ? "حفظ" : "تعديل"}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">خصم الطالب (جنيه)</label>
            {editingSettings ? (
              <input
                type="number"
                value={tempSettings.referralDiscount}
                onChange={(e) => setTempSettings({ ...tempSettings, referralDiscount: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            ) : (
              <p className="text-lg font-bold text-blue-600">{settings.referralDiscount} جنيه</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">نقاط المعلم لكل إحالة</label>
            {editingSettings ? (
              <input
                type="number"
                value={tempSettings.referralPointsPerUse}
                onChange={(e) => setTempSettings({ ...tempSettings, referralPointsPerUse: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            ) : (
              <p className="text-lg font-bold text-green-600">{settings.referralPointsPerUse} نقطة</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">الحد الأدنى للتحويل (نقطة)</label>
            {editingSettings ? (
              <input
                type="number"
                value={tempSettings.minWithdrawalAmount}
                onChange={(e) => setTempSettings({ ...tempSettings, minWithdrawalAmount: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            ) : (
              <p className="text-lg font-bold text-orange-600">{settings.minWithdrawalAmount} نقطة</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold text-gray-800">أكواد الإحالة</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-600">المعلم</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">البريد الإلكتروني</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">كود الإحالة</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">النقاط</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الحالة</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">لا توجد أكواد إحالة بعد</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{user.name}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-mono font-bold">
                        {user.referralCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.points}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.referralActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {user.referralActive ? "مفعّل" : "معطّل"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleReferral(user.id, !user.referralActive)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${user.referralActive ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                      >
                        {user.referralActive ? "تعطيل" : "تفعيل"}
                      </button>
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
