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

  if (loading) return <div className="flex justify-center py-8">جاري التحميل...</div>;
  if (!exam) return <div className="flex justify-center py-8">لم يتم العثور على الامتحان</div>;
  if (!questions.length) return <div className="flex justify-center py-8">لا توجد أسئلة متاحة لهذا الامتحان</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col pb-20 p-2">
      <div className="flex justify-between items-center mb-4">
        <span className="font-bold text-algeria-green">{exam.title}</span>
        <ExamTimer secondsLeft={timer} onExpire={handleSubmit} />
      </div>
      <div className="bg-white p-3 rounded-lg shadow">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>
            {`السؤال ${current + 1} من ${questions.length}`}
          </span>
        </div>
        <ExamQuestion
          questionText={questions[current].question_text}
          answers={questions[current].answers}
          selected={answers[questions[current].id] || null}
          onSelect={handleSelect}
        />
      </div>
      <div className="flex gap-2 mt-5">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 rounded-lg"
          onClick={handlePrev}
          disabled={current === 0}
        >
          السابق
        </Button>
        {current === questions.length - 1 ? (
          <Button
            size="sm"
            className="flex-1 rounded-lg bg-algeria-green text-white"
            onClick={handleSubmit}
          >
            إرسال الامتحان
          </Button>
        ) : (
          <Button size="sm" className="flex-1 rounded-lg bg-algeria-green text-white" onClick={handleNext}>
            التالي
          </Button>
        )}
      </div>
    </div>
  );
};
export default ExamPlayerPage;
