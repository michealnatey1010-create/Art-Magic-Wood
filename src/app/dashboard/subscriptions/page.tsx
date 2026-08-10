import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DeleteSubscriptionButton from "./DeleteSubscriptionButton";

export const dynamic = "force-dynamic";

const typeLabels: Record<string, string> = {
  monthly: "شهري",
  quarterly: "فصلي",
  yearly: "سنوي",
};

const statusLabels: Record<string, string> = {
  pending: "قيد المراجعة",
  approved: "مقبول",
  rejected: "مرفوض",
};

export default async function SubscriptionsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const subscriptions = await prisma.subscription.findMany({
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="p-2" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📦 اشتراكات صندوق المعلم</h1>
          <p className="text-gray-500 text-sm">الاشتراكات المرسلة من التطبيق</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm">
          إجمالي الاشتراكات: {subscriptions.length}
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center text-gray-500 py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-lg">لا توجد اشتراكات حتى الآن</p>
          <p className="text-sm text-gray-400">ستظهر هنا اشتراكات صندوق المعلم المرسلة من التطبيق</p>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((s) => (
            <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {s.user_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{s.user_name}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-0.5">
                        <span>📱 {s.phone}</span>
                        {s.address && <span>📍 {s.address}</span>}
                        {s.sender_phone && <span>📤 {s.sender_phone}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      📦 {s.package_name || "بدون اسم باقة"}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                      {typeLabels[s.subscription_type] || s.subscription_type}
                    </span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      s.status === "approved" ? "bg-green-100 text-green-800" :
                      s.status === "rejected" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {statusLabels[s.status] || s.status}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                      🕐 {new Date(s.created_at).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                {s.receipt_image && (
                  <a
                    href={s.receipt_image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    🧾 عرض الإيصال
                  </a>
                )}
                <DeleteSubscriptionButton id={s.id} userName={s.user_name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}