-- Ensure we're in the public schema
SET search_path TO public;

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate tables if they don't exist
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  workflow_limit INTEGER,
  features JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT REFERENCES public.plans(id) ON DELETE RESTRICT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE NOT NULL,
  workflows_used INTEGER DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default plans if they don't exist
INSERT INTO public.plans (id, name, description, price, workflow_limit, features)
SELECT 'free', 'Free', 'Perfect for getting started', 0, 5, '["Basic templates", "Community support"]'
WHERE NOT EXISTS (SELECT 1 FROM public.plans WHERE id = 'free');

INSERT INTO public.plans (id, name, description, price, workflow_limit, features)
SELECT 'pro', 'Pro', 'For power users who need more', 12, NULL, '["Premium templates", "Priority support", "Custom integrations"]'
WHERE NOT EXISTS (SELECT 1 FROM public.plans WHERE id = 'pro');

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Service role can insert subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role can select subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role can update subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role can delete subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;

DROP POLICY IF EXISTS "Service role can insert usage logs" ON public.usage_logs;
DROP POLICY IF EXISTS "Service role can select usage logs" ON public.usage_logs;
DROP POLICY IF EXISTS "Service role can update usage logs" ON public.usage_logs;
DROP POLICY IF EXISTS "Users can view their own usage logs" ON public.usage_logs;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Create RLS policies
CREATE POLICY "Service role can insert subscriptions"
ON public.subscriptions FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can select subscriptions"
ON public.subscriptions FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Users can view their own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert usage logs"
ON public.usage_logs FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can select usage logs"
ON public.usage_logs FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Users can view their own usage logs" ON public.usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can update usage logs"
ON public.usage_logs FOR UPDATE
TO service_role
USING (true);

CREATE POLICY "Service role can update subscriptions"
ON public.subscriptions FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can delete subscriptions"
ON public.subscriptions FOR DELETE
TO service_role
USING (true);

-- Create function to initialize new user
CREATE OR REPLACE FUNCTION public.initialize_new_user(user_id UUID) 
RETURNS VOID
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
  subscription_id UUID;
  v_error_message TEXT;
  v_detail TEXT;
  v_hint TEXT;
BEGIN
  -- Set role to service_role to bypass RLS
  SET LOCAL ROLE service_role;
  
  -- Log the start of the function
  RAISE LOG 'Starting initialize_new_user for user_id: %', user_id;

  BEGIN
    -- Log attempt to create subscription
    RAISE LOG 'Attempting to create subscription for user_id: %', user_id;
    
    -- Create subscription with RETURNING
    INSERT INTO public.subscriptions (user_id, plan_id)
    VALUES (user_id, 'free')
    RETURNING id INTO subscription_id;

    -- Log successful subscription creation
    RAISE LOG 'Successfully created subscription with id: % for user_id: %', subscription_id, user_id;

    -- Log attempt to create usage log
    RAISE LOG 'Attempting to create usage log for subscription_id: %', subscription_id;
    
    -- Create usage log
    INSERT INTO public.usage_logs (user_id, subscription_id, period_start, period_end)
    VALUES (
      user_id,
      subscription_id,
      date_trunc('month', now()),
      (date_trunc('month', now()) + interval '1 month' - interval '1 second')
    );

    -- Log successful usage log creation
    RAISE LOG 'Successfully created usage log for subscription_id: %', subscription_id;

    -- Reset role
    RESET ROLE;
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT,
                          v_detail = PG_EXCEPTION_DETAIL,
                          v_hint = PG_EXCEPTION_HINT;
    
    RAISE LOG 'Error in initialize_new_user for user_id %: %, Detail: %, Hint: %', 
              user_id, v_error_message, v_detail, v_hint;
              
    -- Reset role even on error
    RESET ROLE;
              
    -- Re-raise the error
    RAISE EXCEPTION 'Failed to initialize user subscription: %', v_error_message;
  END;
END;
$$;

-- Create edge function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user_edge() 
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  -- Just return NEW, the actual initialization will be done by the edge function
  RETURN NEW;
END;
$$;

-- Create trigger that just returns NEW
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_edge();

-- Create function to get subscription info
CREATE OR REPLACE FUNCTION get_subscription_info(user_id UUID)
RETURNS TABLE (
  plan_name TEXT,
  plan_workflow_limit INTEGER,
  workflows_used INTEGER,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  subscription_status TEXT,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT
) AS $$
DECLARE
  current_subscription_id UUID;
BEGIN
  -- Get or create subscription
  SELECT id INTO current_subscription_id
  FROM subscriptions 
  WHERE user_id = get_subscription_info.user_id;

  -- If no subscription exists, create one with free plan
  IF current_subscription_id IS NULL THEN
    INSERT INTO subscriptions (user_id, plan_id)
    VALUES (get_subscription_info.user_id, 'free')
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
    get_subscription_info.user_id,
    current_subscription_id,
    0,
    date_trunc('month', now()),
    (date_trunc('month', now()) + interval '1 month' - interval '1 second')
  WHERE NOT EXISTS (
    SELECT 1 FROM usage_logs ul
    WHERE ul.subscription_id = current_subscription_id
    AND ul.period_end > now()
  );

  -- Return subscription info
  RETURN QUERY
  SELECT
    p.name as plan_name,
    p.workflow_limit,
    COALESCE(ul.workflows_used, 0) as workflows_used,
    ul.period_start,
    ul.period_end,
    s.status as subscription_status,
    s.stripe_subscription_id,
    s.stripe_customer_id
  FROM subscriptions s
  JOIN plans p ON s.plan_id = p.id
  LEFT JOIN usage_logs ul ON s.id = ul.subscription_id
  WHERE s.user_id = get_subscription_info.user_id
  AND ul.period_end > now()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment workflow usage
CREATE OR REPLACE FUNCTION increment_workflow_usage(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_subscription_id UUID;
  current_workflow_limit INTEGER;
  current_workflows_used INTEGER;
BEGIN
  -- Get current subscription info
  SELECT s.id, p.workflow_limit, COALESCE(ul.workflows_used, 0)
  INTO current_subscription_id, current_workflow_limit, current_workflows_used
  FROM subscriptions s
  JOIN plans p ON s.plan_id = p.id
  LEFT JOIN usage_logs ul ON s.id = ul.subscription_id
  WHERE s.user_id = user_id
  AND ul.period_end > now()
  LIMIT 1;

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
