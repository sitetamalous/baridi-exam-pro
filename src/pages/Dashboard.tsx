
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { BookOpen, Clock, Trophy, Users } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  // Mock exam data
  const exams = [
    { id: 1, title: 'امتحان تجريبي 1 - أساسيات بريد الجزائر', questions: 50, duration: 60, difficulty: 'متوسط' },
    { id: 2, title: 'امتحان تجريبي 2 - الخدمات الرقمية', questions: 50, duration: 60, difficulty: 'سهل' },
    { id: 3, title: 'امتحان تجريبي 3 - خدمة العملاء', questions: 50, duration: 60, difficulty: 'صعب' },
    { id: 4, title: 'امتحان تجريبي 4 - الخدمات المالية', questions: 50, duration: 60, difficulty: 'متوسط' },
    { id: 5, title: 'امتحان تجريبي 5 - بريدي موب', questions: 50, duration: 60, difficulty: 'سهل' },
    { id: 6, title: 'امتحان تجريبي 6 - E-CCP', questions: 50, duration: 60, difficulty: 'متوسط' },
    { id: 7, title: 'امتحان تجريبي 7 - إجراءات العمل', questions: 50, duration: 60, difficulty: 'صعب' },
    { id: 8, title: 'امتحان تجريبي 8 - القوانين واللوائح', questions: 50, duration: 60, difficulty: 'متوسط' },
    { id: 9, title: 'امتحان تجريبي 9 - حل المشاكل', questions: 50, duration: 60, difficulty: 'صعب' },
    { id: 10, title: 'امتحان تجريبي 10 - الامتحان الشامل', questions: 50, duration: 60, difficulty: 'صعب' },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'سهل': return 'bg-green-500';
      case 'متوسط': return 'bg-yellow-500';
      case 'صعب': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleStartExam = (examId: number) => {
    navigate(`/exam/${examId}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          لوحة التحكم - الامتحانات التجريبية
        </h1>
        <p className="text-gray-600">
          اختر الامتحان الذي تريد أداؤه للتحضير لامتحان مكلف بالزبائن
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <BookOpen className="h-8 w-8 text-algeria-green ml-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">10</p>
              <p className="text-gray-600 text-sm">امتحانات متاحة</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-algeria-blue ml-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">60</p>
              <p className="text-gray-600 text-sm">دقيقة لكل امتحان</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Trophy className="h-8 w-8 text-algeria-gold ml-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">50</p>
              <p className="text-gray-600 text-sm">سؤال في كل امتحان</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-algeria-red ml-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">4</p>
              <p className="text-gray-600 text-sm">خيارات لكل سؤال</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <Card key={exam.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-right">{exam.title}</CardTitle>
                <Badge className={`${getDifficultyColor(exam.difficulty)} text-white`}>
                  {exam.difficulty}
                </Badge>
              </div>
              <CardDescription className="text-right">
                امتحان تجريبي شامل لتقييم معرفتك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{exam.questions} سؤال</span>
                  <span>{exam.duration} دقيقة</span>
                </div>
                
                <Button
                  onClick={() => handleStartExam(exam.id)}
                  className="w-full bg-algeria-green hover:bg-green-700 text-white"
                >
                  بدء الامتحان
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-algeria-blue text-right">تعليمات الامتحان</CardTitle>
        </CardHeader>
        <CardContent className="text-right">
          <ul className="space-y-2 text-gray-700">
            <li>• كل امتحان يحتوي على 50 سؤال اختيار من متعدد</li>
            <li>• المدة المحددة لكل امتحان هي 60 دقيقة</li>
            <li>• يجب الإجابة على جميع الأسئلة قبل انتهاء الوقت</li>
            <li>• يمكنك مراجعة إجاباتك بعد انتهاء الامتحان</li>
            <li>• النتائج تُحفظ تلقائياً ويمكن الوصول إليها من قسم النتائج</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
