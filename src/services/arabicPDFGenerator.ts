import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from 'pdf-lib';

interface ExamData {
  id: string;
  title: string;
  description?: string;
}

interface AttemptData {
  id: string;
  score: number;
  percentage: number;
  completed_at: string;
  started_at: string;
  exam: ExamData;
}

interface QuestionData {
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

interface UserData {
  name?: string;
  email?: string;
}

export class ArabicPDFGenerator {
  private pdfDoc!: PDFDocument;
  private arabicFont!: PDFFont;
  private boldFont!: PDFFont;
  private currentPage!: PDFPage;
  private yPosition: number = 0;
  private margin = 40;
  private pageWidth = 0;
  private pageHeight = 0;

  async initialize() {
    this.pdfDoc = await PDFDocument.create();
    
    try {
      // Use standard fonts that support Unicode better
      this.arabicFont = await this.pdfDoc.embedFont(StandardFonts.Helvetica);
      this.boldFont = await this.pdfDoc.embedFont(StandardFonts.HelveticaBold);
      console.log('Fonts embedded successfully');
    } catch (error) {
      console.warn('Failed to embed fonts, using defaults:', error);
      this.arabicFont = await this.pdfDoc.embedFont(StandardFonts.Helvetica);
      this.boldFont = await this.pdfDoc.embedFont(StandardFonts.HelveticaBold);
    }

    this.addPage();
  }

  private addPage() {
    this.currentPage = this.pdfDoc.addPage([595, 842]); // A4 size
    this.pageWidth = this.currentPage.getWidth();
    this.pageHeight = this.currentPage.getHeight();
    this.yPosition = this.pageHeight - this.margin;
  }

  private checkPageSpace(requiredSpace: number) {
    if (this.yPosition - requiredSpace < this.margin) {
      this.addPage();
    }
  }

  // Process Arabic text for RTL rendering and Unicode symbols
  private processArabicText(text: string): string {
    // Replace problematic Unicode symbols with Arabic equivalents
    const symbolReplacements: { [key: string]: string } = {
      '✓': 'صحيح',
      '✗': 'خطأ',
      '✔': 'صحيح',
      '✘': 'خطأ',
      '→': '←',
      '←': '→',
      '↔': '↔',
      '"': '"',
      '"': '"',
      '\u2018': "'", // Left single quotation mark
      '\u2019': "'", // Right single quotation mark
      '…': '...',
      '–': '-',
      '—': '-'
    };

    let processedText = text;
    
    // Replace symbols
    Object.entries(symbolReplacements).forEach(([symbol, replacement]) => {
      processedText = processedText.replace(new RegExp(symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
    });

    // Handle Arabic text direction
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    
    if (arabicRegex.test(processedText)) {
      // For Arabic text, ensure proper RTL ordering
      const words = processedText.split(' ');
      const arabicWords = words.filter(word => arabicRegex.test(word));
      const latinWords = words.filter(word => !arabicRegex.test(word));
      
      if (arabicWords.length > 0) {
        // Combine Arabic and Latin words properly for RTL
        return [...arabicWords, ...latinWords].join(' ');
      }
    }

    return processedText;
  }

  private drawText(text: string, x: number, y: number, options: {
    size?: number;
    color?: [number, number, number];
    align?: 'left' | 'center' | 'right';
    font?: PDFFont;
    maxWidth?: number;
  } = {}) {
    const {
      size = 14,
      color = [0, 0, 0],
      align = 'right',
      font = this.arabicFont,
      maxWidth = this.pageWidth - (this.margin * 2)
    } = options;

    const processedText = this.processArabicText(text);
    
    let textWidth: number;
    try {
      textWidth = font.widthOfTextAtSize(processedText, size);
    } catch (error) {
      textWidth = processedText.length * size * 0.6;
    }
    
    let adjustedX = x;
    if (align === 'center') {
      adjustedX = x - (textWidth / 2);
    } else if (align === 'left') {
      adjustedX = x - textWidth;
    }

    // Handle text wrapping
    if (textWidth > maxWidth) {
      const words = processedText.split(' ');
      let currentLine = '';
      const lines: string[] = [];

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        let testWidth: number;
        
        try {
          testWidth = font.widthOfTextAtSize(testLine, size);
        } catch (error) {
          testWidth = testLine.length * size * 0.6;
        }

        if (testWidth > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }

      // Draw multiple lines
      lines.forEach((line, index) => {
        try {
          this.currentPage.drawText(line, {
            x: adjustedX,
            y: y - (index * (size + 4)),
            size,
            font,
            color: rgb(color[0], color[1], color[2])
          });
        } catch (error) {
          console.warn('Failed to draw text line:', error);
        }
      });

      return lines.length * (size + 4);
    } else {
      try {
        this.currentPage.drawText(processedText, {
          x: adjustedX,
          y,
          size,
          font,
          color: rgb(color[0], color[1], color[2])
        });
      } catch (error) {
        console.warn('Failed to draw text:', error);
      }

      return size + 4;
    }
  }

  private drawHeader(attempt: AttemptData) {
    // Header background
    this.currentPage.drawRectangle({
      x: 0,
      y: this.pageHeight - 80,
      width: this.pageWidth,
      height: 80,
      color: rgb(0, 0.65, 0.32)
    });

    // Title
    this.drawText('منصة امتحانات بريد الجزائر', this.pageWidth - this.margin, this.pageHeight - 30, {
      size: 18,
      color: [1, 1, 1],
      font: this.boldFont,
      align: 'right'
    });

    this.drawText('تقرير نتائج الامتحان', this.pageWidth - this.margin, this.pageHeight - 55, {
      size: 14,
      color: [1, 1, 1],
      align: 'right'
    });

    this.yPosition = this.pageHeight - 100;
  }

  private drawExamInfo(attempt: AttemptData, user?: UserData) {
    this.checkPageSpace(120);

    // Info box
    this.currentPage.drawRectangle({
      x: this.margin,
      y: this.yPosition - 100,
      width: this.pageWidth - (this.margin * 2),
      height: 100,
      color: rgb(0.97, 0.98, 0.99),
      borderColor: rgb(0.9, 0.9, 0.9),
      borderWidth: 1
    });

    const rightX = this.pageWidth - this.margin - 10;
    let infoY = this.yPosition - 20;

    // Exam title
    this.drawText('عنوان الامتحان:', rightX, infoY, {
      font: this.boldFont,
      size: 12
    });
    infoY -= 20;
    this.drawText(attempt.exam.title, rightX, infoY, {
      size: 11
    });

    // Date
    infoY -= 25;
    this.drawText('تاريخ الإجراء:', rightX, infoY, {
      font: this.boldFont,
      size: 12
    });
    infoY -= 20;
    const examDate = new Date(attempt.completed_at).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    this.drawText(examDate, rightX, infoY, {
      size: 11
    });

    // User name
    if (user?.name) {
      infoY -= 25;
      this.drawText('الطالب:', rightX, infoY, {
        font: this.boldFont,
        size: 12
      });
      infoY -= 20;
      this.drawText(user.name, rightX, infoY, {
        size: 11
      });
    }

    this.yPosition -= 120;
  }

  private drawResults(attempt: AttemptData, totalQuestions: number) {
    this.checkPageSpace(80);

    const isPassed = attempt.percentage >= 50;
    const resultColor: [number, number, number] = isPassed ? [0.13, 0.77, 0.37] : [0.94, 0.27, 0.27];

    // Results box
    this.currentPage.drawRectangle({
      x: this.margin,
      y: this.yPosition - 60,
      width: this.pageWidth - (this.margin * 2),
      height: 60,
      color: rgb(resultColor[0], resultColor[1], resultColor[2])
    });

    const centerX = this.pageWidth / 2;
    
    const resultText = isPassed ? 'نجح' : 'راسب';
    this.drawText(resultText, centerX, this.yPosition - 25, {
      size: 16,
      color: [1, 1, 1],
      font: this.boldFont,
      align: 'center'
    });

    const scoreText = `النتيجة: ${attempt.score}/${totalQuestions} - ${Math.round(attempt.percentage)}%`;
    this.drawText(scoreText, centerX, this.yPosition - 50, {
      size: 14,
      color: [1, 1, 1],
      align: 'center'
    });

    this.yPosition -= 80;
  }

  private drawQuestionsSection() {
    this.checkPageSpace(50);

    this.drawText('تفاصيل الأسئلة والإجابات', this.pageWidth - this.margin, this.yPosition, {
      size: 16,
      font: this.boldFont
    });

    this.currentPage.drawLine({
      start: { x: this.margin, y: this.yPosition - 5 },
      end: { x: this.pageWidth - this.margin, y: this.yPosition - 5 },
      thickness: 1,
      color: rgb(0, 0.65, 0.32)
    });

    this.yPosition -= 30;
  }

  private drawQuestion(question: QuestionData, index: number) {
    const requiredSpace = 120;
    this.checkPageSpace(requiredSpace);

    const rightX = this.pageWidth - this.margin - 10;

    // Question box
    this.currentPage.drawRectangle({
      x: this.margin,
      y: this.yPosition - 80,
      width: this.pageWidth - (this.margin * 2),
      height: 80,
      color: rgb(0.98, 0.98, 0.99),
      borderColor: rgb(0.87, 0.87, 0.87),
      borderWidth: 1
    });

    // Question number and text
    let questionY = this.yPosition - 20;
    this.drawText(`السؤال ${index + 1}:`, rightX, questionY, {
      font: this.boldFont,
      size: 12
    });

    questionY -= 25;
    const questionHeight = this.drawText(question.question.question_text, rightX, questionY, {
      size: 11,
      maxWidth: this.pageWidth - (this.margin * 2) - 20
    });

    this.yPosition -= Math.max(80, questionHeight + 40);

    // User's answer
    this.checkPageSpace(50);
    const selectedAnswer = question.question.answers.find(a => a.id === question.selected_answer_id);
    const answerColor: [number, number, number] = question.is_correct ? [0.13, 0.77, 0.37] : [0.94, 0.27, 0.27];

    this.currentPage.drawRectangle({
      x: this.margin + 20,
      y: this.yPosition - 35,
      width: this.pageWidth - (this.margin * 2) - 40,
      height: 35,
      color: rgb(answerColor[0] * 0.1, answerColor[1] * 0.1, answerColor[2] * 0.1),
      borderColor: rgb(answerColor[0] * 0.3, answerColor[1] * 0.3, answerColor[2] * 0.3),
      borderWidth: 1
    });

    const statusText = question.is_correct ? 'صحيح' : 'خطأ';
    this.drawText(`إجابتك ${statusText}:`, rightX - 10, this.yPosition - 15, {
      font: this.boldFont,
      size: 10,
      color: answerColor
    });

    const userAnswerText = selectedAnswer?.answer_text || 'لم يتم الإجابة';
    this.drawText(userAnswerText, rightX - 10, this.yPosition - 30, {
      size: 10,
      color: answerColor
    });

    this.yPosition -= 45;

    // Show correct answer if user was wrong
    if (!question.is_correct) {
      this.checkPageSpace(50);
      const correctAnswer = question.question.answers.find(a => a.is_correct);

      this.currentPage.drawRectangle({
        x: this.margin + 20,
        y: this.yPosition - 35,
        width: this.pageWidth - (this.margin * 2) - 40,
        height: 35,
        color: rgb(0.13 * 0.1, 0.77 * 0.1, 0.37 * 0.1),
        borderColor: rgb(0.13 * 0.3, 0.77 * 0.3, 0.37 * 0.3),
        borderWidth: 1
      });

      this.drawText('الإجابة الصحيحة:', rightX - 10, this.yPosition - 15, {
        font: this.boldFont,
        size: 10,
        color: [0.13, 0.77, 0.37]
      });

      const correctAnswerText = correctAnswer?.answer_text || 'غير محدد';
      this.drawText(correctAnswerText, rightX - 10, this.yPosition - 30, {
        size: 10,
        color: [0.13, 0.77, 0.37]
      });

      this.yPosition -= 45;
    }

    this.yPosition -= 20;
  }

  private drawFooter() {
    const pages = this.pdfDoc.getPages();
    
    pages.forEach((page, pageIndex) => {
      page.drawLine({
        start: { x: this.margin, y: 30 },
        end: { x: this.pageWidth - this.margin, y: 30 },
        thickness: 0.5,
        color: rgb(0.5, 0.5, 0.5)
      });

      const originalPage = this.currentPage;
      this.currentPage = page;
      
      const footerText = 'منصة امتحانات بريد الجزائر - تقرير مُولد تلقائياً';
      this.drawText(footerText, this.margin, 15, {
        size: 8,
        font: this.arabicFont,
        color: [0.5, 0.5, 0.5],
        align: 'left'
      });

      const pageText = `صفحة ${pageIndex + 1} من ${pages.length}`;
      this.drawText(pageText, this.pageWidth - this.margin, 15, {
        size: 8,
        font: this.arabicFont,
        color: [0.5, 0.5, 0.5],
        align: 'right'
      });
      
      this.currentPage = originalPage;
    });
  }

  async generatePDF(
    attempt: AttemptData,
    questions: QuestionData[],
    user?: UserData
  ): Promise<Uint8Array> {
    await this.initialize();

    this.drawHeader(attempt);
    this.drawExamInfo(attempt, user);
    this.drawResults(attempt, questions.length);
    this.drawQuestionsSection();

    questions.forEach((question, index) => {
      this.drawQuestion(question, index);
    });

    this.drawFooter();

    return await this.pdfDoc.save();
  }
}
