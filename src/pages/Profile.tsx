
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import UpdateNameDialog from "@/components/UpdateNameDialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import UserAvatarUpload from "@/components/UserAvatarUpload";
import UserIdDisplay from "@/components/UserIdDisplay";
import UserAttemptsList from "@/components/UserAttemptsList";

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [editOpen, setEditOpen] = useState(false);

  // الاسم من metadata أو البريد
  const [name, setName] = useState(
    user?.user_metadata?.full_name || user?.email || ""
  );

  const { toast } = useToast();

  // صورة بروفايل افتراضية أو من user_metadata أو جدول users إن وجدت
  const [profileImageUrl, setProfileImageUrl] = useState(
    user?.user_metadata?.profile_image_url ||
    "" // سيتم تحديثها بعد أول تحميل للبيانات من القاعدة (users)
  );

  const [userDbProfileImage, setUserDbProfileImage] = useState<string | null>(null);

  // قائمة المحاولات
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  // حفظ معرف المستخدم في window (workaround لـ Dialog)
  if (user && !(window as any).currentUserId) (window as any).currentUserId = user.id;

  // أول حرفين من الاسم أو البريد لاختصار الصورة
  const initials = (name || user?.email || "").slice(0, 2);

  const handleLogout = async () => {
    await logout();
    window.location.assign("/auth");
  };

  const handleUpdateName = (newName: string) => {
    setName(newName);
  };

  // جلب الصورة الأحدث من الجدول users
  useEffect(() => {
    const fetchDbProfileImage = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from("users")
        .select("profile_image_url")
        .eq("id", user.id)
        .maybeSingle();

      if (data?.profile_image_url) {
        setUserDbProfileImage(data.profile_image_url);
        setProfileImageUrl(data.profile_image_url);
      }
    };
    fetchDbProfileImage();
    // eslint-disable-next-line
  }, [user?.id]);

  // جلب جميع محاولات الامتحان لهذا المستخدم
  const fetchAttempts = async () => {
    if (!user?.id) return;
    setLoadingAttempts(true);
    const { data, error } = await supabase
      .from("user_attempts")
      .select("id,score,percentage,exam_id,completed_at")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });
    setAttempts(data ?? []);
    setLoadingAttempts(false);
  };

  useEffect(() => {
    fetchAttempts();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col justify-between pb-20">
      <div className="flex-1 flex flex-col p-6 items-center gap-4">
        <UserAvatarUpload
          userId={user?.id ?? ""}
          profileImageUrl={userDbProfileImage || profileImageUrl}
          onUploaded={setProfileImageUrl}
          initials={initials}
        />
        <UserIdDisplay id={user?.id ?? ""} />
        <div className="w-full max-w-xs bg-white rounded-xl shadow p-4 mb-1">
          <div className="mb-2 text-gray-700 font-bold text-center text-lg">{name}</div>
          <div className="text-sm text-gray-500 text-center">{user?.email}</div>
        </div>
        <Button className="mt-2 bg-algeria-green text-white w-full" onClick={() => setEditOpen(true)}>
          تعديل الاسم
        </Button>
        <Button
          className="mt-2 underline text-red-600 font-semibold w-full"
          variant="ghost"
          onClick={handleLogout}
        >
          تسجيل الخروج
        </Button>
        <div className="w-full flex flex-col items-center">
          {loadingAttempts ? (
            <div className="text-center py-4 text-gray-400">جارٍ التحميل...</div>
          ) : (
            <UserAttemptsList attempts={attempts} refresh={fetchAttempts} />
          )}
        </div>
      </div>
      <UpdateNameDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        currentName={name}
        onSuccess={handleUpdateName}
      />
      <BottomNav />
    </div>
  );
};

export default Profile;
