
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArabicPDFGenerator } from '@/services/arabicPDFGenerator';
import { Download, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PDFTestComponent: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateTestPDF = async () => {
    setIsGenerating(true);
    try {
      const generator = new ArabicPDFGenerator();
      
      // Enhanced Arabic test data
      const testAttempt = {
        id: 'test-attempt-1',
        score: 8,
        percentage: 80,
        completed_at: new Date().toISOString(),
        started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        exam: {
          id: 'test-exam-1',
          title: 'امتحان شامل في اللغة العربية والرياضيات والعلوم الإسلامية',
          description: 'امتحان تجريبي يحتوي على أسئلة متنوعة لاختبار قدرات الطالب في المواد الأساسية'
        }
      };

      const testQuestions = [
        {
          id: 'q1',
          question_id: 'q1',
          selected_answer_id: 'a1-correct',
          is_correct: true,
          question: {
            question_text: 'ما هو ناتج جمع العددين اثنين وثلاثة في النظام العشري؟ وما هو الرقم الناتج بالأرقام العربية؟',
            answers: [
              { id: 'a1-correct', answer_text: 'خمسة، ويكتب بالرقم العربي: ٥', is_correct: true },
              { id: 'a1-wrong1', answer_text: 'أربعة، ويكتب بالرقم العربي: ٤', is_correct: false },
              { id: 'a1-wrong2', answer_text: 'ستة، ويكتب بالرقم العربي: ٦', is_correct: false }
            ]
          }
        },
        {
          id: 'q2',
          question_id: 'q2',
          selected_answer_id: 'a2-wrong',
          is_correct: false,
          question: {
            question_text: 'أي من العبارات التالية صحيحة حول العواصم العربية؟ اختر الإجابة الصحيحة من بين الخيارات المطروحة أدناه:',
            answers: [
              { id: 'a2-correct', answer_text: 'القاهرة هي عاصمة جمهورية مصر العربية، وهي أكبر المدن العربية', is_correct: true },
              { id: 'a2-wrong', answer_text: 'بغداد هي عاصمة الجمهورية الجزائرية الديمقراطية الشعبية', is_correct: false },
              { id: 'a2-wrong2', answer_text: 'الرباط هي عاصمة الجمهورية التونسية وليس المملكة المغربية', is_correct: false }
            ]
          }
        },
        {
          id: 'q3',
          question_id: 'q3',
          selected_answer_id: 'a3-correct',
          is_correct: true,
          question: {
            question_text: 'هل تدعم هذه المنصة التعليمية الحديثة النصوص العربية والرموز المختلفة بشكل صحيح ومتكامل؟',
            answers: [
              { id: 'a3-correct', answer_text: 'نعم، تدعم النصوص العربية كاملة والرموز مثل: الأسهم والعلامات المختلفة', is_correct: true },
              { id: 'a3-wrong', answer_text: 'لا، تدعم فقط النصوص الإنجليزية والأرقام اللاتينية', is_correct: false }
            ]
          }
        },
        {
          id: 'q4',
          question_id: 'q4',
          selected_answer_id: 'a4-wrong',
          is_correct: false,
          question: {
            question_text: 'ما هي عاصمة الجمهورية الجزائرية الديمقراطية الشعبية؟ وما هي أهم خصائص هذه المدينة التاريخية؟',
            answers: [
              { id: 'a4-correct', answer_text: 'الجزائر العاصمة، وهي مدينة تاريخية تطل على البحر الأبيض المتوسط', is_correct: true },
              { id: 'a4-wrong', answer_text: 'وهران، وهي المدينة الساحلية الرئيسية في غرب الجزائر', is_correct: false },
              { id: 'a4-wrong2', answer_text: 'قسنطينة، وهي مدينة الجسور المعلقة في شرق الجزائر', is_correct: false }
            ]
          }
        },
        {
          id: 'q5',
          question_id: 'q5',
          selected_answer_id: 'a5-correct',
          is_correct: true,
          question: {
            question_text: 'في الإسلام، كم عدد الصلوات المفروضة في اليوم الواحد؟ وما هي أسماؤها بالترتيب الزمني الصحيح؟',
            answers: [
              { id: 'a5-correct', answer_text: 'خمس صلوات: الفجر، الظهر، العصر، المغرب، العشاء', is_correct: true },
              { id: 'a5-wrong1', answer_text: 'ثلاث صلوات: الفجر، الظهر، المغرب فقط', is_correct: false },
              { id: 'a5-wrong2', answer_text: 'سبع صلوات تشمل النوافل والفرائض معاً', is_correct: false }
            ]
          }
        }
      ];

      const testUser = {
        name: 'أحمد محمد العربي بن علي الجزائري',
        email: 'ahmed.mohamed@poste.dz'
      };

      console.log('Starting enhanced Arabic PDF generation...');
      const pdfBytes = await generator.generatePDF(testAttempt, testQuestions, testUser);
      console.log('PDF generated successfully, size:', pdfBytes.length, 'bytes');
      
      // Download the PDF
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `تقرير-امتحان-عربي-محسن-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "تم إنشاء التقرير بنجاح",
        description: "تم تحميل التقرير المحسن مع دعم كامل للنصوص العربية"
      });
    } catch (error) {
      console.error('Error generating test PDF:', error);
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء التقرير",
        description: `حدث خطأ أثناء إنشاء التقرير: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-2 border-algeria-green/20">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-algeria-green">
          <FileText className="w-5 h-5" />
          اختبار النظام المحسن للـ PDF العربي
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-gray-600">
          اختبر النظام المطور بالكامل لإنشاء تقارير PDF مع دعم شامل للعربية
        </p>
        
        <div className="text-xs bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
          <p className="font-semibold mb-2 text-algeria-green">الميزات المطورة:</p>
          <ul className="list-none space-y-2 text-right">
            <li className="flex items-center justify-end gap-2">
              <span>خط عربي مدمج محلياً</span>
              <CheckCircle className="w-3 h-3 text-green-500" />
            </li>
            <li className="flex items-center justify-end gap-2">
              <span>اتجاه النص من اليمين لليسار</span>
              <CheckCircle className="w-3 h-3 text-green-500" />
            </li>
            <li className="flex items-center justify-end gap-2">
              <span>تشكيل الحروف العربية</span>
              <CheckCircle className="w-3 h-3 text-green-500" />
            </li>
            <li className="flex items-center justify-end gap-2">
              <span>رموز يونيكود محسنة</span>
              <CheckCircle className="w-3 h-3 text-green-500" />
            </li>
            <li className="flex items-center justify-end gap-2">
              <span>عارض PDF مستقر</span>
              <CheckCircle className="w-3 h-3 text-green-500" />
            </li>
          </ul>
        </div>
        
        <Button 
          onClick={generateTestPDF} 
          disabled={isGenerating}
          className="w-full bg-algeria-green hover:bg-algeria-green/90"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              جاري الإنشاء والمعالجة...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              إنشاء تقرير تجريبي محسن
            </div>
          )}
        </Button>
        
        {isGenerating && (
          <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded">
            يتم الآن معالجة الخطوط العربية وإنشاء التقرير...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PDFTestComponent;
