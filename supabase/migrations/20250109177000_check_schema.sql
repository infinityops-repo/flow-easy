-- Verificar e criar schema se necessário
CREATE SCHEMA IF NOT EXISTS public;

-- Remover tabelas existentes
DROP TABLE IF EXISTS public.usage_logs CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabelas base
CREATE TABLE public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  workflow_limit INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id),
  CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_plan FOREIGN KEY(plan_id) REFERENCES public.plans(id) ON DELETE RESTRICT
);

CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  subscription_id UUID NOT NULL,
  workflows_used INTEGER DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_subscription FOREIGN KEY(subscription_id) REFERENCES public.subscriptions(id) ON DELETE CASCADE
);

-- Inserir plano gratuito padrão
INSERT INTO public.plans (id, name, description, price, workflow_limit, features)
VALUES ('free', 'Free', 'Perfect for getting started', 0, 5, '["Basic templates"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Plans are viewable by all users" ON public.plans;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view their own usage logs" ON public.usage_logs;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role can manage usage logs" ON public.usage_logs;

-- Criar novas políticas
CREATE POLICY "Plans are viewable by all users" ON public.plans
  FOR SELECT USING (true);

CREATE POLICY "Users can view their own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
  FOR ALL TO service_role USING (true);

CREATE POLICY "Users can view their own usage logs" ON public.usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage logs" ON public.usage_logs
  FOR ALL TO service_role USING (true); 