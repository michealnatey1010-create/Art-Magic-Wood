import { getDashboardStats } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "المنتجات", value: stats.products, color: "bg-blue-500" },
    { label: "المراحل الدراسية", value: stats.stages, color: "bg-green-500" },
    { label: "باقات المعلم", value: stats.packages, color: "bg-purple-500" },
    { label: "منتجات الطلب المسبق", value: stats.preorders, color: "bg-yellow-500" },
    { label: "المكتبات الشريكة", value: stats.libraries, color: "bg-pink-500" },
    { label: "المستخدمون", value: stats.users, color: "bg-indigo-500" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-xl border p-6 shadow-sm">
          <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-white text-xl font-bold mb-4`}>
            {card.value}
          </div>
          <h3 className="text-lg font-bold text-gray-900">{card.value}</h3>
          <p className="text-sm text-gray-500">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
