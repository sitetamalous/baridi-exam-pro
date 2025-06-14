
import React, { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2, RotateCcw } from "lucide-react";

interface Attempt {
  id: string;
  exam_id: string;
  score: number;
  percentage: number;
  completed_at: string;
}

interface UserAttemptsListProps {
  attempts: Attempt[];
  refresh: () => void;
}

const UserAttemptsList: React.FC<UserAttemptsListProps> = ({ attempts, refresh }) => {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sorted = useMemo(() => [...attempts].sort((a, b) =>
    (b.completed_at || "").localeCompare(a.completed_at || "")), [attempts]);

  const handleDelete = async (attemptId: string) => {
    if (!window.confirm("هل أنت متأكد أنك تريد حذف محاولة هذا الامتحان؟ لن يتم استرجاع نتيجتك.")) return;
    setDeletingId(attemptId);
    const { error } = await supabase.from("user_attempts").delete().eq("id", attemptId);
    setDeletingId(null);
    if (error) {
      toast({ title: "خطأ", description: "تعذر حذف المحاولة.", variant: "destructive" });
      return;
    }
    toast({ title: "تم الحذف", description: "تم حذف المحاولة بنجاح." });
    refresh();
  };

  const handleRetry = (examId: string) => {
    // اذهب لصفحة اعادة الاجتياز
    window.location.assign(`/exam/${examId}`);
  };

  if (!sorted.length) {
    return <div className="text-gray-500 text-center my-6">لم تقم بأي اختبار بعد.</div>
  }

  return (
    <div className="w-full max-w-md mx-auto rounded-xl bg-white p-3 shadow mt-4">
      <div className="font-bold text-center text-algeria-green mb-2">اختبارات قمت بها</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-600 text-xs border-b">
            <th className="p-1 font-bold text-right">النتيجة</th>
            <th className="p-1 font-bold text-right">النسبة</th>
            <th className="p-1 font-bold text-right">التاريخ</th>
            <th className="p-1 font-bold text-right"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((a) => (
            <tr key={a.id} className="even:bg-gray-50 border-b">
              <td className="p-1 text-right">{a.score ?? "--"}</td>
              <td className="p-1 text-right">{a.percentage != null ? `${Math.round(Number(a.percentage))}%` : "--"}</td>
              <td className="p-1 text-right">{a.completed_at ? new Date(a.completed_at).toLocaleDateString() : "--"}</td>
              <td className="p-1 flex gap-1 justify-end">
                <Button size="icon" variant="ghost" aria-label="حذف" disabled={deletingId === a.id} onClick={() => handleDelete(a.id)}>
                  <Trash2 className="text-red-500" size={16} />
                </Button>
                <Button size="icon" variant="ghost" aria-label="إعادة الامتحان" onClick={() => handleRetry(a.exam_id)}>
                  <RotateCcw className="text-algeria-green" size={16} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserAttemptsList;
