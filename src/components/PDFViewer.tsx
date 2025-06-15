
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBlob: Blob | null;
  examTitle: string;
  onDownload: () => void;
  isGenerating: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  isOpen,
  onClose,
  pdfBlob,
  examTitle,
  onDownload,
  isGenerating
}) => {
  const { toast } = useToast();
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [pdfBlob]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF loading error:', error);
    toast({
      variant: "destructive",
      title: "خطأ في تحميل PDF",
      description: "حدث خطأ أثناء تحميل تقرير PDF"
    });
  };

  const goToPrevPage = () => {
    setPageNumber(page => Math.max(1, page - 1));
  };

  const goToNextPage = () => {
    setPageNumber(page => Math.min(numPages, page + 1));
  };

  const zoomIn = () => {
    setScale(prevScale => Math.min(2.0, prevScale + 0.2));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(0.5, prevScale - 0.2));
  };

  const handleDownload = () => {
    onDownload();
    toast({
      title: "تم تحميل التقرير",
      description: "تم تحميل تقرير PDF بنجاح"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0" style={{ direction: 'rtl' }}>
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-right">
            📄 تقرير الامتحان - {examTitle}
          </DialogTitle>
        </DialogHeader>
        
        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isGenerating}
            >
              <Download className="w-4 h-4 ml-1" />
              تحميل
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4 ml-1" />
              إغلاق
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <span className="text-sm px-2">
              {Math.round(scale * 100)}%
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              disabled={scale >= 2.0}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            
            {/* Page Navigation */}
            <div className="flex items-center gap-2 mr-4">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <span className="text-sm px-2">
                صفحة {pageNumber} من {numPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* PDF Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          {isGenerating ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-algeria-green mx-auto mb-2"></div>
                <p className="text-gray-600">جاري إنشاء التقرير...</p>
              </div>
            </div>
          ) : pdfUrl ? (
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
                  <div className="text-center text-red-600 p-8">
                    <p>خطأ في تحميل PDF</p>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.reload()} 
                      className="mt-2"
                    >
                      إعادة المحاولة
                    </Button>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="shadow-lg"
                />
              </Document>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600">لا يوجد تقرير للعرض</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewer;
