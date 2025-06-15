
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { BookOpen, Clock, Trophy, Users, Loader2, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BottomNav from '../components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [exams, setExams] = useState([]);
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
        toast({
          variant: "destructive",
          title: "خطأ في تحميل الامتحانات",
          description: "حدث خطأ أثناء تحميل قائمة الامتحانات",
        });
        return;
      }
      setExams(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ في تحميل الامتحانات",
        description: "حدث خطأ أثناء تحميل قائمة الامتحانات",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (examId) => {
    const index = exams.findIndex(exam => exam.id === examId);
    if (index < 3) return 'bg-green-500';
    if (index < 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDifficultyText = (examId) => {
    const index = exams.findIndex(exam => exam.id === examId);
    if (index < 3) return 'سهل';
    if (index < 6) return 'متوسط';
    return 'صعب';
  };

  const handleStartExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  // رأس الصفحة الجديد المتجاوب صغير الحجم للموبايل
  const handleLogout = async () => {
    await logout();
    navigate("/auth");
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
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 to-blue-50 !font-arabic animate-fade-in pb-24"
      style={{ direction: 'rtl' }}>

      {/* رأس صفحة مخصص ومتجاوب */}
      <div className="w-full flex flex-col items-center mb-1 pt-3 px-2">
        <div className="w-full max-w-[430px] rounded-2xl bg-white/95 px-2 py-3 shadow border border-algeria-green/15">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1">
              <h1 className="text-lg md:text-xl font-extrabold text-algeria-green leading-tight text-center sm:text-right">
                منصة امتحانات بريد الجزائر
              </h1>
              <div className="mt-1 text-gray-700 text-xs text-center sm:text-right leading-none">
                {user && (
                  <>
                    <span>مرحباً، {user?.user_metadata?.full_name || user?.email}</span>
                  </>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-50 hover:text-red-700 !rounded-lg w-fit self-center sm:self-start flex items-center gap-1 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-semibold">تسجيل الخروج</span>
            </Button>
          </div>
        </div>
      </div>

      {/* عنوان بارز للوحة التحكم */}
      <div className="w-full flex flex-col items-center mb-3 pt-1">
        <div className="rounded-xl bg-white/95 px-4 py-2 shadow border border-algeria-green/15 flex flex-col items-center w-full max-w-[390px]">
          <h2 className="text-base md:text-xl font-extrabold text-algeria-green mb-0">
            لوحة تحكم الامتحانات
          </h2>
          <p className="text-gray-600 text-xs mt-1 text-center max-w-xs font-normal">اختر الامتحان الذي تريد أداؤه للتحضير للامتحان الرسمي</p>
        </div>
      </div>

      {/* إحصاءات سريعة - بطاقات عصرية متجاوبة */}
      <div className="grid grid-cols-2 gap-2 mb-4 mx-auto max-w-[400px] md:gap-4 px-1">
        <Card className="rounded-xl shadow bg-white/90 border-0 p-0 transition-all hover:shadow-lg hover:scale-[1.02]">
          <CardContent className="flex flex-col items-center justify-center p-3">
            <BookOpen className="h-7 w-7 text-algeria-green mb-1" />
            <p className="text-base font-bold text-gray-900">{exams.length}</p>
            <span className="text-xs text-gray-500">امتحانات متاحة</span>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow bg-white/90 border-0 p-0 transition-all hover:shadow-lg hover:scale-[1.02]">
          <CardContent className="flex flex-col items-center justify-center p-3">
            <Clock className="h-7 w-7 text-algeria-blue mb-1" />
            <p className="text-base font-bold text-gray-900">60</p>
            <span className="text-xs text-gray-500">دقيقة لكل امتحان</span>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow bg-white/90 border-0 p-0 transition-all hover:shadow-lg hover:scale-[1.02]">
          <CardContent className="flex flex-col items-center justify-center p-3">
            <Trophy className="h-7 w-7 text-algeria-gold mb-1" />
            <p className="text-base font-bold text-gray-900">50</p>
            <span className="text-xs text-gray-500">سؤال في كل امتحان</span>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow bg-white/90 border-0 p-0 transition-all hover:shadow-lg hover:scale-[1.02]">
          <CardContent className="flex flex-col items-center justify-center p-3">
            <Users className="h-7 w-7 text-algeria-red mb-1" />
            <p className="text-base font-bold text-gray-900">4</p>
            <span className="text-xs text-gray-500">خيارات لكل سؤال</span>
          </CardContent>
        </Card>
      </div>

      {/* قائمة الامتحانات */}
      {exams.length > 0 ? (
        <div className="flex flex-col gap-4 mb-6 mx-auto w-full max-w-[450px] px-2">
          {exams.map((exam) => (
            <Card key={exam.id} 
              className="rounded-2xl shadow-md border-0 relative overflow-hidden cursor-pointer animate-fade-in transition-all hover:scale-[1.025] group 
              bg-gradient-to-br from-white/90 to-blue-50/55">
              <CardHeader className="pb-2 pt-3 px-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base text-right font-bold leading-tight group-hover:text-algeria-green transition-colors">
                    {exam.title}
                  </CardTitle>
                  <Badge className={`${getDifficultyColor(exam.id)} text-white px-3 py-1 text-xs rounded-xl drop-shadow`}>
                    {getDifficultyText(exam.id)}
                  </Badge>
                </div>
                <CardDescription className="text-right font-normal text-gray-500/90 group-hover:text-gray-700 transition-colors mt-1">
                  {exam.description || "امتحان تجريبي شامل لتقييم معرفتك"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-1 pb-4 px-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span className="px-2 py-[2px] rounded-md bg-blue-50 font-medium">50 سؤال</span>
                  <span className="px-2 py-[2px] rounded-md bg-green-50 font-medium">{exam.duration_minutes} دقيقة</span>
                </div>
                <Button
                  onClick={() => handleStartExam(exam.id)}
                  className="w-full bg-algeria-green hover:bg-green-700 text-white font-bold rounded-xl shadow hover:scale-105 transition-all text-base py-2 mt-2"
                >
                  بدء الامتحان
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-14 my-6 rounded-2xl shadow bg-white/70 border-0 max-w-[420px] mx-auto">
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

      {/* تعليمات الامتحان */}
      <Card className="bg-blue-50/75 border-blue-200 mt-7 rounded-2xl shadow max-w-[430px] mx-auto">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-algeria-blue text-right text-base font-bold">
            تعليمات الامتحان
          </CardTitle>
        </CardHeader>
        <CardContent className="text-right text-xs px-5 pb-4 pt-0">
          <ul className="space-y-1 text-gray-800 font-medium">
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

