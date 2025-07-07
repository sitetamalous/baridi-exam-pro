import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, Circle } from 'lucide-react';

interface ExamProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: number;
  timeRemaining?: number;
  className?: string;
}

const ExamProgress: React.FC<ExamProgressProps> = ({
  currentQuestion,
  totalQuestions,
  answeredQuestions,
  timeRemaining,
  className = ''
}) => {
  const progressPercentage = (answeredQuestions / totalQuestions) * 100;
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-white/95 rounded-xl p-4 shadow-sm border ${className}`} style={{ direction: 'rtl' }}>
      {/* رقم السؤال الحالي */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">
            السؤال {currentQuestion} من {totalQuestions}
          </span>
        </div>
        
        {timeRemaining !== undefined && (
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${timeRemaining < 300 ? 'text-red-500' : 'text-blue-500'}`} />
            <span className={`text-sm font-medium ${timeRemaining < 300 ? 'text-red-500' : 'text-gray-700'}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
      </div>

      {/* شريط التقدم */}
      <div className="mb-3">
        <Progress 
          value={progressPercentage} 
          className="h-2"
        />
      </div>

      {/* إحصائيات الإجابات */}
      <div className="flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>تم الإجابة: {answeredQuestions}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Circle className="w-3 h-3 text-gray-400" />
          <span>المتبقي: {totalQuestions - answeredQuestions}</span>
        </div>
        
        <span className="font-medium">
          {Math.round(progressPercentage)}% مكتمل
        </span>
      </div>
    </div>
  );
};

export default ExamProgress;