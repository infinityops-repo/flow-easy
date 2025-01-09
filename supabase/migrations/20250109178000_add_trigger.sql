-- Remover trigger existente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Criar função para inicializar novo usuário
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_subscription_id uuid;
BEGIN
  -- Definir role para service_role
  SET LOCAL ROLE service_role;
  
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

  -- Resetar role
  RESET ROLE;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log do erro
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RESET ROLE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 