import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ZoomIn, ZoomOut, RotateCw, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Set up PDF.js worker with proper Vite configuration
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBlob: Blob | null;
  examTitle: string;
  onDownload?: () => void;
  isGenerating?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  isOpen,
  onClose,
  pdfBlob,
  examTitle,
  onDownload,
  isGenerating = false
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (pdfBlob && isOpen) {
      try {
        setLoading(true);
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
        setPageNumber(1);
        setScale(1.0);
        setRotation(0);
        setError(null);

        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.error('Error creating PDF URL:', err);
        setError('فشل في إنشاء رابط PDF');
        setLoading(false);
      }
    } else {
      setPdfUrl(null);
      setLoading(false);
    }
  }, [pdfBlob, isOpen]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(null);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF loading error:', error);
    setError('فشل في تحميل ملف PDF');
    setLoading(false);
    toast({
      variant: "destructive",
      title: "خطأ في تحميل PDF",
      description: "فشل في تحميل ملف PDF"
    });
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handlePrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${examTitle}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "تم التحميل",
        description: "تم تحميل ملف PDF بنجاح"
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold text-right flex-1">
              {examTitle} - تقرير PDF
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between mt-4 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={scale >= 3.0}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotate}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>

            {numPages > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={pageNumber <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[80px] text-center">
                  {pageNumber} من {numPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={pageNumber >= numPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            <Button
              onClick={handleDownload}
              disabled={isGenerating || !pdfBlob}
              className="bg-algeria-green hover:bg-algeria-green/90"
              size="sm"
            >
              <Download className="h-4 w-4 ml-1" />
              تحميل PDF
            </Button>
          </div>
        </DialogHeader>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          {error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-red-500 text-lg font-semibold mb-2">
                  خطأ في تحميل PDF
                </div>
                <div className="text-gray-600 text-sm">
                  {error}
                </div>
                <Button
                  onClick={() => window.location.reload()}
                  className="mt-4"
                  variant="outline"
                >
                  إعادة المحاولة
                </Button>
              </div>
            </div>
          ) : loading || !pdfUrl ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-algeria-green mx-auto mb-4"></div>
                <div className="text-gray-600">جاري تحضير PDF...</div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-algeria-green"></div>
                  </div>
                }
                error={
                  <div className="flex items-center justify-center h-64">
                    <div className="text-red-500">فشل في تحميل PDF</div>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  rotate={rotation}
                  loading={
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-algeria-green"></div>
                    </div>
                  }
                  error={
                    <div className="flex items-center justify-center h-64">
                      <div className="text-red-500">فشل في تحميل الصفحة</div>
                    </div>
                  }
                  className="shadow-lg"
                />
              </Document>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewer;