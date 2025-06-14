
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, FileText, BarChart3, User, LayoutDashboard } from "lucide-react";

interface BottomNavProps {
  className?: string;
}

const navLinks = [
  { to: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { to: "/exams", label: "الامتحانات", icon: FileText },
  { to: "/statistics", label: "الإحصائيات", icon: BarChart3 },
  { to: "/profile", label: "حسابي", icon: User },
];

const BottomNav: React.FC<BottomNavProps> = ({ className }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav
      className={`fixed bottom-0 right-0 left-0 bg-white border-t z-40 flex justify-between items-center px-1 py-1 shadow
        md:hidden ${className || ""}`}
      style={{ direction: 'rtl' }}
      aria-label="Navigation actions"
    >
      {navLinks.map((link) => {
        const Icon = link.icon;
        // تعتبر /dashboard و /dashboard* نشطة
        const isActive = pathname === link.to || pathname.startsWith(link.to + "/");
        return (
          <button
            key={link.to}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 focus:outline-none transition-colors
            ${isActive ? "text-algeria-green font-bold" : "text-gray-500"}`}
            onClick={() => navigate(link.to)}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="mb-0.5" size={22} />
            <span className="text-xs">{link.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
