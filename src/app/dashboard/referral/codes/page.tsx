import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function ReferralCodesPage() {
  const teachers = await prisma.user.findMany({
    where: {
      role: { in: ['TEACHER', 'MERCHANT'] },
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      referralCode: true,
      referralActive: true,
    },
    orderBy: { name: 'asc' },
  });

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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teachers.map((teacher) => (
              <tr key={teacher.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{teacher.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{teacher.email}</td>
                <td className="px-6 py-4 text-sm font-mono font-bold text-blue-600">
                  {teacher.referralCode || '—'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    teacher.referralActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {teacher.referralActive ? '✅ مفعّل' : '⏳ غير مفعّل'}
                  </span>
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
