
-- Insert the first exam
INSERT INTO public.exams (
  title, 
  description, 
  duration_minutes, 
  is_published
) VALUES (
  'الاختبار الأول – مكلف بالزبائن (بريد الجزائر)',
  'اختبار شامل للتحضير لمسابقة مكلف بالزبائن في بريد الجزائر',
  60,
  true
);

-- Get the exam ID for inserting questions (assuming this is the first exam)
DO $$
DECLARE
    exam_uuid UUID;
    question_uuid UUID;
BEGIN
    -- Get the exam ID
    SELECT id INTO exam_uuid FROM public.exams WHERE title = 'الاختبار الأول – مكلف بالزبائن (بريد الجزائر)' LIMIT 1;

    -- Insert Question 1
    INSERT INTO public.questions (exam_id, question_text, explanation, is_ai_generated)
    VALUES (exam_uuid, 'ما هو الموقع الرسمي الذي يمكن من خلاله طلب البطاقة الذهبية؟', 'يتم طلب البطاقة الذهبية عبر منصة فضاء الزبون ECCP من خلال هذا العنوان.', false)
    RETURNING id INTO question_uuid;
    
    INSERT INTO public.answers (question_id, answer_text, is_correct) VALUES
    (question_uuid, 'baridi.dz', false),
    (question_uuid, 'e.poste.dz', false),
    (question_uuid, 'eccp.poste.dz', true),
    (question_uuid, 'edahabia.poste.dz', false);

    -- Insert Question 2
    INSERT INTO public.questions (exam_id, question_text, explanation, is_ai_generated)
    VALUES (exam_uuid, 'ما هي مدة صلاحية البطاقة الذهبية؟', 'صلاحية البطاقة الذهبية محددة بسنتين من تاريخ إصدارها.', false)
    RETURNING id INTO question_uuid;
    
    INSERT INTO public.answers (question_id, answer_text, is_correct) VALUES
    (question_uuid, 'سنة واحدة من تاريخ الاستلام', false),
    (question_uuid, 'ثلاث سنوات من تاريخ الطلب', false),
    (question_uuid, 'سنتين من تاريخ صناعتها', true),
    (question_uuid, 'غير محددة', false);

    -- Insert Question 3
    INSERT INTO public.questions (exam_id, question_text, explanation, is_ai_generated)
    VALUES (exam_uuid, 'في حال نسي الزبون الرمز السري للبطاقة الذهبية، ما هو الإجراء المناسب؟', 'يتطلب تجديد الرمز السري التوجه شخصياً إلى المكتب مع الوثائق اللازمة.', false)
    RETURNING id INTO question_uuid;
    
    INSERT INTO public.answers (question_id, answer_text, is_correct) VALUES
    (question_uuid, 'الاتصال بخدمة الزبائن هاتفياً', false),
    (question_uuid, 'تقديم طلب إلكتروني عبر موقع بريد الجزائر', false),
    (question_uuid, 'التوجه إلى المكتب البريدي مع بطاقة الهوية وطلب خطي', true),
    (question_uuid, 'إرسال بريد إلكتروني إلى مديرية البريد', false);

    -- Insert Question 4
    INSERT INTO public.questions (exam_id, question_text, explanation, is_ai_generated)
    VALUES (exam_uuid, 'ما هو السقف اليومي لعمليات تحويل الأموال عبر تطبيق "بريدي موب"؟', 'تُحدد العمليات في "بريدي موب" بنفس سقف عمليات الشباك الآلي.', false)
    RETURNING id INTO question_uuid;
    
    INSERT INTO public.answers (question_id, answer_text, is_correct) VALUES
    (question_uuid, '100,000 دج', false),
    (question_uuid, '20,000 دج', false),
    (question_uuid, 'من 1,000 دج إلى 50,000 دج', true),
    (question_uuid, 'لا يوجد سقف محدد', false);

    -- Insert Question 5
    INSERT INTO public.questions (exam_id, question_text, explanation, is_ai_generated)
    VALUES (exam_uuid, 'زبون اشتكى من احتجاز بطاقته الذهبية في جهاز الدفع الإلكتروني بعد ثلاث محاولات فاشلة لإدخال الرمز السري، ما الإجراء الصحيح؟', 'يتم استبدال البطاقة عند احتجازها بنهائي الدفع.', false)
    RETURNING id INTO question_uuid;
    
    INSERT INTO public.answers (question_id, answer_text, is_correct) VALUES
    (question_uuid, 'الانتظار حتى يعاد تنشيط البطاقة تلقائيًا', false),
    (question_uuid, 'تقديم طلب استبدال البطاقة بمكتب البريد', true),
    (question_uuid, 'التوجه للبنك واسترجاع البطاقة', false),
    (question_uuid, 'الاتصال بخدمة الدعم عبر الهاتف', false);

    -- Insert Question 6
    INSERT INTO public.questions (exam_id, question_text, explanation, is_ai_generated)
    VALUES (exam_uuid, 'ما هو الرسم المطبق عند تغيير الرمز السري للبطاقة الذهبية؟', 'تُطبق رسوم قدرها 200 دج لتغيير الرمز السري.', false)
    RETURNING id INTO question_uuid;
    
    INSERT INTO public.answers (question_id, answer_text, is_correct) VALUES
    (question_uuid, 'مجاني', false),
    (question_uuid, '350 دج', false),
    (question_uuid, '30 دج', false),
    (question_uuid, '200 دج', true);

    -- Insert Question 7
    INSERT INTO public.questions (exam_id, question_text, explanation, is_ai_generated)
    VALUES (exam_uuid, 'ما هي الخطوة الأولى لتغيير رقم الهاتف المرتبط بالبطاقة الذهبية عبر الموزع الآلي؟', 'يتم تغيير الرقم مباشرة عبر الموزع بعد إدخال البطاقة.', false)
    RETURNING id INTO question_uuid;
    
    INSERT INTO public.answers (question_id, answer_text, is_correct) VALUES
    (question_uuid, 'تقديم طلب كتابي', false),
    (question_uuid, 'إدخال البطاقة وكتابة الرمز السري', true),
    (question_uuid, 'زيارة موقع بريد الجزائر', false),
    (question_uuid, 'الاتصال بخدمة الزبائن', false);

    -- Insert Question 8
    INSERT INTO public.questions (exam_id, question_text, explanation, is_ai_generated)
    VALUES (exam_uuid, 'في حال تم السحب من الشباك ولم يتلقّ الزبون المبلغ، ما الإجراء الأول الذي عليه اتخاذه؟', 'الزبون يجب أن يقدّم شكوى رسمية لتتبع العملية.', false)
    RETURNING id INTO question_uuid;
    
    INSERT INTO public.answers (question_id, answer_text, is_correct) VALUES
    (question_uuid, 'تقديم شكوى عبر التطبيق', false),
    (question_uuid, 'إرسال بريد إلكتروني للمركز المالي', false),
    (question_uuid, 'ملء استمارة شكوى بالمكتب البريدي', true),
    (question_uuid, 'الانتظار 48 ساعة حتى يتم إرجاع المبلغ تلقائيًا', false);

    -- Insert Question 9
    INSERT INTO public.questions (exam_id, question_text, explanation, is_ai_generated)
    VALUES (exam_uuid, 'طلب أحد الزبائن تجميد البطاقة الذهبية بسبب ضياعها، ما هي البيانات الواجب تضمينها في الطلب؟', 'يُشترط وجود هذه البيانات لمعالجة طلب التجميد.', false)
    RETURNING id INTO question_uuid;
    
    INSERT INTO public.answers (question_id, answer_text, is_correct) VALUES
    (question_uuid, 'رقم البطاقة فقط', false),
    (question_uuid, 'الاسم، رقم الحساب أو البطاقة، رقم الهاتف، سبب التجميد', true),
    (question_uuid, 'فقط بطاقة الهوية', false),
    (question_uuid, 'تاريخ آخر استعمال للبطاقة', false);

    -- Insert Question 10
    INSERT INTO public.questions (exam_id, question_text, explanation, is_ai_generated)
    VALUES (exam_uuid, 'ما هو الحد الأدنى للمبلغ الذي يمكن سحبه من الشباك الآلي؟', 'أقل مبلغ يمكن سحبه هو 1,000 دج حسب الأنظمة المعتمدة.', false)
    RETURNING id INTO question_uuid;
    
    INSERT INTO public.answers (question_id, answer_text, is_correct) VALUES
    (question_uuid, '500 دج', false),
    (question_uuid, '1,000 دج', true),
    (question_uuid, '10,000 دج', false),
    (question_uuid, 'لا يوجد حد أدنى', false);

    -- Insert Question 11
    INSERT INTO public.questions (exam_id, question_text, explanation, is_ai_generated)
    VALUES (exam_uuid, 'ما هو التطبيق الذي يسمح بإنجاز خدمات الدفع، تحويل الأموال، والاطلاع على الرصيد عبر الهاتف المحمول؟', 'يتيح تطبيق "بريدي موب" القيام بمعظم الخدمات المالية عن بعد.', false)
    RETURNING id INTO question_uuid;
    
    INSERT INTO public.answers (question_id, answer_text, is_correct) VALUES
    (question_uuid, 'ECCP Mobile', false),
    (question_uuid, 'بريد الجزائر مباشر', false),
    (question_uuid, 'بريدي موب', true),
    (question_uuid, 'Poste DZ App', false);

    -- Insert Question 12
    INSERT INTO public.questions (exam_id, question_text, explanation, is_ai_generated)
    VALUES (exam_uuid, 'عند طلب دفتر الصكوك البريدية، ما هي إحدى الطرق المتاحة لذلك؟', 'الدفتر يُطلب إما عبر الصيغة الخاصة أو كتابيًا.', false)
    RETURNING id INTO question_uuid;
    
    INSERT INTO public.answers (question_id, answer_text, is_correct) VALUES
    (question_uuid, 'الاتصال عبر رقم الطوارئ المالي', false),
    (question_uuid, 'تقديم طلب إلكتروني فقط', false),
    (question_uuid, 'تقديم طلب كتابي في أي مؤسسة بريدية', true),
    (question_uuid, 'التقدم إلى البنك الوطني', false);

END $$;
