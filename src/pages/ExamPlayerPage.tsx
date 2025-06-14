import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ExamTimer from "@/components/ExamTimer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Answer { id: string; answer_text: string }
interface Question {
  id: string;
  question_text: string;
  explanation: string | null;
  answers: Answer[];
}
interface Exam {
  id: string;
  title: string;
  duration_minutes: number;
}

// مكون جديد: دائرة رقم السؤال
const QuestionNumberCircle: React.FC<{ index: number; active: boolean; onClick?: () => void }> = ({
  index,
  active,
  onClick,
}) => (
  <button
    className={`flex items-center justify-center font-bold text-base rounded-full w-9 h-9 border-2 ${
      active
        ? "bg-algeria-green text-white border-algeria-green scale-110 shadow-md"
        : "border-green-200 bg-green-50 text-algeria-green hover:bg-green-100"
    } transition-all`}
    style={{ minWidth: 36, minHeight: 36 }}
    onClick={onClick}
    aria-label={`اذهب للسؤال ${index + 1}`}
    type="button"
  >
    {index + 1}
  </button>
);

const ExamPlayerPage: React.FC = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<{ [q: string]: string }>({});
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: examData } = await supabase.from("exams").select("*").eq("id", examId).maybeSingle();
      if (examData) setExam(examData);
      // Grab shuffled questions with answers
      const { data } = await supabase.rpc("get_shuffled_questions", { exam_uuid: examId });
      const normalizedQuestions = (data || []).map((q: any) => ({
        id: q.id,
        question_text: q.question_text,
        answers: q.answers,
        explanation: q.explanation ?? "",
      }));
      setQuestions(normalizedQuestions);
      setLoading(false);
      if (examData) setTimer(examData.duration_minutes * 60);
    })();
  }, [examId]);

  // Auto-save answers in localStorage
  useEffect(() => {
    if (examId) {
      localStorage.setItem(`exam-${examId}-answers`, JSON.stringify(answers));
    }
  }, [answers, examId]);

  const handleSelect = (aid: string) => {
    setAnswers((prev) => ({ ...prev, [questions[current].id]: aid }));
  };

  const handleNext = () => setCurrent((i) => Math.min(i + 1, questions.length - 1));
  const handlePrev = () => setCurrent((i) => Math.max(i - 1, 0));
  const goToQuestion = (index: number) => setCurrent(index);

  const handleSubmit = () => {
    navigate(`/exam/${examId}/review`, { state: { answers } });
  };

  // Hide global app layout (header/nav/footer) when in this exam page:
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-blue-50 relative py-3">
      {/* البطاقة الرئيسية المتقدمة */}
      <div className="w-full max-w-md rounded-[2.2rem] bg-white/95 shadow-[0_6px_36px_0_rgba(0,166,81,0.13)] relative overflow-hidden px-0 pt-0 pb-2">
        {/* ترويسة الامتحان */}
        <div className="flex flex-col items-center bg-gradient-to-tr from-algeria-green to-green-600 rounded-t-[2.2rem] shadow px-6 pt-7 pb-5 relative">
          <span className="text-white font-extrabold text-lg mb-1 text-center drop-shadow-md tracking-wide">
            {exam.title}
          </span>
          <div className="flex items-center justify-between w-full mt-2">
            {/* المؤقت */}
            <ExamTimer secondsLeft={timer} onExpire={handleSubmit} />
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold rounded-lg px-3 py-1 bg-white/90 text-algeria-green shadow">
                {`السؤال ${current + 1} من ${questions.length}`}
              </span>
            </div>
          </div>
        </div>

        {/* شريط التنقل بين الأسئلة */}
        <div className="flex justify-center gap-1 mt-1 w-full px-3 overflow-x-auto pb-2 pt-2">
          {questions.map((_, idx) => (
            <QuestionNumberCircle key={idx} index={idx} active={idx === current} onClick={() => goToQuestion(idx)} />
          ))}
        </div>

        {/* السؤال + الخيارات */}
        <div className="p-5 flex flex-col gap-6 min-h-[250px] mt-2">
          <div className="text-algeria-green text-lg font-bold text-center leading-[2.2rem] mb-3 select-none">
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

        {/* أزرار التحكم أسفل */}
        <div className="flex gap-3 justify-between items-center mt-4 px-5 mb-3">
          <Button
            size="lg"
            variant="outline"
            className="w-32 font-bold rounded-xl text-base flex items-center justify-center gap-1"
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
            >
              إرسال الامتحان
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
