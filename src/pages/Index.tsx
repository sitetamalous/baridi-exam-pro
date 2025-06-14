
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { BookOpen, Users, Award, Smartphone, Wifi, Clock } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: BookOpen,
      title: 'امتحانات تجريبية شاملة',
      description: '10 امتحانات تجريبية تحتوي على 50 سؤال لكل امتحان، مصممة خصيصاً لمنصب مكلف بالزبائن'
    },
    {
      icon: Smartphone,
      title: 'تجربة محمولة متطورة',
      description: 'واجهة محسّنة للهواتف المحمولة مع إمكانية التثبيت كتطبيق على الشاشة الرئيسية'
    },
    {
      icon: Wifi,
      title: 'العمل بدون اتصال',
      description: 'إمكانية متابعة الامتحانات حتى في حالة انقطاع الاتصال بالإنترنت'
    },
    {
      icon: Clock,
      title: 'توقيت واقعي',
      description: 'محاكاة الامتحان الحقيقي بتوقيت 60 دقيقة مع تنبيهات الوقت'
    },
    {
      icon: Award,
      title: 'تقييم فوري',
      description: 'احصل على النتائج فوراً مع مراجعة تفصيلية للإجابات الصحيحة والخاطئة'
    },
    {
      icon: Users,
      title: 'محتوى متخصص',
      description: 'أسئلة مصممة خصيصاً لتغطي جميع جوانب عمل مكلف بالزبائن في بريد الجزائر'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo and Title */}
          <div className="mb-8">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-algeria-green to-algeria-blue rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              منصة امتحانات
              <span className="text-algeria-green block">بريد الجزائر</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              استعد للامتحان الرقمي لمنصب <strong>مكلف بالزبائن</strong> مع منصة تدريبية شاملة 
              ومصممة خصيصاً للمرشحين الجزائريين
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              onClick={() => navigate('/register')}
              size="lg"
              className="bg-algeria-green hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold shadow-lg transform transition-all hover:scale-105"
            >
              إنشاء حساب جديد
              <BookOpen className="mr-2 h-5 w-5" />
            </Button>
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              size="lg"
              className="border-algeria-green text-algeria-green hover:bg-algeria-green hover:text-white px-8 py-4 text-lg font-semibold"
            >
              تسجيل الدخول
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-algeria-green mb-2">10</div>
              <div className="text-gray-600">امتحانات تجريبية</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-algeria-green mb-2">500</div>
              <div className="text-gray-600">سؤال متنوع</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-algeria-green mb-2">60</div>
              <div className="text-gray-600">دقيقة لكل امتحان</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              لماذا تختار منصتنا؟
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              منصة متكاملة مصممة خصيصاً للتحضير الأمثل لامتحان بريد الجزائر
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-algeria-green to-algeria-blue rounded-lg flex items-center justify-center ml-4">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Algeria Post Section */}
      <section className="py-16 bg-gradient-to-r from-algeria-green to-algeria-blue text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">
            عن بريد الجزائر
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">الخدمات الأساسية</h3>
              <ul className="text-right space-y-2 opacity-90">
                <li>• الخدمات البريدية التقليدية</li>
                <li>• الخدمات المالية والتحويلات</li>
                <li>• تطبيق باريدي موب (Baridi Mob)</li>
                <li>• الحساب الجاري البريدي الإلكتروني (E-CCP)</li>
                <li>• خدمات الدفع الإلكتروني</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">دور مكلف بالزبائن</h3>
              <ul className="text-right space-y-2 opacity-90">
                <li>• استقبال وتوجيه الزبائن</li>
                <li>• تقديم المساعدة في الخدمات الرقمية</li>
                <li>• حل المشاكل والشكاوى</li>
                <li>• تقديم المعلومات حول الخدمات</li>
                <li>• ضمان جودة الخدمة المقدمة</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ابدأ رحلة التحضير الآن
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            لا تضيع الوقت، احصل على أفضل إعداد لامتحان بريد الجزائر مع منصتنا المتخصصة
          </p>
          <Button
            onClick={() => navigate('/register')}
            size="lg"
            className="bg-algeria-green hover:bg-green-700 text-white px-12 py-4 text-xl font-semibold shadow-lg transform transition-all hover:scale-105"
          >
            سجل مجاناً الآن
            <Award className="mr-3 h-6 w-6" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 منصة امتحانات بريد الجزائر - جميع الحقوق محفوظة
          </p>
          <p className="text-gray-500 text-sm mt-2">
            منصة تعليمية مخصصة للتحضير لامتحانات بريد الجزائر
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
