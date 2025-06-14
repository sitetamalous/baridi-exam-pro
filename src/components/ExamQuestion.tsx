
import React from "react";
import { cn } from "@/lib/utils";

type Answer = { id: string; answer_text: string };

interface ExamQuestionProps {
  questionText: string;
  answers: Answer[];
  selected: string | null;
  onSelect: (answerId: string) => void;
  correctAnswerId?: string;
  showResult?: boolean;
  explanation?: string | null;
}

const ExamQuestion: React.FC<ExamQuestionProps> = ({
  questionText,
  answers,
  selected,
  onSelect,
  correctAnswerId,
  showResult,
  explanation,
}) => (
  <div>
    <div className="mb-4 font-semibold text-base text-gray-800">{questionText}</div>
    <div className="flex flex-col gap-2">
      {answers.map((ans) => {
        const isSelected = selected === ans.id;
        const isCorrect = showResult && correctAnswerId === ans.id;
        let optionClass = "border px-3 py-2 rounded-lg flex items-center cursor-pointer";
        if (showResult) {
          if (isSelected && !isCorrect) optionClass += " bg-red-50 border-red-300";
          if (isCorrect) optionClass += " bg-green-50 border-green-400";
        } else if (isSelected) {
          optionClass += " bg-blue-50 border-blue-400";
        }
        return (
          <div
            key={ans.id}
            className={cn(optionClass, "transition duration-150")}
            onClick={() => !showResult && onSelect(ans.id)}
            role="button"
            aria-pressed={isSelected}
          >
            <span className={cn("flex-1", isCorrect ? "font-bold text-algeria-green" : "")}>
              {ans.answer_text}
            </span>
            {showResult && (
              <span className="ml-2">
                {isCorrect ? "✔️" : isSelected ? "✘" : ""}
              </span>
            )}
          </div>
        );
      })}
    </div>
    {showResult && explanation && (
      <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded text-sm">
        <span className="font-semibold">التفسير:</span> {explanation}
      </div>
    )}
  </div>
);

export default ExamQuestion;
