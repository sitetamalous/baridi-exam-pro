
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
      console.log('جلب الإحصائيات للمستخدم:', userId);
      
      // جلب كل المحاولات المنتهية لهذا المستخدم مع ربطها بحق الامتحان
      const { data: attempts, error } = await supabase
        .from("user_attempts")
        .select(
          "id,score,percentage,completed_at,started_at,exam_id,exam:exams(id,title,description)"
        )
        .eq("user_id", userId)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false });

      if (error) {
        console.error('خطأ في جلب المحاولات:', error);
        throw error;
      }

      console.log('المحاولات المجلبة:', attempts);

      const examsTaken = attempts ? attempts.length : 0;
      let bestPercentage = 0;
      let best = 0;
      let avg = 0;

      if (attempts && attempts.length > 0) {
        bestPercentage = Math.max(...attempts.map(a => a.percentage ?? 0));
        avg =
          attempts.reduce((acc, a) => acc + (a.percentage ?? 0), 0) /
          attempts.length;
        for (const att of attempts) {
          if (att.percentage && att.percentage === bestPercentage) {
            best = att.score ?? 0;
          }
        }
      }

      return {
        attempts: attempts || [],
        examsTaken,
        bestPercentage,
        avgPercentage: avg,
        user: {
          name:
            user?.user_metadata?.full_name ||
            user?.user_metadata?.name ||
            user?.email,
        },
      };
    },
  });
};
