
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArabicPdfGenerator } from '@/services/arabicPdfGenerator';
import PDFViewer from '@/components/PDFViewer';
import { FileText, Download, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PDFTestComponent: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const { toast } = useToast();

  // Updated sample data with more Arabic content
  const sampleAttempt = {
    id: 'test-attempt-1',
    score: 8,
    percentage: 80,
    completed_at: new Date().toISOString(),
    started_at: new Date(Date.now() - 3600000).toISOString(),
    exam: {
      id: 'test-exam-1',
      title: 'اختبار تجريبي - مكلف بالزبائن في بريد الجزائر',
      description: 'اختبار شامل للتحضير لمسابقة مكلف بالزبائن في بريد الجزائر - يشمل جميع المواضيع المطلوبة'
    }
  };

  const sampleAnswers = [
    {
      id: 'answer-1',
      question_id: 'q1',
      selected_answer_id: 'a1-correct',
      is_correct: true,
      question: {
        question_text: 'ما هو الموقع الرسمي الذي يمكن من خلاله طلب البطاقة الذهبية؟',
        explanation: 'الموقع الرسمي لطلب البطاقة الذهبية هو eccp.poste.dz وهو الموقع المعتمد من طرف بريد الجزائر.',
        answers: [
          { id: 'a1-1', answer_text: 'baridi.dz', is_correct: false },
          { id: 'a1-2', answer_text: 'e.poste.dz', is_correct: false },
          { id: 'a1-correct', answer_text: 'eccp.poste.dz', is_correct: true },
          { id: 'a1-4', answer_text: 'edahabia.poste.dz', is_correct: false }
        ]
      }
    },
    {
      id: 'answer-2',
      question_id: 'q2',
      selected_answer_id: 'a2-wrong',
      is_correct: false,
      question: {
        question_text: 'ما هي مدة صلاحية البطاقة الذهبية؟',
        explanation: 'مدة صلاحية البطاقة الذهبية هي سنتين من تاريخ صناعتها وليس من تاريخ الاستلام أو الطلب.',
        answers: [
          { id: 'a2-wrong', answer_text: 'سنة واحدة من تاريخ الاستلام', is_correct: false },
          { id: 'a2-2', answer_text: 'ثلاث سنوات من تاريخ الطلب', is_correct: false },
          { id: 'a2-correct', answer_text: 'سنتين من تاريخ صناعتها', is_correct: true },
          { id: 'a2-4', answer_text: 'غير محددة', is_correct: false }
        ]
      }
    },
    {
      id: 'answer-3',
      question_id: 'q3',
      selected_answer_id: 'a3-correct',
      is_correct: true,
      question: {
        question_text: 'في حال نسي الزبون الرمز السري للبطاقة الذهبية، ما هو الإجراء المناسب؟',
        explanation: 'في حالة نسيان الرمز السري، يجب على الزبون التوجه إلى المكتب البريدي مع بطاقة الهوية وتقديم طلب خطي لإعادة تعيين الرمز.',
        answers: [
          { id: 'a3-1', answer_text: 'الاتصال بخدمة الزبائن هاتفياً', is_correct: false },
          { id: 'a3-2', answer_text: 'تقديم طلب إلكتروني عبر موقع بريد الجزائر', is_correct: false },
          { id: 'a3-correct', answer_text: 'التوجه إلى المكتب البريدي مع بطاقة الهوية وطلب خطي', is_correct: true },
          { id: 'a3-4', answer_text: 'إرسال بريد إلكتروني إلى مديرية البريد', is_correct: false }
        ]
      }
    }
  ];

  const sampleUserProfile = {
    name: 'أحمد محمد الجزائري',
    email: 'ahmed.mohamed@example.com'
  };

  const handleGenerateTestPDF = async () => {
    setIsGenerating(true);
    try {
      const blob = await ArabicPdfGenerator.generateExamReport(
        sampleAttempt,
        sampleAnswers,
        sampleUserProfile
      );
      setPdfBlob(blob);
      toast({
        title: "تم إنشاء PDF بنجاح",
        description: "تم إنشاء تقرير PDF تجريبي بنجاح مع دعم اللغة العربية"
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء PDF",
        description: "حدث خطأ أثناء إنشاء تقرير PDF"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewPDF = () => {
    if (pdfBlob) {
      setViewerOpen(true);
    }
  };

  const handleDownloadPDF = () => {
    if (pdfBlob) {
      ArabicPdfGenerator.downloadPDF(pdfBlob, 'تقرير-اختبار-تجريبي.pdf');
      toast({
        title: "تم التحميل",
        description: "تم تحميل ملف PDF بنجاح"
      });
    }
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <FileText className="h-5 w-5" />
            اختبار PDF العربي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleGenerateTestPDF}
            disabled={isGenerating}
            className="w-full bg-algeria-green hover:bg-algeria-green/90"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                جاري الإنشاء...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                إنشاء تقرير تجريبي
              </>
            )}
          </Button>

          {pdfBlob && (
            <div className="flex gap-2">
              <Button
                onClick={handleViewPDF}
                variant="outline"
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                عرض
              </Button>
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-1" />
                تحميل
              </Button>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center mt-2">
            يختبر هذا المكون إنشاء PDF مع دعم كامل للغة العربية والرموز Unicode
          </div>
        </CardContent>
      </Card>

      <PDFViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        pdfBlob={pdfBlob}
        examTitle="اختبار تجريبي - مكلف بالزبائن"
        onDownload={handleDownloadPDF}
        isGenerating={isGenerating}
      />
    </>
  );
};

export default PDFTestComponent;
