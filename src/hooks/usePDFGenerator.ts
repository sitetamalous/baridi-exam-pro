
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import jsPDF from 'jspdf';

interface ExamAttempt {
  id: string;
  score: number;
  percentage: number;
  completed_at: string;
  started_at: string;
  exam: {
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
        exam:exams(title, description)
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
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Set document properties
    doc.setProperties({
      title: `تقرير الامتحان - ${attempt.exam.title}`,
      subject: 'تقرير نتائج الامتحان',
      author: 'منصة بريد الجزائر',
      creator: 'Algeria Post Exam Platform'
    });
    
    // Colors
    const primaryColor = [0, 166, 81]; // Algeria green
    const successColor = [34, 197, 94];
    const errorColor = [239, 68, 68];
    const grayColor = [75, 85, 99];
    
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Header Section
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('منصة امتحانات بريد الجزائر', pageWidth - margin, 15, { align: 'right' });
    
    doc.setFontSize(14);
    doc.text('تقرير نتائج الامتحان', pageWidth - margin, 25, { align: 'right' });
    
    yPosition = 50;
    
    // Exam Information Box
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, yPosition, contentWidth, 35, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, yPosition, contentWidth, 35, 'S');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('عنوان الامتحان:', pageWidth - margin - 5, yPosition + 8, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(attempt.exam.title, pageWidth - margin - 5, yPosition + 15, { align: 'right' });
    
    doc.setFont('helvetica', 'bold');
    doc.text('تاريخ الإجراء:', pageWidth - margin - 5, yPosition + 22, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    const examDate = new Date(attempt.completed_at).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(examDate, pageWidth - margin - 5, yPosition + 29, { align: 'right' });
    
    yPosition += 45;
    
    // Results Summary
    const passThreshold = 50;
    const isPassed = attempt.percentage >= passThreshold;
    const resultColor = isPassed ? successColor : errorColor;
    
    doc.setFillColor(...resultColor);
    doc.rect(margin, yPosition, contentWidth, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const resultText = isPassed ? '✅ نجح' : '❌ راسب';
    doc.text(resultText, pageWidth / 2, yPosition + 8, { align: 'center' });
    
    doc.setFontSize(14);
    const scoreText = `${attempt.score}/${answers.length} - ${Math.round(attempt.percentage)}%`;
    doc.text(`النتيجة: ${scoreText}`, pageWidth / 2, yPosition + 18, { align: 'center' });
    
    yPosition += 35;
    
    // Questions Section Header
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('تفاصيل الأسئلة والإجابات', pageWidth - margin, yPosition, { align: 'right' });
    
    // Underline
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);
    
    yPosition += 15;
    
    // Questions and Answers
    answers.forEach((answer, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Question Box
      const questionHeight = 25;
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, yPosition, contentWidth, questionHeight, 'F');
      doc.setDrawColor(209, 213, 219);
      doc.rect(margin, yPosition, contentWidth, questionHeight, 'S');
      
      // Question Number and Text
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`السؤال ${index + 1}:`, pageWidth - margin - 5, yPosition + 8, { align: 'right' });
      
      doc.setFont('helvetica', 'normal');
      const questionLines = doc.splitTextToSize(answer.question.question_text, contentWidth - 20);
      doc.text(questionLines as string[], pageWidth - margin - 5, yPosition + 15, { align: 'right' });
      
      yPosition += questionHeight + 5;
      
      // User's Answer
      const selectedAnswer = answer.question.answers.find(a => a.id === answer.selected_answer_id);
      const userAnswerColor = answer.is_correct ? successColor : errorColor;
      
      doc.setFillColor(...userAnswerColor, 0.1);
      doc.rect(margin + 10, yPosition, contentWidth - 20, 15, 'F');
      
      doc.setTextColor(...userAnswerColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('إجابتك:', pageWidth - margin - 15, yPosition + 6, { align: 'right' });
      
      doc.setFont('helvetica', 'normal');
      const userAnswerText = selectedAnswer?.answer_text || 'لم يتم الإجابة';
      doc.text(userAnswerText, pageWidth - margin - 15, yPosition + 12, { align: 'right' });
      
      yPosition += 20;
      
      // Correct Answer (if user was wrong)
      if (!answer.is_correct) {
        const correctAnswer = answer.question.answers.find(a => a.is_correct);
        
        doc.setFillColor(...successColor, 0.1);
        doc.rect(margin + 10, yPosition, contentWidth - 20, 15, 'F');
        
        doc.setTextColor(...successColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('الإجابة الصحيحة:', pageWidth - margin - 15, yPosition + 6, { align: 'right' });
        
        doc.setFont('helvetica', 'normal');
        doc.text(correctAnswer?.answer_text || 'غير محدد', pageWidth - margin - 15, yPosition + 12, { align: 'right' });
        
        yPosition += 20;
      }
      
      yPosition += 10; // Space between questions
    });
    
    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(...grayColor);
      doc.setLineWidth(0.3);
      doc.line(margin, doc.internal.pageSize.getHeight() - 20, pageWidth - margin, doc.internal.pageSize.getHeight() - 20);
      
      // Footer text
      doc.setTextColor(...grayColor);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('منصة امتحانات بريد الجزائر - تقرير مُولد تلقائياً', margin, doc.internal.pageSize.getHeight() - 10);
      doc.text(`صفحة ${i} من ${totalPages}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
    }
    
    return doc;
  };

  const generatePDF = async (attemptId: string, action: 'view' | 'download' = 'view') => {
    setIsGenerating(true);
    try {
      const { attempt, answers } = await fetchAttemptDetails(attemptId);
      const doc = generatePDFContent(attempt as ExamAttempt, answers as UserAnswer[]);
      
      if (action === 'view') {
        // Return blob for in-app viewing
        const pdfBlob = doc.output('blob');
        return pdfBlob;
      } else {
        // Download
        doc.save(`تقرير-امتحان-${attemptId}-${new Date().toISOString().split('T')[0]}.pdf`);
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
