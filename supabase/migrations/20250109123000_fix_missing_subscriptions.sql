-- Create function to fix missing subscriptions
CREATE OR REPLACE FUNCTION fix_missing_subscriptions()
RETURNS TABLE (
  user_id UUID,
  status TEXT
) AS $$
DECLARE
  user_record RECORD;
  new_subscription_id UUID;
BEGIN
  -- Loop through all users that don't have a subscription
  FOR user_record IN 
    SELECT au.id
    FROM auth.users au
    LEFT JOIN subscriptions s ON s.user_id = au.id
    WHERE s.id IS NULL
  LOOP
    -- Create subscription for user
    INSERT INTO subscriptions (id, user_id, plan_id, status)
    VALUES (
      uuid_generate_v4(),
      user_record.id,
      'free',
      'active'
    )
    RETURNING id INTO new_subscription_id;
    
    -- Create initial usage log
    INSERT INTO usage_logs (
      id,
      user_id,
      subscription_id,
      workflows_used,
      period_start,
      period_end
    )
    VALUES (
      uuid_generate_v4(),
      user_record.id,
      new_subscription_id,
      0,
      date_trunc('month', now()),
      (date_trunc('month', now()) + interval '1 month' - interval '1 second')
    );
      
    -- Return the user_id and status
    user_id := user_record.id;
    status := 'fixed';
    RETURN NEXT;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION fix_missing_subscriptions() TO authenticated; 