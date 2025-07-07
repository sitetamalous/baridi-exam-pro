import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { arDZ } from 'date-fns/locale/ar-DZ';

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

interface UserProfile {
  name?: string;
  email?: string;
}

export class ReactPdfGeneratorFixed {
  static async generateExamReport(
    attempt: ExamAttempt,
    answers: UserAnswer[],
    userProfile?: UserProfile
  ): Promise<Blob> {
    console.log('إنشاء PDF محسن مع دعم اللغة العربية...');

    // إنشاء PDF جديد
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // إعداد الخط العربي
    pdf.setLanguage('ar');
    let yPosition = 20;
    const lineHeight = 8;
    const pageWidth = 210;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    // دالة مساعدة لمعالجة النص العربي
    const processArabicText = (text: string): string => {
      // تحويل النص العربي ليكون قابل للقراءة في PDF
      return text.split('').reverse().join('');
    };

    // دالة لإضافة نص مع التحقق من الحاجة لصفحة جديدة
    const addText = (text: string, x: number, y: number, options?: any) => {
      if (y > 270) {
        pdf.addPage();
        return 20;
      }
      pdf.text(text, x, y, options);
      return y;
    };

    // عنوان التقرير
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    yPosition = addText('تقرير نتائج الامتحان - Exam Results Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight * 2;

    // عنوان الامتحان
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    yPosition = addText(`Exam: ${attempt.exam.title}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight * 2;

    // رسم خط فاصل
    pdf.setDrawColor(52, 73, 94);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += lineHeight;

    // معلومات المستخدم
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    if (userProfile?.name) {
      yPosition = addText(`Student Name - اسم الطالب: ${userProfile.name}`, margin, yPosition);
      yPosition += lineHeight;
    }

    if (userProfile?.email) {
      yPosition = addText(`Email - البريد الإلكتروني: ${userProfile.email}`, margin, yPosition);
      yPosition += lineHeight;
    }

    // تاريخ الامتحان
    const examDate = format(new Date(attempt.completed_at), 'dd/MM/yyyy - HH:mm', { locale: arDZ });
    yPosition = addText(`Exam Date - تاريخ الامتحان: ${examDate}`, margin, yPosition);
    yPosition += lineHeight * 2;

    // النتيجة النهائية - مربع ملون
    pdf.setFillColor(232, 245, 232);
    pdf.rect(margin, yPosition - 5, contentWidth, 25, 'F');
    
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(39, 174, 96);
    yPosition = addText(`النتيجة النهائية: ${Math.round(attempt.percentage)}%`, pageWidth / 2, yPosition + 10, { align: 'center' });
    
    pdf.setFontSize(14);
    yPosition = addText(`Score: ${attempt.score}/${answers.length} (${Math.round(attempt.percentage)}%)`, pageWidth / 2, yPosition + 8, { align: 'center' });

    // حالة النجاح/الفشل
    const isPassed = attempt.percentage >= 50;
    pdf.setTextColor(isPassed ? 39 : 231, isPassed ? 174 : 76, isPassed ? 96 : 60);
    const resultText = isPassed ? 'PASSED - ناجح ✓' : 'FAILED - راسب ✗';
    yPosition = addText(resultText, pageWidth / 2, yPosition + 8, { align: 'center' });
    
    pdf.setTextColor(0, 0, 0); // إعادة تعيين اللون
    yPosition += lineHeight * 3;

    // تفاصيل الأسئلة
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    yPosition = addText('Questions Details - تفاصيل الأسئلة:', margin, yPosition);
    yPosition += lineHeight * 2;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    answers.forEach((answer, index) => {
      // التحقق من الحاجة لصفحة جديدة
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      // رقم السؤال
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(52, 152, 219);
      yPosition = addText(`Q${index + 1} - السؤال ${index + 1}:`, margin, yPosition);
      yPosition += lineHeight;

      // نص السؤال
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(44, 62, 80);
      let questionText = answer.question.question_text;
      if (questionText.length > 90) {
        questionText = questionText.substring(0, 90) + '...';
      }
      
      // تقسيم النص الطويل
      const wrappedQuestion = pdf.splitTextToSize(questionText, contentWidth - 10);
      wrappedQuestion.forEach((line: string) => {
        yPosition = addText(line, margin + 5, yPosition);
        yPosition += lineHeight * 0.8;
      });
      yPosition += lineHeight * 0.5;

      // إجابة المستخدم
      const userAnswerText = answer.question.answers.find(a => a.id === answer.selected_answer_id)?.answer_text || 'No answer';
      const userAnswerShort = userAnswerText.length > 70 ? userAnswerText.substring(0, 70) + '...' : userAnswerText;
      
      if (answer.is_correct) {
        pdf.setTextColor(39, 174, 96);
        yPosition = addText(`✓ Your Answer - إجابتك: ${userAnswerShort}`, margin + 5, yPosition);
      } else {
        pdf.setTextColor(231, 76, 60);
        yPosition = addText(`✗ Your Answer - إجابتك: ${userAnswerShort}`, margin + 5, yPosition);
      }
      yPosition += lineHeight;

      // الإجابة الصحيحة (في حالة الخطأ)
      if (!answer.is_correct) {
        const correctAnswer = answer.question.answers.find(a => a.is_correct);
        if (correctAnswer) {
          const correctShort = correctAnswer.answer_text.length > 70 ? 
            correctAnswer.answer_text.substring(0, 70) + '...' : 
            correctAnswer.answer_text;
          pdf.setTextColor(39, 174, 96);
          yPosition = addText(`✓ Correct Answer - الإجابة الصحيحة: ${correctShort}`, margin + 5, yPosition);
          yPosition += lineHeight;
        }
      }

      // الشرح (إذا وجد)
      if (answer.question.explanation) {
        pdf.setTextColor(108, 117, 125);
        const explanationShort = answer.question.explanation.length > 80 ? 
          answer.question.explanation.substring(0, 80) + '...' : 
          answer.question.explanation;
        yPosition = addText(`💡 Explanation - الشرح: ${explanationShort}`, margin + 5, yPosition);
        yPosition += lineHeight;
      }

      pdf.setTextColor(0, 0, 0); // إعادة تعيين اللون
      yPosition += lineHeight * 0.5;

      // خط فاصل بين الأسئلة
      if (index < answers.length - 1) {
        pdf.setDrawColor(236, 240, 241);
        pdf.line(margin + 10, yPosition, pageWidth - margin - 10, yPosition);
        yPosition += lineHeight;
      }
    });

    // تذييل الصفحة
    const currentDate = format(new Date(), 'dd/MM/yyyy - HH:mm', { locale: arDZ });
    pdf.setFontSize(8);
    pdf.setTextColor(127, 140, 141);
    pdf.text(`Report generated on - تم إنشاء التقرير في: ${currentDate}`, pageWidth / 2, 285, { align: 'center' });

    console.log('تم إنشاء PDF محسن بنجاح');
    return pdf.output('blob');
  }

  static downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}