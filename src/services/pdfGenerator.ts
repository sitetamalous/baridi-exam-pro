import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// Initialize pdfMake with built-in fonts
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

// Define custom fonts with Arabic support
const fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  },
  Amiri: {
    normal: 'amiri-regular.ttf',
    bold: 'amiri-bold.ttf',
    italics: 'amiri-italic.ttf',
    bolditalics: 'amiri-bolditalic.ttf'
  },
  NotoSansArabic: {
    normal: 'noto-sans-arabic-regular.ttf',
    bold: 'noto-sans-arabic-bold.ttf',
    italics: 'noto-sans-arabic-italic.ttf',
    bolditalics: 'noto-sans-arabic-bolditalic.ttf'
  }
};

// Helper function to convert ArrayBuffer to base64
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Load fonts from public directory
const loadFont = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load font: ${url}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);
    return `data:font/truetype;base64,${base64}`;
  } catch (error) {
    console.warn(`Font loading failed for ${url}, using fallback`);
    return '';
  }
};

// Initialize fonts with base64 data
const initializeFonts = async () => {
  try {
    const [amiriRegular, amiriBold, notoRegular, notoBold] = await Promise.all([
      loadFont('/fonts/amiri-regular.ttf'),
      loadFont('/fonts/amiri-bold.ttf'),
      loadFont('/fonts/noto-sans-arabic-regular.ttf'),
      loadFont('/fonts/noto-sans-arabic-bold.ttf')
    ]);

    // Add fonts to VFS
    Object.assign((pdfMake as any).vfs, {
      'amiri-regular.ttf': amiriRegular.split(',')[1],
      'amiri-bold.ttf': amiriBold.split(',')[1],
      'noto-sans-arabic-regular.ttf': notoRegular.split(',')[1],
      'noto-sans-arabic-bold.ttf': notoBold.split(',')[1]
    });

    // Set fonts configuration
    pdfMake.fonts = fonts;
  } catch (error) {
    console.error('Font initialization failed:', error);
    // Fallback to default fonts
    pdfMake.fonts = {
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
      }
    };
  }
};

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

export class PDFGenerator {
  private static initialized = false;

  static async initialize() {
    if (!this.initialized) {
      await initializeFonts();
      this.initialized = true;
    }
  }

  static async generateExamReport(
    attempt: ExamAttempt,
    answers: UserAnswer[],
    userProfile?: UserProfile
  ): Promise<Blob> {
    await this.initialize();

    const correctAnswers = answers.filter(a => a.is_correct).length;
    const totalQuestions = answers.length;
    const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // Unicode symbols that work with Arabic fonts
    const checkMark = '✓';
    const crossMark = '✗';
    const rightArrow = '←';

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      defaultStyle: {
        font: 'NotoSansArabic',
        fontSize: 12,
        direction: 'rtl',
        alignment: 'right'
      },
      content: [
        // Header
        {
          text: 'تقرير نتائج الامتحان',
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        
        // Exam Info
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: 'اسم الامتحان:', style: 'label' },
                { text: attempt.exam.title, style: 'value' }
              ],
              [
                { text: 'اسم المتقدم:', style: 'label' },
                { text: userProfile?.name || userProfile?.email || 'غير محدد', style: 'value' }
              ],
              [
                { text: 'تاريخ الامتحان:', style: 'label' },
                { text: new Date(attempt.completed_at).toLocaleDateString('ar-SA'), style: 'value' }
              ],
              [
                { text: 'وقت الامتحان:', style: 'label' },
                { text: new Date(attempt.completed_at).toLocaleTimeString('ar-SA'), style: 'value' }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#cccccc',
            vLineColor: () => '#cccccc'
          },
          margin: [0, 0, 0, 20]
        },

        // Results Summary
        {
          text: 'ملخص النتائج',
          style: 'sectionHeader',
          margin: [0, 20, 0, 10]
        },
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                { text: 'إجمالي الأسئلة', style: 'tableHeader' },
                { text: 'الإجابات الصحيحة', style: 'tableHeader' },
                { text: 'النسبة المئوية', style: 'tableHeader' }
              ],
              [
                { text: totalQuestions.toString(), style: 'tableCell', alignment: 'center' },
                { text: correctAnswers.toString(), style: 'tableCell', alignment: 'center' },
                { text: `${percentage.toFixed(1)}%`, style: 'tableCell', alignment: 'center' }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#cccccc',
            vLineColor: () => '#cccccc'
          },
          margin: [0, 0, 0, 20]
        },

        // Performance Indicator
        {
          text: [
            'التقييم: ',
            {
              text: percentage >= 70 ? 'ممتاز' : percentage >= 50 ? 'جيد' : 'يحتاج تحسين',
              color: percentage >= 70 ? '#00A651' : percentage >= 50 ? '#FFA500' : '#FF0000',
              bold: true
            }
          ],
          style: 'performance',
          margin: [0, 0, 0, 30]
        },

        // Questions Review
        {
          text: 'مراجعة الأسئلة',
          style: 'sectionHeader',
          margin: [0, 20, 0, 15]
        },

        // Questions List
        ...answers.map((answer, index) => {
          const question = answer.question;
          const correctAnswer = question.answers.find(a => a.is_correct);
          const selectedAnswer = question.answers.find(a => a.id === answer.selected_answer_id);
          
          return [
            {
              text: `السؤال ${index + 1}`,
              style: 'questionNumber',
              margin: [0, 15, 0, 5]
            },
            {
              text: question.question_text,
              style: 'questionText',
              margin: [0, 0, 0, 10]
            },
            {
              table: {
                widths: ['*'],
                body: [
                  [
                    {
                      text: [
                        'إجابتك: ',
                        {
                          text: selectedAnswer ? selectedAnswer.answer_text : 'لم يتم الإجابة',
                          color: answer.is_correct ? '#00A651' : '#FF0000'
                        },
                        ' ',
                        {
                          text: answer.is_correct ? checkMark : crossMark,
                          color: answer.is_correct ? '#00A651' : '#FF0000',
                          fontSize: 14
                        }
                      ],
                      style: 'answerText'
                    }
                  ],
                  ...(answer.is_correct ? [] : [
                    [
                      {
                        text: [
                          'الإجابة الصحيحة: ',
                          {
                            text: correctAnswer?.answer_text || 'غير محددة',
                            color: '#00A651'
                          },
                          ' ',
                          {
                            text: checkMark,
                            color: '#00A651',
                            fontSize: 14
                          }
                        ],
                        style: 'answerText'
                      }
                    ]
                  ])
                ]
              },
              layout: {
                hLineWidth: () => 0,
                vLineWidth: () => 0,
                paddingLeft: () => 10,
                paddingRight: () => 10,
                paddingTop: () => 5,
                paddingBottom: () => 5
              },
              margin: [0, 0, 0, 10]
            }
          ];
        }).flat(),

        // Footer
        {
          text: [
            'تم إنشاء هذا التقرير بواسطة منصة امتحانات بريد الجزائر في ',
            new Date().toLocaleDateString('ar-SA'),
            ' الساعة ',
            new Date().toLocaleTimeString('ar-SA')
          ],
          style: 'footer',
          margin: [0, 30, 0, 0]
        }
      ],

      styles: {
        header: {
          fontSize: 20,
          bold: true,
          color: '#00A651',
          font: 'NotoSansArabic'
        },
        sectionHeader: {
          fontSize: 16,
          bold: true,
          color: '#333333',
          font: 'NotoSansArabic'
        },
        label: {
          fontSize: 12,
          bold: true,
          color: '#666666',
          font: 'NotoSansArabic'
        },
        value: {
          fontSize: 12,
          color: '#333333',
          font: 'NotoSansArabic'
        },
        tableHeader: {
          fontSize: 12,
          bold: true,
          color: '#ffffff',
          fillColor: '#00A651',
          alignment: 'center',
          font: 'NotoSansArabic'
        },
        tableCell: {
          fontSize: 12,
          color: '#333333',
          font: 'NotoSansArabic'
        },
        performance: {
          fontSize: 14,
          bold: true,
          alignment: 'center',
          font: 'NotoSansArabic'
        },
        questionNumber: {
          fontSize: 14,
          bold: true,
          color: '#00A651',
          font: 'NotoSansArabic'
        },
        questionText: {
          fontSize: 12,
          color: '#333333',
          lineHeight: 1.4,
          font: 'NotoSansArabic'
        },
        answerText: {
          fontSize: 11,
          lineHeight: 1.3,
          font: 'NotoSansArabic'
        },
        footer: {
          fontSize: 10,
          color: '#666666',
          alignment: 'center',
          font: 'NotoSansArabic'
        }
      }
    };

    return new Promise((resolve, reject) => {
      try {
        const pdfDocGenerator = pdfMake.createPdf(docDefinition);
        pdfDocGenerator.getBlob((blob: Blob) => {
          resolve(blob);
        });
      } catch (error) {
        console.error('PDF generation error:', error);
        reject(error);
      }
    });
  }

  static async downloadPDF(blob: Blob, filename: string) {
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
