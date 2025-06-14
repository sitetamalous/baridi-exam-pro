
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('يرجى ملء جميع الحقول');
      return;
    }

    setLoading(true);
    
    try {
      await login(email, password);
      toast({
        title: 'تم تسجيل الدخول بنجاح',
        description: 'مرحباً بك في منصة امتحانات بريد الجزائر',
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-algeria-green to-algeria-blue rounded-xl flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">تسجيل الدخول</h2>
          <p className="mt-2 text-gray-600">ادخل إلى حسابك للمتابعة</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">مرحباً بعودتك</CardTitle>
            <CardDescription className="text-center">
              ادخل بياناتك للوصول إلى الامتحانات التجريبية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-700 text-right">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-right block">
                  البريد الإلكتروني
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ادخل بريدك الإلكتروني"
                    className="text-right pr-10"
                    required
                  />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-right block">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ادخل كلمة المرور"
                    className="text-right pr-10 pl-10"
                    required
                  />
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute left-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-algeria-green hover:bg-green-700 text-white py-3 text-lg font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner w-5 h-5 ml-2"></div>
                    جاري تسجيل الدخول...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    تسجيل الدخول
                    <ArrowRight className="mr-2 h-5 w-5" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                ليس لدي حساب؟{' '}
                <Link
                  to="/register"
                  className="text-algeria-green hover:text-green-700 font-semibold hover:underline"
                >
                  إنشاء حساب جديد
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link
                to="/"
                className="text-gray-500 hover:text-gray-700 text-sm hover:underline"
              >
                العودة إلى الصفحة الرئيسية
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Demo Account Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-blue-800">
              <p className="font-semibold mb-2">للتجربة السريعة:</p>
              <p>البريد الإلكتروني: demo@algerie-poste.dz</p>
              <p>كلمة المرور: demo123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
