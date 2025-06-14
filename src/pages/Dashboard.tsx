
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { BookOpen, Clock, Trophy, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BottomNav from '../components/BottomNav';

interface Exam {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  is_published: boolean;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching exams:', error);
        toast({
          variant: "destructive",
          title: "خطأ في تحميل الامتحانات",
          description: "حدث خطأ أثناء تحميل قائمة الامتحانات",
        });
        return;
      }

      setExams(data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast({
        variant: "destructive",
        title: "خطأ في تحميل الامتحانات",
        description: "حدث خطأ أثناء تحميل قائمة الامتحانات",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (examId: string) => {
    const index = exams.findIndex(exam => exam.id === examId);
    if (index < 3) return 'bg-green-500';
    if (index < 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDifficultyText = (examId: string) => {
    const index = exams.findIndex(exam => exam.id === examId);
    if (index < 3) return 'سهل';
    if (index < 6) return 'متوسط';
    return 'صعب';
  };

  const handleStartExam = (examId: string) => {
    navigate(`/exam/${examId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">جاري التحميل...</span>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="relative pb-20 pt-3 px-1 min-h-screen bg-gradient-to-br from-green-50 to-blue-50 animate-fade-in"
      style={{ direction: 'rtl', fontFamily: 'arabic, Arial, sans-serif' }}>
      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="text-2xl font-extrabold text-algeria-green mb-1">
          لوحة تحكم الامتحانات
        </h1>
        <p className="text-gray-600 text-sm mb-3">
          اختر الامتحان الذي تريد أداؤه للتحضير للامتحان الرسمي
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2 mb-4 md:grid-cols-4 md:gap-4">
        <Card><CardContent className="flex items-center p-3 md:p-6"><BookOpen className="h-7 w-7 text-algeria-green ml-2" /><div><p className="text-xl font-bold text-gray-900">{exams.length}</p><p className="text-gray-600 text-xs">امتحانات متاحة</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center p-3 md:p-6"><Clock className="h-7 w-7 text-algeria-blue ml-2" /><div><p className="text-xl font-bold text-gray-900">60</p><p className="text-gray-600 text-xs">دقيقة لكل امتحان</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center p-3 md:p-6"><Trophy className="h-7 w-7 text-algeria-gold ml-2" /><div><p className="text-xl font-bold text-gray-900">50</p><p className="text-gray-600 text-xs">سؤال في كل امتحان</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center p-3 md:p-6"><Users className="h-7 w-7 text-algeria-red ml-2" /><div><p className="text-xl font-bold text-gray-900">4</p><p className="text-gray-600 text-xs">خيارات لكل سؤال</p></div></CardContent></Card>
      </div>

      {/* Exams Grid */}
      {exams.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 mb-4">
          {exams.map((exam) => (
            <Card key={exam.id} className="transition-shadow shadow rounded-xl hover:shadow-md">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base text-right">{exam.title}</CardTitle>
                  <Badge className={`${getDifficultyColor(exam.id)} text-white`}>
                    {getDifficultyText(exam.id)}
                  </Badge>
                </div>
                <CardDescription className="text-right">
                  {exam.description || "امتحان تجريبي شامل لتقييم معرفتك"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>50 سؤال</span>
                    <span>{exam.duration_minutes} دقيقة</span>
                  </div>
                  <Button
                    onClick={() => handleStartExam(exam.id)}
                    className="w-full bg-algeria-green hover:bg-green-700 text-white mt-3"
                  >
                    بدء الامتحان
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 my-4 rounded-xl">
          <CardContent>
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              لا توجد امتحانات متاحة حالياً
            </h3>
            <p className="text-gray-600 text-sm">
              يرجى المحاولة لاحقاً أو التواصل مع الإدارة
            </p>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200 mt-3 rounded-xl">
        <CardHeader>
          <CardTitle className="text-algeria-blue text-right text-sm">تعليمات الامتحان</CardTitle>
        </CardHeader>
        <CardContent className="text-right text-xs">
          <ul className="space-y-1 text-gray-700">
            <li>• كل امتحان يحتوي على 50 سؤال اختيار من متعدد</li>
            <li>• المدة المحددة لكل امتحان هي 60 دقيقة</li>
            <li>• يجب الإجابة على جميع الأسئلة قبل انتهاء الوقت</li>
            <li>• يمكنك مراجعة إجاباتك بعد انتهاء الامتحان</li>
            <li>• النتائج تُحفظ تلقائياً ويمكن الوصول إليها من قسم النتائج</li>
          </ul>
        </CardContent>
      </Card>
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Dashboard;
