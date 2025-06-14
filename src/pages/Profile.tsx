
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";

const Profile: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col justify-between pb-16">
      <div className="flex-1 flex flex-col p-6 items-center gap-4">
        <img
          src="/icon-144x144.png"
          alt="الصورة الشخصية"
          className="rounded-full border-4 border-algeria-green shadow mb-3"
          style={{ width: 82, height: 82 }}
        />
        <div className="w-full max-w-xs bg-white rounded-xl shadow p-4">
          <div className="mb-2 text-gray-700 font-bold text-center text-lg">
            {user?.user_metadata?.full_name || user?.email || "اسم المستخدم"}
          </div>
          <div className="text-sm text-gray-500 text-center">
            {user?.email}
          </div>
        </div>
        <button
          className="mt-4 underline text-algeria-green font-semibold"
          onClick={() => window.location.assign("/auth")}
        >
          تعديل معلومات الحساب
        </button>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
