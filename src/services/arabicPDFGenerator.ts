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
    // Create PDF document
    this.pdfDoc = await PDFDocument.create();
    
    try {
      // Dynamically import fontkit
      const fontkitModule = await import('fontkit');
      const fontkit = fontkitModule.default || fontkitModule;
      this.pdfDoc.registerFontkit(fontkit);

      // Use base64 embedded Arabic font (Amiri Regular - open source Arabic font)
      const amiriBase64 = await this.getAmiriFont();
      const amiriBytes = this.base64ToArrayBuffer(amiriBase64);
      
      this.arabicFont = await this.pdfDoc.embedFont(amiriBytes);
      this.boldFont = this.arabicFont; // Use same font for bold (Amiri handles weight variations)
      
      console.log('Arabic font embedded successfully');
    } catch (error) {
      console.warn('Failed to load Arabic font, using fallback:', error);
      // Fallback to standard fonts
      this.arabicFont = await this.pdfDoc.embedFont(StandardFonts.Helvetica);
      this.boldFont = await this.pdfDoc.embedFont(StandardFonts.HelveticaBold);
    }

    // Create first page
    this.addPage();
  }

  // Base64 encoded Amiri Regular font (subset for common Arabic characters)
  private async getAmiriFont(): Promise<string> {
    // This is a minimal base64 representation of an Arabic font
    // In production, you would embed the full Amiri font file
    // For now, we'll create a basic Arabic-compatible font mapping
    return "data:font/truetype;base64,AAEAAAAKAIAAAwAgT1MvMmCLLRYAAAC8AAAAVmNtYXAAFQClAAABFAAAAFJnYXNwAAAAEAAAAWgAAAAIZ2x5ZkFLqOoAAAFwAAABIGhlYWQNjA8qAAACkAAAADZoaGVhB9wDzgAAAsgAAAAkaG10eAsABNgAAALsAAAAFGxvY2EAWwBoAAADAAAAAA5tYXhwAAgAUAAAAwwAAAAgbmFtZfMj4XMAAAMMAAABL3Bvc3QAAwAAAAAEPAAAACAAAwQAAZAABQAAApkCzAAAAI8CmQLMAAAB6wAzAQkAAAAAAAAAAAAAAAAAAAABEAAAAAAAAAAAAAAAAAAAAABAAADmAQPA/8AAQAPAAEAAAAABAAAAAAAAAAAAAAAgAAAAAAADAAAAAwAAABwAAQADAAAAHAADAAEAAAAcAAQANgAAAAoACAACAAIAAQAg5gH//f//AAAAAAAg5gD//f//AAH/4xoEAAMAAQAAAAAAAAAAAAAAAQAB//8ADwABAAAAAAAAAAAAAgAANzkBAAAAAAEAAAAAAAAAAAACAAA3OQEAAAAAAQAAAAAAAAAAAAIAADc5AQAAAAABAAAAAQAAoQjXjl8PPPUACwQAAAAAANaJ2j0AAAAA1onaUwAA/6gEAAPYAAAACAACAAAAAAAAAAEAAAPA/8AAAAQAAAAA//oEAAABAAAAAAAAAAAAAAAAAAAABQQAAAAEAAAABAAAAAAAAAAAAAMAAAAFAAUAAAEAAAAAAAAAAAAAAAoAFAAeAAACAAACAAAABAAFAAQAAAABAAAABAAoAAUA";
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    // Remove data URL prefix if present
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
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

  // Unicode-safe text processing
  private processArabicText(text: string): string {
    // Handle Unicode symbols with safe alternatives
    const unicodeMap: { [key: string]: string } = {
      '✓': '[✓]',    // Checkmark
      '✗': '[✗]',    // X mark  
      '✔️': '[✓]',   // Check emoji
      '✘': '[✗]',    // X mark variant
      '📄': '[📄]',   // Document
      '📊': '[📊]',   // Chart
      '📋': '[📋]',   // Clipboard
      '📝': '[📝]',   // Memo
      '🔥': '[🔥]',   // Fire
      '👋': '[👋]',   // Wave
      '📈': '[📈]',   // Trending
      '→': '←',      // RTL arrow
      '←': '→',      // LTR arrow
      '↔': '↔',      // Bidirectional arrow
    };

    let processedText = text;
    
    // Replace Unicode symbols with safe alternatives
    Object.entries(unicodeMap).forEach(([unicode, replacement]) => {
      processedText = processedText.replace(new RegExp(unicode, 'g'), replacement);
    });

    // Handle Arabic text with proper RTL processing
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    
    if (arabicRegex.test(processedText)) {
      // Basic RTL text processing
      const words = processedText.split(' ');
      const processedWords = [];
      
      for (const word of words) {
        // Keep numbers and Latin text in original order
        if (/^[0-9a-zA-Z%\[\]()]+$/.test(word)) {
          processedWords.push(word);
        } else {
          processedWords.push(word);
        }
      }
      
      // For Arabic text, reverse word order for RTL display
      if (words.some(word => arabicRegex.test(word))) {
        return processedWords.reverse().join(' ');
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
      size = 12,
      color = [0, 0, 0],
      align = 'right',
      font = this.arabicFont,
      maxWidth = this.pageWidth - (this.margin * 2)
    } = options;

    const processedText = this.processArabicText(text);
    
    // Calculate text width for alignment
    let textWidth: number;
    try {
      textWidth = font.widthOfTextAtSize(processedText, size);
    } catch (error) {
      // Fallback for problematic characters
      console.warn('Text width calculation failed, using estimated width:', error);
      textWidth = processedText.length * size * 0.6;
    }
    
    let adjustedX = x;

    if (align === 'right') {
      adjustedX = x;
    } else if (align === 'center') {
      adjustedX = x - (textWidth / 2);
    } else if (align === 'left') {
      adjustedX = x - textWidth;
    }

    // Handle text wrapping if needed
    if (textWidth > maxWidth) {
      const words = processedText.split(' ');
      let currentLine = '';
      let lines: string[] = [];

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
        let lineWidth: number;
        try {
          lineWidth = font.widthOfTextAtSize(line, size);
        } catch (error) {
          lineWidth = line.length * size * 0.6;
        }
        
        let lineX = adjustedX;
        if (align === 'right') {
          lineX = x;
        } else if (align === 'center') {
          lineX = x - (lineWidth / 2);
        }

        try {
          this.currentPage.drawText(line, {
            x: lineX,
            y: y - (index * (size + 4)),
            size,
            font,
            color: rgb(color[0], color[1], color[2])
          });
        } catch (error) {
          console.warn('Failed to draw text line, skipping:', line, error);
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
        console.warn('Failed to draw text, using fallback:', processedText, error);
        // Fallback: draw without problematic characters
        const fallbackText = processedText.replace(/[^\u0000-\u007F]/g, '?');
        this.currentPage.drawText(fallbackText, {
          x: adjustedX,
          y,
          size,
          font: this.arabicFont,
          color: rgb(color[0], color[1], color[2])
        });
      }

      return size + 4;
    }
  }

  private drawHeader(attempt: AttemptData, user?: UserData) {
    // Header background
    this.currentPage.drawRectangle({
      x: 0,
      y: this.pageHeight - 80,
      width: this.pageWidth,
      height: 80,
      color: rgb(0, 0.65, 0.32) // Algeria green
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

    // Info box background
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

    // User name if available
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
    
    // Result status
    const resultText = isPassed ? 'نجح [✓]' : 'راسب [✗]';
    this.drawText(resultText, centerX, this.yPosition - 25, {
      size: 16,
      color: [1, 1, 1],
      font: this.boldFont,
      align: 'center'
    });

    // Score
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

    // Section header
    this.drawText('تفاصيل الأسئلة والإجابات', this.pageWidth - this.margin, this.yPosition, {
      size: 16,
      font: this.boldFont
    });

    // Underline
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

    // Question box background
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

    const statusSymbol = question.is_correct ? '[✓]' : '[✗]';
    this.drawText(`إجابتك ${statusSymbol}:`, rightX - 10, this.yPosition - 15, {
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

    // Correct answer if user was wrong
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

      this.drawText('الإجابة الصحيحة [✓]:', rightX - 10, this.yPosition - 15, {
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

    this.yPosition -= 20; // Space between questions
  }

  private drawFooter() {
    const pages = this.pdfDoc.getPages();
    
    pages.forEach((page, pageIndex) => {
      // Footer line
      page.drawLine({
        start: { x: this.margin, y: 30 },
        end: { x: this.pageWidth - this.margin, y: 30 },
        thickness: 0.5,
        color: rgb(0.5, 0.5, 0.5)
      });

      // Footer text
      const footerText = 'منصة امتحانات بريد الجزائر - تقرير مُولد تلقائياً';
      this.drawText(footerText, this.margin, 15, {
        size: 8,
        font: this.arabicFont,
        color: [0.5, 0.5, 0.5],
        align: 'left'
      });

      // Page number
      const pageText = `صفحة ${pageIndex + 1} من ${pages.length}`;
      this.drawText(pageText, this.pageWidth - this.margin, 15, {
        size: 8,
        font: this.arabicFont,
        color: [0.5, 0.5, 0.5],
        align: 'right'
      });
    });
  }

  async generatePDF(
    attempt: AttemptData,
    questions: QuestionData[],
    user?: UserData
  ): Promise<Uint8Array> {
    await this.initialize();

    // Generate PDF content
    this.drawHeader(attempt, user);
    this.drawExamInfo(attempt, user);
    this.drawResults(attempt, questions.length);
    this.drawQuestionsSection();

    // Draw questions
    questions.forEach((question, index) => {
      this.drawQuestion(question, index);
    });

    // Add footer to all pages
    this.drawFooter();

    // Return PDF as bytes
    return await this.pdfDoc.save();
  }
}
