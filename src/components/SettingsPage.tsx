import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MainNav from "@/components/MainNav";

export const SettingsPage = () => {
  const { toast } = useToast();
  const [usageBasedPricing, setUsageBasedPricing] = React.useState(false);

  const handleUpgradeClick = () => {
    // TODO: Implement upgrade logic
    toast({
      title: "Coming soon",
      description: "Business plan upgrade will be available soon.",
    });
  };

  const handleChangeRequests = () => {
    // TODO: Implement change requests logic
    toast({
      title: "Coming soon",
      description: "Changing request limits will be available soon.",
    });
  };

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
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="font-medium">Name</label>
                <p className="text-muted-foreground">Michael Moreira</p>
              </div>
              <div className="grid gap-2">
                <label className="font-medium">Email</label>
                <p className="text-muted-foreground">michaelmoreiramelo@gmail.com</p>
              </div>
            </CardContent>
          </Card>

          {/* Account */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Account</h2>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">Pro</span>
                  <Button onClick={handleUpgradeClick} variant="outline" size="sm">
                    UPGRADE TO BUSINESS
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleChangeRequests} variant="outline">
                CHANGE # OF FAST REQUESTS
              </Button>
              <Button variant="outline">MANAGE SUBSCRIPTION</Button>
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
                    <h3 className="font-medium">Premium models</h3>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span>292 / 500</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '58.4%' }} />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  You've used 292 requests out of your 500 monthly fast requests quota.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">gpt-4o-mini or cursor-small</h3>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span>98 / No Limit</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '98%' }} />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  You've used 98 fast requests of this model. You have no monthly quota.
                </p>
              </div>

              <div className="p-4 bg-[#1E1E1E] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4" />
                  <p className="text-sm">
                    Usage-based pricing allows you to pay for extra fast requests beyond your plan limits.{' '}
                    <a href="#" className="text-primary hover:underline">Learn more</a>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Settings</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>Enable usage-based pricing</span>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Switch
                    checked={usageBasedPricing}
                    onCheckedChange={setUsageBasedPricing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 