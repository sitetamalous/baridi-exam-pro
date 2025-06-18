
import jsPDF from 'jspdf';

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

export class PDFGenerator {
  static async generateExamReport(
    attempt: ExamAttempt,
    answers: UserAnswer[],
    userProfile?: UserProfile
  ): Promise<Blob> {
    console.log('Starting PDF generation with jsPDF...');
    
    // Create new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set font for better text support
    doc.setFont('helvetica');
    
    let yPosition = 20;
    const margin = 20;
    const lineHeight = 8;
    const pageHeight = 297; // A4 height in mm
    const pageWidth = 210; // A4 width in mm
    
    // Helper function to add new page if needed
    const checkPageBreak = (neededSpace: number = 20) => {
      if (yPosition + neededSpace > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
    };

    // Helper function for text wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      
      for (let i = 0; i < lines.length; i++) {
        checkPageBreak();
        doc.text(lines[i], x, yPosition);
        yPosition += lineHeight;
      }
      return yPosition;
    };

    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 166, 81); // Algeria green
    doc.text('Algeria Post Exam Report', margin, yPosition);
    yPosition += lineHeight * 2;

    // Exam Details
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    const examTitle = attempt.exam?.title || 'Exam';
    addWrappedText(`Exam: ${examTitle}`, margin, yPosition, pageWidth - 2 * margin, 14);
    yPosition += lineHeight;

    if (attempt.exam?.description) {
      doc.setFontSize(10);
      addWrappedText(`Description: ${attempt.exam.description}`, margin, yPosition, pageWidth - 2 * margin);
      yPosition += lineHeight;
    }

    // Student Info
    const studentName = userProfile?.name || userProfile?.email || 'Student';
    doc.setFontSize(12);
    doc.text(`Student: ${studentName}`, margin, yPosition);
    yPosition += lineHeight;

    // Exam Date and Duration
    const examDate = new Date(attempt.completed_at).toLocaleDateString('en-US');
    const examTime = new Date(attempt.completed_at).toLocaleTimeString('en-US');
    doc.setFontSize(10);
    doc.text(`Date: ${examDate} at ${examTime}`, margin, yPosition);
    yPosition += lineHeight;

    const startTime = new Date(attempt.started_at);
    const endTime = new Date(attempt.completed_at);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    doc.text(`Duration: ${duration} minutes`, margin, yPosition);
    yPosition += lineHeight * 2;

    // Results Summary
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Results Summary:', margin, yPosition);
    yPosition += lineHeight * 1.5;

    const correctAnswers = answers.filter(a => a.is_correct).length;
    const totalQuestions = answers.length;
    const percentage = attempt.percentage || 0;

    doc.setFontSize(10);
    doc.text(`Total Questions: ${totalQuestions}`, margin, yPosition);
    yPosition += lineHeight;

    doc.text(`Correct Answers: ${correctAnswers}`, margin, yPosition);
    yPosition += lineHeight;

    doc.text(`Wrong Answers: ${totalQuestions - correctAnswers}`, margin, yPosition);
    yPosition += lineHeight;

    // Score with color
    if (percentage >= 70) {
      doc.setTextColor(0, 200, 0);
    } else if (percentage >= 50) {
      doc.setTextColor(255, 150, 0);
    } else {
      doc.setTextColor(255, 0, 0);
    }
    
    doc.setFontSize(14);
    doc.text(`Final Score: ${attempt.score}/${totalQuestions} (${percentage.toFixed(1)}%)`, margin, yPosition);
    yPosition += lineHeight;

    const performance = percentage >= 70 ? 'Excellent' : percentage >= 50 ? 'Good' : 'Needs Improvement';
    doc.setFontSize(12);
    doc.text(`Performance: ${performance}`, margin, yPosition);
    yPosition += lineHeight * 2;

    // Reset color
    doc.setTextColor(0, 0, 0);

    // Detailed Questions Review
    doc.setFontSize(16);
    doc.text('Detailed Questions Review:', margin, yPosition);
    yPosition += lineHeight * 1.5;

    // Process each question
    answers.forEach((answer, index) => {
      checkPageBreak(40);

      // Question header
      doc.setFontSize(12);
      doc.setTextColor(0, 166, 81);
      doc.text(`Question ${index + 1}:`, margin, yPosition);
      yPosition += lineHeight;

      // Question text
      if (answer.question?.question_text) {
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        addWrappedText(answer.question.question_text, margin, yPosition, pageWidth - 2 * margin);
      }

      // User's answer
      const userAnswer = answer.question?.answers?.find(a => a.id === answer.selected_answer_id);
      if (userAnswer) {
        const answerStatus = answer.is_correct ? 'Correct' : 'Wrong';
        if (answer.is_correct) {
          doc.setTextColor(0, 200, 0);
        } else {
          doc.setTextColor(255, 0, 0);
        }
        addWrappedText(`${answerStatus} - Your Answer: ${userAnswer.answer_text}`, margin, yPosition, pageWidth - 2 * margin);
      }

      // Correct answer (if user was wrong)
      if (!answer.is_correct) {
        const correctAnswer = answer.question?.answers?.find(a => a.is_correct);
        if (correctAnswer) {
          doc.setTextColor(0, 200, 0);
          addWrappedText(`Correct Answer: ${correctAnswer.answer_text}`, margin, yPosition, pageWidth - 2 * margin);
        }
      }

      // Explanation
      if (answer.question?.explanation) {
        doc.setTextColor(80, 80, 80);
        doc.setFontSize(9);
        addWrappedText(`Explanation: ${answer.question.explanation}`, margin, yPosition, pageWidth - 2 * margin);
      }

      // Add separator
      yPosition += lineHeight;
      checkPageBreak();
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += lineHeight;

      // Reset color
      doc.setTextColor(0, 0, 0);
    });

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      const footerText = `Generated on: ${new Date().toLocaleString('en-US')} | Algeria Post Exam System`;
      doc.text(footerText, margin, pageHeight - 10);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 30, pageHeight - 10);
    }

    // Convert to blob
    const pdfOutput = doc.output('blob');
    console.log('PDF generated successfully with jsPDF');
    
    return pdfOutput;
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
