
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowRight } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="text-center max-w-md">
        {/* رقم الخطأ */}
        <div className="text-9xl font-bold text-algeria-green mb-4">
          404
        </div>
        
        {/* رسالة الخطأ */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          الصفحة غير موجودة
        </h1>
        
        <p className="text-gray-600 mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر.
        </p>
        
        {/* أزرار التنقل */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate('/')}
            className="w-full bg-algeria-green hover:bg-green-700 text-white"
          >
            <Home className="ml-2 h-4 w-4" />
            العودة إلى الصفحة الرئيسية
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full border-algeria-green text-algeria-green hover:bg-algeria-green hover:text-white"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            الرجوع إلى الصفحة السابقة
          </Button>
        </div>
        
        {/* معلومات مساعدة */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-700">
            إذا كنت تعتقد أن هذا خطأ، يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
