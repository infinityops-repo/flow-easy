-- Criar tabelas se não existirem
CREATE TABLE IF NOT EXISTS public.plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  max_workflows integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id text REFERENCES public.plans(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.usage_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  workflows_used integer DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inserir planos padrão se não existirem
INSERT INTO public.plans (id, name, description, max_workflows)
VALUES 
  ('free', 'Free', 'Plano gratuito com recursos básicos', 3)
ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Usuários podem ver suas próprias assinaturas"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem ver seus próprios logs"
  ON public.usage_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Remover e recriar a função sem SET ROLE
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_subscription_id uuid;
BEGIN
  -- Criar assinatura para o novo usuário
  INSERT INTO public.subscriptions (user_id, plan_id)
  VALUES (NEW.id, 'free')
  RETURNING id INTO new_subscription_id;

  -- Criar log de uso inicial
  INSERT INTO public.usage_logs (
    user_id,
    subscription_id,
    workflows_used,
    period_start,
    period_end
  )
  VALUES (
    NEW.id,
    new_subscription_id,
    0,
    date_trunc('month', now()),
    (date_trunc('month', now()) + interval '1 month' - interval '1 second')
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log do erro
  RAISE LOG 'Erro em handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 