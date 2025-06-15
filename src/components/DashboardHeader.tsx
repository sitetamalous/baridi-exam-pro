
import React from "react";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * رأس الصفحة للوحة التحكم: تصميم متجاوب بالكامل للهاتف والتابلت والديسكتوب
 */
const DashboardHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <header className="w-full sticky top-0 z-30 mb-3 px-0 pt-2 select-none">
      <div
        className="
          w-full max-w-lg mx-auto
          bg-white/95 shadow-md border border-algeria-green/15
          rounded-b-3xl
          flex flex-col items-center
          py-4 px-3
          animate-fade-in
          relative
        "
      >
        {/* اسم المنصة */}
        <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-col items-center md:items-start w-full">
            <h1 className="text-algeria-green text-xl xs:text-2xl md:text-2xl font-extrabold text-center md:text-right leading-tight mb-1">
              منصة امتحانات بريد الجزائر
            </h1>
            {user && (
              <span className="block text-gray-700 text-xs xs:text-sm md:text-base text-center md:text-right font-normal">
                مرحباً، {user?.user_metadata?.full_name || user?.email}
              </span>
            )}
          </div>
          {/* زر تسجيل الخروج */}
          <div className="self-center md:self-auto mt-2 md:mt-0 w-full md:w-auto flex justify-center md:justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLogout}
              className="
                !rounded-lg
                text-red-600 hover:bg-red-50 hover:text-red-700
                transition-all font-semibold
                w-full max-w-[180px] md:max-w-none
                flex items-center justify-center gap-2 py-2 px-0
                "
            >
              <LogOut className="w-4 h-4 ml-1" />
              <span className="text-xs xs:text-sm md:text-base font-semibold">تسجيل الخروج</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
