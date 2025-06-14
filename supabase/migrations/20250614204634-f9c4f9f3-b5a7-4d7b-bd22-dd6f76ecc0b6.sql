
-- Create custom types
CREATE TYPE public.user_role AS ENUM ('candidate', 'admin');
CREATE TYPE public.resource_type AS ENUM ('pdf', 'doc', 'image', 'other');

-- Create users table (extends auth.users with profile info)
CREATE TABLE public.users (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'candidate',
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create exams table
CREATE TABLE public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  explanation TEXT,
  is_ai_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create answers table
CREATE TABLE public.answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false
);

-- Create user_attempts table
CREATE TABLE public.user_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  score INTEGER,
  percentage DECIMAL(5,2),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create user_answers table
CREATE TABLE public.user_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES public.user_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_answer_id UUID REFERENCES public.answers(id) ON DELETE SET NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false
);

-- Create resources table
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type resource_type NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profile_pictures', 'profile_pictures', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('exam_attachments', 'exam_attachments', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('admin_documents', 'admin_documents', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (public.is_admin());

-- RLS Policies for exams table
CREATE POLICY "Everyone can view published exams" ON public.exams
  FOR SELECT USING (is_published = true OR public.is_admin());

CREATE POLICY "Admins can manage exams" ON public.exams
  FOR ALL USING (public.is_admin());

-- RLS Policies for questions table
CREATE POLICY "Users can view questions of published exams" ON public.questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.exams 
      WHERE id = questions.exam_id AND (is_published = true OR public.is_admin())
    )
  );

CREATE POLICY "Admins can manage questions" ON public.questions
  FOR ALL USING (public.is_admin());

-- RLS Policies for answers table
CREATE POLICY "Users can view answers of accessible questions" ON public.answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.questions q
      JOIN public.exams e ON q.exam_id = e.id
      WHERE q.id = answers.question_id AND (e.is_published = true OR public.is_admin())
    )
  );

CREATE POLICY "Admins can manage answers" ON public.answers
  FOR ALL USING (public.is_admin());

-- RLS Policies for user_attempts table
CREATE POLICY "Users can view their own attempts" ON public.user_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attempts" ON public.user_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attempts" ON public.user_attempts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all attempts" ON public.user_attempts
  FOR SELECT USING (public.is_admin());

-- RLS Policies for user_answers table
CREATE POLICY "Users can view their own answers" ON public.user_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_attempts ua
      WHERE ua.id = user_answers.attempt_id AND ua.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own answers" ON public.user_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_attempts ua
      WHERE ua.id = user_answers.attempt_id AND ua.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own answers" ON public.user_answers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_attempts ua
      WHERE ua.id = user_answers.attempt_id AND ua.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all answers" ON public.user_answers
  FOR SELECT USING (public.is_admin());

-- RLS Policies for resources table
CREATE POLICY "Everyone can view resources" ON public.resources
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage resources" ON public.resources
  FOR ALL USING (public.is_admin());

-- Storage policies for profile_pictures bucket
CREATE POLICY "Public can view profile pictures" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile_pictures');

CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile_pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own profile pictures" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile_pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own profile pictures" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile_pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for exam_attachments bucket
CREATE POLICY "Authenticated users can view exam attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'exam_attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can manage exam attachments" ON storage.objects
  FOR ALL USING (bucket_id = 'exam_attachments' AND public.is_admin());

-- Storage policies for admin_documents bucket
CREATE POLICY "Admins can manage admin documents" ON storage.objects
  FOR ALL USING (bucket_id = 'admin_documents' AND public.is_admin());

-- Function to calculate exam score
CREATE OR REPLACE FUNCTION public.calculate_attempt_score(attempt_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_questions INTEGER;
  correct_answers INTEGER;
  calculated_score INTEGER;
  calculated_percentage DECIMAL(5,2);
  result JSON;
BEGIN
  -- Count total questions for this attempt
  SELECT COUNT(*) INTO total_questions
  FROM public.user_answers ua
  WHERE ua.attempt_id = attempt_uuid;
  
  -- Count correct answers
  SELECT COUNT(*) INTO correct_answers
  FROM public.user_answers ua
  WHERE ua.attempt_id = attempt_uuid AND ua.is_correct = true;
  
  -- Calculate score and percentage
  calculated_score := correct_answers;
  calculated_percentage := CASE 
    WHEN total_questions > 0 THEN (correct_answers::DECIMAL / total_questions::DECIMAL) * 100
    ELSE 0
  END;
  
  -- Update the attempt record
  UPDATE public.user_attempts
  SET 
    score = calculated_score,
    percentage = calculated_percentage,
    completed_at = timezone('utc'::text, now())
  WHERE id = attempt_uuid;
  
  -- Return results
  result := json_build_object(
    'total_questions', total_questions,
    'correct_answers', correct_answers,
    'score', calculated_score,
    'percentage', calculated_percentage
  );
  
  RETURN result;
END;
$$;

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    'candidate'
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to shuffle questions for an exam attempt
CREATE OR REPLACE FUNCTION public.get_shuffled_questions(exam_uuid UUID)
RETURNS TABLE (
  id UUID,
  question_text TEXT,
  answers JSON
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.question_text,
    json_agg(
      json_build_object(
        'id', a.id,
        'answer_text', a.answer_text
      ) ORDER BY random()
    ) as answers
  FROM public.questions q
  JOIN public.answers a ON q.id = a.question_id
  WHERE q.exam_id = exam_uuid
  GROUP BY q.id, q.question_text
  ORDER BY random();
END;
$$;

-- Add indexes for better performance
CREATE INDEX idx_questions_exam_id ON public.questions(exam_id);
CREATE INDEX idx_answers_question_id ON public.answers(question_id);
CREATE INDEX idx_user_attempts_user_id ON public.user_attempts(user_id);
CREATE INDEX idx_user_attempts_exam_id ON public.user_attempts(exam_id);
CREATE INDEX idx_user_answers_attempt_id ON public.user_answers(attempt_id);
CREATE INDEX idx_user_answers_question_id ON public.user_answers(question_id);
CREATE INDEX idx_resources_uploaded_by ON public.resources(uploaded_by);
