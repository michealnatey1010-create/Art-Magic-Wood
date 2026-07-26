import prisma from "@/lib/prisma";

function getRoleBadge(role: string) {
  const styles: Record<string, string> = {
    SCHOOL: "bg-purple-100 text-purple-800",
    TEACHER: "bg-blue-100 text-blue-800",
    MERCHANT: "bg-orange-100 text-orange-800",
    STUDENT: "bg-green-100 text-green-800",
  };
  const icons: Record<string, string> = {
    SCHOOL: "🏫 مدرسة",
    TEACHER: "👨‍🏫 معلم",
    MERCHANT: "🏪 تاجر",
    STUDENT: "🎓 طالب",
  };
  const cls = styles[role] || "bg-gray-100 text-gray-800";
  const label = icons[role] || "👤 ولي أمر";
  return { cls, label };
}

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { created_at: "desc" } });

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">👥 المستخدمون المسجلون</h1>

      {users.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-xl">لا يوجد مستخدمون مسجلون حتى الآن</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الهاتف</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">البريد الإلكتروني</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الدور</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user: any, index: number) => {
                const { cls, label } = getRoleBadge(user.role);
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" dir="ltr">{user.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" dir="ltr">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${cls}`}>{label}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString("ar-EG")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
