
import React from "react";
import { useStatistics } from "@/hooks/useStatistics";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import BottomNav from "@/components/BottomNav";

const Statistics: React.FC = () => {
  const { data, isLoading, error } = useStatistics();

  // بناء بيانات الرسم البياني
  let barData: { name: string; النتيجة: number }[] = [];
  if (data && data.attempts.length > 0) {
    barData = data.attempts.map((a, i) => ({
      name: `#${data.attempts.length - i}`,
      النتيجة: a.percentage ? Math.round(Number(a.percentage)) : 0
    }));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col justify-between pb-20">
      <div className="flex-1 flex flex-col p-4 items-center justify-center">
        <h1 className="text-xl font-bold mb-4">إحصائيات الأداء</h1>
        {isLoading ? (
          <div className="loading-spinner" />
        ) : error ? (
          <div className="text-red-600">حدث خطأ أثناء جلب البيانات</div>
        ) : (
          <>
            <div className="bg-white shadow rounded-xl w-full max-w-xs p-4 mb-3">
              <div className="text-center text-gray-700">
                <span className="block text-4xl font-extrabold text-algeria-green">
                  {data?.bestPercentage ? `${Math.round(Number(data.bestPercentage))}%` : "--"}
                </span>
                <span className="block text-sm mt-1">أفضل نسبة نجاح</span>
              </div>
            </div>
            <div className="w-full rounded-xl bg-white p-2 shadow mb-3">
              <div className="font-semibold mb-2 text-gray-700 text-center">توزيع النتائج الأخيرة</div>
              {barData.length > 0 ? (
                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="النتيجة" fill="#00A651" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">لا توجد نتائج للعرض</div>
              )}
            </div>
            <div className="text-gray-600 mt-4 text-sm">سيتم إضافة المزيد من الإحصائيات قريباً.</div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Statistics;
