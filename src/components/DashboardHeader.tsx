
import React from "react";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * رأس الصفحة للوحة التحكم: تصميم متجاوب بالكامل للهاتف بشكل احترافي بدون تكرار
 */
const DashboardHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <header className="w-full sticky top-0 z-30 bg-white/95 border-b border-algeria-green/10 shadow-sm select-none">
      <div className="max-w-lg mx-auto flex flex-col items-stretch px-4 py-3 sm:py-4 sm:px-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex flex-col items-start flex-1 min-w-0">
            <span className="text-algeria-green text-base xs:text-lg font-extrabold leading-tight truncate">
              منصة امتحانات بريد الجزائر
            </span>
            {user && (
              <span className="text-gray-700 text-xs xs:text-sm font-normal truncate mt-0.5">
                مرحباً، {user?.user_metadata?.full_name || user?.email}
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleLogout}
            className="!rounded-full text-red-600 hover:bg-red-50 hover:text-red-700 transition-all flex items-center gap-1 px-3 py-2 font-semibold"
            aria-label="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4 ml-1" />
            <span className="text-xs font-semibold hidden xs:inline">تسجيل الخروج</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

