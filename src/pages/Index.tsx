
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Award, Target, ArrowLeft } from 'lucide-react';

const Index: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: 'امتحانات تفاعلية',
      description: 'امتحانات محاكاة شاملة لمنصب مكلف بالزبائن'
    },
    {
      icon: Target,
      title: 'تدريب مخصص',
      description: 'أسئلة مصممة خصيصاً لمتطلبات بريد الجزائر'
    },
    {
      icon: Award,
      title: 'تتبع التقدم',
      description: 'راقب أداءك واعرف نقاط القوة والتحسين'
    },
    {
      icon: Users,
      title: 'دعم شامل',
      description: 'مراجعة مفصلة للإجابات مع شرح وافي'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-algeria-green">
                منصة امتحانات بريد الجزائر
              </h1>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              {user ? (
                <Button onClick={() => navigate('/dashboard')}>
                  لوحة التحكم
                </Button>
              ) : (
                <Button onClick={() => navigate('/auth')}>
                  تسجيل الدخول
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            استعد لامتحان مكلف بالزبائن
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            منصة تحضير شاملة ومتقدمة لامتحان مكلف بالزبائن في بريد الجزائر
            <br />
            مع أسئلة محاكاة حقيقية وتقييم فوري لأدائك
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Button
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="bg-algeria-green hover:bg-algeria-green/90 text-lg px-8 py-3"
              >
                <ArrowLeft className="h-5 w-5 ml-2" />
                ابدأ التدريب الآن
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="bg-algeria-green hover:bg-algeria-green/90 text-lg px-8 py-3"
                >
                  <ArrowLeft className="h-5 w-5 ml-2" />
                  سجل وابدأ التدريب
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="text-lg px-8 py-3"
                >
                  لديك حساب؟ سجل دخولك
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              لماذا تختار منصتنا؟
            </h3>
            <p className="text-lg text-gray-600">
              أدوات متقدمة ومحتوى عالي الجودة لضمان نجاحك
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto bg-algeria-green/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-algeria-green" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-algeria-green text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-8">
            منصة موثوقة ومجربة
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">10</div>
              <div className="text-lg opacity-90">امتحانات تدريبية</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-lg opacity-90">سؤال متنوع</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-lg opacity-90">معدل النجاح</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            ابدأ رحلتك نحو النجاح اليوم
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            انضم إلى آلاف المترشحين الذين حققوا نجاحهم من خلال منصتنا
          </p>
          <Button
            size="lg"
            onClick={() => navigate(user ? '/dashboard' : '/auth')}
            className="bg-algeria-green hover:bg-algeria-green/90 text-lg px-8 py-3"
          >
            {user ? 'ابدأ التدريب الآن' : 'سجل مجاناً الآن'}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">
            © 2024 بريد الجزائر - منصة الامتحانات الرقمية. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
