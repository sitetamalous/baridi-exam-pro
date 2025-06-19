
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useStatistics = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ["statistics", userId],
    enabled: !!userId,
    staleTime: 0, // البيانات دائماً stale لضمان التحديث
    cacheTime: 0, // لا نحتفظ بالكاش
    queryFn: async () => {
      console.log('جلب الإحصائيات للمستخدم:', userId);
      
      // جلب المحاولات المكتملة فقط
      const { data: attempts, error } = await supabase
        .from("user_attempts")
        .select(`
          id,
          score,
          percentage,
          completed_at,
          started_at,
          exam_id,
          exam:exams(id, title, description)
        `)
        .eq("user_id", userId)
        .not("completed_at", "is", null) // فقط المحاولات المكتملة
        .order("completed_at", { ascending: false });

      if (error) {
        console.error('خطأ في جلب المحاولات:', error);
        throw error;
      }

      console.log('المحاولات المكتملة المجلبة:', attempts);

      const examsTaken = attempts?.length || 0;
      let bestPercentage = 0;
      let avgPercentage = 0;

      if (attempts && attempts.length > 0) {
        // أفضل نتيجة
        bestPercentage = Math.max(...attempts.map(a => a.percentage ?? 0));
        
        // متوسط النتائج
        const totalPercentage = attempts.reduce((acc, a) => acc + (a.percentage ?? 0), 0);
        avgPercentage = totalPercentage / attempts.length;
      }

      return {
        attempts: attempts || [],
        examsTaken,
        bestPercentage,
        avgPercentage,
        user: {
          name: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email,
        },
      };
    },
  });
};
