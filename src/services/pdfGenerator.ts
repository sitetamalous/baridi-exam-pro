
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

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

// Fallback Arabic font data (minimal subset)
const ARABIC_FONT_BASE64 = 'data:font/truetype;base64,AAEAAAAKAIAAAwAgT1MvMi+mT78AAAEoAAAAYGNtYXAAFgCPAAABiAAAAFRnYXNwAAAAEAAAAdwAAAAIZ2x5ZgALAAAAAAHkAAAAYGhlYWQfph19AAAAvAAAADZoaGVhBzgEJAAAAPQAAAAkaG10eAcAAAAAAAFEAAAADGxvY2EACQAJAAABUAAAAAhtYXhwAAoAPwAAAVgAAAAgbmFtZYkK/CIAAAJEAAAAe3Bvc3QAAwAAAAADAQAAACAAAQAAAAEAAKGJVFVfDzz1AAsD6AAAAADcJhgGAAAAANwmGAYAAP/sA+gDEgAAAAgAAgAAAAAAAAABAAADEP/sAAAD6AAAAAAD6AABAAAAAAAAAAAAAAAAAAAAAgABAAAAAgAvAAIAAAAAAAIAAAABAAEAAABAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAA=';

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
      pdfDoc.registerFontkit(fontkit);
      
      // تحميل خط يدعم Unicode
      let arabicFont;
      try {
        // محاولة تحميل خط من Google Fonts
        const fontResponse = await fetch('https://fonts.gstatic.com/s/notoserif/v21/ga6iaw1J5X9T9RW6j9bNfFImZq4IPVs.woff2');
        if (fontResponse.ok) {
          const fontBytes = await fontResponse.arrayBuffer();
          arabicFont = await pdfDoc.embedFont(fontBytes);
          console.log('تم تحميل خط عربي من Google Fonts');
        } else {
          throw new Error('Failed to load Google Font');
        }
      } catch (error) {
        console.log('فشل تحميل الخط من Google Fonts، سيتم استخدام خط احتياطي');
        // استخدام خط احتياطي بسيط
        arabicFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      }

      // الخط الافتراضي للنص الإنجليزي
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // إضافة صفحة جديدة
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      const { width, height } = page.getSize();
      
      let yPosition = height - 50;
      const margin = 50;
      const lineHeight = 20;
      
      // دالة مساعدة لكتابة النص مع دعم العربية
      const drawTextSafe = (text: string, x: number, y: number, options: any = {}) => {
        try {
          // فحص إذا كان النص يحتوي على أحرف عربية
          const hasArabic = /[\u0600-\u06FF]/.test(text);
          const selectedFont = hasArabic ? arabicFont : (options.font || font);
          
          page.drawText(text, {
            x,
            y,
            font: selectedFont,
            size: options.size || 12,
            color: options.color || rgb(0, 0, 0),
          });
        } catch (error) {
          console.log('خطأ في كتابة النص:', text, error);
          // محاولة كتابة النص بالخط الافتراضي
          const safeText = text.replace(/[^\x00-\x7F]/g, '?'); // استبدال الأحرف غير ASCII
          page.drawText(safeText, {
            x,
            y,
            font: font,
            size: options.size || 12,
            color: options.color || rgb(0, 0, 0),
          });
        }
      };
      
      // العنوان الرئيسي
      drawTextSafe('Algeria Post Exam Report', margin, yPosition, {
        size: 20,
        font: boldFont,
        color: rgb(0, 0.65, 0.32),
      });
      yPosition -= lineHeight * 2;
      
      // معلومات الامتحان
      const examTitle = attempt.exam?.title || 'امتحان';
      drawTextSafe(`Exam: ${examTitle}`, margin, yPosition, {
        size: 14,
        font: boldFont,
      });
      yPosition -= lineHeight;
      
      const studentName = userProfile?.name || userProfile?.email || 'Unknown';
      drawTextSafe(`Student: ${studentName}`, margin, yPosition, {
        size: 12,
      });
      yPosition -= lineHeight;
      
      const examDate = new Date(attempt.completed_at).toLocaleDateString('en-US');
      drawTextSafe(`Date: ${examDate}`, margin, yPosition, {
        size: 12,
      });
      yPosition -= lineHeight * 2;
      
      // النتائج
      const correctAnswers = answers.filter(a => a.is_correct).length;
      const totalQuestions = answers.length;
      const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      
      drawTextSafe('Results Summary:', margin, yPosition, {
        size: 16,
        font: boldFont,
      });
      yPosition -= lineHeight;
      
      drawTextSafe(`Total Questions: ${totalQuestions}`, margin, yPosition);
      yPosition -= lineHeight;
      
      drawTextSafe(`Correct Answers: ${correctAnswers}`, margin, yPosition);
      yPosition -= lineHeight;
      
      const scoreColor = percentage >= 70 ? rgb(0, 0.8, 0) : percentage >= 50 ? rgb(1, 0.6, 0) : rgb(1, 0, 0);
      drawTextSafe(`Score: ${percentage.toFixed(1)}%`, margin, yPosition, {
        color: scoreColor,
      });
      yPosition -= lineHeight * 2;
      
      // تقييم الأداء
      const performance = percentage >= 70 ? 'Excellent' : percentage >= 50 ? 'Good' : 'Needs Improvement';
      drawTextSafe(`Performance: ${performance}`, margin, yPosition, {
        size: 14,
        font: boldFont,
        color: scoreColor,
      });
      yPosition -= lineHeight * 2;
      
      // معلومات الأسئلة
      drawTextSafe('Questions Review:', margin, yPosition, {
        size: 14,
        font: boldFont,
      });
      yPosition -= lineHeight;
      
      // عرض معلومات الأسئلة (بشكل مبسط)
      answers.slice(0, 10).forEach((answer, index) => {
        if (yPosition < 100) return; // تجنب الخروج من الصفحة
        
        const statusText = answer.is_correct ? 'Correct' : 'Incorrect';
        const statusColor = answer.is_correct ? rgb(0, 0.8, 0) : rgb(1, 0, 0);
        
        drawTextSafe(`Q${index + 1}: ${statusText}`, margin, yPosition, {
          size: 10,
          color: statusColor,
        });
        yPosition -= lineHeight * 0.8;
      });
      
      // معلومات التذييل
      const footerText = `Generated on: ${new Date().toLocaleString('en-US')}`;
      drawTextSafe(footerText, margin, 50, {
        size: 8,
        color: rgb(0.5, 0.5, 0.5),
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
