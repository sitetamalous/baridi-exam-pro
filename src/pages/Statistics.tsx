
import React from "react";
import { useStatistics } from "@/hooks/useStatistics";
import {
  BarChart,
  Bar,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { BadgeCheck, TrendingUp, BarChart3, X as XIcon, Check as CheckIcon } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import arDZ from "date-fns/locale/ar-DZ";
import classNames from "clsx";

const MotivationMessage: React.FC<{ attempts: any[] }> = ({ attempts }) => {
  if (!attempts || attempts.length < 2) return null;
  // حساب تحسن النسبة بالتتابع
  const last = attempts[0]?.percentage ?? 0;
  const before = attempts[1]?.percentage ?? 0;
  if (last > before)
    return (
      <div className="text-sm mt-3 font-bold bg-green-50 text-green-700 px-3 py-2 rounded-xl text-center animate-pulse">
        🔥 أنت تتحسن! واصل التقدم!
      </div>
    );
  return null;
};

const Statistics: React.FC = () => {
  const { data, isLoading, error } = useStatistics();

  // تجهيز بيانات الرسم البياني
  let chartData: { name: string; النتيجة: number; التاريخ: string }[] = [];
  if (data && data.attempts.length > 0) {
    chartData = data.attempts
      .map((a, i) => ({
        name: `امتحان ${data.attempts.length - i}`,
        النتيجة: a.percentage ? Math.round(Number(a.percentage)) : 0,
        التاريخ: a.completed_at
          ? format(new Date(a.completed_at), "d MMM yyyy", { locale: arDZ })
          : "",
      }))
      .reverse();
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col pb-20 !rtl"
      style={{ direction: "rtl" }}
    >
      {/* رأس الصفحة: فقط في الشاشات الكبيرة */}
      <div className="hidden sm:block pt-8 px-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <BarChart3 className="inline-block w-7 h-7 text-algeria-green" /> إحصائياتي
        </h1>
        <span className="text-gray-700 font-medium">
          مرحبًا {data?.user?.name ? `، ${data.user.name.split(" ")[0]}` : ""} 👋
        </span>
      </div>

      {/* KPIs - البطاقات العلوية */}
      <div className="flex flex-col xs:flex-row gap-3 mt-4 px-2 sm:justify-center sm:items-center transition-all">
        <Card className="flex-1 bg-white/85 shadow rounded-2xl flex flex-row gap-2 items-center px-3 py-3 min-w-[110px] border-0">
          <div className="rounded-full bg-green-100 p-2 mr-2 flex-shrink-0">
            <BadgeCheck className="w-7 h-7 text-algeria-green" />
          </div>
          <div>
            <span className="block text-lg font-bold text-gray-800">{isLoading ? "--" : data?.examsTaken ?? 0}</span>
            <span className="text-xs text-gray-500 font-medium">اختبارات منجزة</span>
          </div>
        </Card>
        <Card className="flex-1 bg-white/85 shadow rounded-2xl flex flex-row gap-2 items-center px-3 py-3 min-w-[110px] border-0">
          <div className="rounded-full bg-yellow-100 p-2 mr-2 flex-shrink-0">
            <TrendingUp className="w-7 h-7 text-yellow-500" />
          </div>
          <div>
            <span className="block text-lg font-bold text-gray-800">
              {isLoading
                ? "--"
                : data?.bestPercentage !== undefined
                ? `${Math.round(Number(data.bestPercentage))}%`
                : "--"}
            </span>
            <span className="text-xs text-gray-500 font-medium">أفضل نتيجة</span>
          </div>
        </Card>
        <Card className="flex-1 bg-white/85 shadow rounded-2xl flex flex-row gap-2 items-center px-3 py-3 min-w-[110px] border-0">
          <div className="rounded-full bg-blue-100 p-2 mr-2 flex-shrink-0">
            <BarChart3 className="w-7 h-7 text-blue-500" />
          </div>
          <div>
            <span className="block text-lg font-bold text-gray-800">
              {isLoading
                ? "--"
                : data?.avgPercentage !== undefined
                ? `${Math.round(Number(data.avgPercentage))}%`
                : "--"}
            </span>
            <span className="text-xs text-gray-500 font-medium">متوسط النتائج</span>
          </div>
        </Card>
      </div>

      {/* رسم بياني للنتائج */}
      <Card className="mt-4 mx-2 mb-2 bg-white/90 shadow rounded-2xl border-0 px-1 pt-5 pb-2">
        <div className="font-semibold mb-1 text-gray-700 text-center text-sm sm:text-base">
          تطور نتائجك
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="loading-spinner" />
          </div>
        ) : chartData && chartData.length > 0 ? (
          <div className="w-full h-[220px] xs:h-[280px] sm:h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 16, right: 2, left: 2, bottom: 2 }}
              >
                <defs>
                  <linearGradient id="score" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00A651" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#00A651" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                {/* المحور السيني تظهر بالعربي ومرقمة من اليمين */}
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: "#666" }} 
                  axisLine={false} 
                  reversed={true}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: "#666" }} 
                  axisLine={false}
                  domain={[0,100]}
                  width={30}
                />
                <CartesianGrid strokeDasharray="3 3" opacity={0.12}/>
                <Tooltip
                  contentStyle={{ direction: "rtl", fontSize: 13 }}
                  labelFormatter={() => "امتحان"}
                  formatter={(value) => [`${value}%`, "النتيجة"]}
                />
                <Line
                  type="monotone"
                  dataKey="النتيجة"
                  stroke="#00A651"
                  strokeWidth={3}
                  dot={{ r: 4, stroke: "#fff", strokeWidth: 2, fill: "#00A651" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-7">لا توجد بيانات بعد</div>
        )}
      </Card>

      {/* رسالة تحفيزية حسب التحسن */}
      {data && <MotivationMessage attempts={data.attempts} />}

      {/* جدول الامتحانات السابقة */}
      <div className="mt-3 mx-2 mb-56">
        <div className="font-bold text-algeria-blue mb-2 text-sm">
          نتائج جميع الامتحانات
        </div>
        <div className="flex flex-col gap-2">
          {isLoading ? (
            <Card className="rounded-2xl p-6 bg-white/70">
              <div className="animate-pulse text-center text-gray-500">جاري التحميل ...</div>
            </Card>
          ) : data?.attempts && data.attempts.length > 0 ? (
            data.attempts.map((att, idx) => (
              <Card key={att.id} className="bg-white/95 shadow border-0 rounded-2xl flex flex-row items-center justify-between px-3 py-2">
                <div className="flex-1 flex flex-col items-start">
                  <span className="font-bold text-sm text-gray-900">{att.exam?.title || `امتحان رقم ${data.attempts.length - idx}`}</span>
                  <span className="text-gray-500 text-xs mt-0.5">
                    {att.completed_at
                      ? format(new Date(att.completed_at), "d MMM yyyy - hh:mm", { locale: arDZ })
                      : ""}
                  </span>
                </div>
                <div className="flex items-center min-w-[68px] flex-shrink-0">
                  <span
                    className={classNames(
                      "font-extrabold text-lg ml-2",
                      att.percentage >= 50
                        ? "text-algeria-green"
                        : "text-algeria-red"
                    )}
                  >
                    {att.percentage !== null && att.percentage !== undefined
                      ? `${Math.round(att.percentage)}%`
                      : "--"}
                  </span>
                  <span>
                    {att.percentage >= 50 ? (
                      <CheckIcon className="text-green-500 w-[20px] h-[20px]" />
                    ) : (
                      <XIcon className="text-red-500 w-[20px] h-[20px]" />
                    )}
                  </span>
                </div>
                {/* (اختياري) زر مراجعة */}
                {/* <Button 
                  size="sm" 
                  className="rounded-full ml-3 bg-algeria-blue/90 text-white hover:bg-blue-600 transition"
                  onClick={() => {/* TODO: implement navigation */}}
                >
                  مراجعة
                </Button> */}
              </Card>
            ))
          ) : (
            <Card className="rounded-2xl p-5 bg-white/70 text-center text-gray-500">
              لا توجد امتحانات سابقة لعرضها.
            </Card>
          )}
        </div>
      </div>

      {/* شريط التنقل السفلي للموبايل فقط: يبقى ظاهرًا دوماً */}
      <BottomNav />
    </div>
  );
};

export default Statistics;
