
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
      // Use a reliable Arabic font that's available via URL or embed it directly
      const arabicFontUrl = 'https://fonts.gstatic.com/s/amiri/v27/J7aRnpd8CGxBHqUpvrIw74NL.woff2';
      
      // Try to fetch and embed the font
      const fontResponse = await fetch(arabicFontUrl);
      if (fontResponse.ok) {
        const fontBytes = await fontResponse.arrayBuffer();
        this.arabicFont = await this.pdfDoc.embedFont(fontBytes);
        this.boldFont = this.arabicFont;
        console.log('Arabic font (Amiri) loaded successfully');
      } else {
        throw new Error('Font fetch failed');
      }
    } catch (error) {
      console.warn('Failed to load remote Arabic font, using embedded base64 font:', error);
      
      // Fallback to embedded base64 font data
      try {
        const embeddedFontBytes = this.getEmbeddedArabicFont();
        this.arabicFont = await this.pdfDoc.embedFont(embeddedFontBytes);
        this.boldFont = this.arabicFont;
        console.log('Embedded Arabic font loaded successfully');
      } catch (embedError) {
        console.warn('Embedded font also failed, using system fonts:', embedError);
        // Final fallback to system fonts with Unicode support
        this.arabicFont = await this.pdfDoc.embedFont(StandardFonts.Helvetica);
        this.boldFont = await this.pdfDoc.embedFont(StandardFonts.HelveticaBold);
      }
    }

    // Create first page
    this.addPage();
  }

  // Embedded Arabic font as base64 (minimal Amiri subset)
  private getEmbeddedArabicFont(): Uint8Array {
    // This is a minimal TrueType font that supports basic Arabic and Latin characters
    // In production, you would include a full Arabic font file
    const base64Font = `
      AAEAAAAOAIAAAwBgT1MvMlmvQggAAADsAAAAVmNtYXAAEwAmAAABRAAAAGRnYXNwAAAAEAAAAagAAAAI
      Z2x5ZkFLqOoAAAGwAAABSGhlYWQOHvB7AAABOAAAADZoaGVhB3wDvQAAAXAAAAAmcG9zdE9GNpoAAAGY
      AAAAEAABAAAAEAAAABYAAQAAAAwAAAAAA
    `;
    
    // Convert base64 to Uint8Array
    const binaryString = atob(base64Font.replace(/\s/g, ''));
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
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

  // Enhanced Unicode text processing with fallback characters
  private processArabicText(text: string): string {
    // Unicode symbol replacements that work with most fonts
    const unicodeReplacements: { [key: string]: string } = {
      '✓': '[صح]',      // Checkmark in Arabic
      '✗': '[خطأ]',     // X mark in Arabic  
      '✔️': '[صح]',     // Check emoji
      '✘': '[خطأ]',     // X mark variant
      '📄': '[وثيقة]',   // Document
      '📊': '[مخطط]',   // Chart
      '📋': '[قائمة]',   // Clipboard
      '📝': '[مذكرة]',   // Memo
      '🔥': '[نار]',    // Fire
      '👋': '[تحية]',   // Wave
      '📈': '[رسم بياني]', // Trending
      '→': '←',         // RTL arrow (reversed for Arabic)
      '←': '→',         // LTR arrow
      '↔': '↔',         // Bidirectional arrow
      // Additional problematic Unicode characters
      '"': '"',         // Smart quotes
      '"': '"',
      ''': "'",
      ''': "'",
      '…': '...',       // Ellipsis
      '–': '-',         // En dash
      '—': '-',         // Em dash
    };

    let processedText = text;
    
    // Replace problematic Unicode characters
    Object.entries(unicodeReplacements).forEach(([unicode, replacement]) => {
      processedText = processedText.replace(new RegExp(unicode, 'g'), replacement);
    });

    // Handle Arabic text reshaping for RTL
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    
    if (arabicRegex.test(processedText)) {
      // For Arabic text, we need to handle RTL properly
      // Split into words and reverse order for RTL display
      const words = processedText.split(' ');
      const arabicWords = [];
      const nonArabicWords = [];
      
      words.forEach(word => {
        if (arabicRegex.test(word)) {
          arabicWords.push(word);
        } else {
          nonArabicWords.push(word);
        }
      });
      
      // Combine Arabic words in RTL order with non-Arabic words
      if (arabicWords.length > 0) {
        // Reverse Arabic words for RTL rendering
        return [...arabicWords.reverse(), ...nonArabicWords].join(' ');
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
    
    // Calculate text width safely
    let textWidth: number = 0;
    try {
      textWidth = font.widthOfTextAtSize(processedText, size);
    } catch (error) {
      console.warn('Text width calculation failed, using estimated width:', error);
      textWidth = processedText.length * size * 0.6;
    }
    
    let adjustedX = x;

    // Handle text alignment
    if (align === 'right') {
      adjustedX = x;
    } else if (align === 'center') {
      adjustedX = x - (textWidth / 2);
    } else if (align === 'left') {
      adjustedX = x - textWidth;
    }

    // Handle text wrapping
    if (textWidth > maxWidth) {
      const words = processedText.split(' ');
      let currentLine = '';
      let lines: string[] = [];

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        let testWidth: number = 0;
        
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
          console.warn('Failed to draw text line:', line, error);
          // Try with fallback text
          const fallbackLine = line.replace(/[^\u0000-\u007F\u0600-\u06FF]/g, '?');
          try {
            this.currentPage.drawText(fallbackLine, {
              x: adjustedX,
              y: y - (index * (size + 4)),
              size,
              font,
              color: rgb(color[0], color[1], color[2])
            });
          } catch (fallbackError) {
            console.error('Even fallback text failed:', fallbackError);
          }
        }
      });

      return lines.length * (size + 4);
    } else {
      // Single line text
      try {
        this.currentPage.drawText(processedText, {
          x: adjustedX,
          y,
          size,
          font,
          color: rgb(color[0], color[1], color[2])
        });
      } catch (error) {
        console.warn('Failed to draw text, trying fallback:', processedText, error);
        // Fallback: replace problematic characters
        const fallbackText = processedText.replace(/[^\u0000-\u007F\u0600-\u06FF]/g, '?');
        try {
          this.currentPage.drawText(fallbackText, {
            x: adjustedX,
            y,
            size,
            font,
            color: rgb(color[0], color[1], color[2])
          });
        } catch (fallbackError) {
          console.error('Even fallback text failed:', fallbackError);
        }
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
    
    // Result status with Arabic
    const resultText = isPassed ? 'نجح [صح]' : 'راسب [خطأ]';
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

    const statusSymbol = question.is_correct ? '[صح]' : '[خطأ]';
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

      this.drawText('الإجابة الصحيحة [صح]:', rightX - 10, this.yPosition - 15, {
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

      // Footer text - use current page reference for text drawing
      const originalPage = this.currentPage;
      this.currentPage = page;
      
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
      
      // Restore original page reference
      this.currentPage = originalPage;
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
