
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

// Add Arabic font support
import 'jspdf/dist/jspdf.es.min.js';

interface ExamAttemptData {
  id: string;
  score: number;
  percentage: number;
  completed_at: string;
  exam: {
    title: string;
    description?: string;
  };
  user_answers: Array<{
    question: {
      question_text: string;
      explanation?: string;
    };
    selected_answer: {
      answer_text: string;
      is_correct: boolean;
    };
    is_correct: boolean;
  }>;
}

export const usePDFGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const fetchAttemptData = async (attemptId: string): Promise<ExamAttemptData | null> => {
    try {
      const { data, error } = await supabase
        .from('user_attempts')
        .select(`
          id,
          score,
          percentage,
          completed_at,
          exam:exams!inner(title, description),
          user_answers!inner(
            is_correct,
            question:questions!inner(question_text, explanation),
            selected_answer:answers!inner(answer_text, is_correct)
          )
        `)
        .eq('id', attemptId)
        .single();

      if (error) throw error;
      return data as ExamAttemptData;
    } catch (error) {
      console.error('Error fetching attempt data:', error);
      return null;
    }
  };

  const generatePDFContent = (data: ExamAttemptData): jsPDF => {
    const doc = new jsPDF();
    
    // Set RTL direction and Arabic support
    doc.setLanguage('ar');
    doc.setR2L(true);
    
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('تقرير نتائج الامتحان', pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 15;

    // Exam Info
    doc.setFontSize(16);
    doc.text(`عنوان الامتحان: ${data.exam.title}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 10;

    const date = new Date(data.completed_at).toLocaleDateString('ar-EG');
    doc.setFontSize(12);
    doc.text(`تاريخ الامتحان: ${date}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 10;

    doc.text(`النتيجة: ${data.score} نقطة (${Math.round(data.percentage)}%)`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 15;

    // Pass/Fail status
    const status = data.percentage >= 50 ? 'نجح ✓' : 'راسب ✗';
    const statusColor = data.percentage >= 50 ? [0, 166, 81] : [220, 53, 69];
    doc.setTextColor(...statusColor);
    doc.setFontSize(14);
    doc.text(`الحالة: ${status}`, pageWidth - margin, yPosition, { align: 'right' });
    doc.setTextColor(0, 0, 0); // Reset to black
    yPosition += 20;

    // Questions and Answers
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('الأسئلة والإجابات:', pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 15;

    data.user_answers.forEach((answer, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Question number and text
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`السؤال ${index + 1}:`, pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 7;

      doc.setFont('helvetica', 'normal');
      const questionLines = doc.splitTextToSize(answer.question.question_text, contentWidth - 20);
      questionLines.forEach((line: string) => {
        doc.text(line, pageWidth - margin - 10, yPosition, { align: 'right' });
        yPosition += 5;
      });
      yPosition += 3;

      // User's answer
      const userAnswerColor = answer.is_correct ? [0, 166, 81] : [220, 53, 69];
      doc.setTextColor(...userAnswerColor);
      doc.text(`إجابتك: ${answer.selected_answer.answer_text}`, pageWidth - margin - 10, yPosition, { align: 'right' });
      yPosition += 7;

      // Correct answer (if user was wrong)
      if (!answer.is_correct) {
        doc.setTextColor(0, 166, 81);
        doc.text(`الإجابة الصحيحة: [تحتاج لاستخراجها من قاعدة البيانات]`, pageWidth - margin - 10, yPosition, { align: 'right' });
        yPosition += 7;
      }

      doc.setTextColor(0, 0, 0); // Reset to black

      // Explanation (if available)
      if (answer.question.explanation) {
        doc.setFont('helvetica', 'italic');
        doc.text(`التفسير: ${answer.question.explanation}`, pageWidth - margin - 10, yPosition, { align: 'right' });
        yPosition += 7;
      }

      yPosition += 5; // Space between questions
    });

    // Footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`صفحة ${i} من ${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      doc.text('منصة امتحانات بريد الجزائر', margin, doc.internal.pageSize.getHeight() - 10);
    }

    return doc;
  };

  const generatePDF = async (attemptId: string, action: 'view' | 'download' = 'view') => {
    setIsGenerating(true);
    
    try {
      const data = await fetchAttemptData(attemptId);
      if (!data) {
        toast({
          title: 'خطأ',
          description: 'لم يتم العثور على بيانات الامتحان',
          variant: 'destructive',
        });
        return;
      }

      const pdf = generatePDFContent(data);
      
      if (action === 'view') {
        // Open in new tab/window
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
      } else {
        // Download
        const fileName = `تقرير_امتحان_${data.exam.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
      }

      toast({
        title: 'تم بنجاح',
        description: action === 'view' ? 'تم فتح التقرير' : 'تم تحميل التقرير',
      });

    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في إنشاء التقرير',
        variant: 'destructive',
      });
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
