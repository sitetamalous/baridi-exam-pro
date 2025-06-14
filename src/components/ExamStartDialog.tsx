
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ExamPlayer from "@/components/ExamPlayer";

interface ExamStartDialogProps {
  examId: string;
  examTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExamStartDialog: React.FC<ExamStartDialogProps> = ({
  examId,
  examTitle,
  open,
  onOpenChange,
}) => {
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <Dialog open={open} onOpenChange={o => {onOpenChange(o); if(!o) setHasStarted(false);}}>
      <DialogContent
        className="p-0 max-w-xl w-full !rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 shadow-2xl min-h-[80vh] flex flex-col justify-center relative"
        style={{
          maxWidth: "420px",
          width: "100%",
          minHeight: "90vh",
          padding: 0,
          border: "none",
        }}
      >
        {!hasStarted ? (
          <div className="flex flex-col items-center gap-6 px-6 py-12">
            <div className="bg-white rounded-full shadow-lg w-20 h-20 flex items-center justify-center text-algeria-green text-5xl font-black mb-3 border-4 border-algeria-green select-none">📝</div>
            <DialogHeader className="text-center w-full mb-3">
              <DialogTitle className="text-2xl font-bold text-algeria-green mb-0">{examTitle}</DialogTitle>
            </DialogHeader>
            <div className="text-gray-700 text-base text-center leading-relaxed">
              أنت على وشك بدء الامتحان التجريبي.<br />
              عند البدء يبدأ العداد التنازلي، ولن تتمكن من التراجع.<br />
              تأكد من الاستعداد قبل الضغط على زر "ابدأ الامتحان".
            </div>
            <Button
              className="mt-6 bg-algeria-green text-white w-full h-14 rounded-xl text-lg font-bold shadow-lg hover:bg-green-700 transition"
              size="lg"
              onClick={() => setHasStarted(true)}
              autoFocus
            >
              ابدأ الامتحان الآن
            </Button>
          </div>
        ) : (
          <div className="w-full h-full min-h-[75vh] flex flex-col">
            <ExamPlayer />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExamStartDialog;
