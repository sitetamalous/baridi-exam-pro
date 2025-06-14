import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Clock, ChevronLeft, ChevronRight, Flag } from 'lucide-react';

interface Answer {
  id: string;
  answer_text: string;
}

interface Question {
  id: string;
  question_text: string;
  answers: Answer[];
}

interface ScoreResult {
  total_questions: number;
  correct_answers: number;
  score: number;
  percentage: number;
}

const ExamPlayer: React.FC = () => {
  const { examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [attemptId, setAttemptId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (examId && user) {
      initializeExam();
    }
  }, [examId, user]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && attemptId) {
      handleSubmitExam();
    }
  }, [timeLeft, attemptId]);

  const initializeExam = async () => {
    try {
      // Fetch exam details
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .single();

      if (examError) throw examError;
      setExam(examData);
      setTimeLeft(examData.duration_minutes * 60);

      // Create attempt
      const { data: attemptData, error: attemptError } = await supabase
        .from('user_attempts')
        .insert({
          user_id: user?.id,
          exam_id: examId,
        })
        .select()
        .single();

      if (attemptError) throw attemptError;
      setAttemptId(attemptData.id);

      // Fetch shuffled questions
      const { data: questionsData, error: questionsError } = await supabase
        .rpc('get_shuffled_questions', { exam_uuid: examId });

      if (questionsError) throw questionsError;
      
      // Transform the data to match our Question interface
      const transformedQuestions: Question[] = (questionsData || []).map((q: any) => ({
        id: q.id,
        question_text: q.question_text,
        answers: Array.isArray(q.answers) ? q.answers : []
      }));
      
      setQuestions(transformedQuestions);
    } catch (error: any) {
      console.error('Error initializing exam:', error);
      toast({
        variant: "destructive",
        title: "خطأ في تحميل الامتحان",
        description: "حدث خطأ أثناء تحميل الامتحان",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const handleSubmitExam = async () => {
    try {
      // Submit all answers
      const userAnswers = Object.entries(answers).map(([questionId, answerId]) => ({
        attempt_id: attemptId,
        question_id: questionId,
        selected_answer_id: answerId,
        is_correct: false // Will be calculated on the backend
      }));

      if (userAnswers.length > 0) {
        const { error: answersError } = await supabase
          .from('user_answers')
          .insert(userAnswers);

        if (answersError) throw answersError;
      }

      // Calculate score
      const { data: scoreData, error: scoreError } = await supabase
        .rpc('calculate_attempt_score', { attempt_uuid: attemptId });

      if (scoreError) throw scoreError;

      // Safe type conversion to handle the Json type
      const score = scoreData as unknown as ScoreResult;

      toast({
        title: "تم إنهاء الامتحان",
        description: `تم الحصول على ${score.percentage}% من الدرجات`,
      });

      navigate(`/results?attempt=${attemptId}`);
    } catch (error: any) {
      console.error('Error submitting exam:', error);
      toast({
        variant: "destructive",
        title: "خطأ في إرسال الامتحان",
        description: "حدث خطأ أثناء إرسال إجاباتك",
      });
    }
  };

  const getTimerClass = () => {
    if (timeLeft <= 30) return "text-red-600 timer-critical";
    if (timeLeft <= 60) return "text-yellow-600 timer-warning";
    return "text-algeria-green";
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">لا توجد أسئلة متاحة لهذا الامتحان</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          العودة للوحة التحكم
        </Button>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="exam-container min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-blue-50 px-0 py-0 relative pb-24">
      {/* شريط علوي */}
      <div className="w-full bg-white/70 sticky top-0 z-10 flex items-center justify-between px-4 py-2 rounded-b-xl shadow-md border-b">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-gray-200"
          onClick={() => navigate('/dashboard')}
        >
          <span className="sr-only">خروج</span>
          {/* يمكن استخدام أيقونة خروج */}
          <svg width={18} height={18} viewBox="0 0 20 20" fill="none"><path d="M14 7v-2.5A2.5 2.5 0 0 0 11.5 2h-5A2.5 2.5 0 0 0 4 4.5v11A2.5 2.5 0 0 0 6.5 18h5a2.5 2.5 0 0 0 2.5-2.5V13" stroke="#00A651" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/><path d="M17 10h-8M15 8l2 2-2 2" stroke="#00A651" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Button>
        <div className="text-base font-bold text-algeria-green text-center flex-1">{exam?.title}</div>
        <div className={getTimerClass() + " font-mono min-w-[85px] text-center text-lg flex items-center justify-center"}>
          <span className="ml-1">⏰</span>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* تقدم الامتحان */}
      <div className="w-full px-4 mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>السؤال <span className="font-bold text-gray-700">{currentQuestion + 1}</span> من {questions.length}</span>
          <span>{Object.keys(answers).length} مجاب</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-algeria-green h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* كارت السؤال والإجابات */}
      <div
        className="question-card mt-5 mb-2 py-6 px-3 md:px-6 flex flex-col rounded-2xl shadow-lg"
        style={{
          boxShadow: "0 8px 28px 0 rgba(0,166,81,0.09)",
          border: "1.5px solid #E3E7EB",
        }}
      >
        <div className="mb-4 font-semibold text-lg text-gray-800 text-center">
          {currentQ?.question_text}
        </div>
        <div className="flex flex-col gap-3">
          {currentQ?.answers?.map((answer, index) => {
            const selected = answers[currentQ.id] === answer.id;
            return (
              <button
                key={answer.id}
                aria-pressed={selected}
                className={
                  "answer-option w-full flex gap-3 items-center rounded-xl transition-all duration-200 text-base font-medium " +
                  (selected
                    ? "selected border-2 border-algeria-green ring-2 ring-green-200"
                    : "hover:scale-105")
                }
                style={{ minHeight: 54, paddingRight: 18 }}
                onClick={() => handleAnswerSelect(currentQ.id, answer.id)}
              >
                <span className="w-7 text-center text-sm opacity-60">{String.fromCharCode(65 + index)})</span>
                <span className="flex-1 text-start">{answer.answer_text}</span>
                {selected && (
                  <span className="text-2xl -mr-2 text-algeria-green">{/* صح */}✔️</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* أزرار التنقل بالأسفل ـ مثبت ـ كأنها أزرار موبايل */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-[0_-2px_20px_0_rgba(0,166,81,0.13)] flex gap-3 px-2 py-3 z-30 max-w-lg mx-auto">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 rounded-xl font-semibold"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          <span className="ml-2">السابق</span>
        </Button>
        {currentQuestion === questions.length - 1 ? (
          <Button
            size="lg"
            className="flex-1 bg-algeria-green rounded-xl text-white font-bold shadow-md hover:bg-green-700"
            onClick={handleSubmitExam}
          >
            إنهاء الامتحان
          </Button>
        ) : (
          <Button
            size="lg"
            className="flex-1 bg-algeria-green rounded-xl text-white font-bold shadow-md hover:bg-green-700"
            onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
          >
            التالي
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExamPlayer;
