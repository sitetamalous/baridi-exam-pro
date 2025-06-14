
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, BarChart3, Calendar, Clock, Trophy } from 'lucide-react';

const Results: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [attempts, setAttempts] = useState<any[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
  const [attemptDetails, setAttemptDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAttempts();
      const attemptId = searchParams.get('attempt');
      if (attemptId) {
        fetchAttemptDetails(attemptId);
      }
    }
  }, [user, searchParams]);

  const fetchAttempts = async () => {
    try {
      const { data, error } = await supabase
        .from('user_attempts')
        .select(`
          *,
          exams (
            title,
            description
          )
        `)
        .eq('user_id', user?.id)
        .order('started_at', { ascending: false });

      if (error) throw error;
      setAttempts(data || []);
    } catch (error: any) {
      console.error('Error fetching attempts:', error);
      toast({
        variant: "destructive",
        title: "خطأ في جلب النتائج",
        description: "حدث خطأ أثناء جلب نتائج الامتحانات",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAttemptDetails = async (attemptId: string) => {
    try {
      const { data: attemptData, error: attemptError } = await supabase
        .from('user_attempts')
        .select(`
          *,
          exams (
            title,
            description
          )
        `)
        .eq('id', attemptId)
        .single();

      if (attemptError) throw attemptError;

      const { data: answersData, error: answersError } = await supabase
        .from('user_answers')
        .select(`
          *,
          questions (
            question_text,
            explanation
          ),
          answers!selected_answer_id (
            answer_text
          )
        `)
        .eq('attempt_id', attemptId);

      if (answersError) throw answersError;

      // Get correct answers for each question
      const questionIds = answersData?.map(a => a.question_id) || [];
      const { data: correctAnswers, error: correctError } = await supabase
        .from('answers')
        .select('*')
        .in('question_id', questionIds)
        .eq('is_correct', true);

      if (correctError) throw correctError;

      setSelectedAttempt(attemptData);
      setAttemptDetails({
        answers: answersData,
        correctAnswers: correctAnswers
      });
    } catch (error: any) {
      console.error('Error fetching attempt details:', error);
      toast({
        variant: "destructive",
        title: "خطأ في جلب تفاصيل الامتحان",
        description: "حدث خطأ أثناء جلب تفاصيل النتيجة",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-algeria-green"></div>
      </div>
    );
  }

  if (selectedAttempt && attemptDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedAttempt(null);
              setAttemptDetails(null);
              navigate('/results');
            }}
            className="mb-4"
          >
            العودة للنتائج
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedAttempt.exams?.title}</span>
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-algeria-green">
                      {selectedAttempt.percentage?.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">النسبة</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {selectedAttempt.score}/{attemptDetails.answers?.length}
                    </div>
                    <div className="text-sm text-gray-600">النقاط</div>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 ml-2" />
                  تاريخ الامتحان: {new Date(selectedAttempt.started_at).toLocaleDateString('ar-DZ')}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 ml-2" />
                  وقت الإنهاء: {new Date(selectedAttempt.completed_at).toLocaleTimeString('ar-DZ')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questions Review */}
        <div className="space-y-4">
          {attemptDetails.answers?.map((userAnswer: any, index: number) => {
            const correctAnswer = attemptDetails.correctAnswers?.find(
              (ca: any) => ca.question_id === userAnswer.question_id
            );
            
            return (
              <Card key={userAnswer.id} className="border-l-4 border-l-gray-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium leading-relaxed flex-1">
                      <span className="text-algeria-green font-bold ml-2">
                        السؤال {index + 1}:
                      </span>
                      {userAnswer.questions?.question_text}
                    </h3>
                    <div className="flex items-center ml-4">
                      {userAnswer.is_correct ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {userAnswer.selected_answer_id && (
                    <div className={`p-3 rounded-lg ${
                      userAnswer.is_correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      <span className="font-medium">إجابتك: </span>
                      <span>{userAnswer.answers?.answer_text}</span>
                    </div>
                  )}
                  
                  {!userAnswer.is_correct && correctAnswer && (
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                      <span className="font-medium text-green-700">الإجابة الصحيحة: </span>
                      <span>{correctAnswer.answer_text}</span>
                    </div>
                  )}
                  
                  {userAnswer.questions?.explanation && (
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <span className="font-medium text-blue-700">التفسير: </span>
                      <span>{userAnswer.questions.explanation}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center">
          <BarChart3 className="h-6 w-6 ml-3" />
          نتائج الامتحانات
        </h1>
        <p className="text-gray-600">اعرض نتائج امتحاناتك السابقة وراجع إجاباتك</p>
      </div>

      {attempts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">لم تقم بأي امتحان بعد</p>
            <Button onClick={() => navigate('/dashboard')}>
              ابدأ امتحانك الأول
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {attempts.map((attempt) => (
            <Card key={attempt.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">
                      {attempt.exams?.title}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {attempt.exams?.description}
                    </p>
                    <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 ml-1" />
                        {new Date(attempt.started_at).toLocaleDateString('ar-DZ')}
                      </div>
                      {attempt.completed_at && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 ml-1" />
                          {new Date(attempt.completed_at).toLocaleTimeString('ar-DZ')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-left mr-4">
                    {attempt.completed_at ? (
                      <>
                        <div className="text-2xl font-bold text-algeria-green">
                          {attempt.percentage?.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">
                          {attempt.score} نقطة
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchAttemptDetails(attempt.id)}
                          className="mt-2"
                        >
                          عرض التفاصيل
                        </Button>
                      </>
                    ) : (
                      <div className="text-orange-600 font-medium">
                        غير مكتمل
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Results;
