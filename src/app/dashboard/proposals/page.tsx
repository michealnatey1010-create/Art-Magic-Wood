import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProposalsPage() {
  const proposals = await prisma.packageProposal.findMany({ orderBy: { created_at: "desc" } });

  return (
    <div className="p-6" dir="rtl">
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
          {proposals.map((proposal: any) => (
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
                    <p className="text-sm text-gray-700">{proposal.package_details}</p>
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
                    <button className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                      ✅ قبول
                    </button>
                    <button className="px-4 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                      ❌ رفض
                    </button>
                  </>
                )}
                <button className="px-4 py-1.5 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                  📋 عرض التفاصيل
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
