"use client";

import { useRouter } from "next/navigation";

export default function DeleteSubscriptionButton({ id, userName }: { id: string; userName: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`هل تريد حذف اشتراك "${userName}" نهائياً؟`)) return;
    try {
      const res = await fetch(`/api/dashboard/subscriptions/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || data.message || "فشل الحذف");
      router.refresh();
    } catch (e) {
      alert("❌ " + (e instanceof Error ? e.message : "حدث خطأ"));
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="px-4 py-1.5 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors"
    >
      🗑️ حذف
    </button>
  );
}