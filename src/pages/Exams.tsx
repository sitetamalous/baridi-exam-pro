
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { FileText, Check, X } from "lucide-react";

interface Exam {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
}

type AttemptStatus = "not_started" | "in_progress" | "completed";

const Exams: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
    if (user) fetchUserAttempts();
  }, [user]);

  const fetchExams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: true })
      .limit(10);
    if (!error) setExams(data || []);
    setLoading(false);
  };

  const fetchUserAttempts = async () => {
    const { data, error } = await supabase
      .from("user_attempts")
      .select("*")
      .eq("user_id", user?.id);
    if (!error) setAttempts(data || []);
  };

  const getExamStatus = (exam: Exam): AttemptStatus => {
    const attempt = attempts.find((a) => a.exam_id === exam.id);
    if (!attempt) return "not_started";
    if (!attempt.completed_at) return "in_progress";
    return "completed";
  };

  const getExamScore = (exam: Exam) => {
    const attempt = attempts.find((a) => a.exam_id === exam.id);
    if (!attempt || attempt.score == null) return null;
    return { score: attempt.score, percentage: attempt.percentage };
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-green-50 to-blue-50 pb-16">
      <div className="flex-1 p-3">
        <h1 className="text-xl font-bold mb-4 mt-3 flex items-center justify-center gap-2">
          <FileText className="ml-1" />
          الامتحانات التجريبية
        </h1>
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center mt-8 text-gray-500">جاري التحميل...</div>
          ) : exams.length === 0 ? (
            <div className="text-center text-gray-500">لا يوجد امتحانات متاحة حاليا.</div>
          ) : (
            exams.map((exam) => {
              const status = getExamStatus(exam);
              const score = getExamScore(exam);
              return (
                <Card key={exam.id} className="rounded-xl shadow px-1">
                  <CardHeader className="pb-2 flex items-center gap-2">
                    <CardTitle className="text-base flex-1">{exam.title}</CardTitle>
                    {status === "completed" && (
                      <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-semibold">
                        <Check className="ml-1" size={16} />
                        تم
                      </span>
                    )}
                    {status === "in_progress" && (
                      <span className="inline-flex items-center px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-semibold">
                        <FileText className="ml-1" size={16} />
                        جاري الحل
                      </span>
                    )}
                    {status === "not_started" && (
                      <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                        <X className="ml-1" size={16} />
                        لم يبدأ بعد
                      </span>
                    )}
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="text-sm text-gray-700 mb-3">{exam.description || "امتحان تدريبي."}</div>
                    {score && (
                      <div className="mb-2 text-sm text-algeria-green font-bold">
                        نتيجتك: {score.score} نقطة ({score.percentage?.toFixed(1)}%)
                      </div>
                    )}
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        if (status === "completed") {
                          const attempt = attempts.find((a) => a.exam_id === exam.id);
                          navigate(`/results?attempt=${attempt?.id}`);
                        } else {
                          navigate(`/exam/${exam.id}`);
                        }
                      }}
                    >
                      {status === "completed"
                        ? "مراجعة الامتحان"
                        : status === "in_progress"
                        ? "أكمل الحل"
                        : "ابدأ الامتحان"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Exams;
