
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

export class SimplePdfGenerator {
  static async generateExamReport(
    attempt: ExamAttempt,
    answers: UserAnswer[],
    userProfile?: UserProfile
  ): Promise<Blob> {
    console.log('إنشاء PDF بسيط بدون html2canvas...');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // إعداد الخط والاتجاه للنص العربي
    pdf.setLanguage('ar');
    
    let yPosition = 20;
    const lineHeight = 7;
    const pageWidth = 210;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // عنوان التقرير
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    const title = 'Exam Results Report - تقرير نتائج الامتحان';
    pdf.text(title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight * 2;

    // عنوان الامتحان
    pdf.setFontSize(14);
    const examTitle = `Exam: ${attempt.exam.title}`;
    pdf.text(examTitle, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight * 2;

    // معلومات المستخدم
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    if (userProfile?.name) {
      const studentName = `Student Name: ${userProfile.name}`;
      pdf.text(studentName, margin, yPosition);
      yPosition += lineHeight;
    }

    if (userProfile?.email) {
      const studentEmail = `Email: ${userProfile.email}`;
      pdf.text(studentEmail, margin, yPosition);
      yPosition += lineHeight;
    }

    // تاريخ الامتحان
    const examDate = format(new Date(attempt.completed_at), 'dd/MM/yyyy - HH:mm', { locale: arDZ });
    const dateText = `Exam Date: ${examDate}`;
    pdf.text(dateText, margin, yPosition);
    yPosition += lineHeight * 2;

    // النتيجة النهائية
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    const scoreText = `Final Score: ${attempt.score}/${answers.length} (${Math.round(attempt.percentage)}%)`;
    pdf.text(scoreText, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight * 2;

    // النجاح أو الفشل
    const isPassed = attempt.percentage >= 50;
    const resultText = isPassed ? 'PASSED - نجح' : 'FAILED - رسب';
    pdf.setTextColor(isPassed ? 0 : 255, isPassed ? 128 : 0, 0);
    pdf.text(resultText, pageWidth / 2, yPosition, { align: 'center' });
    pdf.setTextColor(0, 0, 0); // إعادة تعيين اللون للأسود
    yPosition += lineHeight * 3;

    // تفاصيل الأسئلة
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Questions Details:', margin, yPosition);
    yPosition += lineHeight * 2;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    answers.forEach((answer, index) => {
      // التحقق من الحاجة لصفحة جديدة
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }

      // رقم السؤال
      const questionNumber = `Q${index + 1}:`;
      pdf.setFont('helvetica', 'bold');
      pdf.text(questionNumber, margin, yPosition);
      yPosition += lineHeight;

      // نص السؤال (مختصر)
      pdf.setFont('helvetica', 'normal');
      let questionText = answer.question.question_text;
      if (questionText.length > 80) {
        questionText = questionText.substring(0, 80) + '...';
      }
      const wrappedQuestion = pdf.splitTextToSize(questionText, contentWidth - 20);
      pdf.text(wrappedQuestion, margin + 10, yPosition);
      yPosition += lineHeight * Math.max(1, wrappedQuestion.length);

      // إجابة المستخدم
      const userAnswerText = answer.question.answers.find(a => a.id === answer.selected_answer_id)?.answer_text || 'No answer';
      const userAnswerShort = userAnswerText.length > 60 ? userAnswerText.substring(0, 60) + '...' : userAnswerText;
      const userAnswerLine = `Your Answer: ${userAnswerShort}`;
      
      if (answer.is_correct) {
        pdf.setTextColor(0, 128, 0); // أخضر للصحيح
        pdf.text(userAnswerLine + ' ✓', margin + 10, yPosition);
      } else {
        pdf.setTextColor(255, 0, 0); // أحمر للخطأ
        pdf.text(userAnswerLine + ' ✗', margin + 10, yPosition);
      }
      pdf.setTextColor(0, 0, 0); // إعادة تعيين اللون
      yPosition += lineHeight;

      // الإجابة الصحيحة (في حالة الخطأ)
      if (!answer.is_correct) {
        const correctAnswer = answer.question.answers.find(a => a.is_correct);
        if (correctAnswer) {
          const correctShort = correctAnswer.answer_text.length > 60 ? 
            correctAnswer.answer_text.substring(0, 60) + '...' : 
            correctAnswer.answer_text;
          pdf.setTextColor(0, 128, 0);
          pdf.text(`Correct Answer: ${correctShort} ✓`, margin + 10, yPosition);
          pdf.setTextColor(0, 0, 0);
          yPosition += lineHeight;
        }
      }

      yPosition += lineHeight * 0.5; // مسافة بين الأسئلة
    });

    // تذييل
    const currentDate = format(new Date(), 'dd/MM/yyyy - HH:mm', { locale: arDZ });
    const footerText = `Report generated on: ${currentDate}`;
    pdf.setFontSize(8);
    pdf.text(footerText, pageWidth / 2, 285, { align: 'center' });

    console.log('تم إنشاء PDF بنجاح');
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
