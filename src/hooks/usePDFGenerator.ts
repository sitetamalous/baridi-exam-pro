import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ArabicPdfGenerator } from '@/services/arabicPdfGenerator';

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

export const usePDFGenerator = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchAttemptDetails = async (attemptId: string) => {
    console.log('Fetching attempt details for:', attemptId);
    
    try {
      // Fetch attempt details with exam info
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
        console.error('Error fetching attempt:', attemptError);
        throw new Error('فشل في جلب بيانات الامتحان');
      }

      console.log('Attempt fetched:', attempt);

      // Fetch user answers with questions, all possible answers, and explanations
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
        console.error('Error fetching answers:', answersError);
        throw new Error('فشل في جلب الإجابات');
      }

      console.log('Answers fetched:', answers);

      // Get user profile data
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', user?.id)
        .single();

      if (profileError) {
        console.warn('Could not fetch user profile:', profileError);
      }

      console.log('User profile fetched:', userProfile);

      return { 
        attempt, 
        answers: answers || [],
        userProfile: userProfile ? { 
          name: userProfile.full_name, 
          email: userProfile.email 
        } : { email: user?.email }
      };
    } catch (error) {
      console.error('Error in fetchAttemptDetails:', error);
      throw error;
    }
  };

  const generatePDF = async (attemptId: string, action: 'view' | 'download' = 'view') => {
    setIsGenerating(true);
    try {
      console.log('Generating PDF for attempt:', attemptId);
      
      const { attempt, answers, userProfile } = await fetchAttemptDetails(attemptId);
      
      if (!attempt) {
        throw new Error('لم يتم العثور على بيانات الامتحان');
      }

      if (!answers || answers.length === 0) {
        throw new Error('لم يتم العثور على إجابات الامتحان');
      }

      // Generate PDF with real data including explanations and corrections
      const pdfBlob = await ArabicPdfGenerator.generateExamReport(
        attempt as ExamAttempt,
        answers as UserAnswer[],
        userProfile
      );

      if (action === 'view') {
        // Return blob for in-app viewing
        return pdfBlob;
      } else {
        // Download
        const examTitle = attempt.exam?.title || 'امتحان';
        const date = new Date().toISOString().split('T')[0];
        const filename = `تقرير-${examTitle}-${date}.pdf`;
        ArabicPdfGenerator.downloadPDF(pdfBlob, filename);
        return null;
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
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
