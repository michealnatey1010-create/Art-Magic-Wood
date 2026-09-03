"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Level {
  id: string;
  grades: { subjects: { summaries: unknown[] }[] }[];
}

export default function SummariesHomePage() {
  const [levels, setLevels] = useState<Level[]>([]);

  useEffect(() => {
    fetch("/api/summaries/full")
      .then((r) => r.json())
      .then((d) => setLevels(d.data || []))
      .catch(() => setLevels([]));
  }, []);

  const gradeCount = levels.reduce((a, l) => a + l.grades.length, 0);
  const subjectCount = levels.reduce((a, l) => a + l.grades.reduce((b, g) => b + g.subjects.length, 0), 0);
  const summaryCount = levels.reduce(
    (a, l) => a + l.grades.reduce((b, g) => b + g.subjects.reduce((c, s) => c + s.summaries.length, 0), 0),
    0
  );

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <p className="text-sm text-gray-500">المراحل</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{levels.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <p className="text-sm text-gray-500">الصفوف</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{gradeCount}</p>
        </div>
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <p className="text-sm text-gray-500">المواد والملخصات</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{subjectCount} / {summaryCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/summaries/levels" className="bg-white rounded-xl border p-6 shadow-sm hover:shadow-md transition group">
          <p className="text-3xl mb-2">🏫</p>
          <p className="font-bold text-gray-900 group-hover:text-blue-700">إدارة المراحل</p>
          <p className="text-sm text-gray-500 mt-1">ابتدائي، إعدادي، ثانوي</p>
        </Link>
        <Link href="/dashboard/summaries/grades" className="bg-white rounded-xl border p-6 shadow-sm hover:shadow-md transition group">
          <p className="text-3xl mb-2">🎓</p>
          <p className="font-bold text-gray-900 group-hover:text-blue-700">إدارة الصفوف</p>
          <p className="text-sm text-gray-500 mt-1">الأول، الثاني، الثالث</p>
        </Link>
        <Link href="/dashboard/summaries/subjects" className="bg-white rounded-xl border p-6 shadow-sm hover:shadow-md transition group">
          <p className="text-3xl mb-2">📖</p>
          <p className="font-bold text-gray-900 group-hover:text-blue-700">إدارة المواد</p>
          <p className="text-sm text-gray-500 mt-1">عربي، إنجليزي، رياضيات...</p>
        </Link>
        <Link href="/dashboard/summaries/products" className="bg-white rounded-xl border p-6 shadow-sm hover:shadow-md transition group">
          <p className="text-3xl mb-2">📚</p>
          <p className="font-bold text-gray-900 group-hover:text-blue-700">إدارة الملخصات</p>
          <p className="text-sm text-gray-500 mt-1">إضافة وتعديل الملخصات مع الصور</p>
        </Link>
      </div>
    </div>
  );
}