
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ExamQuestion from "@/components/ExamQuestion";
import { Button } from "@/components/ui/button";

const ExamReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { examId } = useParams();
  const answersMap: Record<string, string> = location.state?.answers || {};

  const [questions, setQuestions] = useState<any[]>([]);
  const [corrects, setCorrects] = useState<Record<string, string>>({});
  const [exam, setExam] = useState<any>(null);

  useEffect(() => {
    (async () => {
      // Get exam & questions
      const { data: examData } = await supabase.from("exams").select("*").eq("id", examId).maybeSingle();
      setExam(examData || null);
      // Get all questions with answers
      const { data: qData } = await supabase.rpc("get_shuffled_questions", { exam_uuid: examId });
      setQuestions(qData || []);
      // Get correct answers
      if (qData) {
        const qIds = qData.map((q: any) => q.id);
        const { data: correctAns } = await supabase.from("answers")
          .select("*")
          .in("question_id", qIds)
          .eq("is_correct", true);
        const correctMap: Record<string, string> = {};
        correctAns?.forEach((c) => { correctMap[c.question_id] = c.id; });
        setCorrects(correctMap);
      }
    })();
  }, [examId]);

  if (!questions.length) return <div className="flex justify-center py-8">لا توجد بيانات للمراجعة...</div>;

  // Result calculation (client, can be synced to backend)
  const total = questions.length;
  let correctCount = 0;
  questions.forEach(q => {
    if (answersMap[q.id] && corrects[q.id] && answersMap[q.id] === corrects[q.id]) correctCount++;
  });
  const percent = total ? Math.round((correctCount / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col p-2 pb-20">
      <div className="mb-7 flex items-center">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>العودة</Button>
        <span className="mx-auto font-bold text-algeria-green">{exam?.title}</span>
      </div>
      <div className="bg-white mb-6 px-3 py-4 rounded-xl shadow text-center">
        <div className="flex flex-col items-center gap-1">
          <div className="text-3xl font-extrabold text-algeria-green">{percent}%</div>
          <div className="text-sm text-gray-700">نسبة الإجابات الصحيحة</div>
          <div className="text-md text-blue-700">{correctCount} من {total} سؤالًا صحيحًا</div>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-lg shadow py-3 px-2">
            <div className="text-sm text-algeria-green font-bold mb-1">
              السؤال {idx + 1}
            </div>
            <ExamQuestion
              questionText={q.question_text}
              answers={q.answers}
              selected={answersMap[q.id] || null}
              correctAnswerId={corrects[q.id]}
              showResult
              explanation={q.explanation}
              onSelect={() => { }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
export default ExamReviewPage;
