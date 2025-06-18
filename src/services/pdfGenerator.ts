
import pdfMake from 'pdfmake/build/pdfmake';
import { createFontConfig } from './fontConfig';

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
      const fontConfig = createFontConfig();
      pdfMake.fonts = fontConfig;
      this.isInitialized = true;
      console.log('PDFMake fonts initialized successfully');
    } catch (error) {
      console.error('Error initializing fonts:', error);
      // Fallback to default fonts
      pdfMake.fonts = {
        Roboto: {
          normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf',
          bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf',
          italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Italic.ttf',
          bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-MediumItalic.ttf'
        }
      };
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
    
    // Helper function to detect Arabic text
    const isArabic = (text: string) => /[\u0600-\u06FF\u0750-\u077F]/.test(text);
    
    // Helper function to get appropriate font and alignment
    const getTextStyle = (text: string) => {
      if (isArabic(text)) {
        return {
          font: 'NotoSansArabic',
          alignment: 'right' as const,
          direction: 'rtl' as const
        };
      }
      return {
        font: 'Roboto',
        alignment: 'left' as const
      };
    };

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
        
        // Exam Title
        {
          text: attempt.exam?.title || 'امتحان',
          style: 'examTitle',
          ...getTextStyle(attempt.exam?.title || 'امتحان'),
          margin: [0, 0, 0, 10]
        },
        
        // Exam Description
        ...(attempt.exam?.description ? [{
          text: attempt.exam.description,
          style: 'description',
          ...getTextStyle(attempt.exam.description),
          margin: [0, 0, 0, 15]
        }] : []),
        
        // Student Info
        {
          text: `الطالب: ${userProfile?.name || userProfile?.email || 'Student'}`,
          style: 'studentInfo',
          font: 'NotoSansArabic',
          alignment: 'right',
          margin: [0, 0, 0, 5]
        },
        
        // Date and Time
        {
          text: `التاريخ: ${new Date(attempt.completed_at).toLocaleDateString('ar-SA')} في ${new Date(attempt.completed_at).toLocaleTimeString('ar-SA')}`,
          style: 'dateInfo',
          font: 'NotoSansArabic',
          alignment: 'right',
          margin: [0, 0, 0, 20]
        },
        
        // Results Summary
        {
          text: 'ملخص النتائج',
          style: 'sectionHeader',
          font: 'NotoSansArabic',
          alignment: 'right',
          margin: [0, 0, 0, 10]
        },
        
        {
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                { text: 'إجمالي الأسئلة', font: 'NotoSansArabic', alignment: 'right' },
                { text: totalQuestions.toString(), font: 'Roboto', alignment: 'center' }
              ],
              [
                { text: 'الإجابات الصحيحة', font: 'NotoSansArabic', alignment: 'right' },
                { text: correctAnswers.toString(), font: 'Roboto', alignment: 'center' }
              ],
              [
                { text: 'الإجابات الخاطئة', font: 'NotoSansArabic', alignment: 'right' },
                { text: (totalQuestions - correctAnswers).toString(), font: 'Roboto', alignment: 'center' }
              ],
              [
                { text: 'النتيجة النهائية', font: 'NotoSansArabic', alignment: 'right', bold: true },
                { 
                  text: `${attempt.score}/${totalQuestions} (${percentage.toFixed(1)}%)`,
                  font: 'Roboto',
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
          text: `التقييم: ${percentage >= 70 ? 'ممتاز' : percentage >= 50 ? 'جيد' : 'يحتاج تحسين'}`,
          style: 'performance',
          font: 'NotoSansArabic',
          alignment: 'right',
          color: percentage >= 70 ? '#00A651' : percentage >= 50 ? '#FF9500' : '#FF0000',
          margin: [0, 0, 0, 30]
        },
        
        // Detailed Questions Review
        {
          text: 'مراجعة تفصيلية للأسئلة',
          style: 'sectionHeader',
          font: 'NotoSansArabic',
          alignment: 'right',
          margin: [0, 0, 0, 15]
        },
        
        // Questions
        ...answers.map((answer, index) => {
          const userAnswer = answer.question?.answers?.find(a => a.id === answer.selected_answer_id);
          const correctAnswer = answer.question?.answers?.find(a => a.is_correct);
          
          return [
            {
              text: `السؤال ${index + 1}:`,
              style: 'questionNumber',
              font: 'NotoSansArabic',
              alignment: 'right',
              color: '#00A651',
              margin: [0, 15, 0, 5]
            },
            {
              text: answer.question?.question_text || '',
              style: 'questionText',
              font: 'NotoSansArabic',
              alignment: 'right',
              margin: [0, 0, 0, 10]
            },
            {
              text: `${answer.is_correct ? '✓ صحيح' : '✗ خطأ'} - إجابتك: ${userAnswer?.answer_text || ''}`,
              font: 'NotoSansArabic',
              alignment: 'right',
              color: answer.is_correct ? '#00A651' : '#FF0000',
              margin: [0, 0, 0, 5]
            },
            ...((!answer.is_correct && correctAnswer) ? [{
              text: `الإجابة الصحيحة: ${correctAnswer.answer_text}`,
              font: 'NotoSansArabic',
              alignment: 'right',
              color: '#00A651',
              margin: [0, 0, 0, 5]
            }] : []),
            ...(answer.question?.explanation ? [{
              text: `الشرح: ${answer.question.explanation}`,
              font: 'NotoSansArabic',
              alignment: 'right',
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
        description: {
          fontSize: 11
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
        text: `تم إنشاؤه في: ${new Date().toLocaleDateString('ar-SA')} | نظام امتحانات بريد الجزائر | صفحة ${currentPage} من ${pageCount}`,
        alignment: 'center',
        fontSize: 8,
        font: 'NotoSansArabic',
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
