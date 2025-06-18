
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

export class ArabicPdfGenerator {
  private static createPDF(): jsPDF {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set RTL direction and UTF-8 encoding
    pdf.setFont('helvetica');
    pdf.setFontSize(12);
    
    return pdf;
  }

  private static addArabicText(
    pdf: jsPDF, 
    text: string, 
    x: number, 
    y: number, 
    options: {
      fontSize?: number;
      isBold?: boolean;
      align?: 'right' | 'center' | 'left';
      maxWidth?: number;
    } = {}
  ): number {
    const { fontSize = 12, isBold = false, align = 'right', maxWidth = 180 } = options;
    
    pdf.setFontSize(fontSize);
    
    if (isBold) {
      pdf.setFont('helvetica', 'bold');
    } else {
      pdf.setFont('helvetica', 'normal');
    }

    // For Arabic text, we need to reverse the text direction for proper display
    const lines = pdf.splitTextToSize(text, maxWidth);
    let currentY = y;

    lines.forEach((line: string) => {
      if (align === 'right') {
        pdf.text(line, x, currentY, { align: 'right' });
      } else if (align === 'center') {
        pdf.text(line, x, currentY, { align: 'center' });
      } else {
        pdf.text(line, x, currentY);
      }
      currentY += fontSize * 0.5; // Line height
    });

    return currentY;
  }

  static async generateExamReport(
    attempt: ExamAttempt,
    answers: UserAnswer[],
    userProfile?: UserProfile
  ): Promise<Blob> {
    const pdf = this.createPDF();
    let yPosition = 20;
    const pageWidth = 210;
    const rightMargin = 190;
    const leftMargin = 20;

    // Header Section
    yPosition = this.addArabicText(
      pdf,
      'تقرير نتائج الامتحان',
      pageWidth / 2,
      yPosition,
      { fontSize: 18, isBold: true, align: 'center' }
    );

    yPosition += 10;

    // Exam Title
    yPosition = this.addArabicText(
      pdf,
      `عنوان الاختبار: ${attempt.exam.title}`,
      rightMargin,
      yPosition,
      { fontSize: 14, isBold: true }
    );

    yPosition += 5;

    // User Information
    if (userProfile?.name) {
      yPosition = this.addArabicText(
        pdf,
        `اسم المترشح: ${userProfile.name}`,
        rightMargin,
        yPosition,
        { fontSize: 12 }
      );
    }

    if (userProfile?.email) {
      yPosition = this.addArabicText(
        pdf,
        `البريد الإلكتروني: ${userProfile.email}`,
        rightMargin,
        yPosition,
        { fontSize: 12 }
      );
    }

    // Date and Time
    const examDate = format(new Date(attempt.completed_at), 'dd/MM/yyyy - HH:mm', { locale: arDZ });
    yPosition = this.addArabicText(
      pdf,
      `تاريخ الامتحان: ${examDate}`,
      rightMargin,
      yPosition,
      { fontSize: 12 }
    );

    yPosition += 5;

    // Score Summary
    yPosition = this.addArabicText(
      pdf,
      `النتيجة النهائية: ${attempt.score} من ${answers.length} (${Math.round(attempt.percentage)}%)`,
      rightMargin,
      yPosition,
      { fontSize: 14, isBold: true }
    );

    yPosition += 15;

    // Questions Section
    yPosition = this.addArabicText(
      pdf,
      'تفاصيل الأسئلة والإجابات:',
      rightMargin,
      yPosition,
      { fontSize: 14, isBold: true }
    );

    yPosition += 10;

    // Process each question
    answers.forEach((answer, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      // Question number and text
      yPosition = this.addArabicText(
        pdf,
        `السؤال ${index + 1}: ${answer.question.question_text}`,
        rightMargin,
        yPosition,
        { fontSize: 12, isBold: true, maxWidth: 170 }
      );

      yPosition += 5;

      // User's answer
      const userAnswerText = answer.question.answers.find(
        a => a.id === answer.selected_answer_id
      )?.answer_text || 'لم يتم الإجابة';

      const userIcon = answer.is_correct ? '✓' : '✗';
      const userColor = answer.is_correct ? 'green' : 'red';
      
      yPosition = this.addArabicText(
        pdf,
        `إجابتك: ${userAnswerText} ${userIcon}`,
        rightMargin,
        yPosition,
        { fontSize: 11, maxWidth: 170 }
      );

      // Correct answer (if user was wrong)
      if (!answer.is_correct) {
        const correctAnswer = answer.question.answers.find(a => a.is_correct);
        if (correctAnswer) {
          yPosition = this.addArabicText(
            pdf,
            `الإجابة الصحيحة: ${correctAnswer.answer_text} ✓`,
            rightMargin,
            yPosition,
            { fontSize: 11, maxWidth: 170 }
          );
        }
      }

      // Explanation (if available)
      if (answer.question.explanation) {
        yPosition += 2;
        yPosition = this.addArabicText(
          pdf,
          `التفسير: ${answer.question.explanation}`,
          rightMargin,
          yPosition,
          { fontSize: 10, maxWidth: 170 }
        );
      }

      yPosition += 8;

      // Add separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(leftMargin, yPosition, rightMargin, yPosition);
      yPosition += 5;
    });

    // Footer
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    yPosition += 10;
    yPosition = this.addArabicText(
      pdf,
      `تم إنشاء هذا التقرير في: ${format(new Date(), 'dd/MM/yyyy - HH:mm', { locale: arDZ })}`,
      pageWidth / 2,
      yPosition,
      { fontSize: 10, align: 'center' }
    );

    // Convert to blob
    const pdfBlob = pdf.output('blob');
    return pdfBlob;
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
