
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

// Helper function to transliterate Arabic to Latin for PDF compatibility
const transliterateArabic = (text: string): string => {
  const arabicToLatin: { [key: string]: string } = {
    'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h',
    'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's',
    'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a',
    'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm',
    'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y', 'ة': 'h', 'ى': 'a',
    'ء': 'a', 'آ': 'aa', 'أ': 'a', 'إ': 'i', 'ؤ': 'u', 'ئ': 'i',
    'َ': '', 'ُ': '', 'ِ': '', 'ً': '', 'ٌ': '', 'ٍ': '', 'ْ': ''
  };

  return text.replace(/[\u0600-\u06FF]/g, (char) => arabicToLatin[char] || '?');
};

// Safe text drawing function
const drawTextSafe = (
  page: any,
  text: string,
  x: number,
  y: number,
  options: any = {}
) => {
  try {
    // First try with original text
    page.drawText(text, {
      x,
      y,
      font: options.font || StandardFonts.Helvetica,
      size: options.size || 12,
      color: options.color || rgb(0, 0, 0),
    });
  } catch (error) {
    console.log('فشل في كتابة النص العربي، جاري التحويل:', text);
    // If Arabic text fails, transliterate it
    const transliteratedText = transliterateArabic(text);
    try {
      page.drawText(transliteratedText, {
        x,
        y,
        font: options.font || StandardFonts.Helvetica,
        size: options.size || 12,
        color: options.color || rgb(0, 0, 0),
      });
    } catch (fallbackError) {
      // Ultimate fallback - remove special characters
      const safeText = text.replace(/[^\x00-\x7F]/g, '?');
      page.drawText(safeText, {
        x,
        y,
        font: options.font || StandardFonts.Helvetica,
        size: options.size || 12,
        color: options.color || rgb(0, 0, 0),
      });
    }
  }
};

export class PDFGenerator {
  static async generateExamReport(
    attempt: ExamAttempt,
    answers: UserAnswer[],
    userProfile?: UserProfile
  ): Promise<Blob> {
    try {
      console.log('بدء إنشاء تقرير PDF...');
      
      // إنشاء مستند PDF جديد
      const pdfDoc = await PDFDocument.create();
      
      // استخدام الخطوط المعيارية فقط لتجنب مشاكل fontkit
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // إضافة صفحة جديدة
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      const { width, height } = page.getSize();
      
      let yPosition = height - 50;
      const margin = 50;
      const lineHeight = 20;
      
      // العنوان الرئيسي
      drawTextSafe(page, 'Algeria Post Exam Report', margin, yPosition, {
        size: 20,
        font: boldFont,
        color: rgb(0, 0.65, 0.32),
      });
      yPosition -= lineHeight * 2;
      
      // معلومات الامتحان
      const examTitle = attempt.exam?.title || 'Exam';
      drawTextSafe(page, `Exam: ${examTitle}`, margin, yPosition, {
        size: 14,
        font: boldFont,
      });
      yPosition -= lineHeight;
      
      const studentName = userProfile?.name || userProfile?.email || 'Unknown';
      drawTextSafe(page, `Student: ${studentName}`, margin, yPosition, {
        size: 12,
        font: font,
      });
      yPosition -= lineHeight;
      
      const examDate = new Date(attempt.completed_at).toLocaleDateString('en-US');
      drawTextSafe(page, `Date: ${examDate}`, margin, yPosition, {
        size: 12,
        font: font,
      });
      yPosition -= lineHeight * 2;
      
      // النتائج
      const correctAnswers = answers.filter(a => a.is_correct).length;
      const totalQuestions = answers.length;
      const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      
      drawTextSafe(page, 'Results Summary:', margin, yPosition, {
        size: 16,
        font: boldFont,
      });
      yPosition -= lineHeight;
      
      drawTextSafe(page, `Total Questions: ${totalQuestions}`, margin, yPosition, {
        font: font,
      });
      yPosition -= lineHeight;
      
      drawTextSafe(page, `Correct Answers: ${correctAnswers}`, margin, yPosition, {
        font: font,
      });
      yPosition -= lineHeight;
      
      const scoreColor = percentage >= 70 ? rgb(0, 0.8, 0) : percentage >= 50 ? rgb(1, 0.6, 0) : rgb(1, 0, 0);
      drawTextSafe(page, `Score: ${percentage.toFixed(1)}%`, margin, yPosition, {
        color: scoreColor,
        font: boldFont,
      });
      yPosition -= lineHeight * 2;
      
      // تقييم الأداء
      const performance = percentage >= 70 ? 'Excellent' : percentage >= 50 ? 'Good' : 'Needs Improvement';
      drawTextSafe(page, `Performance: ${performance}`, margin, yPosition, {
        size: 14,
        font: boldFont,
        color: scoreColor,
      });
      yPosition -= lineHeight * 2;
      
      // معلومات الأسئلة
      drawTextSafe(page, 'Questions Review:', margin, yPosition, {
        size: 14,
        font: boldFont,
      });
      yPosition -= lineHeight;
      
      // عرض معلومات الأسئلة (بشكل مبسط)
      answers.slice(0, 10).forEach((answer, index) => {
        if (yPosition < 100) return; // تجنب الخروج من الصفحة
        
        const statusText = answer.is_correct ? 'Correct' : 'Incorrect';
        const statusColor = answer.is_correct ? rgb(0, 0.8, 0) : rgb(1, 0, 0);
        
        drawTextSafe(page, `Q${index + 1}: ${statusText}`, margin, yPosition, {
          size: 10,
          color: statusColor,
          font: font,
        });
        yPosition -= lineHeight * 0.8;
      });
      
      // معلومات التذييل
      const footerText = `Generated on: ${new Date().toLocaleString('en-US')}`;
      drawTextSafe(page, footerText, margin, 50, {
        size: 8,
        color: rgb(0.5, 0.5, 0.5),
        font: font,
      });
      
      // تحويل PDF إلى Blob
      const pdfBytes = await pdfDoc.save();
      console.log('تم إنشاء PDF بنجاح');
      
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
