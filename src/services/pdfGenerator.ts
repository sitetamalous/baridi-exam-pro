
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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

interface UserProfile {
  name?: string;
  email?: string;
}

export class PDFGenerator {
  static async generateExamReport(
    attempt: ExamAttempt,
    answers: UserAnswer[],
    userProfile?: UserProfile
  ): Promise<Blob> {
    try {
      // إنشاء مستند PDF جديد
      const pdfDoc = await PDFDocument.create();
      
      // إضافة صفحة جديدة
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      const { width, height } = page.getSize();
      
      // تحميل الخط الافتراضي
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      let yPosition = height - 50;
      const margin = 50;
      const lineHeight = 20;
      
      // العنوان الرئيسي
      page.drawText('Algeria Post Exam Report', {
        x: margin,
        y: yPosition,
        size: 20,
        font: boldFont,
        color: rgb(0, 0.65, 0.32), // Algeria green
      });
      yPosition -= lineHeight * 2;
      
      // معلومات الامتحان
      page.drawText(`Exam: ${attempt.exam.title}`, {
        x: margin,
        y: yPosition,
        size: 14,
        font: boldFont,
      });
      yPosition -= lineHeight;
      
      page.drawText(`Student: ${userProfile?.name || userProfile?.email || 'Unknown'}`, {
        x: margin,
        y: yPosition,
        size: 12,
        font: font,
      });
      yPosition -= lineHeight;
      
      page.drawText(`Date: ${new Date(attempt.completed_at).toLocaleDateString()}`, {
        x: margin,
        y: yPosition,
        size: 12,
        font: font,
      });
      yPosition -= lineHeight * 2;
      
      // النتائج
      const correctAnswers = answers.filter(a => a.is_correct).length;
      const totalQuestions = answers.length;
      const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      
      page.drawText('Results Summary:', {
        x: margin,
        y: yPosition,
        size: 16,
        font: boldFont,
      });
      yPosition -= lineHeight;
      
      page.drawText(`Total Questions: ${totalQuestions}`, {
        x: margin,
        y: yPosition,
        size: 12,
        font: font,
      });
      yPosition -= lineHeight;
      
      page.drawText(`Correct Answers: ${correctAnswers}`, {
        x: margin,
        y: yPosition,
        size: 12,
        font: font,
      });
      yPosition -= lineHeight;
      
      page.drawText(`Score: ${percentage.toFixed(1)}%`, {
        x: margin,
        y: yPosition,
        size: 12,
        font: font,
        color: percentage >= 70 ? rgb(0, 0.8, 0) : percentage >= 50 ? rgb(1, 0.6, 0) : rgb(1, 0, 0),
      });
      yPosition -= lineHeight * 2;
      
      // تقييم الأداء
      const performance = percentage >= 70 ? 'Excellent' : percentage >= 50 ? 'Good' : 'Needs Improvement';
      page.drawText(`Performance: ${performance}`, {
        x: margin,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: percentage >= 70 ? rgb(0, 0.8, 0) : percentage >= 50 ? rgb(1, 0.6, 0) : rgb(1, 0, 0),
      });
      yPosition -= lineHeight * 2;
      
      // معلومات إضافية
      page.drawText('Questions Review:', {
        x: margin,
        y: yPosition,
        size: 14,
        font: boldFont,
      });
      yPosition -= lineHeight;
      
      // إضافة معلومات الأسئلة (بشكل مبسط)
      answers.slice(0, 10).forEach((answer, index) => {
        if (yPosition < 100) return; // تجنب الخروج من الصفحة
        
        page.drawText(`Q${index + 1}: ${answer.is_correct ? 'Correct' : 'Incorrect'}`, {
          x: margin,
          y: yPosition,
          size: 10,
          font: font,
          color: answer.is_correct ? rgb(0, 0.8, 0) : rgb(1, 0, 0),
        });
        yPosition -= lineHeight * 0.8;
      });
      
      // معلومات التذييل
      page.drawText(`Generated on: ${new Date().toLocaleString()}`, {
        x: margin,
        y: 50,
        size: 8,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      // تحويل PDF إلى Blob
      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });
      
    } catch (error) {
      console.error('خطأ في إنشاء تقرير PDF:', error);
      throw new Error('فشل في إنشاء تقرير PDF');
    }
  }

  static async downloadPDF(blob: Blob, filename: string) {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('خطأ في تحميل PDF:', error);
      throw new Error('فشل في تحميل PDF');
    }
  }
}
