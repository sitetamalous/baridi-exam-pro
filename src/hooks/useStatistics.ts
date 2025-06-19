
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
      
      // جلب كل المحاولات لهذا المستخدم مع ربطها بحق الامتحان
      const { data: attempts, error } = await supabase
        .from("user_attempts")
        .select(
          "id,score,percentage,completed_at,started_at,exam_id,exam:exams(id,title,description)"
        )
        .eq("user_id", userId)
        .order("started_at", { ascending: false });

      if (error) {
        console.error('خطأ في جلب المحاولات:', error);
        throw error;
      }

      console.log('جميع المحاولات المجلبة:', attempts);

      // تصفية المحاولات المكتملة فقط
      const completedAttempts = attempts?.filter(attempt => attempt.completed_at !== null) || [];
      console.log('المحاولات المكتملة:', completedAttempts);

      const examsTaken = completedAttempts.length;
      let bestPercentage = 0;
      let best = 0;
      let avg = 0;

      if (completedAttempts.length > 0) {
        bestPercentage = Math.max(...completedAttempts.map(a => a.percentage ?? 0));
        avg =
          completedAttempts.reduce((acc, a) => acc + (a.percentage ?? 0), 0) /
          completedAttempts.length;
        for (const att of completedAttempts) {
          if (att.percentage && att.percentage === bestPercentage) {
            best = att.score ?? 0;
          }
        }
      }

      return {
        attempts: completedAttempts,
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
