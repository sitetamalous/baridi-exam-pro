import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ExamTimer from "@/components/ExamTimer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useExamSubmission } from "@/hooks/useExamSubmission";

// دائرة رقم السؤال مع إبراز السؤال الجاري
const QuestionNumberCircle: React.FC<{
  index: number;
  active: boolean;
  onClick?: () => void;
}> = ({ index, active, onClick }) => (
  <button
    className={`
      relative flex items-center justify-center font-bold
      rounded-full transition-all text-sm md:text-base
      w-9 h-9 sm:w-10 sm:h-10
      ${active ? "bg-algeria-green text-white border-4 border-algeria-green scale-110 shadow-lg ring-2 ring-green-200" 
        : "bg-white border-2 border-green-200 text-algeria-green hover:bg-green-100"}
      focus:outline-none focus:ring-2 focus:ring-green-300 z-10
      select-none
    `}
    style={{
      minWidth: 36, minHeight: 36, boxShadow: active ? "0 2px 8px rgba(0,166,81,0.10)" : undefined
    }}
    onClick={onClick}
    aria-label={`اذهب للسؤال ${index + 1}`}
    type="button"
  >
    <span className="">{index + 1}</span>
    {active && (
      <span className="absolute left-0 right-0 mx-auto -bottom-2 w-1.5 h-1.5 rounded-full bg-algeria-green"></span>
    )}
  </button>
);

const ExamPlayerPage: React.FC = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { submitExam, isSubmitting } = useExamSubmission();
  
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: examData } = await supabase.from("exams").select("*").eq("id", examId).maybeSingle();
      if (examData) setExam(examData);
      const { data } = await supabase.rpc("get_shuffled_questions", { exam_uuid: examId });
      // Safely add explanation as empty string, so no TS error if not present
      const normalizedQuestions = (data || []).map((q) => ({
        id: q.id,
        question_text: q.question_text,
        answers: q.answers,
        explanation: "",
      }));
      setQuestions(normalizedQuestions);
      setLoading(false);
      if (examData) setTimer(examData.duration_minutes * 60);
    })();
  }, [examId]);

  useEffect(() => {
    if (examId) {
      localStorage.setItem(`exam-${examId}-answers`, JSON.stringify(answers));
    }
  }, [answers, examId]);

  const handleSelect = (aid) => {
    setAnswers((prev) => ({ ...prev, [questions[current].id]: aid }));
  };
  const handleNext = () => setCurrent((i) => Math.min(i + 1, questions.length - 1));
  const handlePrev = () => setCurrent((i) => Math.max(i - 1, 0));
  const goToQuestion = (index) => setCurrent(index);

  const handleSubmit = async () => {
    if (!examId) return;

    console.log('تسليم الامتحان مع الإجابات:', answers);
    
    const result = await submitExam(examId, answers);
    
    if (result) {
      // الانتقال لصفحة المراجعة مع معرف المحاولة
      navigate(`/results?attempt=${result.attemptId}`, {
        state: { 
          answers,
          score: result.score,
          percentage: result.percentage,
          totalQuestions: result.totalQuestions
        }
      });
    }
  };

  // زر الخروج من الامتحان: العودة للصفحة السابقة أو داشبورد
  const handleExit = () => {
    // أي من back أو إلى "/dashboard"
    if (window.history.length > 1) navigate(-1);
    else navigate("/dashboard");
  };

  useEffect(() => {
    document.body.classList.add("exam-full-page");
    return () => {
      document.body.classList.remove("exam-full-page");
    };
  }, []);

  if (loading)
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="loading-spinner"></div>
        <span className="mt-4 text-gray-600 font-bold">جاري تحميل الامتحان...</span>
      </div>
    );
  if (!exam)
    return <div className="flex justify-center py-8">لم يتم العثور على الامتحان</div>;
  if (!questions.length)
    return <div className="flex justify-center py-8">لا توجد أسئلة متاحة لهذا الامتحان</div>;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-blue-50 relative pb-28">
      <div className="
        w-full max-w-md rounded-[2.2rem] bg-white/95 shadow-[0_6px_36px_0_rgba(0,166,81,0.13)]
        relative overflow-hidden px-0 pt-0 pb-20 sm:pb-2
        min-h-[65vh] flex flex-col justify-between
        border border-green-100
      ">
        {/* زر الخروج في أعلى اليسار مع علامة * صغيرة جدًا */}
        <button
          onClick={handleExit}
          className="absolute left-3 top-3 bg-white text-algeria-green border rounded-full shadow w-9 h-9 flex items-center justify-center z-10 border-green-100 hover:bg-red-50 hover:text-red-500 transition"
          aria-label="الخروج من الامتحان"
          tabIndex={0}
        >
          <span className="absolute -top-0.5 -right-0.5 text-red-500" style={{fontSize: "0.7rem", fontWeight: 900}}>*</span>
          <X size={22} />
        </button>

        {/* ترويسة الامتحان */}
        <div className="flex flex-col items-center bg-gradient-to-tr from-algeria-green to-green-600 rounded-t-[2.2rem] shadow px-6 pt-7 pb-5 relative">
          <span className="text-white font-extrabold text-lg mb-1 text-center drop-shadow-md tracking-wide">
            {exam.title}
          </span>
          <div className="flex items-center justify-between w-full mt-2">
            <ExamTimer secondsLeft={timer} onExpire={handleSubmit} />
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold rounded-lg px-3 py-1 bg-white/90 text-algeria-green shadow">
                {`السؤال ${current + 1} من ${questions.length}`}
              </span>
            </div>
          </div>
        </div>

        {/* شريط أرقام الأسئلة – قابل للتمرير وجذاب أكثر على الموبايل */}
        <div
          className="
            flex items-center justify-start gap-1 px-2 mt-1 w-full overflow-x-auto pb-2 pt-2
            scrollbar-thin scrollbar-thumb-green-200 scrollbar-track-green-50 select-none
            sticky top-0 z-20 bg-white/95
            snap-x snap-mandatory
            shadow-xs
          "
          style={{
            WebkitOverflowScrolling: "touch",
            scrollSnapType: "x mandatory"
          }}
        >
          {questions.map((_, idx) => (
            <span
              key={idx}
              className="snap-center"
              style={{ minWidth: 0 }}
            >
              <QuestionNumberCircle
                index={idx}
                active={idx === current}
                onClick={() => goToQuestion(idx)}
              />
            </span>
          ))}
        </div>

        {/* السؤال + الخيارات محتفظان بتجاوب ممتاز */}
        <div className="p-4 sm:p-5 flex flex-col gap-6 min-h-[200px] mt-2">
          <div className="text-algeria-green text-lg font-bold text-center leading-[2.2rem] mb-2 select-none">
            {questions[current].question_text}
          </div>
          <div className="flex flex-col gap-4">
            {questions[current].answers.map((answer, i) => {
              const isSelected = answers[questions[current].id] === answer.id;
              return (
                <button
                  key={answer.id}
                  className={`block w-full rounded-xl border-2 px-0 py-3 bg-gray-50
                  text-gray-900 font-medium text-base text-right transition-all duration-150
                  ${
                    isSelected
                      ? "border-algeria-green bg-green-50 text-algeria-green shadow-md scale-105"
                      : "border-gray-200 hover:scale-105 hover:bg-green-50"
                  }`}
                  style={{ minHeight: 54 }}
                  onClick={() => handleSelect(answer.id)}
                  aria-pressed={isSelected}
                  type="button"
                >
                  <span className="font-bold text-base mx-2 rounded w-6 inline-block text-center bg-green-100 text-algeria-green">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {answer.answer_text}
                </button>
              );
            })}
          </div>
        </div>

        {/* شريط أزرار التحكم ⬇️ مثبت بأسفل البطاقة/الشاشة بكل الأوقات */}
        <div
          className="
            fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md
            flex gap-2 justify-between items-center
            bg-white/95 shadow-[0_-2px_16px_rgba(0,166,81,0.13)]
            rounded-t-2xl py-3 px-3
            z-50
            transition
            border-t border-green-100
            sm:static sm:rounded-t-none sm:shadow-none sm:border-t-0
          "
        >
          <Button
            size="lg"
            variant="outline"
            className="w-28 font-bold rounded-xl text-base flex items-center justify-center gap-1"
            onClick={handlePrev}
            disabled={current === 0}
          >
            <ArrowRight size={20} className="ml-1" />
            السابق
          </Button>
          
          {current === questions.length - 1 ? (
            <Button
              size="lg"
              className="flex-1 rounded-xl bg-algeria-green text-white font-bold text-base shadow-md"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "جاري التسليم..." : "إرسال الامتحان"}
            </Button>
          ) : (
            <Button
              size="lg"
              className="flex-1 rounded-xl bg-algeria-green text-white font-bold text-base shadow-md"
              onClick={handleNext}
              disabled={current === questions.length - 1}
            >
              التالي
              <ArrowLeft size={20} className="mr-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPlayerPage;
