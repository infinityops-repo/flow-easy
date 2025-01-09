-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create plans table if not exists
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  workflow_limit INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create subscriptions table if not exists
CREATE TABLE IF NOT EXISTS subscriptions (
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

-- Create usage_logs table if not exists
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE NOT NULL,
  workflows_used INTEGER DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default plans if they don't exist
INSERT INTO plans (id, name, description, price, workflow_limit, features)
SELECT 'free', 'Free', 'Perfect for getting started', 0, 5, '["Basic templates", "Community support"]'
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE id = 'free');

INSERT INTO plans (id, name, description, price, workflow_limit, features)
SELECT 'pro', 'Pro', 'For power users who need more', 12, NULL, '["Premium templates", "Priority support", "Custom integrations"]'
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE id = 'pro');

-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Plans are viewable by all users" ON plans
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view their own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own usage logs" ON usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Add policies for trigger function
CREATE POLICY "Trigger can insert subscriptions" ON subscriptions
  FOR INSERT TO postgres
  WITH CHECK (true);

CREATE POLICY "Trigger can insert usage logs" ON usage_logs
  FOR INSERT TO postgres
  WITH CHECK (true);

-- Create function to initialize subscription for new users
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
  subscription_id UUID;
BEGIN
  -- Set role to service_role to bypass RLS
  SET LOCAL ROLE service_role;

  -- Create subscription with explicit schema
  INSERT INTO public.subscriptions (user_id, plan_id)
  VALUES (NEW.id, 'free')
  RETURNING id INTO subscription_id;

  -- Create usage log with explicit schema
  INSERT INTO public.usage_logs (user_id, subscription_id, period_start, period_end)
  VALUES (
    NEW.id,
    subscription_id,
    date_trunc('month', now()),
    (date_trunc('month', now()) + interval '1 month' - interval '1 second')
  );

  -- Reset role
  RESET ROLE;

  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
