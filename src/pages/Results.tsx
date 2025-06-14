
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Trophy, RotateCcw, Home, TrendingUp } from 'lucide-react';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get results from navigation state or use mock data
  const { score, total, examId } = location.state || { score: 35, total: 50, examId: 1 };
  
  const percentage = Math.round((score / total) * 100);
  
  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'ممتاز', color: 'bg-green-500', description: 'أداء رائع جداً!' };
    if (percentage >= 80) return { grade: 'جيد جداً', color: 'bg-blue-500', description: 'أداء جيد جداً' };
    if (percentage >= 70) return { grade: 'جيد', color: 'bg-yellow-500', description: 'أداء جيد' };
    if (percentage >= 60) return { grade: 'مقبول', color: 'bg-orange-500', description: 'يحتاج إلى تحسين' };
    return { grade: 'ضعيف', color: 'bg-red-500', description: 'يحتاج إلى مراجعة شاملة' };
  };

  const gradeInfo = getGrade(percentage);

  // Mock previous attempts data
  const previousAttempts = [
    { id: 1, date: '2024-01-15', score: 42, total: 50, percentage: 84 },
    { id: 2, date: '2024-01-10', score: 38, total: 50, percentage: 76 },
    { id: 3, date: '2024-01-05', score: 33, total: 50, percentage: 66 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          نتائج الامتحان التجريبي {examId}
        </h1>
        <p className="text-gray-600">
          مراجعة أدائك في الامتحان
        </p>
      </div>

      {/* Main Result Card */}
      <Card className="text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-algeria-green to-algeria-blue rounded-full flex items-center justify-center mb-4">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl">نتيجتك النهائية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-6xl font-bold text-algeria-green">
            {percentage}%
          </div>
          
          <div className="flex items-center justify-center space-x-4 space-x-reverse">
            <Badge className={`${gradeInfo.color} text-white text-lg px-4 py-2`}>
              {gradeInfo.grade}
            </Badge>
          </div>
          
          <p className="text-gray-600 text-lg">{gradeInfo.description}</p>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{score}</p>
              <p className="text-gray-600">إجابات صحيحة</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{total - score}</p>
              <p className="text-gray-600">إجابات خاطئة</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-algeria-blue">{total}</p>
              <p className="text-gray-600">إجمالي الأسئلة</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={() => navigate(`/exam/${examId}`)}
          className="bg-algeria-green hover:bg-green-700 text-white"
        >
          <RotateCcw className="h-4 w-4 ml-2" />
          إعادة الامتحان
        </Button>
        
        <Button
          onClick={() => navigate('/dashboard')}
          variant="outline"
          className="border-algeria-blue text-algeria-blue hover:bg-blue-50"
        >
          <Home className="h-4 w-4 ml-2" />
          العودة إلى لوحة التحكم
        </Button>
      </div>

      {/* Performance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right flex items-center">
            <TrendingUp className="h-5 w-5 ml-2" />
            تحليل الأداء
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-right">نقاط القوة</h4>
              <ul className="space-y-2 text-right text-gray-600">
                {percentage >= 80 && <li>• أداء ممتاز في الأسئلة العامة</li>}
                {percentage >= 70 && <li>• فهم جيد للخدمات الأساسية</li>}
                {percentage >= 60 && <li>• إلمام بأساسيات بريد الجزائر</li>}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-right">نقاط التحسين</h4>
              <ul className="space-y-2 text-right text-gray-600">
                {percentage < 90 && <li>• مراجعة الخدمات الرقمية المتقدمة</li>}
                {percentage < 80 && <li>• التركيز على إجراءات خدمة العملاء</li>}
                {percentage < 70 && <li>• دراسة تفصيلية للخدمات المالية</li>}
                {percentage < 60 && <li>• مراجعة شاملة لجميع المواضيع</li>}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previous Attempts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">المحاولات السابقة</CardTitle>
          <CardDescription className="text-right">
            تتبع تقدمك عبر الامتحانات المختلفة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {previousAttempts.map((attempt) => (
              <div key={attempt.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div className="text-right">
                  <p className="font-medium">امتحان تجريبي {attempt.id}</p>
                  <p className="text-sm text-gray-600">{attempt.date}</p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">{attempt.percentage}%</p>
                  <p className="text-sm text-gray-600">{attempt.score}/{attempt.total}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-algeria-blue text-right">توصيات للتحسين</CardTitle>
        </CardHeader>
        <CardContent className="text-right">
          <ul className="space-y-2 text-gray-700">
            <li>• قم بمراجعة الأسئلة التي أخطأت فيها</li>
            <li>• ادرس المواضيع التي حصلت فيها على درجات منخفضة</li>
            <li>• تدرب على امتحانات أخرى لتحسين مستواك</li>
            <li>• راجع الدليل الرسمي لبريد الجزائر</li>
            <li>• تواصل مع المرشدين للحصول على نصائح إضافية</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Results;
