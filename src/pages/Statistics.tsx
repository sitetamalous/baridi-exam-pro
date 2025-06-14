
import React from "react";
import BottomNav from "@/components/BottomNav";

const Statistics: React.FC = () => {
  // This is a placeholder page, real chart/statistics can be added in later steps
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col justify-between pb-16">
      <div className="flex-1 flex flex-col p-6 items-center justify-center">
        <h1 className="text-xl font-bold mb-4">إحصائيات الأداء</h1>
        <div className="bg-white shadow rounded-xl w-full max-w-xs p-4 mb-3">
          <div className="text-center text-gray-700">
            <span className="block text-4xl font-extrabold text-algeria-green">
              --
            </span>
            <span className="block text-sm mt-1">أفضل نتيجة</span>
          </div>
        </div>
        {/* Add charts or summary here */}
        <div className="text-gray-600 mt-4">سيتم إضافة المزيد من الإحصائيات قريباً.</div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Statistics;
