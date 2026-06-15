-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  company_name TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free','starter','growth','enterprise')),
  calls_used_today INTEGER DEFAULT 0,
  calls_limit INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, company_name)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'company_name'
  );
  RETURN new;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- AGENTS
CREATE TABLE public.agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'Hindi',
  description TEXT,
  voice_type TEXT DEFAULT 'Female - Warm & Professional',
  status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','draft')),
  phone_number TEXT,
  calls_handled INTEGER DEFAULT 0,
  success_rate NUMERIC(5,2) DEFAULT 0,
  avg_duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agents TO authenticated;
GRANT ALL ON public.agents TO service_role;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own agents" ON public.agents FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_agents_user_id ON public.agents(user_id);

-- KNOWLEDGE BASE
CREATE TABLE public.knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_base TO authenticated;
GRANT ALL ON public.knowledge_base TO service_role;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own knowledge" ON public.knowledge_base FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- CALLS
CREATE TABLE public.calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  caller_number TEXT,
  caller_name TEXT,
  duration_seconds INTEGER DEFAULT 0,
  status TEXT DEFAULT 'completed' CHECK (status IN ('active','completed','dropped','missed')),
  intent TEXT,
  sentiment TEXT DEFAULT 'neutral' CHECK (sentiment IN ('positive','neutral','negative','delighted')),
  transcript TEXT,
  recording_url TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calls TO authenticated;
GRANT ALL ON public.calls TO service_role;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own calls" ON public.calls FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_calls_agent_id ON public.calls(agent_id);
CREATE INDEX idx_calls_user_id ON public.calls(user_id);
CREATE INDEX idx_calls_started_at ON public.calls(started_at DESC);

-- PHONE NUMBERS
CREATE TABLE public.phone_numbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  number TEXT NOT NULL,
  country_code TEXT DEFAULT '+91',
  provider TEXT DEFAULT 'plivo',
  provider_number_id TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.phone_numbers TO authenticated;
GRANT ALL ON public.phone_numbers TO service_role;
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own numbers" ON public.phone_numbers FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at trigger for agents
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- DASHBOARD STATS as security-invoker view (RLS on underlying tables applies to caller)
CREATE OR REPLACE VIEW public.dashboard_stats
WITH (security_invoker = true)
AS
SELECT
  u.id AS user_id,
  COUNT(DISTINCT a.id) AS total_agents,
  COUNT(DISTINCT CASE WHEN a.status = 'active' THEN a.id END) AS active_agents,
  COUNT(c.id) AS total_calls,
  ROUND(AVG(c.duration_seconds)) AS avg_duration_seconds,
  ROUND(AVG(CASE WHEN c.sentiment IN ('positive','delighted') THEN 1.0 ELSE 0.0 END) * 5, 1) AS satisfaction_score
FROM auth.users u
LEFT JOIN public.agents a ON a.user_id = u.id
LEFT JOIN public.calls c ON c.user_id = u.id
GROUP BY u.id;
GRANT SELECT ON public.dashboard_stats TO authenticated;