
import React, { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface UserAvatarUploadProps {
  userId: string;
  profileImageUrl?: string;
  onUploaded?: (newUrl: string) => void;
  initials: string;
}

const AVATARS_BUCKET = "avatars";

const UserAvatarUpload: React.FC<UserAvatarUploadProps> = ({ userId, profileImageUrl, onUploaded, initials }) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from(AVATARS_BUCKET).upload(filePath, file, {
      upsert: true
    });
    if (uploadError) {
      toast({ title: "خطأ", description: "تعذر رفع الصورة. حاول مرة أخرى.", variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(filePath);
    // احفظ الرابط في جدول users
    const { error: updateError } = await supabase
      .from("users")
      .update({ profile_image_url: data.publicUrl })
      .eq("id", userId);
    setUploading(false);
    if (updateError) {
      toast({ title: "خطأ", description: "تم رفع الصورة ولكن لم يتم تحديث الحساب.", variant: "destructive" });
      return;
    }
    toast({ title: "تم التحديث", description: "تم تحديث الصورة الشخصية بنجاح." });
    if (onUploaded) onUploaded(data.publicUrl);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <Avatar className="w-20 h-20 shadow border-4 border-algeria-green">
          <AvatarImage src={profileImageUrl || "/icon-144x144.png"} alt="الصورة الشخصية" />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <button
          type="button"
          aria-label="تغيير الصورة"
          className="absolute bottom-0 left-0 bg-white rounded-full p-2 border shadow cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Camera className="text-algeria-green" size={18} />
        </button>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>
      <span className="text-xs text-gray-500">اضغط لتغيير الصورة</span>
    </div>
  );
};

export default UserAvatarUpload;
