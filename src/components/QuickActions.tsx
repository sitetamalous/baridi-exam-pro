import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Users, 
  FileText, 
  Settings,
  HelpCircle,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ className = '' }) => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: BookOpen,
      label: 'بدء امتحان جديد',
      description: 'ابدأ امتحان من المواد المتاحة',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      onClick: () => navigate('/exams')
    },
    {
      icon: TrendingUp,
      label: 'عرض الإحصائيات',
      description: 'تابع تقدمك ونتائجك',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      onClick: () => navigate('/statistics')
    },
    {
      icon: Clock,
      label: 'الامتحانات الأخيرة',
      description: 'راجع امتحاناتك السابقة',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      onClick: () => navigate('/statistics')
    },
    {
      icon: FileText,
      label: 'المراجع والملفات',
      description: 'اطلع على المواد التعليمية',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      onClick: () => navigate('/profile')
    },
    {
      icon: Users,
      label: 'التصنيفات',
      description: 'شاهد ترتيبك بين الطلاب',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      onClick: () => navigate('/statistics')
    },
    {
      icon: Star,
      label: 'المفضلة',
      description: 'الامتحانات المحفوظة',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      onClick: () => navigate('/exams')
    },
    {
      icon: HelpCircle,
      label: 'المساعدة',
      description: 'دليل استخدام المنصة',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      onClick: () => navigate('/profile')
    },
    {
      icon: Settings,
      label: 'الإعدادات',
      description: 'تخصيص حسابك',
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
      onClick: () => navigate('/profile')
    }
  ];

  return (
    <Card className={`p-6 bg-white/95 ${className}`} style={{ direction: 'rtl' }}>
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5 text-blue-600" />
        الإجراءات السريعة
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className={`h-auto p-3 flex flex-col items-center gap-2 hover:${action.bgColor} border border-gray-100 hover:border-gray-200 transition-all duration-200`}
            onClick={action.onClick}
          >
            <div className={`p-2 rounded-lg ${action.bgColor}`}>
              <action.icon className={`w-5 h-5 ${action.color}`} />
            </div>
            <div className="text-center">
              <p className="font-medium text-xs text-gray-800">{action.label}</p>
              <p className="text-xs text-gray-500 mt-1 hidden sm:block">{action.description}</p>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default QuickActions;