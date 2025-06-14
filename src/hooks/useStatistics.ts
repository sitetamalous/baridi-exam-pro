
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useStatistics = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ["statistics", userId],
    enabled: !!userId,
    queryFn: async () => {
      // جلب جميع محاولات المستخدم
      const { data: attempts, error } = await supabase
        .from("user_attempts")
        .select("id,score,percentage,exam_id,completed_at")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false });

      if (error) throw error;

      // أفضل نتيجة ونسبة النجاح
      let best = 0, bestPercentage = 0;
      if (attempts && attempts.length > 0) {
        for (const att of attempts) {
          if (att.percentage && att.percentage > bestPercentage) {
            best = att.score;
            bestPercentage = att.percentage;
          }
        }
      }

      return {
        attempts: attempts || [],
        best,
        bestPercentage,
      };
    }
  });
};
