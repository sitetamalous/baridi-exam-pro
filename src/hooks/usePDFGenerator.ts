
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import jsPDF from 'jspdf';

interface ExamAttempt {
  id: string;
  score: number;
  percentage: number;
  completed_at: string;
  exam: {
    title: string;
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
        exam:exams(title)
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

    return { attempt, answers };
  };

  const generatePDFContent = (attempt: ExamAttempt, answers: UserAnswer[]) => {
    const doc = new jsPDF();
    
    // Add Arabic font support (basic fallback)
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(20);
    doc.text('Algeria Post - Exam Report', 20, 20);
    
    doc.setFontSize(14);
    doc.text(`Exam: ${attempt.exam.title}`, 20, 35);
    doc.text(`Score: ${attempt.score}/${answers.length} (${Math.round(attempt.percentage)}%)`, 20, 50);
    doc.text(`Date: ${new Date(attempt.completed_at).toLocaleDateString()}`, 20, 65);
    
    // Questions and answers
    let yPosition = 85;
    
    answers.forEach((answer, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Question
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const questionText = `Q${index + 1}: ${answer.question.question_text}`;
      const questionLines = doc.splitTextToSize(questionText, 170);
      doc.text(questionLines as string[], 20, yPosition);
      yPosition += questionLines.length * 7;
      
      // User's answer
      doc.setFont('helvetica', 'normal');
      const selectedAnswer = answer.question.answers.find(a => a.id === answer.selected_answer_id);
      const userAnswerText = `Your answer: ${selectedAnswer?.answer_text || 'No answer'}`;
      doc.setTextColor(answer.is_correct ? 0, 150, 0 : 255, 0, 0);
      doc.text(userAnswerText, 25, yPosition + 5);
      
      // Correct answer (if user was wrong)
      if (!answer.is_correct) {
        const correctAnswer = answer.question.answers.find(a => a.is_correct);
        doc.setTextColor(0, 100, 0);
        doc.text(`Correct answer: ${correctAnswer?.answer_text || 'Unknown'}`, 25, yPosition + 15);
        yPosition += 10;
      }
      
      doc.setTextColor(0, 0, 0); // Reset color
      yPosition += 20;
    });
    
    return doc;
  };

  const generatePDF = async (attemptId: string, action: 'view' | 'download' = 'view') => {
    setIsGenerating(true);
    try {
      const { attempt, answers } = await fetchAttemptDetails(attemptId);
      const doc = generatePDFContent(attempt as ExamAttempt, answers as UserAnswer[]);
      
      if (action === 'view') {
        // Open in new tab/window
        const pdfUrl = doc.output('bloburl');
        window.open(pdfUrl, '_blank');
      } else {
        // Download
        doc.save(`exam-report-${attemptId}.pdf`);
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
