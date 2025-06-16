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
  private hasArabicFont = false;

  async initialize() {
    // Create PDF document
    this.pdfDoc = await PDFDocument.create();
    
    try {
      // Dynamically import fontkit and handle CommonJS/ESM interop
      const fontkitModule = await import('fontkit');
      // Handle both CommonJS and ESM exports
      const fontkit = fontkitModule.default || fontkitModule;
      this.pdfDoc.registerFontkit(fontkit);

      console.log('Fontkit loaded successfully, attempting to load Arabic font...');
      
      // Try to load Arabic font
      const arabicFontUrl = 'https://fonts.gstatic.com/s/amiri/v27/J7aRnpd8CGxBHqUpvrIw74NL.woff2';
      
      const arabicFontBytes = await fetch(arabicFontUrl).then(res => {
        if (!res.ok) {
          throw new Error(`Font fetch failed: ${res.status}`);
        }
        return res.arrayBuffer();
      });
      
      this.arabicFont = await this.pdfDoc.embedFont(arabicFontBytes);
      this.boldFont = this.arabicFont;
      this.hasArabicFont = true;
      console.log('Arabic font loaded successfully');
    } catch (error) {
      console.warn('Failed to load Arabic font or fontkit, using standard fonts:', error);
      this.arabicFont = await this.pdfDoc.embedFont(StandardFonts.Helvetica);
      this.boldFont = await this.pdfDoc.embedFont(StandardFonts.HelveticaBold);
      this.hasArabicFont = false;
    }

    // Create first page
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

  // Convert Arabic text to Latin equivalent if Arabic font is not available
  private processText(text: string): string {
    if (this.hasArabicFont) {
      return text; // Return original text if we have Arabic font
    }
    
    // If no Arabic font, convert to Latin equivalent
    const arabicToLatin: { [key: string]: string } = {
      'منصة امتحانات بريد الجزائر': 'Algeria Post Exam Platform',
      'تقرير نتائج الامتحان': 'Exam Results Report',
      'عنوان الامتحان:': 'Exam Title:',
      'تاريخ الإجراء:': 'Date:',
      'الطالب:': 'Student:',
      'النتيجة:': 'Score:',
      'نجح': 'Passed',
      'راسب': 'Failed',
      'تفاصيل الأسئلة والإجابات': 'Questions and Answers Details',
      'السؤال': 'Question',
      'إجابتك:': 'Your Answer:',
      'الإجابة الصحيحة:': 'Correct Answer:',
      'لم يتم الإجابة': 'Not Answered',
      'غير محدد': 'Not Specified',
      'منصة امتحانات بريد الجزائر - تقرير مُولد تلقائياً': 'Algeria Post Exam Platform - Auto-generated Report',
      'صفحة': 'Page',
      'من': 'of'
    };
    
    // Check if the text has an exact translation
    if (arabicToLatin[text]) {
      return arabicToLatin[text];
    }
    
    // For other text, remove Arabic characters and keep Latin/numbers
    return text.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '?');
  }

  // Proper Arabic text handling with RTL support (only when Arabic font is available)
  private processArabicText(text: string): string {
    const processedText = this.processText(text);
    
    if (!this.hasArabicFont) {
      return processedText; // Return processed Latin text
    }
    
    // Basic Arabic text processing - in a production app, you'd use a proper BiDi library
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    
    if (!arabicRegex.test(processedText)) {
      return processedText; // Return as-is if no Arabic characters
    }

    // Split text into words and reverse for RTL display
    const words = processedText.split(' ');
    const processedWords = words.map(word => {
      // Keep numbers and Latin text in their original order
      if (/^[0-9a-zA-Z%]+$/.test(word)) {
        return word;
      }
      return word;
    });

    // Reverse word order for RTL
    return processedWords.reverse().join(' ');
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
    const textWidth = font.widthOfTextAtSize(processedText, size);
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
        const testWidth = font.widthOfTextAtSize(testLine, size);

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
        const lineWidth = font.widthOfTextAtSize(line, size);
        let lineX = adjustedX;
        if (align === 'right') {
          lineX = x;
        } else if (align === 'center') {
          lineX = x - (lineWidth / 2);
        }

        this.currentPage.drawText(line, {
          x: lineX,
          y: y - (index * (size + 4)),
          size,
          font,
          color: rgb(color[0], color[1], color[2])
        });
      });

      return lines.length * (size + 4);
    } else {
      this.currentPage.drawText(processedText, {
        x: adjustedX,
        y,
        size,
        font,
        color: rgb(color[0], color[1], color[2])
      });

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
    const examDate = new Date(attempt.completed_at).toLocaleDateString('en-US', {
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
    const resultText = isPassed ? 'Passed ✓' : 'Failed ✗';
    this.drawText(resultText, centerX, this.yPosition - 25, {
      size: 16,
      color: [1, 1, 1],
      font: this.boldFont,
      align: 'center'
    });

    // Score
    const scoreText = `Score: ${attempt.score}/${totalQuestions} - ${Math.round(attempt.percentage)}%`;
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

    this.drawText('إجابتك:', rightX - 10, this.yPosition - 15, {
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
      const footerText = this.processText('منصة امتحانات بريد الجزائر - تقرير مُولد تلقائياً');
      page.drawText(footerText, {
        x: this.margin,
        y: 15,
        size: 8,
        font: this.arabicFont,
        color: rgb(0.5, 0.5, 0.5)
      });

      // Page number
      const pageText = this.processText(`صفحة ${pageIndex + 1} من ${pages.length}`);
      page.drawText(pageText, {
        x: this.pageWidth - this.margin,
        y: 15,
        size: 8,
        font: this.arabicFont,
        color: rgb(0.5, 0.5, 0.5)
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
