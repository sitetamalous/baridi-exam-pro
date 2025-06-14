
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ExamTimer from "@/components/ExamTimer";
import { Button } from "@/components/ui/button";

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
    // Add class to body to hide layout
    document.body.classList.add("exam-full-page");
    return () => {
      document.body.classList.remove("exam-full-page");
    };
  }, []);

  if (loading) return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="loading-spinner"></div>
      <span className="mt-4 text-gray-600 font-bold">جاري تحميل الامتحان...</span>
    </div>
  );
  if (!exam) return <div className="flex justify-center py-8">لم يتم العثور على الامتحان</div>;
  if (!questions.length) return <div className="flex justify-center py-8">لا توجد أسئلة متاحة لهذا الامتحان</div>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-100 to-blue-50 flex flex-col items-center p-0">
      {/* بطاقة الامتحان الرئيسية */}
      <div className="w-full max-w-md m-auto mt-6 flex flex-col gap-3 animate-fade-in">
        {/* عنوان الامتحان + عداد */}
        <div className="bg-algeria-green text-white rounded-t-3xl shadow-xl px-6 py-5 flex flex-col items-center">
          <span className="text-base font-bold text-center">{exam.title}</span>
          <div className="flex justify-between w-full items-center mt-4">
            <ExamTimer secondsLeft={timer} onExpire={handleSubmit} />
            <span className="text-xs font-semibold">{`السؤال ${current + 1} من ${questions.length}`}</span>
          </div>
        </div>
        {/* أرقام الأسئلة (pagination as circles) */}
        <div className="w-full bg-white px-4 py-2 flex justify-center gap-2 rounded-b-3xl border-b border-x border-green-100 shadow">
          {questions.map((_, idx) => (
            <button
              key={idx}
              aria-label={`اذهب للسؤال ${idx + 1}`}
              onClick={() => goToQuestion(idx)}
              className={`rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold transition
                ${idx === current ? "bg-algeria-green text-white scale-105 shadow" : "bg-green-50 text-algeria-green hover:bg-green-100"}
                border border-green-200`}
              style={{ minWidth: 32, minHeight: 32 }}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        {/* السؤال والخيارات */}
        <div className="w-full bg-white rounded-3xl shadow-2xl p-5 pb-6 border border-green-100 flex flex-col gap-6 min-h-[270px]">
          <div className="text-center font-bold text-lg text-algeria-green mb-2" style={{lineHeight: "2.2rem"}}>
            {questions[current].question_text}
          </div>
          <div className="flex flex-col gap-4">
            {questions[current].answers.map((answer) => {
              const isSelected = answers[questions[current].id] === answer.id;
              return (
                <button
                  key={answer.id}
                  className={`block w-full rounded-xl border-2 px-0 py-3 bg-gray-50
                    text-gray-900 font-semibold text-base text-right transition-all
                    ${isSelected ? "border-algeria-green bg-green-50 text-algeria-green shadow-md scale-105" : "border-gray-200 hover:scale-105 hover:bg-green-50"}
                  `}
                  style={{ minHeight: 54 }}
                  onClick={() => handleSelect(answer.id)}
                  aria-pressed={isSelected}
                >
                  {answer.answer_text}
                </button>
              );
            })}
          </div>
        </div>
        {/* أزرار التحكم في الأسفل */}
        <div className="flex gap-3 mt-4 mb-2">
          <Button
            size="lg"
            variant="outline"
            className="w-32 font-bold rounded-xl text-base"
            onClick={handlePrev}
            disabled={current === 0}
          >
            السابق
          </Button>
          {current === questions.length - 1 ? (
            <Button
              size="lg"
              className="flex-1 rounded-xl bg-algeria-green text-white font-bold text-base"
              onClick={handleSubmit}
            >
              إرسال الامتحان
            </Button>
          ) : (
            <Button
              size="lg"
              className="flex-1 rounded-xl bg-algeria-green text-white font-bold text-base"
              onClick={handleNext}
              disabled={current === questions.length - 1}
            >
              التالي
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPlayerPage;

