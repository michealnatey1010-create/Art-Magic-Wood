"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";

const sidebarItems = [
  { href: "/dashboard", label: "الإحصائيات", icon: "📊" },
  { href: "/dashboard/supply", label: "سبورة المستلزمات", icon: "📋" },
  { href: "/dashboard/stationery", label: "الأدوات المكتبية", icon: "📎" },
  { href: "/dashboard/teacher", label: "صندوق المعلم", icon: "📦" },
  { href: "/dashboard/subscriptions", label: "اشتراكات المعلم", icon: "🧾" },
  { href: "/dashboard/preorder", label: "الطلب المسبق", icon: "🛒" },
  { href: "/dashboard/orders", label: "الطلبات", icon: "📋" },
  { href: "/dashboard/merchant-inventory", label: "مخزون التجار", icon: "📦" },
  { href: "/dashboard/proposals", label: "مقترحات الحزم", icon: Package },
  { href: "/dashboard/users", label: "المستخدمون", icon: "👥" },
];

function IconRender({ icon, collapsed }: { icon: any; collapsed: boolean }) {
  if (typeof icon === "string") {
    return <span className="text-lg">{icon}</span>;
  }
  const IconComp = icon;
  return <IconComp size={20} className={collapsed ? "mx-auto" : ""} />;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) setUserName(name);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("userName");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50" dir="rtl">
      <aside className={`bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
        <div className="p-4 border-b flex items-center justify-between">
          {!collapsed && <span className="font-bold text-lg text-blue-600">Art-Magic-Wood</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="text-gray-500 hover:text-gray-700 p-1">
            {collapsed ? "☰" : "✕"}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <IconRender icon={item.icon} collapsed={collapsed} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition"
          >
            <span>🚪</span>
            {!collapsed && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {sidebarItems.find((i) => i.href === pathname)?.label || "لوحة التحكم"}
              </h2>
            </div>
            {userName && (
              <div className="text-sm text-gray-500">
                مرحباً، <span className="font-bold text-gray-700">{userName}</span>
              </div>
            )}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
