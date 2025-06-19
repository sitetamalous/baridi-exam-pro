
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useArabicPDFGenerator } from '@/hooks/useArabicPDFGenerator';

interface PDFDownloadButtonProps {
  attemptId: string;
  examTitle?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({
  attemptId,
  examTitle,
  variant = 'outline',
  size = 'sm',
  className = ''
}) => {
  const { downloadPDF, isGenerating } = useArabicPDFGenerator();

  const handleDownload = async () => {
    console.log('بدء تحميل PDF للمحاولة:', attemptId);
    try {
      await downloadPDF(attemptId);
      console.log('تم تحميل PDF بنجاح');
    } catch (error) {
      console.error('خطأ في تحميل PDF:', error);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      variant={variant}
      size={size}
      className={`${className}`}
    >
      {isGenerating ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          جاري الإنشاء...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-1" />
          تحميل PDF
        </>
      )}
    </Button>
  );
};

export default PDFDownloadButton;
