import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ArabicPDFGenerator } from '@/services/arabicPDFGenerator';

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
    // Fetch attempt details
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

    if (attemptError) throw attemptError;

    // Fetch user answers with questions and all possible answers
    const { data: answers, error: answersError } = await supabase
      .from('user_answers')
      .select(`
        id,
        question_id,
        selected_answer_id,
        is_correct,
        question:questions(
          question_text,
          answers(
            id,
            answer_text,
            is_correct
          )
        )
      `)
      .eq('attempt_id', attemptId);

    if (answersError) throw answersError;

    // Get user profile data
    const { data: userProfile } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', user?.id)
      .single();

    return { 
      attempt, 
      answers,
      userProfile: userProfile ? { name: userProfile.full_name, email: userProfile.email } : undefined
    };
  };

  const generatePDF = async (attemptId: string, action: 'view' | 'download' = 'view') => {
    setIsGenerating(true);
    try {
      const { attempt, answers, userProfile } = await fetchAttemptDetails(attemptId);
      
      // Initialize the Arabic PDF generator
      const generator = new ArabicPDFGenerator();
      
      // Generate PDF with proper Arabic support
      const pdfBytes = await generator.generatePDF(
        attempt as ExamAttempt,
        answers as UserAnswer[],
        userProfile
      );

      if (action === 'view') {
        // Return blob for in-app viewing
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        return pdfBlob;
      } else {
        // Download
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `تقرير-امتحان-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
