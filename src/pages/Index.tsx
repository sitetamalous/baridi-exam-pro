
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { BookOpen, Users, Award, Clock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-algeria-green p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">منصة امتحانات بريد الجزائر</h1>
                <p className="text-sm text-gray-600">التحضير لامتحان مكلف بالزبائن</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link to="/dashboard">
                  <Button className="bg-algeria-green hover:bg-green-700">
                    الذهاب للوحة التحكم
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button className="bg-algeria-green hover:bg-green-700">
                    تسجيل الدخول
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            استعد لامتحان
            <span className="text-algeria-green"> مكلف بالزبائن</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            منصة شاملة للتحضير لامتحان مكلف بالزبائن في بريد الجزائر
            مع امتحانات تجريبية واقعية ونتائج فورية
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-algeria-green hover:bg-green-700 text-lg px-8 py-3">
                  بدء الامتحانات التجريبية
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button size="lg" className="bg-algeria-green hover:bg-green-700 text-lg px-8 py-3">
                    ابدأ التحضير الآن
                    <ArrowLeft className="mr-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                    إنشاء حساب جديد
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              لماذا تختار منصتنا؟
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              نوفر لك كل ما تحتاجه للنجاح في امتحان مكلف بالزبائن
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <CardHeader>
                <div className="bg-algeria-green p-3 rounded-full w-fit mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">امتحانات شاملة</CardTitle>
                <CardDescription>
                  أكثر من 10 امتحانات تجريبية تحاكي الامتحان الحقيقي
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <div className="bg-algeria-blue p-3 rounded-full w-fit mx-auto mb-4">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">محاكاة الوقت الحقيقي</CardTitle>
                <CardDescription>
                  تدرب على إدارة الوقت مع نفس مدة الامتحان الرسمي
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <div className="bg-algeria-gold p-3 rounded-full w-fit mx-auto mb-4">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">تتبع التقدم</CardTitle>
                <CardDescription>
                  راقب أداءك وتحسن درجاتك مع الوقت
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <div className="bg-algeria-red p-3 rounded-full w-fit mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">محتوى محدث</CardTitle>
                <CardDescription>
                  أسئلة محدثة تواكب آخر التطورات في بريد الجزائر
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-algeria-green text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ابدأ رحلتك نحو النجاح اليوم
          </h2>
          <p className="text-xl mb-8 opacity-90">
            انضم إلى آلاف المتقدمين الذين نجحوا باستخدام منصتنا
          </p>
          {!user && (
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                سجل الآن مجاناً
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 منصة امتحانات بريد الجزائر. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
