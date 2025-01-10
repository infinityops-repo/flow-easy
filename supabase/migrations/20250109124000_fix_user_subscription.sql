-- Remover assinatura existente se houver
DELETE FROM usage_logs WHERE user_id = 'c0234e1e-6241-4ea9-a008-c766744741ca';
DELETE FROM subscriptions WHERE user_id = 'c0234e1e-6241-4ea9-a008-c766744741ca';

-- Criar nova assinatura
WITH new_subscription AS (
  INSERT INTO subscriptions (id, user_id, plan_id, status)
  VALUES (
    uuid_generate_v4(),
    'c0234e1e-6241-4ea9-a008-c766744741ca',
    'free',
    'active'
  )
  RETURNING id, user_id
)
INSERT INTO usage_logs (id, user_id, subscription_id, workflows_used, period_start, period_end)
SELECT
  uuid_generate_v4(),
  new_subscription.user_id,
  new_subscription.id,
  0,
  date_trunc('month', now()),
  (date_trunc('month', now()) + interval '1 month' - interval '1 second')
FROM new_subscription; 