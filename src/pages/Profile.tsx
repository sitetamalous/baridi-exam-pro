
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { User, Mail, Calendar, Trophy, BookOpen, Clock, Edit2, Save, X } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Mock user statistics
  const userStats = {
    totalExams: 7,
    averageScore: 78,
    bestScore: 92,
    totalHours: 12.5,
    joinDate: '2024-01-01',
    lastLogin: '2024-01-20',
  };

  // Mock recent activity
  const recentActivity = [
    { id: 1, exam: 'امتحان تجريبي 3', score: 85, date: '2024-01-20', status: 'مكتمل' },
    { id: 2, exam: 'امتحان تجريبي 2', score: 78, date: '2024-01-18', status: 'مكتمل' },
    { id: 3, exam: 'امتحان تجريبي 1', score: 92, date: '2024-01-15', status: 'مكتمل' },
  ];

  const handleSave = () => {
    // Mock save functionality
    toast({
      title: 'تم حفظ البيانات',
      description: 'تم تحديث معلومات الملف الشخصي بنجاح',
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          الملف الشخصي
        </h1>
        <p className="text-gray-600">
          إدارة معلوماتك الشخصية ومتابعة تقدمك
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-right flex items-center">
              <User className="h-5 w-5 ml-2" />
              المعلومات الشخصية
            </CardTitle>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
              >
                <Edit2 className="h-4 w-4 ml-1" />
                تعديل
              </Button>
            ) : (
              <div className="flex space-x-2 space-x-reverse">
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="bg-algeria-green hover:bg-green-700"
                >
                  <Save className="h-4 w-4 ml-1" />
                  حفظ
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4 ml-1" />
                  إلغاء
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-right block">الاسم الكامل</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-right"
                />
              ) : (
                <div className="flex items-center p-3 border rounded-md bg-gray-50">
                  <User className="h-4 w-4 text-gray-400 ml-2" />
                  <span className="text-right flex-1">{name}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-right block">البريد الإلكتروني</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-right"
                />
              ) : (
                <div className="flex items-center p-3 border rounded-md bg-gray-50">
                  <Mail className="h-4 w-4 text-gray-400 ml-2" />
                  <span className="text-right flex-1">{email}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center p-3 border rounded-md bg-gray-50">
              <Calendar className="h-4 w-4 text-gray-400 ml-2" />
              <div className="text-right flex-1">
                <p className="text-sm text-gray-600">تاريخ التسجيل</p>
                <p className="font-medium">{userStats.joinDate}</p>
              </div>
            </div>

            <div className="flex items-center p-3 border rounded-md bg-gray-50">
              <Clock className="h-4 w-4 text-gray-400 ml-2" />
              <div className="text-right flex-1">
                <p className="text-sm text-gray-600">آخر زيارة</p>
                <p className="font-medium">{userStats.lastLogin}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right flex items-center">
            <Trophy className="h-5 w-5 ml-2" />
            إحصائيات الأداء
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-algeria-green mb-2">
                {userStats.totalExams}
              </div>
              <p className="text-gray-600 text-sm">امتحانات مكتملة</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-algeria-blue mb-2">
                {userStats.averageScore}%
              </div>
              <p className="text-gray-600 text-sm">المعدل العام</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-algeria-gold mb-2">
                {userStats.bestScore}%
              </div>
              <p className="text-gray-600 text-sm">أفضل نتيجة</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-algeria-red mb-2">
                {userStats.totalHours}
              </div>
              <p className="text-gray-600 text-sm">ساعات الدراسة</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right flex items-center">
            <BookOpen className="h-5 w-5 ml-2" />
            النشاط الأخير
          </CardTitle>
          <CardDescription className="text-right">
            آخر الامتحانات التي قمت بها
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                <div className="text-right">
                  <p className="font-medium">{activity.exam}</p>
                  <p className="text-sm text-gray-600">{activity.date}</p>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Badge 
                    className={
                      activity.score >= 80 ? 'bg-green-500' :
                      activity.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }
                  >
                    {activity.score}%
                  </Badge>
                  <Badge variant="outline">
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-gradient-to-r from-algeria-green/10 to-algeria-blue/10">
        <CardHeader>
          <CardTitle className="text-right flex items-center">
            <Trophy className="h-5 w-5 ml-2" />
            الإنجازات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Trophy className="h-8 w-8 text-algeria-gold mx-auto mb-2" />
              <p className="font-semibold">متفوق</p>
              <p className="text-sm text-gray-600">حصلت على +90% في امتحان</p>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <BookOpen className="h-8 w-8 text-algeria-blue mx-auto mb-2" />
              <p className="font-semibold">مثابر</p>
              <p className="text-sm text-gray-600">أكملت 5 امتحانات</p>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Clock className="h-8 w-8 text-algeria-green mx-auto mb-2" />
              <p className="font-semibold">منتظم</p>
              <p className="text-sm text-gray-600">دخلت لمدة 7 أيام متتالية</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
