
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SubmissionResult {
  attemptId: string;
  score: number;
  percentage: number;
  totalQuestions: number;
}

export const useExamSubmission = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitExam = async (
    examId: string,
    answers: Record<string, string>
  ): Promise<SubmissionResult | null> => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً"
      });
      return null;
    }

    setIsSubmitting(true);
    console.log('بدء تسليم الامتحان:', { examId, answersCount: Object.keys(answers).length });

    try {
      // 1. إنشاء محاولة جديدة
      const { data: attempt, error: attemptError } = await supabase
        .from('user_attempts')
        .insert({
          user_id: user.id,
          exam_id: examId,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (attemptError) {
        console.error('خطأ في إنشاء المحاولة:', attemptError);
        throw new Error('فشل في حفظ المحاولة');
      }

      console.log('تم إنشاء المحاولة:', attempt);

      // 2. جلب الأسئلة وإجاباتها الصحيحة
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select(`
          id,
          answers!inner(id, is_correct)
        `)
        .eq('exam_id', examId);

      if (questionsError) {
        console.error('خطأ في جلب الأسئلة:', questionsError);
        throw new Error('فشل في جلب بيانات الأسئلة');
      }

      console.log('تم جلب الأسئلة:', questions);

      // 3. تحضير إجابات المستخدم للحفظ
      const userAnswers = [];
      let correctCount = 0;

      for (const question of questions) {
        const selectedAnswerId = answers[question.id];
        if (!selectedAnswerId) continue;

        const correctAnswer = question.answers.find(a => a.is_correct);
        const isCorrect = selectedAnswerId === correctAnswer?.id;
        
        if (isCorrect) correctCount++;

        userAnswers.push({
          attempt_id: attempt.id,
          question_id: question.id,
          selected_answer_id: selectedAnswerId,
          is_correct: isCorrect
        });
      }

      console.log('إجابات المستخدم المحضرة:', { total: userAnswers.length, correct: correctCount });

      // 4. حفظ إجابات المستخدم
      const { error: answersError } = await supabase
        .from('user_answers')
        .insert(userAnswers);

      if (answersError) {
        console.error('خطأ في حفظ الإجابات:', answersError);
        throw new Error('فشل في حفظ الإجابات');
      }

      console.log('تم حفظ الإجابات بنجاح');

      // 5. حساب النتيجة وتحديث المحاولة
      const totalQuestions = userAnswers.length;
      const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

      const { error: updateError } = await supabase
        .from('user_attempts')
        .update({
          score: correctCount,
          percentage: percentage,
          completed_at: new Date().toISOString()
        })
        .eq('id', attempt.id);

      if (updateError) {
        console.error('خطأ في تحديث النتيجة:', updateError);
        throw new Error('فشل في حفظ النتيجة');
      }

      console.log('تم تحديث النتيجة بنجاح:', { score: correctCount, percentage, completed_at: new Date().toISOString() });

      toast({
        title: "تم التسليم بنجاح",
        description: `حصلت على ${correctCount} من ${totalQuestions} (${Math.round(percentage)}%)`
      });

      return {
        attemptId: attempt.id,
        score: correctCount,
        percentage: percentage,
        totalQuestions: totalQuestions
      };

    } catch (error: any) {
      console.error('خطأ في تسليم الامتحان:', error);
      toast({
        variant: "destructive",
        title: "خطأ في التسليم",
        description: error.message || "حدث خطأ أثناء تسليم الامتحان"
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitExam,
    isSubmitting
  };
};
