
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Initialize pdfMake with fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

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
  private static isInitialized = false;

  private static async initializeFonts() {
    if (this.isInitialized) return;
    
    try {
      // Use default fonts that support Arabic
      pdfMake.fonts = {
        Roboto: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-MediumItalic.ttf'
        }
      };
      this.isInitialized = true;
      console.log('PDFMake fonts initialized successfully');
    } catch (error) {
      console.error('Error initializing fonts:', error);
      this.isInitialized = true;
    }
  }

  static async generateExamReport(
    attempt: ExamAttempt,
    answers: UserAnswer[],
    userProfile?: UserProfile
  ): Promise<Blob> {
    console.log('Starting PDF generation with pdfMake...');
    
    await this.initializeFonts();
    
    const correctAnswers = answers.filter(a => a.is_correct).length;
    const totalQuestions = answers.length;
    const percentage = attempt.percentage || 0;
    
    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      defaultStyle: {
        font: 'Roboto',
        fontSize: 10,
        lineHeight: 1.3
      },
      content: [
        // Header
        {
          text: 'Algeria Post Exam Report',
          style: 'header',
          color: '#00A651',
          margin: [0, 0, 0, 20]
        },
        
        // Exam Title (handle Arabic if present)
        {
          text: attempt.exam?.title || 'امتحان',
          style: 'examTitle',
          alignment: 'center',
          margin: [0, 0, 0, 10]
        },
        
        // Student Info
        {
          text: `Student: ${userProfile?.name || userProfile?.email || 'Student'}`,
          style: 'studentInfo',
          margin: [0, 0, 0, 5]
        },
        
        // Date and Time
        {
          text: `Date: ${new Date(attempt.completed_at).toLocaleDateString()} at ${new Date(attempt.completed_at).toLocaleTimeString()}`,
          style: 'dateInfo',
          margin: [0, 0, 0, 20]
        },
        
        // Results Summary
        {
          text: 'Results Summary',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        
        {
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                { text: 'Total Questions', alignment: 'left' },
                { text: totalQuestions.toString(), alignment: 'center' }
              ],
              [
                { text: 'Correct Answers', alignment: 'left' },
                { text: correctAnswers.toString(), alignment: 'center' }
              ],
              [
                { text: 'Wrong Answers', alignment: 'left' },
                { text: (totalQuestions - correctAnswers).toString(), alignment: 'center' }
              ],
              [
                { text: 'Final Score', alignment: 'left', bold: true },
                { 
                  text: `${attempt.score}/${totalQuestions} (${percentage.toFixed(1)}%)`,
                  alignment: 'center',
                  bold: true,
                  color: percentage >= 70 ? '#00A651' : percentage >= 50 ? '#FF9500' : '#FF0000'
                }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 20]
        },
        
        // Performance Assessment
        {
          text: `Assessment: ${percentage >= 70 ? 'Excellent' : percentage >= 50 ? 'Good' : 'Needs Improvement'}`,
          style: 'performance',
          alignment: 'center',
          color: percentage >= 70 ? '#00A651' : percentage >= 50 ? '#FF9500' : '#FF0000',
          margin: [0, 0, 0, 30]
        },
        
        // Questions Review
        {
          text: 'Detailed Questions Review',
          style: 'sectionHeader',
          margin: [0, 0, 0, 15]
        },
        
        // Questions
        ...answers.map((answer, index) => {
          const userAnswer = answer.question?.answers?.find(a => a.id === answer.selected_answer_id);
          const correctAnswer = answer.question?.answers?.find(a => a.is_correct);
          
          return [
            {
              text: `Question ${index + 1}:`,
              style: 'questionNumber',
              color: '#00A651',
              margin: [0, 15, 0, 5]
            },
            {
              text: answer.question?.question_text || '',
              style: 'questionText',
              margin: [0, 0, 0, 10]
            },
            {
              text: `${answer.is_correct ? 'Correct' : 'Wrong'} - Your answer: ${userAnswer?.answer_text || ''}`,
              color: answer.is_correct ? '#00A651' : '#FF0000',
              margin: [0, 0, 0, 5]
            },
            ...((!answer.is_correct && correctAnswer) ? [{
              text: `Correct answer: ${correctAnswer.answer_text}`,
              color: '#00A651',
              margin: [0, 0, 0, 5]
            }] : []),
            ...(answer.question?.explanation ? [{
              text: `Explanation: ${answer.question.explanation}`,
              fontSize: 9,
              color: '#666666',
              margin: [0, 5, 0, 10]
            }] : []),
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0, y1: 0,
                  x2: 515, y2: 0,
                  lineWidth: 0.5,
                  lineColor: '#CCCCCC'
                }
              ],
              margin: [0, 5, 0, 0]
            }
          ];
        }).flat()
      ],
      
      styles: {
        header: {
          fontSize: 20,
          bold: true,
          alignment: 'center'
        },
        examTitle: {
          fontSize: 16,
          bold: true
        },
        studentInfo: {
          fontSize: 12,
          bold: true
        },
        dateInfo: {
          fontSize: 10
        },
        sectionHeader: {
          fontSize: 14,
          bold: true
        },
        performance: {
          fontSize: 12,
          bold: true
        },
        questionNumber: {
          fontSize: 12,
          bold: true
        },
        questionText: {
          fontSize: 11
        }
      },
      
      footer: (currentPage: number, pageCount: number) => ({
        text: `Generated on: ${new Date().toLocaleDateString()} | Algeria Post Exam System | Page ${currentPage} of ${pageCount}`,
        alignment: 'center',
        fontSize: 8,
        margin: [0, 10, 0, 0]
      })
    };

    return new Promise((resolve, reject) => {
      try {
        pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => {
          console.log('PDF generated successfully with pdfMake');
          resolve(blob);
        });
      } catch (error) {
        console.error('Error generating PDF:', error);
        reject(error);
      }
    });
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
