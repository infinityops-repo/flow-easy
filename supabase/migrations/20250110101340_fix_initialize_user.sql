-- Drop existing function if exists
DROP FUNCTION IF EXISTS initialize_user(UUID);

-- Create initialize_user function
CREATE OR REPLACE FUNCTION initialize_user(user_id UUID)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  subscription_id UUID;
BEGIN
  -- Create subscription
  INSERT INTO public.subscriptions (user_id, plan_id)
  VALUES (user_id, 'free')
  RETURNING id INTO subscription_id;

  -- Create usage log
  INSERT INTO public.usage_logs (user_id, subscription_id, period_start, period_end)
  VALUES (
    user_id,
    subscription_id,
    date_trunc('month', now()),
    (date_trunc('month', now()) + interval '1 month' - interval '1 second')
  );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION initialize_user(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION initialize_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION initialize_user(UUID) TO anon;

