
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
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-br from-green-50 to-blue-50 animate-fade-in">
        <Loader2 className="h-10 w-10 animate-spin text-algeria-green mb-2" />
        <span className="text-lg font-bold text-algeria-green">جاري تحميل لوحة التحكم...</span>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="relative pb-24 pt-5 px-1 min-h-screen bg-gradient-to-br from-green-50 to-blue-50 !font-arabic animate-fade-in"
      style={{ direction: 'rtl' }}>
      {/* لا يوجد header أو navigation bar */}

      {/* عنوان وإرشادات صغيرة للموبايل تظهر بشكل حديث */}
      <div className="flex flex-col items-center mb-5">
        <h1 className="text-2xl font-extrabold text-algeria-green mb-1 mt-1 tracking-tight rounded-lg shadow-sm px-3 py-2 bg-white/90 border border-algeria-green/20">
          الامتحانات
        </h1>
        <p className="text-gray-600 text-sm mb-1 text-center max-w-xs bg-white/60 rounded px-2 font-medium shadow">
          حضّر نفسك للامتحان الرسمي! اختر أي امتحان تريد.
        </p>
      </div>

      {/* احصائيات بشكل حديث وعصري مع تأثيرات تفاعلية */}
      <div className="grid grid-cols-2 gap-2 mb-4 md:grid-cols-4 md:gap-4">
        <Card className="rounded-2xl shadow hover:scale-105 hover:shadow-lg transition-transform border-0 bg-white/95">
          <CardContent className="flex flex-col items-center justify-center p-3 md:p-6">
            <BookOpen className="h-8 w-8 text-algeria-green mb-1" />
            <p className="text-lg font-bold text-gray-900">{exams.length}</p>
            <p className="text-xs text-gray-600">امتحانات متاحة</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow hover:scale-105 hover:shadow-lg transition-transform border-0 bg-white/95">
          <CardContent className="flex flex-col items-center justify-center p-3 md:p-6">
            <Clock className="h-8 w-8 text-algeria-blue mb-1" />
            <p className="text-lg font-bold text-gray-900">60</p>
            <p className="text-xs text-gray-600">دقيقة لكل امتحان</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow hover:scale-105 hover:shadow-lg transition-transform border-0 bg-white/95">
          <CardContent className="flex flex-col items-center justify-center p-3 md:p-6">
            <Trophy className="h-8 w-8 text-algeria-gold mb-1" />
            <p className="text-lg font-bold text-gray-900">50</p>
            <p className="text-xs text-gray-600">سؤال في كل امتحان</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow hover:scale-105 hover:shadow-lg transition-transform border-0 bg-white/95">
          <CardContent className="flex flex-col items-center justify-center p-3 md:p-6">
            <Users className="h-8 w-8 text-algeria-red mb-1" />
            <p className="text-lg font-bold text-gray-900">4</p>
            <p className="text-xs text-gray-600">خيارات لكل سؤال</p>
          </CardContent>
        </Card>
      </div>

      {/* قائمة الامتحانات بشكل بطاقات متجاوبة عصرية */}
      {exams.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {exams.map((exam) => (
            <Card key={exam.id} className="transition-all rounded-2xl shadow-md hover:shadow-xl hover:scale-105 bg-white border-0 relative overflow-hidden cursor-pointer group animate-fade-in">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base text-right font-bold leading-tight group-hover:text-algeria-green transition-colors">
                    {exam.title}
                  </CardTitle>
                  <Badge className={`${getDifficultyColor(exam.id)} text-white px-3 py-1 text-xs rounded-xl shadow`}>
                    {getDifficultyText(exam.id)}
                  </Badge>
                </div>
                <CardDescription className="text-right font-normal text-gray-500/90 group-hover:text-gray-700 transition-colors">
                  {exam.description || "امتحان تجريبي شامل لتقييم معرفتك"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span className="px-2 py-1 rounded-lg bg-blue-50">50 سؤال</span>
                  <span className="px-2 py-1 rounded-lg bg-green-50">{exam.duration_minutes} دقيقة</span>
                </div>
                <Button
                  onClick={() => handleStartExam(exam.id)}
                  className="w-full bg-algeria-green hover:bg-green-700 text-white mt-2 font-bold rounded-xl shadow hover:scale-105 transition-all text-base py-2"
                >
                  بدء الامتحان
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-14 my-6 rounded-2xl shadow bg-white/65 border-0">
          <CardContent>
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              لا توجد امتحانات متاحة حالياً
            </h3>
            <p className="text-gray-600 text-sm">
              يرجى المحاولة لاحقاً أو التواصل مع الإدارة
            </p>
          </CardContent>
        </Card>
      )}

      {/* تعليمات الامتحان - تظهر بشكل تفاعلي وجذاب */}
      <Card className="bg-blue-50/60 border-blue-200 mt-6 rounded-2xl shadow">
        <CardHeader className="pb-1">
          <CardTitle className="text-algeria-blue text-right text-base font-bold">
            تعليمات الامتحان
          </CardTitle>
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

