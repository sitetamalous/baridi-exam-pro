
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BookOpen, LogIn, UserPlus } from "lucide-react";

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* شعار التطبيق */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-algeria-green rounded-2xl flex items-center justify-center shadow-lg">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* عنوان التطبيق */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-algeria-green">
            منصة امتحانات بريد الجزائر
          </h1>
          <p className="text-gray-600 text-lg">
            مكلف بالزبائن - اختبارات تدريبية
          </p>
        </div>

        {/* وصف التطبيق */}
        <p className="text-gray-700 leading-relaxed">
          اختبر معلوماتك وحضر للنجاح في الامتحان المهني لمنصب "مكلف بالزبائن" في بريد الجزائر من خلال واجهة سهلة الاستخدام ودعم كامل للغة العربية.
        </p>

        {/* أزرار التنقل */}
        <div className="space-y-3">
          {user ? (
            <>
              <Button
                size="lg"
                className="w-full bg-algeria-green hover:bg-green-700 text-white font-semibold py-3"
                onClick={() => navigate("/dashboard")}
              >
                <BookOpen className="ml-2 h-5 w-5" />
                الذهاب إلى لوحة التحكم
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full border-algeria-green text-algeria-green hover:bg-algeria-green hover:text-white font-semibold py-3"
                onClick={() => navigate("/exams")}
              >
                بدء الامتحانات
              </Button>
            </>
          ) : (
            <>
              <Button
                size="lg"
                className="w-full bg-algeria-green hover:bg-green-700 text-white font-semibold py-3"
                onClick={() => navigate("/auth")}
              >
                <LogIn className="ml-2 h-5 w-5" />
                تسجيل الدخول
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full border-algeria-green text-algeria-green hover:bg-algeria-green hover:text-white font-semibold py-3"
                onClick={() => navigate("/auth")}
              >
                <UserPlus className="ml-2 h-5 w-5" />
                إنشاء حساب جديد
              </Button>
            </>
          )}
        </div>

        {/* معلومات إضافية */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-algeria-blue mb-2">ميزات التطبيق:</h3>
          <ul className="text-sm text-gray-700 space-y-1 text-right">
            <li>• امتحانات تدريبية شاملة</li>
            <li>• تقارير مفصلة للنتائج</li>
            <li>• واجهة باللغة العربية</li>
            <li>• يعمل بدون إنترنت</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
