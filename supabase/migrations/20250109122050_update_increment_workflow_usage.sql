-- Drop existing function
DROP FUNCTION IF EXISTS increment_workflow_usage(UUID);

-- Create updated function
CREATE OR REPLACE FUNCTION increment_workflow_usage(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_subscription_id UUID;
  current_workflow_limit INTEGER;
  current_workflows_used INTEGER;
BEGIN
  -- Get or create subscription
  SELECT id INTO current_subscription_id
  FROM subscriptions 
  WHERE user_id = increment_workflow_usage.user_id;

  -- If no subscription exists, create one with free plan
  IF current_subscription_id IS NULL THEN
    INSERT INTO subscriptions (user_id, plan_id)
    VALUES (increment_workflow_usage.user_id, 'free')
    RETURNING id INTO current_subscription_id;
  END IF;

  -- Get or create usage log for current period
  INSERT INTO usage_logs (
    user_id,
    subscription_id,
    workflows_used,
    period_start,
    period_end
  )
  SELECT
    increment_workflow_usage.user_id,
    current_subscription_id,
    0,
    date_trunc('month', now()),
    (date_trunc('month', now()) + interval '1 month' - interval '1 second')
  WHERE NOT EXISTS (
    SELECT 1 FROM usage_logs ul
    WHERE ul.subscription_id = current_subscription_id
    AND ul.period_end > now()
  );

  -- Get current usage info
  SELECT 
    p.workflow_limit,
    COALESCE(ul.workflows_used, 0)
  INTO 
    current_workflow_limit,
    current_workflows_used
  FROM subscriptions s
  JOIN plans p ON s.plan_id = p.id
  LEFT JOIN usage_logs ul ON s.id = ul.subscription_id
  WHERE s.id = current_subscription_id
  AND ul.period_end > now();

  -- Check if user has reached their limit
  IF current_workflow_limit IS NOT NULL AND current_workflows_used >= current_workflow_limit THEN
    RETURN FALSE;
  END IF;

  -- Increment usage
  UPDATE usage_logs
  SET workflows_used = workflows_used + 1,
      updated_at = now()
  WHERE subscription_id = current_subscription_id
  AND period_end > now();

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
