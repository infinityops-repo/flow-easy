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
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 