
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ExamQuestion from "@/components/ExamQuestion";
import PDFDownloadButton from "@/components/PDFDownloadButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, RotateCcw, Home } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const Results: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attempt');

  const [attempt, setAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId || !user) return;

    const fetchResults = async () => {
      console.log('جلب نتائج المحاولة:', attemptId);
      
      try {
        // جلب بيانات المحاولة
        const { data: attemptData, error: attemptError } = await supabase
          .from('user_attempts')
          .select(`
            id,
            score,
            percentage,
            completed_at,
            started_at,
            exam:exams(id, title, description)
          `)
          .eq('id', attemptId)
          .eq('user_id', user.id)
          .single();

        if (attemptError) {
          console.error('خطأ في جلب المحاولة:', attemptError);
          setError('لم يتم العثور على نتائج هذا الامتحان');
          return;
        }

        console.log('تم جلب المحاولة:', attemptData);
        setAttempt(attemptData);

        // جلب إجابات المستخدم مع الأسئلة
        const { data: answersData, error: answersError } = await supabase
          .from('user_answers')
          .select(`
            id,
            question_id,
            selected_answer_id,
            is_correct,
            question:questions(
              question_text,
              explanation,
              answers(
                id,
                answer_text,
                is_correct
              )
            )
          `)
          .eq('attempt_id', attemptId)
          .order('question_id');

        if (answersError) {
          console.error('خطأ في جلب الإجابات:', answersError);
          setError('فشل في جلب تفاصيل الإجابات');
          return;
        }

        console.log('تم جلب الإجابات:', answersData);
        setUserAnswers(answersData || []);

        // تحضير الأسئلة للعرض
        const questionsData = (answersData || []).map((answer: any, index: number) => ({
          ...answer.question,
          userAnswer: answer.selected_answer_id,
          isCorrect: answer.is_correct,
          index: index + 1
        }));

        setQuestions(questionsData);

      } catch (error: any) {
        console.error('خطأ في جلب النتائج:', error);
        setError('حدث خطأ في تحميل النتائج');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [attemptId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-algeria-green mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل النتائج...</p>
        </div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="p-6 text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">خطأ في تحميل النتائج</h2>
          <p className="text-gray-600 mb-4">{error || 'لم يتم العثور على نتائج هذا الامتحان'}</p>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/statistics')} className="flex-1">
              <Home className="w-4 h-4 mr-2" />
              الإحصائيات
            </Button>
            <Button variant="outline" onClick={() => navigate('/exams')} className="flex-1">
              الامتحانات
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const percentage = Math.round(attempt.percentage || 0);
  const isPassed = percentage >= 50;

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col pb-20"
      style={{ direction: "rtl" }}
    >
      {/* Header */}
      <div className="p-4 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/statistics')}
          >
            العودة للإحصائيات
          </Button>
          <h1 className="flex-1 text-center font-bold text-algeria-green">
            {attempt.exam?.title || 'نتائج الامتحان'}
          </h1>
        </div>
      </div>

      {/* Results Summary */}
      <Card className="mx-4 mb-6 p-6 text-center bg-white/90">
        <div className="flex items-center justify-center mb-4">
          {isPassed ? (
            <CheckCircle className="w-16 h-16 text-green-500" />
          ) : (
            <XCircle className="w-16 h-16 text-red-500" />
          )}
        </div>
        
        <h2 className={`text-3xl font-bold mb-2 ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
          {percentage}%
        </h2>
        
        <p className="text-lg text-gray-700 mb-2">
          {attempt.score} من {questions.length} إجابة صحيحة
        </p>
        
        <p className={`font-medium ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
          {isPassed ? '🎉 مبروك! لقد نجحت' : '😔 لم تنجح هذه المرة'}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate(`/exam/${attempt.exam?.id}`)}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            إعادة الامتحان
          </Button>
          
          <PDFDownloadButton
            attemptId={attemptId!}
            examTitle={attempt.exam?.title}
            className="flex-1"
          />
        </div>
      </Card>

      {/* Questions Review */}
      <div className="px-4 space-y-4 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">مراجعة الأسئلة</h3>
        
        {questions.map((question, idx) => (
          <Card key={question.id} className="p-4 bg-white/90">
            <div className="text-sm text-algeria-green font-bold mb-2">
              السؤال {idx + 1}
            </div>
            <ExamQuestion
              questionText={question.question_text}
              answers={question.answers}
              selected={question.userAnswer}
              correctAnswerId={question.answers.find((a: any) => a.is_correct)?.id}
              showResult={true}
              explanation={question.explanation}
              onSelect={() => {}}
            />
          </Card>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Results;
