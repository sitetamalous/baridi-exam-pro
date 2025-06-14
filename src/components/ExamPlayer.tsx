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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-algeria-green"></div>
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header with timer */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
        <h1 className="text-xl font-bold">{exam?.title}</h1>
        <div className="flex items-center text-red-600 font-mono text-lg">
          <Clock className="h-5 w-5 ml-2" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>السؤال {currentQuestion + 1} من {questions.length}</span>
          <span>{Object.keys(answers).length} إجابة مكتملة</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-algeria-green h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">
            {currentQ?.question_text}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentQ?.answers?.map((answer, index) => (
              <label
                key={answer.id}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  answers[currentQ.id] === answer.id
                    ? 'border-algeria-green bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQ.id}`}
                  value={answer.id}
                  checked={answers[currentQ.id] === answer.id}
                  onChange={() => handleAnswerSelect(currentQ.id, answer.id)}
                  className="ml-3"
                />
                <span className="font-medium ml-2">
                  {String.fromCharCode(65 + index)})
                </span>
                <span>{answer.answer_text}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          <ChevronRight className="h-4 w-4 ml-2" />
          السابق
        </Button>

        <div className="flex space-x-2 space-x-reverse">
          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmitExam}
              className="bg-red-600 hover:bg-red-700"
            >
              <Flag className="h-4 w-4 ml-2" />
              إنهاء الامتحان
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
              disabled={currentQuestion === questions.length - 1}
            >
              <ChevronLeft className="h-4 w-4 ml-2" />
              التالي
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPlayer;
