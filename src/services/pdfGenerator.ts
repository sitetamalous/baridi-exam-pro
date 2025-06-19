
import pdfMake from 'pdfmake/build/pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

// Define fonts for pdfMake with fallback
const fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  },
  Arabic: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  }
};

// Initialize pdfMake with fonts
pdfMake.fonts = fonts;

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
    const docDefinition: TDocumentDefinitions = {
      content: [
        // Header
        {
          text: 'تقرير نتائج الامتحان',
          style: 'header',
          alignment: 'center'
        },
        
        // Exam title
        {
          text: `عنوان الاختبار: ${attempt.exam.title}`,
          style: 'subheader',
          margin: [0, 20, 0, 10]
        },
        
        // User info
        ...(userProfile?.name ? [{
          text: `اسم المترشح: ${userProfile.name}`,
          margin: [0, 5, 0, 5]
        }] : []),
        
        ...(userProfile?.email ? [{
          text: `البريد الإلكتروني: ${userProfile.email}`,
          margin: [0, 5, 0, 5]
        }] : []),
        
        // Date
        {
          text: `تاريخ الامتحان: ${new Date(attempt.completed_at).toLocaleDateString('ar-DZ')}`,
          margin: [0, 5, 0, 10]
        },
        
        // Score
        {
          text: `النتيجة النهائية: ${attempt.score} من ${answers.length} (${Math.round(attempt.percentage)}%)`,
          style: 'subheader',
          margin: [0, 10, 0, 20]
        },
        
        // Questions header
        {
          text: 'تفاصيل الأسئلة والإجابات:',
          style: 'subheader',
          margin: [0, 20, 0, 10]
        },
        
        // Questions
        ...answers.map((answer, index) => {
          const userAnswerText = answer.question.answers.find(
            a => a.id === answer.selected_answer_id
          )?.answer_text || 'لم يتم الإجابة';
          
          const correctAnswer = answer.question.answers.find(a => a.is_correct);
          
          return [
            {
              text: `السؤال ${index + 1}: ${answer.question.question_text}`,
              style: 'question',
              margin: [0, 10, 0, 5]
            },
            {
              text: `إجابتك: ${userAnswerText} ${answer.is_correct ? '✓' : '✗'}`,
              margin: [20, 5, 0, 5],
              color: answer.is_correct ? 'green' : 'red'
            },
            ...(correctAnswer && !answer.is_correct ? [{
              text: `الإجابة الصحيحة: ${correctAnswer.answer_text} ✓`,
              margin: [20, 5, 0, 5],
              color: 'green'
            }] : []),
            ...(answer.question.explanation ? [{
              text: `التفسير: ${answer.question.explanation}`,
              margin: [20, 5, 0, 10],
              fontSize: 10,
              color: 'gray'
            }] : []),
            {
              canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5, lineColor: '#cccccc' }]
            }
          ];
        }).flat(),
        
        // Footer
        {
          text: `تم إنشاء هذا التقرير في: ${new Date().toLocaleString('ar-DZ')}`,
          alignment: 'center',
          margin: [0, 30, 0, 0],
          fontSize: 10,
          color: 'gray'
        }
      ],
      
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        question: {
          fontSize: 12,
          bold: true
        }
      },
      
      defaultStyle: {
        font: 'Arabic',
        fontSize: 11,
        direction: 'rtl'
      },
      
      pageMargins: [40, 60, 40, 60]
    };

    return new Promise((resolve, reject) => {
      try {
        const pdfDocGenerator = pdfMake.createPdf(docDefinition);
        pdfDocGenerator.getBlob((blob: Blob) => {
          resolve(blob);
        });
      } catch (error) {
        reject(error);
      }
    });
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
