
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

// Helper function to convert Arabic text to Latin for PDF compatibility
const arabicToLatin = (text: string): string => {
  const arabicMap: { [key: string]: string } = {
    'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h',
    'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's',
    'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a',
    'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm',
    'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y', 'ة': 'h', 'ى': 'a',
    'ء': 'a', 'آ': 'aa', 'أ': 'a', 'إ': 'i', 'ؤ': 'u', 'ئ': 'i',
    'َ': '', 'ُ': '', 'ِ': '', 'ً': '', 'ٌ': '', 'ٍ': '', 'ْ': '',
    ' ': ' ', '-': '-', '(': '(', ')': ')', ':': ':', '.': '.',
    '،': ',', '؟': '?', '!': '!', '0': '0', '1': '1', '2': '2',
    '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9'
  };

  return text.split('').map(char => arabicMap[char] || char).join('');
};

// Safe text drawing function that handles Arabic text
const drawSafeText = (
  page: any,
  text: string,
  x: number,
  y: number,
  options: any = {}
) => {
  try {
    // Convert Arabic text to Latin equivalent
    const safeText = arabicToLatin(text);
    
    page.drawText(safeText, {
      x,
      y,
      font: options.font || StandardFonts.Helvetica,
      size: options.size || 12,
      color: options.color || rgb(0, 0, 0),
    });
  } catch (error) {
    console.error('Error drawing text:', error);
    // Fallback: draw placeholder text
    page.drawText('Text display error', {
      x,
      y,
      font: StandardFonts.Helvetica,
      size: options.size || 12,
      color: rgb(0.5, 0.5, 0.5),
    });
  }
};

export class PDFGenerator {
  static async generateExamReport(
    attempt: ExamAttempt,
    answers: UserAnswer[],
    userProfile?: UserProfile
  ): Promise<Blob> {
    try {
      console.log('Starting PDF generation...');
      
      // Create new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Use only standard fonts to avoid fontkit issues
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Add new page
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      const { width, height } = page.getSize();
      
      let yPosition = height - 50;
      const margin = 50;
      const lineHeight = 20;
      
      // Header
      drawSafeText(page, 'Algeria Post Exam Report', margin, yPosition, {
        size: 20,
        font: boldFont,
        color: rgb(0, 0.65, 0.32),
      });
      yPosition -= lineHeight * 2;
      
      // Exam information
      const examTitle = attempt.exam?.title || 'Exam';
      drawSafeText(page, `Exam: ${examTitle}`, margin, yPosition, {
        size: 14,
        font: boldFont,
      });
      yPosition -= lineHeight;
      
      const studentName = userProfile?.name || userProfile?.email || 'Student';
      drawSafeText(page, `Student: ${studentName}`, margin, yPosition, {
        size: 12,
        font: font,
      });
      yPosition -= lineHeight;
      
      const examDate = new Date(attempt.completed_at).toLocaleDateString('en-US');
      drawSafeText(page, `Date: ${examDate}`, margin, yPosition, {
        size: 12,
        font: font,
      });
      yPosition -= lineHeight * 2;
      
      // Results
      const correctAnswers = answers.filter(a => a.is_correct).length;
      const totalQuestions = answers.length;
      const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      
      drawSafeText(page, 'Results Summary:', margin, yPosition, {
        size: 16,
        font: boldFont,
      });
      yPosition -= lineHeight;
      
      drawSafeText(page, `Total Questions: ${totalQuestions}`, margin, yPosition, {
        font: font,
      });
      yPosition -= lineHeight;
      
      drawSafeText(page, `Correct Answers: ${correctAnswers}`, margin, yPosition, {
        font: font,
      });
      yPosition -= lineHeight;
      
      const scoreColor = percentage >= 70 ? rgb(0, 0.8, 0) : percentage >= 50 ? rgb(1, 0.6, 0) : rgb(1, 0, 0);
      drawSafeText(page, `Score: ${percentage.toFixed(1)}%`, margin, yPosition, {
        color: scoreColor,
        font: boldFont,
      });
      yPosition -= lineHeight * 2;
      
      // Performance evaluation
      const performance = percentage >= 70 ? 'Excellent' : percentage >= 50 ? 'Good' : 'Needs Improvement';
      drawSafeText(page, `Performance: ${performance}`, margin, yPosition, {
        size: 14,
        font: boldFont,
        color: scoreColor,
      });
      yPosition -= lineHeight * 2;
      
      // Questions review
      drawSafeText(page, 'Questions Review:', margin, yPosition, {
        size: 14,
        font: boldFont,
      });
      yPosition -= lineHeight;
      
      // Display questions info (simplified)
      answers.slice(0, 10).forEach((answer, index) => {
        if (yPosition < 100) return; // Avoid going off page
        
        const statusText = answer.is_correct ? 'Correct' : 'Incorrect';
        const statusColor = answer.is_correct ? rgb(0, 0.8, 0) : rgb(1, 0, 0);
        
        drawSafeText(page, `Q${index + 1}: ${statusText}`, margin, yPosition, {
          size: 10,
          color: statusColor,
          font: font,
        });
        yPosition -= lineHeight * 0.8;
      });
      
      // Footer
      const footerText = `Generated on: ${new Date().toLocaleString('en-US')}`;
      drawSafeText(page, footerText, margin, 50, {
        size: 8,
        color: rgb(0.5, 0.5, 0.5),
        font: font,
      });
      
      // Convert PDF to Blob
      const pdfBytes = await pdfDoc.save();
      console.log('PDF generated successfully');
      
      return new Blob([pdfBytes], { type: 'application/pdf' });
      
    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw new Error('Failed to generate PDF report');
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
      console.error('Error downloading PDF:', error);
      throw new Error('Failed to download PDF');
    }
  }
}
