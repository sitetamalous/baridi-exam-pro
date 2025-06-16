
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Fix PDF.js worker configuration with multiple fallbacks
if (typeof window !== 'undefined') {
  // Primary worker URL - using jsDelivr CDN which is more reliable
  const primaryWorkerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  
  // Fallback worker URLs
  const fallbackWorkerUrls = [
    `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`,
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`,
    // Local fallback if available
    `/node_modules/pdfjs-dist/build/pdf.worker.min.js`
  ];

  // Test worker URL and set the first working one
  const testWorkerUrl = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  const setWorkerUrl = async () => {
    // Try primary URL first
    if (await testWorkerUrl(primaryWorkerUrl)) {
      pdfjs.GlobalWorkerOptions.workerSrc = primaryWorkerUrl;
      console.log('PDF.js worker loaded from jsDelivr CDN');
      return;
    }

    // Try fallback URLs
    for (const url of fallbackWorkerUrls) {
      if (await testWorkerUrl(url)) {
        pdfjs.GlobalWorkerOptions.workerSrc = url;
        console.log(`PDF.js worker loaded from fallback: ${url}`);
        return;
      }
    }

    // Final fallback - try to load from the same origin
    console.warn('All worker URLs failed, using same-origin fallback');
    pdfjs.GlobalWorkerOptions.workerSrc = primaryWorkerUrl;
  };

  // Set worker URL asynchronously
  setWorkerUrl().catch(() => {
    console.warn('Worker URL setup failed, using default');
    pdfjs.GlobalWorkerOptions.workerSrc = primaryWorkerUrl;
  });
}

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      setError(null);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [pdfBlob]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
    setError(null);
    console.log('PDF loaded successfully with', numPages, 'pages');
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF loading error:', error);
    setLoading(false);
    setError('حدث خطأ أثناء تحميل التقرير');
    toast({
      variant: "destructive",
      title: "خطأ في تحميل PDF",
      description: "حدث خطأ أثناء تحميل تقرير PDF. يرجى المحاولة مجددًا أو تحميله مباشرة."
    });
  };

  const onDocumentLoadStart = () => {
    setLoading(true);
    setError(null);
    console.log('PDF loading started');
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
    try {
      onDownload();
      toast({
        title: "تم تحميل التقرير",
        description: "تم تحميل تقرير PDF بنجاح"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ في التحميل",
        description: "حدث خطأ أثناء تحميل الملف"
      });
    }
  };

  const handleRetry = () => {
    if (pdfUrl) {
      setError(null);
      setLoading(true);
      // Force re-render of Document component
      const currentUrl = pdfUrl;
      setPdfUrl(null);
      setTimeout(() => setPdfUrl(currentUrl), 100);
    }
  };

  const handleFallbackDownload = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `تقرير-${examTitle}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "تم تحميل التقرير",
        description: "تم تحميل التقرير كملف احتياطي"
      });
    }
  };

  return (
    <Dialog open={is 
    onOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0" style={{ direction: 'rtl' }}>
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-right">
            تقرير الامتحان - {examTitle}
          </DialogTitle>
        </DialogHeader>
        
        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 pdf-viewer-controls">
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
            
            {error && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleFallbackDownload}
                disabled={!pdfBlob}
              >
                <Download className="w-4 h-4 ml-1" />
                تحميل احتياطي
              </Button>
            )}
            
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
              disabled={scale <= 0.5 || error !== null}
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
              disabled={scale >= 2.0 || error !== null}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            
            {/* Page Navigation */}
            {numPages > 0 && (
              <div className="flex items-center gap-2 mr-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={pageNumber <= 1 || error !== null}
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
                  disabled={pageNumber >= numPages || error !== null}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Retry Button */}
            {error && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
              >
                <RefreshCw className="w-4 h-4 ml-1" />
                إعادة المحاولة
              </Button>
            )}
          </div>
        </div>
        
        {/* PDF Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100 pdf-container">
          {isGenerating ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-algeria-green mx-auto mb-2"></div>
                <p className="text-gray-600">جاري إنشاء التقرير...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center p-8">
                <div className="text-red-500 mb-4">
                  <X className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-lg font-semibold">خطأ في تحميل PDF</p>
                  <p className="text-sm text-gray-600 mt-2">
                    حدث خطأ أثناء تحميل التقرير. يرجى المحاولة مجددًا أو تحميله مباشرة.
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleRetry} size="sm">
                    <RefreshCw className="w-4 h-4 ml-1" />
                    إعادة المحاولة
                  </Button>
                  <Button onClick={handleFallbackDownload} variant="outline" size="sm">
                    <Download className="w-4 h-4 ml-1" />
                    تحميل مباشر
                  </Button>
                </div>
              </div>
            </div>
          ) : pdfUrl ? (
            <div className="flex justify-center">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                onLoadStart={onDocumentLoadStart}
                loading={
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-algeria-green mx-auto mb-2"></div>
                      <p className="text-gray-600">جاري تحميل PDF...</p>
                    </div>
                  </div>
                }
                error={
                  <div className="text-center text-red-600 p-8">
                    <p>خطأ في تحميل PDF</p>
                    <Button 
                      variant="outline" 
                      onClick={handleRetry} 
                      className="mt-2"
                    >
                      إعادة المحاولة
                    </Button>
                  </div>
                }
                options={{
                  // Use reliable cMap configuration
                  cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
                  cMapPacked: true,
                  // Enable text layer for better performance
                  enableXfa: true,
                }}
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="shadow-lg"
                  loading={
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-algeria-green"></div>
                    </div>
                  }
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
