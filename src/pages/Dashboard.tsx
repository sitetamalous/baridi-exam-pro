
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { BookOpen, Clock, Trophy, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
    // Simple logic to assign difficulty based on exam order for demo
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          لوحة التحكم - الامتحانات التجريبية
        </h1>
        <p className="text-gray-600">
          اختر الامتحان الذي تريد أداؤه للتحضير لامتحان مكلف بالزبائن
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <BookOpen className="h-8 w-8 text-algeria-green ml-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{exams.length}</p>
              <p className="text-gray-600 text-sm">امتحانات متاحة</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-algeria-blue ml-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">60</p>
              <p className="text-gray-600 text-sm">دقيقة لكل امتحان</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Trophy className="h-8 w-8 text-algeria-gold ml-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">50</p>
              <p className="text-gray-600 text-sm">سؤال في كل امتحان</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-algeria-red ml-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">4</p>
              <p className="text-gray-600 text-sm">خيارات لكل سؤال</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exams Grid */}
      {exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg text-right">{exam.title}</CardTitle>
                  <Badge className={`${getDifficultyColor(exam.id)} text-white`}>
                    {getDifficultyText(exam.id)}
                  </Badge>
                </div>
                <CardDescription className="text-right">
                  {exam.description || "امتحان تجريبي شامل لتقييم معرفتك"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>50 سؤال</span>
                    <span>{exam.duration_minutes} دقيقة</span>
                  </div>
                  
                  <Button
                    onClick={() => handleStartExam(exam.id)}
                    className="w-full bg-algeria-green hover:bg-green-700 text-white"
                  >
                    بدء الامتحان
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              لا توجد امتحانات متاحة حالياً
            </h3>
            <p className="text-gray-600">
              يرجى المحاولة لاحقاً أو التواصل مع الإدارة
            </p>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-algeria-blue text-right">تعليمات الامتحان</CardTitle>
        </CardHeader>
        <CardContent className="text-right">
          <ul className="space-y-2 text-gray-700">
            <li>• كل امتحان يحتوي على 50 سؤال اختيار من متعدد</li>
            <li>• المدة المحددة لكل امتحان هي 60 دقيقة</li>
            <li>• يجب الإجابة على جميع الأسئلة قبل انتهاء الوقت</li>
            <li>• يمكنك مراجعة إجاباتك بعد انتهاء الامتحان</li>
            <li>• النتائج تُحفظ تلقائياً ويمكن الوصول إليها من قسم النتائج</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
