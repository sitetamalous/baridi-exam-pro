import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Target, Clock, Award } from 'lucide-react';

interface ExamStatsProps {
  totalExams: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number; // in minutes
  className?: string;
}

const ExamStats: React.FC<ExamStatsProps> = ({
  totalExams,
  averageScore,
  bestScore,
  totalTimeSpent,
  className = ''
}) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours} ساعة و ${mins} دقيقة`;
    }
    return `${mins} دقيقة`;
  };

  const stats = [
    {
      icon: Target,
      label: 'إجمالي الامتحانات',
      value: totalExams.toString(),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: TrendingUp,
      label: 'متوسط النتائج',
      value: `${Math.round(averageScore)}%`,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Award,
      label: 'أفضل نتيجة',
      value: `${Math.round(bestScore)}%`,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      icon: Clock,
      label: 'إجمالي الوقت',
      value: formatTime(totalTimeSpent),
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`} style={{ direction: 'rtl' }}>
      {stats.map((stat, index) => (
        <Card key={index} className="p-4 bg-white/95 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
              <p className="font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ExamStats;