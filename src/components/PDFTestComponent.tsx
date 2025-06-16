
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArabicPDFGenerator } from '@/services/arabicPDFGenerator';
import { Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PDFTestComponent: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateTestPDF = async () => {
    setIsGenerating(true);
    try {
      const generator = new ArabicPDFGenerator();
      
      // Sample test data with Arabic text and Unicode symbols
      const testAttempt = {
        id: 'test-attempt-1',
        score: 8,
        percentage: 80,
        completed_at: new Date().toISOString(),
        started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        exam: {
          id: 'test-exam-1',
          title: 'امتحان تجريبي في اللغة العربية والرياضيات',
          description: 'امتحان شامل يحتوي على أسئلة متنوعة'
        }
      };

      const testQuestions = [
        {
          id: 'q1',
          question_id: 'q1',
          selected_answer_id: 'a1-correct',
          is_correct: true,
          question: {
            question_text: 'ما هو ناتج جمع ٢ + ٣؟',
            answers: [
              { id: 'a1-correct', answer_text: '٥', is_correct: true },
              { id: 'a1-wrong1', answer_text: '٤', is_correct: false },
              { id: 'a1-wrong2', answer_text: '٦', is_correct: false }
            ]
          }
        },
        {
          id: 'q2',
          question_id: 'q2',
          selected_answer_id: 'a2-wrong',
          is_correct: false,
          question: {
            question_text: 'أي من الخيارات التالية يعبر عن العلاقة الصحيحة؟ [✓] أم [✗]',
            answers: [
              { id: 'a2-correct', answer_text: 'القاهرة عاصمة مصر ✓', is_correct: true },
              { id: 'a2-wrong', answer_text: 'بغداد عاصمة الجزائر ✗', is_correct: false },
              { id: 'a2-wrong2', answer_text: 'الرباط عاصمة تونس ✗', is_correct: false }
            ]
          }
        },
        {
          id: 'q3',
          question_id: 'q3',
          selected_answer_id: 'a3-correct',
          is_correct: true,
          question: {
            question_text: 'اختر الإجابة الصحيحة: هل تدعم هذه المنصة النصوص العربية والرموز؟',
            answers: [
              { id: 'a3-correct', answer_text: 'نعم، تدعم النصوص العربية والرموز مثل → ← ↔ 📄 📊', is_correct: true },
              { id: 'a3-wrong', answer_text: 'لا، لا تدعم سوى الإنجليزية', is_correct: false }
            ]
          }
        }
      ];

      const testUser = {
        name: 'أحمد محمد العربي',
        email: 'ahmed@example.com'
      };

      // Generate PDF
      const pdfBytes = await generator.generatePDF(testAttempt, testQuestions, testUser);
      
      // Download the PDF
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `تقرير-تجريبي-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "تم إنشاء التقرير بنجاح",
        description: "تم تحميل التقرير التجريبي بنجاح مع النصوص العربية والرموز"
      });
    } catch (error) {
      console.error('Error generating test PDF:', error);
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء التقرير",
        description: "حدث خطأ أثناء إنشاء التقرير التجريبي"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <FileText className="w-5 h-5" />
          اختبار PDF العربي
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-gray-600">
          اختبر إنشاء PDF مع النصوص العربية والرموز
        </p>
        <div className="text-xs bg-gray-50 p-3 rounded-lg">
          <p>سيحتوي التقرير على:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>نصوص عربية كاملة ✓</li>
            <li>اتجاه RTL صحيح ←</li>
            <li>رموز Unicode مثل: ✗ ✓ → ↔</li>
            <li>أرقام عربية: ١٢٣٤٥</li>
          </ul>
        </div>
        <Button 
          onClick={generateTestPDF} 
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              جاري الإنشاء...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              إنشاء تقرير تجريبي
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PDFTestComponent;
