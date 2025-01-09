import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MainNav from "@/components/MainNav";

interface SubscriptionInfo {
  plan_name: string;
  plan_workflow_limit: number | null;
  workflows_used: number;
  period_start: string;
  period_end: string;
  subscription_status: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
}

export const SettingsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    email: string | undefined;
    name: string | undefined;
    avatar_url: string | undefined;
  }>({
    email: undefined,
    name: undefined,
    avatar_url: undefined
  });

  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('No active session found');
          return;
        }

        if (session?.user) {
          setUser({
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            avatar_url: session.user.user_metadata?.avatar_url
          });

          // Fetch subscription info
          const { data: subscriptionData, error: subscriptionError } = await supabase
            .rpc('get_subscription_info', { user_id: session.user.id });

          if (subscriptionError) {
            throw subscriptionError;
          }

          if (subscriptionData && subscriptionData.length > 0) {
            setSubscription(subscriptionData[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [toast]);

  const handleUpgradeClick = async () => {
    try {
      // TODO: Integrate with Stripe
      toast({
        title: "Coming soon",
        description: "Pro plan upgrade will be available soon.",
      });
    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast({
        title: "Error",
        description: "Failed to upgrade plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleManageSubscription = async () => {
    try {
      if (!subscription?.stripe_customer_id) {
        throw new Error('No Stripe customer ID found');
      }

      // TODO: Redirect to Stripe Customer Portal
      toast({
        title: "Coming soon",
        description: "Subscription management will be available soon.",
      });
    } catch (error) {
      console.error('Error managing subscription:', error);
      toast({
        title: "Error",
        description: "Failed to manage subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading || !subscription) {
    return (
      <div className="min-h-screen flex flex-col">
        <MainNav />
        <div className="flex-1 container mx-auto py-8 px-4 mt-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-700 rounded w-2/4"></div>
            <div className="space-y-8 mt-8">
              <div className="border rounded-lg p-6 space-y-4">
                <div className="h-6 bg-gray-700 rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const planLimits = {
    free: {
      features: ['Basic templates', 'Community support']
    },
    pro: {
      features: ['Premium templates', 'Priority support', 'Custom integrations']
    }
  };

  const currentPlan = planLimits[subscription.plan_name.toLowerCase() as keyof typeof planLimits];
  const workflowLimit = subscription.plan_workflow_limit === null ? 'Unlimited' : subscription.plan_workflow_limit;
  const workflowUsagePercent = subscription.plan_workflow_limit === null ? 0 : (subscription.workflows_used / subscription.plan_workflow_limit) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      <div className="flex-1 container mx-auto py-8 px-4 mt-16">
        <h1 className="text-4xl font-bold mb-4">Settings</h1>
        <p className="text-muted-foreground mb-8">
          You can manage your account, billing, and team settings here.
        </p>

        <div className="grid gap-8">
          {/* Basic Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Basic Information</h2>
              </div>
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="font-medium">Name</label>
                <p className="text-muted-foreground">{user.name}</p>
              </div>
              <div className="grid gap-2">
                <label className="font-medium">Email</label>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Account */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Account</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your current plan: <span className="font-medium capitalize">{subscription.plan_name}</span>
                  </p>
                </div>
                {subscription.plan_name.toLowerCase() === 'free' && (
                  <Button onClick={handleUpgradeClick} variant="default">
                    Upgrade to Pro
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Current Plan Features</h3>
                <ul className="space-y-2">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              {subscription.plan_name.toLowerCase() === 'pro' && subscription.stripe_subscription_id && (
                <Button onClick={handleManageSubscription} variant="outline" className="w-full">
                  Manage Subscription
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Usage */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold">Usage</h2>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Workflows</h3>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span>{subscription.workflows_used} / {workflowLimit}</span>
                </div>
                {workflowLimit !== 'Unlimited' && (
                  <>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${Math.min(workflowUsagePercent, 100)}%` }} 
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      You've used {subscription.workflows_used} workflows out of your {workflowLimit} monthly quota.
                    </p>
                  </>
                )}
              </div>

              {subscription.plan_name.toLowerCase() === 'pro' && (
                <div className="p-4 bg-[#1E1E1E] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <p className="text-sm">
                      You have unlimited workflows with your Pro plan.{' '}
                      <a href="#" className="text-primary hover:underline">View details</a>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 