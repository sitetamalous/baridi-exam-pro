
import React from "react";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const DashboardHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <header className="w-full flex flex-col items-center mb-2 pt-3 px-2 select-none">
      <div className="w-full max-w-[420px] rounded-2xl bg-white/95 px-3 py-4 shadow border border-algeria-green/15
        flex flex-col gap-2 sm:gap-0 sm:flex-row sm:items-center sm:justify-between 
        transition-all duration-150
        ">
        <div className="flex flex-col items-center sm:items-start flex-1">
          <h1 className="text-center sm:text-right text-lg xs:text-xl font-extrabold text-algeria-green leading-tight mb-1">
            منصة امتحانات بريد الجزائر
          </h1>
          {user && (
            <span className="block text-gray-700 text-xs xs:text-sm text-center sm:text-right font-normal">
              مرحباً، {user?.user_metadata?.full_name || user?.email}
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleLogout}
          className="mt-2 sm:mt-0 text-red-600 hover:bg-red-50 hover:text-red-700 !rounded-lg w-full max-w-[150px] self-center sm:self-start flex items-center gap-1 transition-all py-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs font-semibold">تسجيل الخروج</span>
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
