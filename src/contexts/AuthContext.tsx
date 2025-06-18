
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        toast({
          variant: "destructive",
          title: "خطأ في تسجيل الدخول",
          description: error.message === 'Invalid login credentials' 
            ? "بيانات الدخول غير صحيحة" 
            : "حدث خطأ أثناء تسجيل الدخول",
        });
        throw error;
      }

      if (data.user) {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في منصة امتحانات بريد الجزائر",
        });
      }
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('Registration error:', error);
        toast({
          variant: "destructive",
          title: "خطأ في إنشاء الحساب",
          description: error.message === 'User already registered' 
            ? "المستخدم مسجل مسبقاً" 
            : "حدث خطأ أثناء إنشاء الحساب",
        });
        throw error;
      }

      if (data.user) {
        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: "يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب",
        });
      }
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast({
          variant: "destructive",
          title: "خطأ في تسجيل الخروج",
          description: "حدث خطأ أثناء تسجيل الخروج",
        });
        throw error;
      }

      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "نراك قريباً",
      });
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
