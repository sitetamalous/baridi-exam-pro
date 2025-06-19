
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { arDZ } from 'date-fns/locale/ar-DZ';

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

export class ArabicPdfGeneratorFixed {
  private static createHtmlContent(
    attempt: ExamAttempt,
    answers: UserAnswer[],
    userProfile?: UserProfile
  ): string {
    const examDate = format(new Date(attempt.completed_at), 'dd/MM/yyyy - HH:mm', { locale: arDZ });
    const currentDate = format(new Date(), 'dd/MM/yyyy - HH:mm', { locale: arDZ });

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Noto Sans Arabic', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 20px;
            direction: rtl;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #00A651;
            padding-bottom: 20px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #00A651;
            margin-bottom: 10px;
          }
          .exam-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
          }
          .info-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
          }
          .info-row {
            margin-bottom: 8px;
            font-size: 14px;
          }
          .label {
            font-weight: bold;
            color: #555;
          }
          .score-summary {
            background: #e8f5e8;
            border: 2px solid #00A651;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 25px;
          }
          .score-text {
            font-size: 18px;
            font-weight: bold;
            color: #00A651;
          }
          .questions-section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-bottom: 20px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          .question-item {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .question-header {
            font-weight: bold;
            font-size: 14px;
            color: #333;
            margin-bottom: 10px;
          }
          .answer-row {
            margin-bottom: 8px;
            font-size: 13px;
            padding: 5px;
            border-radius: 4px;
          }
          .user-answer {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
          }
          .correct-answer {
            background: #d4edda;
            border-left: 4px solid #28a745;
          }
          .wrong-answer {
            background: #f8d7da;
            border-left: 4px solid #dc3545;
          }
          .explanation {
            background: #e9ecef;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
            font-size: 12px;
            color: #666;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
          }
          .correct-icon { color: #28a745; }
          .wrong-icon { color: #dc3545; }
          .page-break { page-break-before: always; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">تقرير نتائج الامتحان</div>
          <div class="exam-title">عنوان الاختبار: ${attempt.exam.title}</div>
        </div>

        <div class="info-section">
          ${userProfile?.name ? `<div class="info-row"><span class="label">اسم المترشح:</span> ${userProfile.name}</div>` : ''}
          ${userProfile?.email ? `<div class="info-row"><span class="label">البريد الإلكتروني:</span> ${userProfile.email}</div>` : ''}
          <div class="info-row"><span class="label">تاريخ الامتحان:</span> ${examDate}</div>
        </div>

        <div class="score-summary">
          <div class="score-text">النتيجة النهائية: ${attempt.score} من ${answers.length} (${Math.round(attempt.percentage)}%)</div>
        </div>

        <div class="questions-section">
          <div class="section-title">تفاصيل الأسئلة والإجابات:</div>
          ${answers.map((answer, index) => {
            const userAnswerText = answer.question.answers.find(a => a.id === answer.selected_answer_id)?.answer_text || 'لم يتم الإجابة';
            const correctAnswer = answer.question.answers.find(a => a.is_correct);
            
            return `
              <div class="question-item">
                <div class="question-header">السؤال ${index + 1}: ${answer.question.question_text}</div>
                
                <div class="answer-row ${answer.is_correct ? 'correct-answer' : 'wrong-answer'}">
                  <strong>إجابتك:</strong> ${userAnswerText} 
                  <span class="${answer.is_correct ? 'correct-icon' : 'wrong-icon'}">
                    ${answer.is_correct ? '✓' : '✗'}
                  </span>
                </div>
                
                ${!answer.is_correct && correctAnswer ? `
                  <div class="answer-row correct-answer">
                    <strong>الإجابة الصحيحة:</strong> ${correctAnswer.answer_text} <span class="correct-icon">✓</span>
                  </div>
                ` : ''}
                
                ${answer.question.explanation ? `
                  <div class="explanation">
                    <strong>التفسير:</strong> ${answer.question.explanation}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>

        <div class="footer">
          تم إنشاء هذا التقرير في: ${currentDate}
        </div>
      </body>
      </html>
    `;
  }

  static async generateExamReport(
    attempt: ExamAttempt,
    answers: UserAnswer[],
    userProfile?: UserProfile
  ): Promise<Blob> {
    console.log('بدء إنشاء PDF باستخدام HTML to Canvas...');

    // إنشاء عنصر HTML مؤقت
    const htmlContent = this.createHtmlContent(attempt, answers, userProfile);
    
    // إنشاء div مؤقت لعرض المحتوى
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '794px'; // A4 width in pixels at 96 DPI
    tempDiv.style.background = 'white';
    
    // إضافة العنصر المؤقت للصفحة
    document.body.appendChild(tempDiv);

    try {
      // انتظار تحميل الخطوط
      await document.fonts.ready;
      
      // تحويل HTML إلى Canvas
      const canvas = await html2canvas(tempDiv.firstElementChild as HTMLElement, {
        scale: 2, // جودة عالية
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: tempDiv.firstElementChild!.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          // التأكد من تطبيق الخطوط في النسخة المستنسخة
          const style = clonedDoc.createElement('style');
          style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap');
            * { font-family: 'Noto Sans Arabic', Arial, sans-serif !important; }
          `;
          clonedDoc.head.appendChild(style);
        }
      });

      // إنشاء PDF من Canvas
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // إضافة الصورة للـ PDF
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // إذا كان المحتوى أطول من صفحة واحدة، أضف صفحات إضافية
      const pageHeight = 297; // A4 height in mm
      let remainingHeight = imgHeight - pageHeight;
      let yPosition = -pageHeight;

      while (remainingHeight > 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, yPosition, imgWidth, imgHeight);
        remainingHeight -= pageHeight;
        yPosition -= pageHeight;
      }

      console.log('تم إنشاء PDF بنجاح');

      return pdf.output('blob');
    } finally {
      // إزالة العنصر المؤقت
      document.body.removeChild(tempDiv);
    }
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
