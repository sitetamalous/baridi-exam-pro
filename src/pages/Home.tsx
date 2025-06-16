
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-between relative bg-gradient-to-br from-green-50 to-blue-50 pb-14">
      <div className="flex-1 flex flex-col items-center justify-center text-center p-5">
        <img
          src="/icon-144x144.png"
          className="mx-auto mb-4 rounded-lg shadow-lg"
          alt="شعار منصة الامتحانات"
          style={{ width: 88, height: 88 }}
        />
        <h1 className="text-2xl md:text-3xl font-bold text-algeria-green mb-2 arabic-text">
          منصة امتحانات بريد الجزائر
        </h1>
        <p className="text-gray-700 mb-6 arabic-text max-w-sm mx-auto">
          اختبر معلوماتك و حضّر للنجاح في الامتحان المهني "مكلف بالزبائن" في بريد الجزائر من خلال واجهة سهلة الاستخدام ودعم كامل للغة العربية.
        </p>
        <Button
          size="lg"
          className="w-full max-w-xs mb-3"
          onClick={() => navigate("/exams")}
        >
          ابدأ الامتحان
        </Button>
        {!user && (
          <Button
            variant="outline"
            className="w-full max-w-xs"
            onClick={() => navigate("/auth")}
          >
            تسجيل الدخول / إنشاء حساب
          </Button>
        )}
      </div>
    </div>
  );
};

export default Home;
