
import React, { useState } from "react";
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
import { BadgeCheck, TrendingUp, BarChart3, X as XIcon, Check as CheckIcon, RotateCcw, FileText } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PDFDownloadButton from "@/components/PDFDownloadButton";
import { format } from "date-fns";
import { arDZ } from "date-fns/locale/ar-DZ";
import classNames from "clsx";
import { useToast } from "@/hooks/use-toast";

const MotivationMessage: React.FC<{ attempts: any[] }> = ({ attempts }) => {
  if (!attempts || attempts.length < 2) return null;
  
  const last = attempts[0]?.percentage ?? 0;
  const before = attempts[1]?.percentage ?? 0;
  
  if (last > before) {
    const improvement = Math.round(last - before);
    return (
      <div className="text-sm mt-3 font-bold bg-green-50 text-green-700 px-3 py-2 rounded-xl text-center animate-pulse mx-2">
        🔥 أنت تتحسن! زدت بـ {improvement}% منذ آخر امتحان!
      </div>
    );
  }
  return null;
};

const Statistics: React.FC = () => {
  const { data, isLoading, error, refetch } = useStatistics();
  const { toast } = useToast();

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

  const handleRetakeExam = (examId: string) => {
    console.log('إعادة الامتحان:', examId);
    window.location.href = `/exam/${examId}`;
  };

  const handleReviewExam = (attemptId: string) => {
    console.log('مراجعة الامتحان:', attemptId);
    window.location.href = `/results?attempt=${attemptId}`;
  };

  // إعادة تحديث البيانات عند العودة للصفحة
  React.useEffect(() => {
    const handleFocus = () => {
      console.log('إعادة تحميل الإحصائيات...');
      refetch();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch]);

  if (error) {
    console.error('خطأ في تحميل الإحصائيات:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4" style={{ direction: "rtl" }}>
        <Card className="p-6 text-center">
          <p className="text-red-600 mb-4">حدث خطأ في تحميل الإحصائيات</p>
          <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col pb-20"
      style={{ direction: "rtl" }}
    >
      {/* Header - Desktop only */}
      <div className="hidden sm:block pt-8 px-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <BarChart3 className="inline-block w-7 h-7 text-algeria-green" /> 📊 إحصائياتي
        </h1>
        <span className="text-gray-700 font-medium">
          مرحبًا {data?.user?.name ? `، ${data.user.name.split(" ")[0]}` : ""} 👋
        </span>
      </div>

      {/* Mobile Header */}
      <div className="sm:hidden pt-4 px-4 mb-2">
        <h1 className="text-xl font-bold text-center text-algeria-green">📊 إحصائياتي</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 mt-4 px-2 sm:max-w-4xl sm:mx-auto sm:px-6">
        <Card className="bg-white/90 shadow-lg rounded-2xl border-0 overflow-hidden">
          <div className="flex items-center p-4">
            <div className="rounded-full bg-green-100 p-3 mr-3 flex-shrink-0">
              <BadgeCheck className="w-6 h-6 text-algeria-green" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-800">
                {isLoading ? "..." : data?.examsTaken ?? 0}
              </div>
              <div className="text-xs text-gray-600 font-medium">اختبارات منجزة</div>
            </div>
          </div>
        </Card>

        <Card className="bg-white/90 shadow-lg rounded-2xl border-0 overflow-hidden">
          <div className="flex items-center p-4">
            <div className="rounded-full bg-yellow-100 p-3 mr-3 flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-800">
                {isLoading
                  ? "..."
                  : data?.bestPercentage !== undefined
                  ? `${Math.round(Number(data.bestPercentage))}%`
                  : "--"}
              </div>
              <div className="text-xs text-gray-600 font-medium">أفضل نتيجة</div>
            </div>
          </div>
        </Card>

        <Card className="bg-white/90 shadow-lg rounded-2xl border-0 overflow-hidden xs:col-span-1 col-span-1">
          <div className="flex items-center p-4">
            <div className="rounded-full bg-blue-100 p-3 mr-3 flex-shrink-0">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-800">
                {isLoading
                  ? "..."
                  : data?.avgPercentage !== undefined
                  ? `${Math.round(Number(data.avgPercentage))}%`
                  : "--"}
              </div>
              <div className="text-xs text-gray-600 font-medium">متوسط النتائج</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className="mt-6 mx-2 mb-4 bg-white/95 shadow-lg rounded-2xl border-0 overflow-hidden sm:max-w-4xl sm:mx-auto">
        <div className="p-4 pb-2">
          <h2 className="font-bold text-gray-800 text-center text-lg mb-4">
            📈 تطور نتائجك
          </h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-algeria-green"></div>
            </div>
          ) : chartData && chartData.length > 0 ? (
            <div className="w-full h-[280px] sm:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00A651" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00A651" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: "#666" }} 
                    axisLine={false} 
                    reversed={true}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: "#666" }} 
                    axisLine={false}
                    domain={[0, 100]}
                    width={35}
                  />
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2}/>
                  <Tooltip
                    contentStyle={{ 
                      direction: "rtl", 
                      fontSize: 13,
                      backgroundColor: "rgba(255,255,255,0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px"
                    }}
                    labelFormatter={() => "امتحان"}
                    formatter={(value) => [`${value}%`, "النتيجة"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="النتيجة"
                    stroke="#00A651"
                    strokeWidth={3}
                    dot={{ r: 5, stroke: "#fff", strokeWidth: 3, fill: "#00A651" }}
                    activeDot={{ r: 7, stroke: "#fff", strokeWidth: 2 }}
                    fill="url(#scoreGradient)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              📊 لا توجد بيانات بعد
            </div>
          )}
        </div>
      </Card>

      {/* Motivation Message */}
      {data && <MotivationMessage attempts={data.attempts} />}

      {/* Exam History */}
      <div className="mt-6 mx-2 mb-24 sm:max-w-4xl sm:mx-auto">
        <h2 className="font-bold text-gray-800 mb-4 text-lg px-2">
          📋 تاريخ الامتحانات
        </h2>
        
        <div className="space-y-3">
          {isLoading ? (
            <Card className="rounded-2xl p-6 bg-white/80">
              <div className="animate-pulse text-center text-gray-500">جاري التحميل...</div>
            </Card>
          ) : data?.attempts && data.attempts.length > 0 ? (
            data.attempts.map((attempt, idx) => {
              console.log('عرض المحاولة:', attempt);
              return (
                <Card key={attempt.id} className="bg-white/95 shadow-lg border-0 rounded-2xl overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-sm">
                          {attempt.exam?.title || `امتحان رقم ${data.attempts.length - idx}`}
                        </h3>
                        <p className="text-gray-500 text-xs mt-1">
                          {attempt.completed_at
                            ? format(new Date(attempt.completed_at), "d MMM yyyy - HH:mm", { locale: arDZ })
                            : ""}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span
                          className={classNames(
                            "font-bold text-lg",
                            attempt.percentage >= 50
                              ? "text-algeria-green"
                              : "text-red-500"
                          )}
                        >
                          {attempt.percentage !== null && attempt.percentage !== undefined
                            ? `${Math.round(attempt.percentage)}%`
                            : "--"}
                        </span>
                        {attempt.percentage >= 50 ? (
                          <CheckIcon className="text-green-500 w-5 h-5" />
                        ) : (
                          <XIcon className="text-red-500 w-5 h-5" />
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => handleReviewExam(attempt.id)}
                      >
                        <FileText className="w-4 h-4 ml-1" />
                        مراجعة الامتحان
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => handleRetakeExam(attempt.exam_id)}
                      >
                        <RotateCcw className="w-4 h-4 ml-1" />
                        إعادة الامتحان
                      </Button>
                      
                      <PDFDownloadButton
                        attemptId={attempt.id}
                        examTitle={attempt.exam?.title}
                        size="sm"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </Card>
              )
            })
          ) : (
            <Card className="rounded-2xl p-8 bg-white/80 text-center">
              <div className="text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>لا توجد امتحانات سابقة لعرضها.</p>
                <p className="text-sm mt-2">ابدأ أول امتحان لك الآن!</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Statistics;
