
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Exam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Mock questions data
  const questions = [
    {
      id: 1,
      text: 'ما هو الهدف الرئيسي لبريد الجزائر؟',
      options: [
        'تقديم الخدمات البريدية فقط',
        'تقديم الخدمات البريدية والمالية والرقمية',
        'تقديم الخدمات المصرفية فقط',
        'تقديم خدمات الاتصالات'
      ],
      correctAnswer: 1
    },
    {
      id: 2,
      text: 'ما هو بريدي موب؟',
      options: [
        'تطبيق للألعاب',
        'تطبيق للتواصل الاجتماعي',
        'تطبيق للخدمات المالية والدفع الإلكتروني',
        'تطبيق للأخبار'
      ],
      correctAnswer: 2
    },
    // Add more questions as needed
  ];

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setAnswers({
      ...answers,
      [currentQuestion]: answerIndex
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    const score = Object.entries(answers).reduce((total, [questionIndex, answerIndex]) => {
      const question = questions[parseInt(questionIndex)];
      return total + (question.correctAnswer === answerIndex ? 1 : 0);
    }, 0);

    toast({
      title: 'تم إرسال الامتحان',
      description: `نتيجتك: ${score}/${questions.length}`,
    });

    // Navigate to results page
    setTimeout(() => {
      navigate('/results', { state: { score, total: questions.length, examId } });
    }, 2000);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredQuestions = Object.keys(answers).length;

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="text-center">
          <CardContent className="p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">تم إرسال الامتحان بنجاح</h2>
            <p className="text-gray-600">جاري تحضير النتائج...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">امتحان تجريبي {examId}</CardTitle>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center text-algeria-red">
                <Clock className="h-4 w-4 ml-1" />
                <span className="font-bold">{formatTime(timeLeft)}</span>
              </div>
              <div className="text-sm text-gray-600">
                {answeredQuestions}/{questions.length} أجبت
              </div>
            </div>
          </div>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">
            السؤال {currentQuestion + 1} من {questions.length}
          </CardTitle>
          <CardDescription className="text-right text-lg font-medium text-gray-900">
            {questions[currentQuestion]?.text}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {questions[currentQuestion]?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-right rounded-lg border-2 transition-colors ${
                  answers[currentQuestion] === index
                    ? 'border-algeria-green bg-green-50 text-algeria-green'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  <span className="font-bold text-gray-400">
                    {String.fromCharCode(65 + index)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          variant="outline"
        >
          السؤال السابق
        </Button>

        <div className="flex space-x-2 space-x-reverse">
          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              className="bg-algeria-red hover:bg-red-700 text-white"
              disabled={answeredQuestions < questions.length}
            >
              إرسال الامتحان
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-algeria-green hover:bg-green-700 text-white"
            >
              السؤال التالي
            </Button>
          )}
        </div>
      </div>

      {/* Warning for unanswered questions */}
      {answeredQuestions < questions.length && currentQuestion === questions.length - 1 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center text-yellow-800">
              <AlertCircle className="h-5 w-5 ml-2" />
              <span>تحذير: لم تجب على جميع الأسئلة. يرجى مراجعة إجاباتك قبل الإرسال.</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Exam;
