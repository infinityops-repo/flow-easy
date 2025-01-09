-- Remover função se existir
DROP FUNCTION IF EXISTS initialize_new_user(user_id uuid);

-- Criar função para inicializar usuário
CREATE OR REPLACE FUNCTION initialize_new_user(user_id uuid)
RETURNS json AS $$
DECLARE
  new_subscription_id uuid;
  result json;
BEGIN
  -- Criar assinatura para o usuário
  INSERT INTO public.subscriptions (user_id, plan_id)
  VALUES (user_id, 'free')
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
    user_id,
    new_subscription_id,
    0,
    date_trunc('month', now()),
    (date_trunc('month', now()) + interval '1 month' - interval '1 second')
  );

  -- Retornar resultado
  SELECT json_build_object(
    'subscription_id', new_subscription_id,
    'plan_id', 'free',
    'status', 'success'
  ) INTO result;

  RETURN result;
EXCEPTION WHEN OTHERS THEN
  -- Log do erro
  RAISE LOG 'Error in initialize_new_user: %', SQLERRM;
  
  -- Retornar erro
  RETURN json_build_object(
    'status', 'error',
    'message', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 