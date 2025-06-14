
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ExamTimer from "@/components/ExamTimer";
import ExamQuestion from "@/components/ExamQuestion";
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
      // تأكد أن كل عنصر في data لديه explanation (حتى لو فاضي)
      const normalizedQuestions = (data || []).map((q: any) => ({
        id: q.id,
        question_text: q.question_text,
        answers: q.answers,
        explanation: q.explanation ?? "", // أضف explanation للتوافق مع النوع
      }));
      setQuestions(normalizedQuestions);
      setLoading(false);
      if (examData) setTimer(examData.duration_minutes * 60);
    })();
  }, [examId]);

  // Auto-save answers in localStorage (simulate)
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

  const handleSubmit = () => {
    // Save attempt/answers to supabase, then redirect
    navigate(`/exam/${examId}/review`, { state: { answers } });
  };

  if (loading) return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="loading-spinner"></div>
      <span className="mt-4 text-gray-600 font-bold">جاري تحميل الامتحان...</span>
    </div>
  );
  if (!exam) return <div className="flex justify-center py-8">لم يتم العثور على الامتحان</div>;
  if (!questions.length) return <div className="flex justify-center py-8">لا توجد أسئلة متاحة لهذا الامتحان</div>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-100 to-blue-50 flex flex-col py-0 px-0">
      {/* Top header bar */}
      <div className="w-full sticky top-0 z-20">
        <div className="flex flex-col items-center p-0 w-full">
          <div className="w-full bg-algeria-green text-white rounded-b-3xl drop-shadow-lg px-0 py-6 flex flex-col items-center border-b border-green-200 mb-1">
            <div className="flex justify-between w-full items-center px-5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="!bg-transparent text-white hover:bg-white/20 rounded-full"
              >
                <svg width={24} height={24} viewBox="0 0 24 24"><path d="M17 12H7M13 18l-6-6 6-6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Button>
              <span className="text-lg font-bold tracking-tight">
                {exam.title}
              </span>
              <div style={{ width: 32 }}></div>
            </div>
            <div className="flex justify-center mt-3 mb-1 w-full gap-6 items-center">
              <ExamTimer secondsLeft={timer} onExpire={handleSubmit} />
              <span className="text-[0.97rem] text-green-100 font-semibold">{`السؤال ${current + 1} من ${questions.length}`}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Card container */}
      <div className="flex-1 flex flex-col items-center justify-start w-full px-2 pb-24">
        <div className="w-full max-w-md m-auto">
          <div className="bg-white rounded-2xl p-4 py-7 shadow-xl border border-green-100 animate-fade-in mt-4">
            {/* السؤال */}
            <div className="font-bold text-base md:text-lg text-gray-800 mb-6 text-center leading-9">
              {questions[current].question_text}
            </div>
            {/* الأجوبة */}
            <div className="flex flex-col gap-3">
              {questions[current].answers.map((answer) => {
                const isSelected = answers[questions[current].id] === answer.id;
                return (
                  <button
                    key={answer.id}
                    className={`w-full text-base rounded-xl border-2 px-0 py-3 transition-all font-semibold bg-gray-50 text-gray-900
                      ${isSelected ? "border-algeria-green bg-green-50 text-algeria-green shadow-md scale-105" : "border-gray-200 hover:scale-105"}
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
        </div>
      </div>
      {/* Bottom nav for next/prev/submit */}
      <div className="fixed left-0 right-0 bottom-0 z-40 py-3 bg-white/90 backdrop-blur-lg flex items-center justify-between gap-2 px-2 max-w-md mx-auto w-full border-t border-green-100">
        <Button
          size="lg"
          variant="outline"
          className="flex-1 rounded-lg"
          onClick={handlePrev}
          disabled={current === 0}
        >
          السابق
        </Button>
        {current === questions.length - 1 ? (
          <Button
            size="lg"
            className="flex-1 rounded-lg bg-algeria-green text-white font-bold"
            onClick={handleSubmit}
          >
            إرسال الامتحان
          </Button>
        ) : (
          <Button size="lg" className="flex-1 rounded-lg bg-algeria-green text-white font-bold" onClick={handleNext}>
            التالي
          </Button>
        )}
      </div>
    </div>
  );
};
export default ExamPlayerPage;
