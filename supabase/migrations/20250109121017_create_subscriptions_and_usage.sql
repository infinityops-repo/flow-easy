-- Create plans table
CREATE TABLE plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  workflow_limit INTEGER,
  features JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT REFERENCES plans(id) ON DELETE RESTRICT NOT NULL,
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

-- Create usage_logs table
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE NOT NULL,
  workflows_used INTEGER DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default plans
INSERT INTO plans (id, name, description, price, workflow_limit, features) VALUES
('free', 'Free', 'Perfect for getting started', 0, 5, '["Basic templates", "Community support"]'),
('pro', 'Pro', 'For power users who need more', 12, NULL, '["Premium templates", "Priority support", "Custom integrations"]');

-- Create function to initialize subscription for new users
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (user_id, plan_id)
  VALUES (NEW.id, 'free');
  
  INSERT INTO usage_logs (user_id, subscription_id, period_start, period_end)
  VALUES (
    NEW.id,
    (SELECT id FROM subscriptions WHERE user_id = NEW.id),
    date_trunc('month', now()),
    (date_trunc('month', now()) + interval '1 month' - interval '1 second')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to initialize subscription for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to get current user's subscription info
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

-- Create RLS policies
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Plans are readable by all authenticated users
CREATE POLICY "Plans are viewable by all users" ON plans
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own usage logs
CREATE POLICY "Users can view their own usage logs" ON usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Function to increment workflow usage
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
