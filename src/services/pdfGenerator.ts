
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

// Simple Arabic to Latin transliteration for PDF compatibility
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

// Safe text drawing function with automatic line wrapping
const drawSafeText = (
  page: any,
  text: string,
  x: number,
  y: number,
  options: any = {}
) => {
  try {
    const safeText = arabicToLatin(text);
    const maxWidth = options.maxWidth || 400;
    const fontSize = options.size || 10;
    
    // Simple word wrapping
    const words = safeText.split(' ');
    let lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = testLine.length * (fontSize * 0.6); // Rough estimate
      
      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    
    // Draw lines
    let currentY = y;
    for (const line of lines) {
      page.drawText(line, {
        x,
        y: currentY,
        size: fontSize,
        font: options.font || StandardFonts.Helvetica,
        color: options.color || rgb(0, 0, 0),
      });
      currentY -= fontSize + 2;
    }
    
    return currentY;
  } catch (error) {
    console.error('Error drawing text:', error);
    page.drawText('Text display error', {
      x,
      y,
      size: options.size || 10,
      font: StandardFonts.Helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });
    return y - 15;
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
      
      const pdfDoc = await PDFDocument.create();
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      let pages = [];
      let currentPage = pdfDoc.addPage([595.28, 841.89]); // A4 size
      pages.push(currentPage);
      
      const { width, height } = currentPage.getSize();
      let currentY = height - 50;
      const margin = 50;
      const lineHeight = 20;
      
      // Header
      drawSafeText(currentPage, 'Algeria Post Exam Report', margin, currentY, {
        size: 20,
        font: helveticaBold,
        color: rgb(0, 0.65, 0.32),
      });
      currentY -= lineHeight * 2;
      
      // Exam Details
      const examTitle = attempt.exam?.title || 'Exam';
      drawSafeText(currentPage, `Exam: ${examTitle}`, margin, currentY, {
        size: 14,
        font: helveticaBold,
        maxWidth: width - 2 * margin,
      });
      currentY -= lineHeight;
      
      if (attempt.exam?.description) {
        currentY = drawSafeText(currentPage, `Description: ${attempt.exam.description}`, margin, currentY, {
          size: 10,
          font: helvetica,
          maxWidth: width - 2 * margin,
        });
        currentY -= 10;
      }
      
      // Student Info
      const studentName = userProfile?.name || userProfile?.email || 'Student';
      drawSafeText(currentPage, `Student: ${studentName}`, margin, currentY, {
        size: 12,
        font: helvetica,
      });
      currentY -= lineHeight;
      
      // Exam Date and Duration
      const examDate = new Date(attempt.completed_at).toLocaleDateString('en-US');
      const examTime = new Date(attempt.completed_at).toLocaleTimeString('en-US');
      drawSafeText(currentPage, `Date: ${examDate} at ${examTime}`, margin, currentY, {
        size: 10,
        font: helvetica,
      });
      currentY -= lineHeight;
      
      const startTime = new Date(attempt.started_at);
      const endTime = new Date(attempt.completed_at);
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      drawSafeText(currentPage, `Duration: ${duration} minutes`, margin, currentY, {
        size: 10,
        font: helvetica,
      });
      currentY -= lineHeight * 2;
      
      // Results Summary
      drawSafeText(currentPage, 'Results Summary:', margin, currentY, {
        size: 16,
        font: helveticaBold,
      });
      currentY -= lineHeight;
      
      const correctAnswers = answers.filter(a => a.is_correct).length;
      const totalQuestions = answers.length;
      const percentage = attempt.percentage || 0;
      
      drawSafeText(currentPage, `Total Questions: ${totalQuestions}`, margin, currentY, {
        font: helvetica,
      });
      currentY -= lineHeight;
      
      drawSafeText(currentPage, `Correct Answers: ${correctAnswers}`, margin, currentY, {
        font: helvetica,
      });
      currentY -= lineHeight;
      
      drawSafeText(currentPage, `Wrong Answers: ${totalQuestions - correctAnswers}`, margin, currentY, {
        font: helvetica,
      });
      currentY -= lineHeight;
      
      const scoreColor = percentage >= 70 ? rgb(0, 0.8, 0) : percentage >= 50 ? rgb(1, 0.6, 0) : rgb(1, 0, 0);
      drawSafeText(currentPage, `Final Score: ${attempt.score}/${totalQuestions} (${percentage.toFixed(1)}%)`, margin, currentY, {
        color: scoreColor,
        font: helveticaBold,
        size: 14,
      });
      currentY -= lineHeight;
      
      const performance = percentage >= 70 ? 'Excellent' : percentage >= 50 ? 'Good' : 'Needs Improvement';
      drawSafeText(currentPage, `Performance: ${performance}`, margin, currentY, {
        size: 12,
        font: helveticaBold,
        color: scoreColor,
      });
      currentY -= lineHeight * 2;
      
      // Detailed Questions Review
      drawSafeText(currentPage, 'Detailed Questions Review:', margin, currentY, {
        size: 16,
        font: helveticaBold,
      });
      currentY -= lineHeight * 1.5;
      
      // Process each question
      answers.forEach((answer, index) => {
        // Check if we need a new page
        if (currentY < 150) {
          currentPage = pdfDoc.addPage([595.28, 841.89]);
          pages.push(currentPage);
          currentY = height - 50;
        }
        
        // Question header
        const questionHeader = `Question ${index + 1}:`;
        drawSafeText(currentPage, questionHeader, margin, currentY, {
          size: 12,
          font: helveticaBold,
          color: rgb(0, 0.65, 0.32),
        });
        currentY -= lineHeight;
        
        // Question text
        if (answer.question?.question_text) {
          currentY = drawSafeText(currentPage, answer.question.question_text, margin, currentY, {
            size: 10,
            font: helvetica,
            maxWidth: width - 2 * margin,
          });
          currentY -= 10;
        }
        
        // User's answer
        const userAnswer = answer.question?.answers?.find(a => a.id === answer.selected_answer_id);
        if (userAnswer) {
          const answerColor = answer.is_correct ? rgb(0, 0.8, 0) : rgb(1, 0, 0);
          const answerStatus = answer.is_correct ? '✓' : '✗';
          currentY = drawSafeText(currentPage, `${answerStatus} Your Answer: ${userAnswer.answer_text}`, margin, currentY, {
            size: 10,
            font: helvetica,
            color: answerColor,
            maxWidth: width - 2 * margin,
          });
          currentY -= 5;
        }
        
        // Correct answer (if user was wrong)
        if (!answer.is_correct) {
          const correctAnswer = answer.question?.answers?.find(a => a.is_correct);
          if (correctAnswer) {
            currentY = drawSafeText(currentPage, `✓ Correct Answer: ${correctAnswer.answer_text}`, margin, currentY, {
              size: 10,
              font: helvetica,
              color: rgb(0, 0.8, 0),
              maxWidth: width - 2 * margin,
            });
            currentY -= 5;
          }
        }
        
        // Explanation
        if (answer.question?.explanation) {
          currentY = drawSafeText(currentPage, `Explanation: ${answer.question.explanation}`, margin, currentY, {
            size: 9,
            font: helvetica,
            color: rgb(0.3, 0.3, 0.3),
            maxWidth: width - 2 * margin,
          });
          currentY -= 5;
        }
        
        // Add separator
        currentPage.drawLine({
          start: { x: margin, y: currentY },
          end: { x: width - margin, y: currentY },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8),
        });
        currentY -= 15;
      });
      
      // Footer on all pages
      pages.forEach(page => {
        const footerText = `Generated on: ${new Date().toLocaleString('en-US')} | Algeria Post Exam System`;
        drawSafeText(page, footerText, margin, 30, {
          size: 8,
          color: rgb(0.5, 0.5, 0.5),
          font: helvetica,
        });
      });
      
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
