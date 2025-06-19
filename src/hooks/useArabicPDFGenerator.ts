
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ArabicPdfGeneratorFixed } from '@/services/arabicPdfGeneratorFixed';
import { useToast } from '@/hooks/use-toast';

interface ExamAttempt {
  id: string;
  score: number;
  percentage: number;
  completed_at: string;
  started_at: string;
  exam: {
    id: string;
    title: string;
    description?: string;
  };
}

interface UserAnswer {
  id: string;
  question_id: string;
  selected_answer_id: string;
  is_correct: boolean;
  question: {
    question_text: string;
    explanation?: string;
    answers: Array<{
      id: string;
      answer_text: string;
      is_correct: boolean;
    }>;
  };
}

export const useArabicPDFGenerator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchAttemptDetails = async (attemptId: string) => {
    console.log('جلب بيانات المحاولة:', attemptId);
    
    try {
      // جلب بيانات المحاولة مع معلومات الامتحان
      const { data: attempt, error: attemptError } = await supabase
        .from('user_attempts')
        .select(`
          id,
          score,
          percentage,
          completed_at,
          started_at,
          exam:exams(id, title, description)
        `)
        .eq('id', attemptId)
        .eq('user_id', user?.id)
        .single();

      if (attemptError) {
        console.error('خطأ في جلب المحاولة:', attemptError);
        throw new Error('فشل في جلب بيانات الامتحان');
      }

      console.log('تم جلب المحاولة:', attempt);

      // جلب إجابات المستخدم مع الأسئلة والإجابات الصحيحة
      const { data: answers, error: answersError } = await supabase
        .from('user_answers')
        .select(`
          id,
          question_id,
          selected_answer_id,
          is_correct,
          question:questions(
            question_text,
            explanation,
            answers(
              id,
              answer_text,
              is_correct
            )
          )
        `)
        .eq('attempt_id', attemptId)
        .order('question_id');

      if (answersError) {
        console.error('خطأ في جلب الإجابات:', answersError);
        throw new Error('فشل في جلب الإجابات');
      }

      console.log('تم جلب الإجابات:', answers);

      // جلب بيانات المستخدم
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', user?.id)
        .single();

      if (profileError) {
        console.warn('لم يتم جلب ملف المستخدم:', profileError);
      }

      console.log('تم جلب ملف المستخدم:', userProfile);

      return { 
        attempt, 
        answers: answers || [],
        userProfile: userProfile ? { 
          name: userProfile.full_name, 
          email: userProfile.email 
        } : { email: user?.email }
      };
    } catch (error) {
      console.error('خطأ في fetchAttemptDetails:', error);
      throw error;
    }
  };

  const generatePDF = async (attemptId: string, action: 'view' | 'download' = 'download') => {
    setIsGenerating(true);
    try {
      console.log('إنشاء PDF للمحاولة باستخدام HTML to Canvas:', attemptId);
      
      const { attempt, answers, userProfile } = await fetchAttemptDetails(attemptId);
      
      if (!attempt) {
        throw new Error('لم يتم العثور على بيانات الامتحان');
      }

      if (!answers || answers.length === 0) {
        throw new Error('لم يتم العثور على إجابات الامتحان');
      }

      // إنشاء PDF بالبيانات الحقيقية باستخدام المولد الجديد
      const pdfBlob = await ArabicPdfGeneratorFixed.generateExamReport(
        attempt as ExamAttempt,
        answers as UserAnswer[],
        userProfile
      );

      if (action === 'download') {
        // تحميل مباشر
        const examTitle = attempt.exam?.title || 'امتحان';
        const date = new Date().toISOString().split('T')[0];
        const filename = `تقرير-${examTitle}-${date}.pdf`;
        ArabicPdfGeneratorFixed.downloadPDF(pdfBlob, filename);
        
        toast({
          title: "تم التحميل بنجاح",
          description: "تم تحميل تقرير PDF بنجاح مع دعم كامل للعربية"
        });
      }

      return pdfBlob;
    } catch (error: any) {
      console.error('خطأ في إنشاء PDF:', error);
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء PDF",
        description: error.message || "حدث خطأ أثناء إنشاء تقرير PDF"
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = async (attemptId: string) => {
    await generatePDF(attemptId, 'download');
  };

  return {
    generatePDF,
    downloadPDF,
    isGenerating,
  };
};
